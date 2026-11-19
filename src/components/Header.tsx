import { useState } from 'react';
import { Play, ExternalLink } from 'lucide-react';
import { CORPOCENTROH_LOGO, type RadioStation } from '../data/stations';

interface HeaderProps {
  activeStation: RadioStation;
}

export function Header({ activeStation }: HeaderProps) {
  const [logoFailed, setLogoFailed] = useState(false);

  return (
    <header className="sticky top-0 z-40 h-14 md:h-16 w-full bg-[#F7F8F5]/95 backdrop-blur-md border-b border-[#DCE4DD]">
      <div className="max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4 md:gap-8">
        {/* Zone 1: Official CORPOCENTROH brand logo in corner */}
        <a
          href="#en-vivo"
          aria-label="CORPOCENTROH Siguatepeque Inicio"
          className="inline-flex items-center shrink-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#1B4D3E]"
        >
          {!logoFailed ? (
            <img
              src={CORPOCENTROH_LOGO}
              alt="CORPOCENTROH"
              referrerPolicy="no-referrer"
              onError={() => setLogoFailed(true)}
              className="h-10 sm:h-11 w-auto object-contain shrink-0"
            />
          ) : (
            <span className="font-display text-lg sm:text-xl font-bold tracking-tight text-[#0F2B1D] whitespace-nowrap shrink-0">
              CORPOCENTROH
            </span>
          )}
        </a>

        {/* Zone 2: Clean single-line text navigation links */}
        <nav
          aria-label="Navegación principal"
          className="hidden md:flex items-center gap-6 text-sm font-medium text-[#374B3F]"
        >
          <a
            href="#en-vivo"
            className="hover:text-[#0F2B1D] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
          >
            En Vivo
          </a>
          <a
            href="#tv-en-vivo"
            className="hover:text-[#0F2B1D] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
          >
            Canales TV
          </a>
          <a
            href="#emisoras"
            className="hover:text-[#0F2B1D] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
          >
            Emisoras
          </a>
          <a
            href="#programacion"
            className="hover:text-[#0F2B1D] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
          >
            Programación
          </a>
          <a
            href="#nosotros"
            className="hover:text-[#0F2B1D] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
          >
            Publicidad
          </a>
        </nav>

        {/* Zone 3: Direct blank-tab radio CTA */}
        <div className="flex items-center shrink-0">
          <a
            href={activeStation.directStreamUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Escuchar ${activeStation.shortName} en vivo en nueva pestaña`}
            className="min-h-[40px] sm:min-h-[44px] px-4 py-2 rounded-lg bg-[#1B4D3E] hover:bg-[#143B2F] active:scale-[0.98] text-white text-xs sm:text-sm font-semibold inline-flex items-center gap-2 transition-all whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1B4D3E]"
          >
            <Play className="w-4 h-4 fill-current shrink-0" aria-hidden="true" />
            <span>Escuchar {activeStation.shortName}</span>
            <ExternalLink className="w-3.5 h-3.5 opacity-80 shrink-0 hidden sm:inline" aria-hidden="true" />
          </a>
        </div>
      </div>
    </header>
  );
}
