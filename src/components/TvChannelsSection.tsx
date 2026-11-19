import { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';
import { Tv, Play, RefreshCw, Volume2, VolumeX } from 'lucide-react';
import { TV_CHANNELS, type TvChannelId } from '../data/stations';

interface TvChannelsSectionProps {
  onTvStartPlaying: () => void;
}

export function TvChannelsSection({ onTvStartPlaying }: TvChannelsSectionProps) {
  const [selectedChannelId, setSelectedChannelId] = useState<TvChannelId>('tvcentrohd');
  const [isTvActive, setIsTvActive] = useState(false);
  const [isTvMuted, setIsTvMuted] = useState(false);
  const [tvError, setTvError] = useState<string | null>(null);
  const [failedLogos, setFailedLogos] = useState<Record<string, boolean>>({});

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const hlsRef = useRef<Hls | null>(null);

  const selectedChannel =
    TV_CHANNELS.find((c) => c.id === selectedChannelId) ?? TV_CHANNELS[0];

  function loadAndPlayChannel(src: string) {
    const video = videoRef.current;
    if (!video) return;

    setTvError(null);

    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    const attemptPlay = () => {
      video.muted = false;
      setIsTvMuted(false);
      const p = video.play();
      if (p && typeof p.catch === 'function') {
        p.catch(() => {
          // If browser autoplay policy blocks unmuted playback, start muted so video renders immediately
          video.muted = true;
          setIsTvMuted(true);
          void video.play().catch(() => {
            // Native video controls remain available for manual tap
          });
        });
      }
    };

    if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: false,
        backBufferLength: 30,
        maxBufferLength: 30,
      });
      hlsRef.current = hls;
      hls.loadSource(src);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        attemptPlay();
      });

      hls.on(Hls.Events.ERROR, (_event, data) => {
        if (!data.fatal) return;
        if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
          hls.startLoad();
        } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
          hls.recoverMediaError();
        } else {
          setTvError(
            'La señal de video tuvo una interrupción o está fuera de línea en este momento.'
          );
        }
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = src;
      video.load();
      attemptPlay();
    } else {
      setTvError('Tu navegador no soporta reproducción de video HLS en directo.');
    }
  }

  useEffect(() => {
    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, []);

  function handleActivateChannel(channelId: TvChannelId) {
    const channel = TV_CHANNELS.find((c) => c.id === channelId) ?? TV_CHANNELS[0];
    setSelectedChannelId(channelId);
    setTvError(null);
    setIsTvActive(true);
    onTvStartPlaying();
    loadAndPlayChannel(channel.hlsUrl);
  }

  function handleUnmuteTv() {
    const video = videoRef.current;
    if (!video) return;
    video.muted = false;
    setIsTvMuted(false);
  }

  return (
    <section id="tv-en-vivo" className="scroll-mt-20 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div className="space-y-1.5 max-w-2xl">
          <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-[#0F2B1D]">
            Canales de Televisión en Vivo
          </h2>
          <p className="text-sm sm:text-base text-[#4A5E52] leading-relaxed">
            Mira la señal en directo de TV Centro HD y TV Centro+ desde Siguatepeque para toda la zona central.
          </p>
        </div>
        <div className="text-xs font-medium text-[#52665A] shrink-0">
          Señal Digital Abierta · Canal 27.1 y 27.2
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6 items-stretch">
        {/* Video Player Viewport */}
        <div className="lg:col-span-8 rounded-2xl overflow-hidden bg-[#0B1E14] border border-[#1E3B2B] flex flex-col min-w-0">
          <div className="relative aspect-video w-full bg-[#07140D] flex items-center justify-center">
            {/* Keep video element permanently mounted so user click gestures attach reliably on iOS/Android */}
            <video
              ref={videoRef}
              controls
              playsInline
              poster={selectedChannel.logoImage}
              onPlay={onTvStartPlaying}
              onVolumeChange={() => {
                if (videoRef.current) {
                  setIsTvMuted(videoRef.current.muted);
                }
              }}
              onError={() => {
                if (isTvActive) {
                  setTvError('No se pudo cargar la transmisión de video en este momento.');
                }
              }}
              className={`w-full h-full object-contain bg-black ${isTvActive ? 'block' : 'hidden'}`}
            />

            {isTvActive && isTvMuted && (
              <button
                type="button"
                onClick={handleUnmuteTv}
                className="absolute top-3 right-3 z-10 min-h-[40px] px-3.5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-[#0F2B1D] text-xs font-semibold inline-flex items-center gap-1.5 shadow-md cursor-pointer"
              >
                <VolumeX className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span>Activar sonido</span>
              </button>
            )}

            {!isTvActive && (
              <div className="absolute inset-0 p-6 flex flex-col items-center justify-center text-center gap-4 bg-gradient-to-br from-[#0B1F15] to-[#133323]">
                {!failedLogos[selectedChannel.id] ? (
                  <img
                    src={selectedChannel.logoImage}
                    alt={selectedChannel.name}
                    referrerPolicy="no-referrer"
                    onError={() =>
                      setFailedLogos((prev) => ({ ...prev, [selectedChannel.id]: true }))
                    }
                    className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-contain bg-black/30 p-2 border border-white/15"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-2xl bg-[#1B4D3E] flex items-center justify-center text-amber-300">
                    <Tv className="w-9 h-9" aria-hidden="true" />
                  </div>
                )}

                <div className="space-y-1 max-w-md">
                  <div className="font-mono text-xs tabular-nums text-amber-300">
                    {selectedChannel.channelNumber}
                  </div>
                  <h3 className="font-display text-xl sm:text-2xl font-bold text-white">
                    {selectedChannel.name}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#CBE0D2]">
                    {selectedChannel.tagline}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => handleActivateChannel(selectedChannel.id)}
                  className="min-h-[48px] px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 active:scale-[0.98] text-[#0F2B1D] font-semibold text-sm inline-flex items-center gap-2 transition-all cursor-pointer shadow-sm"
                >
                  <Play className="w-4 h-4 fill-current shrink-0" aria-hidden="true" />
                  <span>Ver {selectedChannel.name} en Vivo</span>
                </button>
              </div>
            )}
          </div>

          <div className="px-4 sm:px-5 py-3 bg-[#0E261A] border-t border-white/10 flex flex-wrap items-center justify-between gap-2 text-xs text-[#DCE7DF]">
            <div className="flex items-center gap-2 min-w-0">
              <Tv className="w-4 h-4 text-amber-300 shrink-0" aria-hidden="true" />
              <span className="font-semibold text-white truncate">{selectedChannel.name}</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono tabular-nums text-[#C8DACD]">{selectedChannel.channelNumber}</span>
            </div>

            {tvError ? (
              <button
                type="button"
                onClick={() => handleActivateChannel(selectedChannel.id)}
                className="min-h-[34px] px-3 py-1 rounded-lg bg-white/12 hover:bg-white/20 text-white font-medium inline-flex items-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Reintentar señal</span>
              </button>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-[#C8DACD]">
                <Volume2 className="w-3.5 h-3.5 text-amber-300" aria-hidden="true" />
                <span>Al iniciar TV se pausa la radio automáticamente</span>
              </span>
            )}
          </div>

          {tvError && (
            <div
              role="alert"
              className="px-4 sm:px-5 py-2.5 bg-rose-950/90 border-t border-rose-400/30 text-xs text-rose-100"
            >
              {tvError}
            </div>
          )}
        </div>

        {/* Channel Switcher Cards */}
        <div className="lg:col-span-4 flex flex-col gap-4 min-w-0">
          {TV_CHANNELS.map((channel) => {
            const isSelected = channel.id === selectedChannel.id;
            return (
              <article
                key={channel.id}
                className={`rounded-2xl bg-white border p-4 sm:p-5 flex-1 flex flex-col justify-between gap-4 transition-colors min-w-0 ${
                  isSelected
                    ? 'border-[#1B4D3E]'
                    : 'border-[#DCE4DD] hover:border-[#B6C7B9]'
                }`}
              >
                <div className="flex items-start gap-3.5 min-w-0">
                  <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-[#0F2B1D] border border-[#DCE4DD] flex items-center justify-center">
                    {!failedLogos[channel.id] ? (
                      <img
                        src={channel.logoImage}
                        alt={`Logo de ${channel.name}`}
                        referrerPolicy="no-referrer"
                        onError={() =>
                          setFailedLogos((prev) => ({ ...prev, [channel.id]: true }))
                        }
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <Tv className="w-7 h-7 text-amber-300" aria-hidden="true" />
                    )}
                  </div>

                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="font-mono text-xs tabular-nums font-medium text-[#1B4D3E]">
                      {channel.channelNumber}
                    </div>
                    <h3 className="font-display text-lg font-bold text-[#0F2B1D] truncate">
                      {channel.name}
                    </h3>
                    <p className="text-xs sm:text-sm text-[#4A5E52] leading-relaxed">
                      {channel.description}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleActivateChannel(channel.id)}
                  className={`w-full min-h-[44px] px-4 py-2 rounded-xl text-sm font-semibold inline-flex items-center justify-center gap-2 transition-colors cursor-pointer ${
                    isSelected && isTvActive
                      ? 'bg-amber-500 hover:bg-amber-400 text-[#0F2B1D]'
                      : 'bg-[#1B4D3E] hover:bg-[#143B2F] text-white'
                  }`}
                >
                  <Play className="w-4 h-4 fill-current shrink-0" aria-hidden="true" />
                  <span>
                    {isSelected && isTvActive
                      ? `Viendo ${channel.name}`
                      : `Sintonizar ${channel.name}`}
                  </span>
                </button>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
