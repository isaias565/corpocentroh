import { useState } from 'react';
import {
  Play,
  ExternalLink,
  Share2,
  Radio,
  Check,
  MessageCircle,
} from 'lucide-react';
import {
  CORPOCENTROH_WHATSAPP_DISPLAY,
  CORPOCENTROH_WHATSAPP_NUMBER,
  HERO_PINE_IMAGE,
  STATIONS,
  buildWhatsAppUrl,
  getCurrentShowForStation,
  getHondurasClockLabel,
  type RadioStation,
  type StationId,
} from '../data/stations';

interface LivePlayerDeckProps {
  activeStation: RadioStation;
  onSelectStation: (stationId: StationId) => void;
}

export function LivePlayerDeck({
  activeStation,
  onSelectStation,
}: LivePlayerDeckProps) {
  const [heroImgFailed, setHeroImgFailed] = useState(false);
  const [coverImgFailed, setCoverImgFailed] = useState<Record<string, boolean>>({});
  const [copiedShare, setCopiedShare] = useState(false);

  const currentShow = getCurrentShowForStation(activeStation);
  const hondurasTime = getHondurasClockLabel();
  const cabinWhatsAppUrl = buildWhatsAppUrl(
    CORPOCENTROH_WHATSAPP_NUMBER,
    `Hola ${activeStation.name}, les escribo desde la web.`
  );

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
      aria-label="Sintonizador en vivo de CORPOCENTROH"
      className="relative rounded-2xl overflow-hidden bg-[#0F2B1D] text-white shadow-sm min-w-0 h-full flex flex-col justify-between"
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

      <div className="relative z-10 p-5 sm:p-7 lg:p-8 flex flex-col gap-6 min-w-0 flex-1 justify-between">
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
            Elige cualquiera de las cuatro emisoras de CORPOCENTROH para abrir la señal de audio en vivo directamente en tu navegador o teléfono.
          </p>
        </div>

        {/* Station Selector */}
        <div className="space-y-4 min-w-0">
          <div
            role="tablist"
            aria-label="Seleccionar emisora en vivo"
            className="grid grid-cols-2 sm:grid-cols-4 gap-2 min-w-0"
          >
            {STATIONS.map((station) => {
              const isSelected = station.id === activeStation.id;
              return (
                <button
                  key={station.id}
                  role="tab"
                  aria-selected={isSelected}
                  type="button"
                  onClick={() => onSelectStation(station.id)}
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
              {/* Station Logo */}
              <div className="flex items-center gap-4 min-w-0 flex-1">
                <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden shrink-0 bg-white/95 p-1 flex items-center justify-center border border-white/20">
                  {!coverImgFailed[activeStation.id] ? (
                    <img
                      src={activeStation.coverImage}
                      alt={`Logo de ${activeStation.name}`}
                      referrerPolicy="no-referrer"
                      onError={() =>
                        setCoverImgFailed((prev) => ({ ...prev, [activeStation.id]: true }))
                      }
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <Radio className="w-7 h-7 text-[#1B4D3E]" aria-hidden="true" />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 text-xs text-amber-300 font-medium">
                    <span className="font-mono tabular-nums">{activeStation.frequency}</span>
                    <span aria-hidden="true">·</span>
                    <span>Transmisión en vivo 24/7</span>
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

              {/* Direct Blank Tab Play Link */}
              <div className="flex items-center justify-end shrink-0 pt-1 sm:pt-0">
                <a
                  href={activeStation.directStreamUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto h-[52px] min-w-[172px] px-5 rounded-xl bg-amber-500 hover:bg-amber-400 active:scale-[0.98] text-[#0F2B1D] font-semibold text-sm inline-flex items-center justify-center gap-2 transition-all shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white whitespace-nowrap shrink-0"
                >
                  <Play className="w-5 h-5 fill-current shrink-0" aria-hidden="true" />
                  <span>Escuchar en Vivo</span>
                  <ExternalLink className="w-4 h-4 shrink-0" aria-hidden="true" />
                </a>
              </div>
            </div>

            {/* Secondary Utility Bar */}
            <div className="pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
              <span className="text-xs text-[#C8DACD]">
                CORPOCENTROH llevando noticias, entretenimiento y buena música sin parar.
              </span>

              <div className="flex items-center gap-2">
                <a
                  href={cabinWhatsAppUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="min-h-[40px] px-3 py-2 rounded-lg bg-white/8 hover:bg-white/14 text-xs font-medium text-[#E4EEE7] inline-flex items-center gap-1.5 transition-colors whitespace-nowrap"
                >
                  <MessageCircle className="w-4 h-4 text-amber-300 shrink-0" aria-hidden="true" />
                  <span>WhatsApp {CORPOCENTROH_WHATSAPP_DISPLAY}</span>
                </a>

                <button
                  type="button"
                  onClick={handleShare}
                  className="min-h-[40px] px-3 py-2 rounded-lg bg-white/8 hover:bg-white/14 text-xs font-medium text-[#E4EEE7] inline-flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap"
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
      </div>
    </section>
  );
}
