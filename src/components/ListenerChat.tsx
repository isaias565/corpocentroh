import { useEffect, useRef, useState, type FormEvent } from 'react';
import {
  Send,
  Heart,
  Users,
  Wifi,
  WifiOff,
  UserCheck,
  Music2,
  MessageSquare,
  Megaphone,
} from 'lucide-react';
import type { RadioStation } from '../data/stations';
import type { ChatMessage, ChatMessageKind, ServerWsEvent } from '../types/chat';

interface ListenerChatProps {
  activeStation: RadioStation;
}

const STORAGE_NAME_KEY = 'corpocentroh_listener_name';
const STORAGE_LOC_KEY = 'corpocentroh_listener_location';

function formatMessageTime(iso: string): string {
  try {
    return new Intl.DateTimeFormat('es-HN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }).format(new Date(iso));
  } catch {
    return '';
  }
}

export function ListenerChat({ activeStation }: ListenerChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [onlineCount, setOnlineCount] = useState<number>(1);
  const [wsState, setWsState] = useState<'connecting' | 'connected' | 'reconnecting'>('connecting');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [author, setAuthor] = useState<string>(() => {
    try {
      return localStorage.getItem(STORAGE_NAME_KEY) || '';
    } catch {
      return '';
    }
  });
  const [location, setLocation] = useState<string>(() => {
    try {
      return localStorage.getItem(STORAGE_LOC_KEY) || 'Siguatepeque';
    } catch {
      return 'Siguatepeque';
    }
  });
  const [isEditingProfile, setIsEditingProfile] = useState<boolean>(() => {
    try {
      return !(localStorage.getItem(STORAGE_NAME_KEY) || '').trim();
    } catch {
      return true;
    }
  });

  const [kind, setKind] = useState<ChatMessageKind>('chat');
  const [draft, setDraft] = useState<string>('');
  const [filterMode, setFilterMode] = useState<'all' | 'station'>('all');
  const [reactedIds, setReactedIds] = useState<Record<string, boolean>>({});

  const wsRef = useRef<WebSocket | null>(null);
  const listEndRef = useRef<HTMLDivElement | null>(null);
  const reconnectTimerRef = useRef<number | null>(null);

  useEffect(() => {
    let isMounted = true;
    let attempt = 0;

    function connect() {
      if (!isMounted) return;
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const socket = new WebSocket(`${protocol}//${window.location.host}/ws`);
      wsRef.current = socket;

      socket.onopen = () => {
        if (!isMounted) return;
        attempt = 0;
        setWsState('connected');
        setErrorMsg(null);
      };

      socket.onmessage = (event) => {
        if (!isMounted) return;
        let payload: ServerWsEvent;
        try {
          payload = JSON.parse(event.data) as ServerWsEvent;
        } catch {
          return;
        }

        if (payload.type === 'init') {
          setMessages(payload.messages);
          setOnlineCount(payload.onlineCount);
        } else if (payload.type === 'chat:message') {
          setMessages((prev) => {
            if (prev.some((m) => m.id === payload.message.id)) {
              return prev;
            }
            const next = [...prev, payload.message];
            return next.length > 80 ? next.slice(next.length - 80) : next;
          });
        } else if (payload.type === 'chat:reaction') {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === payload.messageId ? { ...m, hearts: payload.hearts } : m
            )
          );
        } else if (payload.type === 'presence:update') {
          setOnlineCount(payload.onlineCount);
        } else if (payload.type === 'error') {
          setErrorMsg(payload.error);
          window.setTimeout(() => setErrorMsg(null), 3500);
        }
      };

      socket.onclose = () => {
        if (!isMounted) return;
        setWsState('reconnecting');
        const delay = Math.min(1000 * Math.pow(1.6, attempt), 10000);
        attempt += 1;
        reconnectTimerRef.current = window.setTimeout(connect, delay);
      };

      socket.onerror = () => {
        socket.close();
      };
    }

    connect();

    return () => {
      isMounted = false;
      if (reconnectTimerRef.current !== null) {
        window.clearTimeout(reconnectTimerRef.current);
      }
      wsRef.current?.close();
    };
  }, []);

  useEffect(() => {
    listEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [messages.length]);

  function saveProfile(nextAuthor: string, nextLocation: string) {
    try {
      localStorage.setItem(STORAGE_NAME_KEY, nextAuthor.trim());
      localStorage.setItem(STORAGE_LOC_KEY, nextLocation.trim() || 'Siguatepeque');
    } catch {
      // Ignore storage failures
    }
  }

  function handleSend(e: FormEvent) {
    e.preventDefault();
    setErrorMsg(null);

    const cleanAuthor = author.trim();
    const cleanLocation = location.trim() || 'Siguatepeque';
    const cleanText = draft.trim();

    if (cleanAuthor.length < 2) {
      setIsEditingProfile(true);
      setErrorMsg('Escribe tu nombre (mínimo 2 letras) para enviar mensajes al chat.');
      return;
    }

    if (cleanText.length < 1) {
      return;
    }

    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      setErrorMsg('Reconectando con la cabina... intenta en un segundo.');
      return;
    }

    saveProfile(cleanAuthor, cleanLocation);
    setIsEditingProfile(false);

    wsRef.current.send(
      JSON.stringify({
        type: 'chat:send',
        author: cleanAuthor,
        location: cleanLocation,
        stationId: activeStation.id,
        kind,
        text: cleanText,
      })
    );

    setDraft('');
  }

  function handleReact(messageId: string) {
    if (reactedIds[messageId]) return;
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;

    setReactedIds((prev) => ({ ...prev, [messageId]: true }));
    wsRef.current.send(
      JSON.stringify({
        type: 'chat:react',
        messageId,
      })
    );
  }

  const visibleMessages =
    filterMode === 'station'
      ? messages.filter((m) => m.stationId === activeStation.id || m.isCabin)
      : messages;

  return (
    <aside
      id="chat-oyentes"
      aria-label="Chat en vivo de oyentes"
      className="rounded-2xl bg-white border border-[#DCE4DD] flex flex-col h-[540px] lg:h-full lg:min-h-[540px] lg:max-h-[620px] min-w-0 overflow-hidden"
    >
      {/* Chat Header */}
      <div className="px-4 sm:px-5 py-3.5 border-b border-[#DCE4DD] bg-[#F1F5F2] flex flex-wrap items-center justify-between gap-2">
        <div className="min-w-0">
          <h2 className="font-display text-base font-bold text-[#0F2B1D] truncate">
            Cabina de Oyentes
          </h2>
          <div className="flex items-center gap-2 text-xs text-[#4A5E52] mt-0.5">
            <span className="inline-flex items-center gap-1 font-mono tabular-nums">
              <Users className="w-3.5 h-3.5 text-[#1B4D3E]" aria-hidden="true" />
              {onlineCount} {onlineCount === 1 ? 'conectado' : 'conectados'}
            </span>
            <span aria-hidden="true">·</span>
            <span className="inline-flex items-center gap-1">
              {wsState === 'connected' ? (
                <>
                  <Wifi className="w-3.5 h-3.5 text-[#1B4D3E]" aria-hidden="true" />
                  <span>En directo</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-3.5 h-3.5 text-amber-700" aria-hidden="true" />
                  <span>{wsState === 'connecting' ? 'Conectando...' : 'Reconectando...'}</span>
                </>
              )}
            </span>
          </div>
        </div>

        {/* Station Filter Tabs */}
        <div className="flex items-center gap-1 p-1 rounded-lg bg-[#E4ECE6] shrink-0">
          <button
            type="button"
            onClick={() => setFilterMode('all')}
            className={`px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
              filterMode === 'all'
                ? 'bg-white text-[#0F2B1D] shadow-xs'
                : 'text-[#4A5E52] hover:text-[#0F2B1D]'
            }`}
          >
            Todas
          </button>
          <button
            type="button"
            onClick={() => setFilterMode('station')}
            className={`px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
              filterMode === 'station'
                ? 'bg-white text-[#0F2B1D] shadow-xs'
                : 'text-[#4A5E52] hover:text-[#0F2B1D]'
            }`}
          >
            {activeStation.shortName}
          </button>
        </div>
      </div>

      {/* Listener Profile Bar */}
      <div className="px-4 sm:px-5 py-2.5 border-b border-[#EAEFEA] bg-[#FAFBFA] flex items-center justify-between gap-2">
        {isEditingProfile ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full">
            <input
              type="text"
              value={author}
              maxLength={26}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder="Tu nombre (ej. Carlos)"
              aria-label="Tu nombre para el chat"
              className="w-full min-h-[40px] px-3 py-1.5 text-sm rounded-lg border border-[#CBD6CD] bg-white text-[#111E17] placeholder:text-[#6B7D72] focus:outline-2 focus:outline-[#1B4D3E]"
            />
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={location}
                maxLength={34}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Barrio o ciudad"
                aria-label="Tu barrio o ciudad"
                className="w-full min-w-0 min-h-[40px] px-3 py-1.5 text-sm rounded-lg border border-[#CBD6CD] bg-white text-[#111E17] placeholder:text-[#6B7D72] focus:outline-2 focus:outline-[#1B4D3E]"
              />
              {author.trim().length >= 2 && (
                <button
                  type="button"
                  onClick={() => {
                    saveProfile(author, location);
                    setIsEditingProfile(false);
                  }}
                  className="min-h-[40px] px-3 rounded-lg bg-[#1B4D3E] text-white text-xs font-semibold shrink-0 cursor-pointer"
                >
                  Listo
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-2 w-full min-w-0">
            <div className="flex items-center gap-2 text-xs text-[#374B3F] min-w-0 truncate">
              <UserCheck className="w-4 h-4 text-[#1B4D3E] shrink-0" aria-hidden="true" />
              <span className="font-semibold text-[#0F2B1D] truncate">{author}</span>
              <span aria-hidden="true">·</span>
              <span className="truncate">{location || 'Siguatepeque'}</span>
            </div>
            <button
              type="button"
              onClick={() => setIsEditingProfile(true)}
              className="text-xs font-semibold text-[#1B4D3E] hover:underline shrink-0 py-1 px-2 cursor-pointer"
            >
              Cambiar
            </button>
          </div>
        )}
      </div>

      {/* Live Messages Feed */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-5 py-3 space-y-3 bg-white min-h-0">
        {visibleMessages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center px-4 py-8 text-sm text-[#5B6E62]">
            <p className="font-medium text-[#111E17]">Aún no hay mensajes en {activeStation.shortName}.</p>
            <p className="text-xs mt-1">Sé el primero en enviar un saludo o pedir una canción.</p>
          </div>
        ) : (
          visibleMessages.map((msg) => {
            const kindLabel =
              msg.kind === 'peticion'
                ? 'Petición musical'
                : msg.kind === 'saludo'
                  ? 'Saludo al aire'
                  : null;

            return (
              <div
                key={msg.id}
                className={`rounded-xl px-3.5 py-2.5 border transition-colors ${
                  msg.isCabin
                    ? 'bg-[#EDF4EF] border-[#C9DBD0]'
                    : 'bg-[#F8FAF8] border-[#E4EBE6]'
                }`}
              >
                <div className="flex items-baseline justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-xs min-w-0">
                    <span className="font-semibold text-[#0F2B1D] truncate max-w-[160px]">
                      {msg.author}
                    </span>
                    <span aria-hidden="true" className="text-[#88998E]">·</span>
                    <span className="text-[#52665A] truncate max-w-[130px]">{msg.location}</span>
                    <span aria-hidden="true" className="text-[#88998E]">·</span>
                    <span className="text-[#1B4D3E] font-medium">{msg.stationLabel}</span>
                  </div>
                  <time
                    dateTime={msg.createdAt}
                    className="font-mono text-[11px] tabular-nums text-[#677A6E] shrink-0"
                  >
                    {formatMessageTime(msg.createdAt)}
                  </time>
                </div>

                {kindLabel && (
                  <div className="mt-1 text-[11px] font-semibold text-amber-800">
                    {kindLabel}
                  </div>
                )}

                <p className="mt-1 text-sm text-[#17261D] leading-snug break-words">
                  {msg.text}
                </p>

                <div className="mt-1.5 flex items-center justify-end">
                  <button
                    type="button"
                    onClick={() => handleReact(msg.id)}
                    aria-label={`Apoyar mensaje de ${msg.author}`}
                    className={`min-h-[32px] px-2 py-1 rounded-md inline-flex items-center gap-1 text-xs font-mono tabular-nums transition-colors cursor-pointer ${
                      reactedIds[msg.id]
                        ? 'text-rose-700 bg-rose-50'
                        : 'text-[#5C6F63] hover:text-rose-700 hover:bg-rose-50/70'
                    }`}
                  >
                    <Heart
                      className={`w-3.5 h-3.5 ${reactedIds[msg.id] ? 'fill-current' : ''}`}
                      aria-hidden="true"
                    />
                    <span>{msg.hearts}</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
        <div ref={listEndRef} />
      </div>

      {/* Message Composer */}
      <form
        onSubmit={handleSend}
        className="px-4 sm:px-5 py-3 border-t border-[#DCE4DD] bg-[#F7F9F7] space-y-2.5"
      >
        {errorMsg && (
          <p role="alert" className="text-xs font-medium text-rose-700">
            {errorMsg}
          </p>
        )}

        {/* Message Type Segmented Control */}
        <div className="flex items-center gap-1.5 overflow-x-auto">
          <button
            type="button"
            onClick={() => setKind('chat')}
            className={`min-h-[34px] px-2.5 py-1 rounded-lg text-xs font-medium inline-flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
              kind === 'chat'
                ? 'bg-[#1B4D3E] text-white'
                : 'bg-white border border-[#D4DFD6] text-[#374B3F] hover:bg-[#EDF2EE]'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Comentario</span>
          </button>

          <button
            type="button"
            onClick={() => setKind('saludo')}
            className={`min-h-[34px] px-2.5 py-1 rounded-lg text-xs font-medium inline-flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
              kind === 'saludo'
                ? 'bg-[#1B4D3E] text-white'
                : 'bg-white border border-[#D4DFD6] text-[#374B3F] hover:bg-[#EDF2EE]'
            }`}
          >
            <Megaphone className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Saludo al aire</span>
          </button>

          <button
            type="button"
            onClick={() => setKind('peticion')}
            className={`min-h-[34px] px-2.5 py-1 rounded-lg text-xs font-medium inline-flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
              kind === 'peticion'
                ? 'bg-[#1B4D3E] text-white'
                : 'bg-white border border-[#D4DFD6] text-[#374B3F] hover:bg-[#EDF2EE]'
            }`}
          >
            <Music2 className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Pedir canción</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="text"
            value={draft}
            maxLength={280}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={
              kind === 'peticion'
                ? 'Escribe canción y artista para cabina...'
                : kind === 'saludo'
                  ? 'Envía un saludo a tu familia o barrio...'
                  : `Escribe en el chat de ${activeStation.shortName}...`
            }
            aria-label="Mensaje para el chat de oyentes"
            className="flex-1 min-w-0 min-h-[44px] px-3.5 py-2 text-sm rounded-xl border border-[#CBD6CD] bg-white text-[#111E17] placeholder:text-[#6B7D72] focus:outline-2 focus:outline-[#1B4D3E]"
          />
          <button
            type="submit"
            aria-label="Enviar mensaje"
            className="min-h-[44px] min-w-[44px] px-4 rounded-xl bg-amber-500 hover:bg-amber-400 active:scale-[0.98] text-[#0F2B1D] font-semibold text-sm inline-flex items-center justify-center gap-1.5 transition-all cursor-pointer shrink-0"
          >
            <Send className="w-4 h-4" aria-hidden="true" />
            <span className="hidden sm:inline">Enviar</span>
          </button>
        </div>
      </form>
    </aside>
  );
}
