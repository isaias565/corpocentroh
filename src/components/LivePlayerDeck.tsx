import { useState } from 'react';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Share2,
  Clock,
  Radio,
  Loader2,
  Check,
  RefreshCw,
} from 'lucide-react';
import {
  HERO_PINE_IMAGE,
  STATIONS,
  getCurrentShowForStation,
  getHondurasClockLabel,
  type RadioStation,
  type StationId,
} from '../data/stations';

interface LivePlayerDeckProps {
  activeStation: RadioStation;
  isPlaying: boolean;
  isBuffering: boolean;
  streamError: string | null;
  volume: number;
  isMuted: boolean;
  sleepMinutes: number | null;
  onSelectStation: (stationId: StationId, autoPlay?: boolean) => void;
  onTogglePlay: () => void;
  onRetryStream: () => void;
  onVolumeChange: (nextVolume: number) => void;
  onToggleMute: () => void;
  onSetSleepMinutes: (minutes: number | null) => void;
}

export function LivePlayerDeck({
  activeStation,
  isPlaying,
  isBuffering,
  streamError,
  volume,
  isMuted,
  sleepMinutes,
  onSelectStation,
  onTogglePlay,
  onRetryStream,
  onVolumeChange,
  onToggleMute,
  onSetSleepMinutes,
}: LivePlayerDeckProps) {
  const [heroImgFailed, setHeroImgFailed] = useState(false);
  const [coverImgFailed, setCoverImgFailed] = useState<Record<string, boolean>>({});
  const [copiedShare, setCopiedShare] = useState(false);
  const [showSleepMenu, setShowSleepMenu] = useState(false);

  const currentShow = getCurrentShowForStation(activeStation);
  const hondurasTime = getHondurasClockLabel();

  async function handleShare() {
    const shareData = {
      title: `${activeStation.name} — CORPOCENTROH Siguatepeque`,
      text: `Escucha en vivo ${activeStation.name} (${activeStation.frequency}) desde Siguatepeque, Honduras.`,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        return;
      }
    } catch {
      // User cancelled or share unsupported, fall back to clipboard
    }

    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopiedShare(true);
      window.setTimeout(() => setCopiedShare(false), 2400);
    } catch {
      // Ignore clipboard failures in restricted frames
    }
  }

  return (
    <section
      aria-label="Reproductor en vivo de CORPOCENTROH"
      className="relative rounded-2xl overflow-hidden bg-[#0F2B1D] text-white shadow-sm min-w-0"
    >
      {/* Siguatepeque Pine Sunrise Atmospheric Backdrop */}
      {!heroImgFailed && (
        <img
          src={HERO_PINE_IMAGE}
          alt="Amanecer sobre los pinares de Siguatepeque, Honduras"
          referrerPolicy="no-referrer"
          onError={() => setHeroImgFailed(true)}
          className="absolute inset-0 w-full h-full object-cover object-center opacity-40 pointer-events-none select-none"
        />
      )}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-br from-[#0B2015]/95 via-[#0F2B1D]/88 to-[#173A28]/80 pointer-events-none"
      />

      <div className="relative z-10 p-5 sm:p-7 lg:p-8 flex flex-col gap-6 min-w-0">
        {/* Editorial Kicker & Headline */}
        <div className="space-y-2.5 min-w-0">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-medium text-[#D9E5DC]">
            <span>Siguatepeque, Comayagua</span>
            <span aria-hidden="true">·</span>
            <span>La Ciudad de los Pinares</span>
            {hondurasTime && (
              <>
                <span aria-hidden="true">·</span>
                <span className="font-mono tabular-nums">Hora HN {hondurasTime}</span>
              </>
            )}
          </div>

          <h1
            className="font-display font-bold tracking-tight text-white leading-[1.12] max-w-2xl"
            style={{
              fontSize: 'clamp(1.75rem, 3.3vw, 2.75rem)',
              textWrap: 'balance',
            }}
          >
            La voz e imagen de la zona central, en tu celular y en todo el mundo.
          </h1>

          <p className="text-sm sm:text-[15px] text-[#DCE7DF] leading-relaxed max-w-xl">
            Sintoniza en directo las cuatro frecuencias de CORPOCENTROH desde 1965 y comparte tus saludos con nuestra cabina.
          </p>
        </div>

        {/* Station Selector (Grid ensures 0 horizontal overflow on 360px phones) */}
        <div role="tablist" aria-label="Seleccionar emisora en vivo" className="grid grid-cols-2 sm:grid-cols-4 gap-2 min-w-0">
          {STATIONS.map((station) => {
            const isSelected = station.id === activeStation.id;
            return (
              <button
                key={station.id}
                role="tab"
                aria-selected={isSelected}
                type="button"
                onClick={() => onSelectStation(station.id, true)}
                className={`min-h-[48px] px-3 py-2.5 rounded-xl text-left transition-all cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-400 min-w-0 ${
                  isSelected
                    ? 'bg-white text-[#0F2B1D] shadow-sm'
                    : 'bg-white/10 hover:bg-white/16 text-white border border-white/12'
                }`}
              >
                <div className="text-xs sm:text-sm font-semibold truncate">{station.shortName}</div>
                <div
                  className={`font-mono text-[11px] tabular-nums truncate ${
                    isSelected ? 'text-[#375143]' : 'text-[#C8DACD]'
                  }`}
                >
                  {station.frequency}
                </div>
              </button>
            );
          })}
        </div>

        {/* Active Station Deck Card */}
        <div className="rounded-xl bg-[#091A11]/82 border border-white/12 p-4 sm:p-5 flex flex-col gap-4 min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 min-w-0">
            {/* Cover Art with CSS Fallback */}
            <div className="flex items-center gap-4 min-w-0 flex-1">
              <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden shrink-0 bg-[#1B4D3E] flex items-center justify-center border border-white/15">
                {!coverImgFailed[activeStation.id] ? (
                  <img
                    src={activeStation.coverImage}
                    alt={`Cabina de ${activeStation.name}`}
                    referrerPolicy="no-referrer"
                    onError={() =>
                      setCoverImgFailed((prev) => ({ ...prev, [activeStation.id]: true }))
                    }
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Radio className="w-7 h-7 text-amber-300" aria-hidden="true" />
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 text-xs text-amber-300 font-medium">
                  <span className="font-mono tabular-nums">{activeStation.frequency}</span>
                  <span aria-hidden="true">·</span>
                  <span>
                    {isBuffering
                      ? 'Conectando señal...'
                      : isPlaying
                        ? 'Transmitiendo en vivo'
                        : 'Señal en pausa'}
                  </span>
                </div>

                <h2 className="font-display text-lg sm:text-xl font-bold text-white truncate mt-0.5">
                  {activeStation.name}
                </h2>

                <p className="text-xs sm:text-sm text-[#CBE0D2] truncate mt-0.5">
                  Ahora: <span className="font-medium text-white">{currentShow.title}</span> ·{' '}
                  <span className="font-mono text-xs tabular-nums">{currentShow.timeLabel}</span>
                </p>
              </div>
            </div>

            {/* Primary Play / Pause Control + Equalizer */}
            <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-1 sm:pt-0">
              {/* Live audio level bars */}
              <div
                aria-hidden="true"
                className="flex items-end gap-1 h-7 px-2"
              >
                {[0, 120, 240, 80, 180].map((delay, idx) => (
                  <span
                    key={idx}
                    className={`w-1 rounded-full bg-amber-400 transition-transform duration-200 ${
                      isPlaying && !isBuffering ? 'eq-bar-active h-6' : 'h-2 opacity-45'
                    }`}
                    style={
                      isPlaying && !isBuffering
                        ? { animationDelay: `${delay}ms` }
                        : undefined
                    }
                  />
                ))}
              </div>

              <button
                type="button"
                onClick={onTogglePlay}
                aria-label={isPlaying ? 'Pausar transmisión' : 'Reproducir transmisión en vivo'}
                className="h-[52px] min-w-[148px] px-5 rounded-xl bg-amber-500 hover:bg-amber-400 active:scale-[0.98] text-[#0F2B1D] font-semibold text-sm inline-flex items-center justify-center gap-2.5 transition-all cursor-pointer shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white whitespace-nowrap shrink-0"
              >
                {isBuffering ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin shrink-0" aria-hidden="true" />
                    <span>Conectando</span>
                  </>
                ) : isPlaying ? (
                  <>
                    <Pause className="w-5 h-5 fill-current shrink-0" aria-hidden="true" />
                    <span>Pausar Audio</span>
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5 fill-current shrink-0" aria-hidden="true" />
                    <span>Reproducir</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Stream Error Banner (if station stream momentarily fails) */}
          {streamError && (
            <div
              role="alert"
              className="rounded-lg bg-rose-950/75 border border-rose-400/35 px-3.5 py-2.5 flex flex-wrap items-center justify-between gap-2 text-xs text-rose-100"
            >
              <span>{streamError}</span>
              <button
                type="button"
                onClick={onRetryStream}
                className="min-h-[36px] px-3 py-1.5 rounded-md bg-white/15 hover:bg-white/25 text-white font-medium inline-flex items-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Reintentar señal</span>
              </button>
            </div>
          )}

          {/* Secondary Player Utility Bar */}
          <div className="pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
            {/* Volume Controls */}
            <div className="flex items-center gap-2.5 min-w-0">
              <button
                type="button"
                onClick={onToggleMute}
                aria-label={isMuted || volume === 0 ? 'Activar sonido' : 'Silenciar'}
                className="min-h-[44px] min-w-[44px] -ml-2 flex items-center justify-center rounded-lg text-[#D9E5DC] hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="w-5 h-5" aria-hidden="true" />
                ) : (
                  <Volume2 className="w-5 h-5" aria-hidden="true" />
                )}
              </button>
              <label htmlFor="radio-volume" className="sr-only">
                Volumen de radio
              </label>
              <input
                id="radio-volume"
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={isMuted ? 0 : volume}
                onChange={(e) => onVolumeChange(Number(e.target.value))}
                className="w-24 sm:w-32 accent-amber-400 cursor-pointer"
              />
              <span className="font-mono text-xs tabular-nums text-[#C8DACD] w-9">
                {Math.round((isMuted ? 0 : volume) * 100)}%
              </span>
            </div>

            {/* Sleep Timer & Share */}
            <div className="relative flex items-center gap-2">
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowSleepMenu((prev) => !prev)}
                  className="min-h-[44px] px-3 py-2 rounded-lg bg-white/8 hover:bg-white/14 text-xs font-medium text-[#E4EEE7] inline-flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap"
                >
                  <Clock className="w-4 h-4 text-amber-300 shrink-0" aria-hidden="true" />
                  <span>{sleepMinutes ? `Apagado: ${sleepMinutes}m` : 'Temporizador'}</span>
                </button>

                {showSleepMenu && (
                  <div className="absolute right-0 bottom-12 z-20 w-40 rounded-xl bg-[#0C2116] border border-white/15 p-1.5 shadow-lg">
                    {[15, 30, 60].map((mins) => (
                      <button
                        key={mins}
                        type="button"
                        onClick={() => {
                          onSetSleepMinutes(mins);
                          setShowSleepMenu(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                          sleepMinutes === mins
                            ? 'bg-amber-500 text-[#0F2B1D]'
                            : 'text-white hover:bg-white/10'
                        }`}
                      >
                        Apagar en {mins} min
                      </button>
                    ))}
                    {sleepMinutes !== null && (
                      <button
                        type="button"
                        onClick={() => {
                          onSetSleepMinutes(null);
                          setShowSleepMenu(false);
                        }}
                        className="w-full text-left px-3 py-2 rounded-lg text-xs font-medium text-rose-200 hover:bg-white/10 transition-colors cursor-pointer"
                      >
                        Desactivar
                      </button>
                    )}
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={handleShare}
                className="min-h-[44px] px-3 py-2 rounded-lg bg-white/8 hover:bg-white/14 text-xs font-medium text-[#E4EEE7] inline-flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap"
              >
                {copiedShare ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-300 shrink-0" aria-hidden="true" />
                    <span>Enlace copiado</span>
                  </>
                ) : (
                  <>
                    <Share2 className="w-4 h-4 text-amber-300 shrink-0" aria-hidden="true" />
                    <span>Compartir</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
