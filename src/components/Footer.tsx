import {
  CORPOCENTROH_WHATSAPP_DISPLAY,
  CORPOCENTROH_WHATSAPP_NUMBER,
  STATIONS,
  TV_CHANNELS,
  WORLDWEBCONNECT_WHATSAPP_NUMBER,
  buildWhatsAppUrl,
} from '../data/stations';

export function Footer() {
  const corpocentrohWa = buildWhatsAppUrl(
    CORPOCENTROH_WHATSAPP_NUMBER,
    'Hola CORPOCENTROH, me comunico desde su sitio web.'
  );
  const worldwebconnectWa = buildWhatsAppUrl(
    WORLDWEBCONNECT_WHATSAPP_NUMBER,
    'Hola worldwebconnect, vi el sitio web de CORPOCENTROH y me gustaría cotizar.'
  );

  return (
    <footer className="border-t border-[#DCE4DD] bg-[#F1F5F2] pb-20 md:pb-10 pt-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="font-display text-lg font-bold text-[#0F2B1D]">CORPOCENTROH</div>
            <p className="text-xs sm:text-sm text-[#4A5E52]">
              Corporación Centro Radial Hondureña · Siguatepeque, Comayagua, Honduras
            </p>
            <p className="text-xs text-[#4A5E52]">
              WhatsApp oficial:{' '}
              <a
                href={corpocentrohWa}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono font-semibold text-[#1B4D3E] hover:underline"
              >
                {CORPOCENTROH_WHATSAPP_DISPLAY}
              </a>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-[#4A5E52]">
            {STATIONS.map((s) => (
              <span key={s.id} className="whitespace-nowrap">
                {s.shortName} <span className="font-mono tabular-nums">{s.frequency}</span>
              </span>
            ))}
            {TV_CHANNELS.map((tv) => (
              <span key={tv.id} className="whitespace-nowrap">
                {tv.name} <span className="font-mono tabular-nums">{tv.channelNumber}</span>
              </span>
            ))}
          </div>
        </div>

        <div className="pt-4 border-t border-[#DCE4DD] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs text-[#52665A]">
          <span>© {new Date().getFullYear()} CORPOCENTROH · La voz e imagen de la zona central.</span>
          <span>
            Este sitio web diseñado por{' '}
            <a
              href={worldwebconnectWa}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-[#1B4D3E] hover:underline"
            >
              worldwebconnect
            </a>
          </span>
        </div>
      </div>
    </footer>
  );
}
