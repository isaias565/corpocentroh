import { useState } from 'react';
import { Play, ExternalLink, Newspaper } from 'lucide-react';
import { INFORMATIVO_IMAGE, STATIONS } from '../data/stations';

export function InformativoBanner() {
  const [imgFailed, setImgFailed] = useState(false);
  const laCentro = STATIONS[0];

  return (
    <section
      aria-label="Programa destacado: El Informativo de las 11"
      className="rounded-2xl bg-white border border-[#DCE4DD] overflow-hidden grid grid-cols-1 md:grid-cols-12 items-center"
    >
      <div className="md:col-span-5 lg:col-span-4 bg-[#0B2420] flex items-center justify-center p-3 sm:p-4">
        {!imgFailed ? (
          <img
            src={INFORMATIVO_IMAGE}
            alt="El Informativo de las 11 — La Centro 96.3 FM"
            referrerPolicy="no-referrer"
            onError={() => setImgFailed(true)}
            className="w-full max-w-[340px] h-auto rounded-xl object-contain"
          />
        ) : (
          <div className="w-full aspect-square max-w-[300px] rounded-xl bg-[#133830] flex flex-col items-center justify-center text-white p-6 text-center gap-2">
            <Newspaper className="w-10 h-10 text-amber-300" aria-hidden="true" />
            <span className="font-display text-lg font-bold">El Informativo de las 11</span>
          </div>
        )}
      </div>

      <div className="md:col-span-7 lg:col-span-8 p-6 sm:p-8 space-y-4">
        <div className="text-xs font-semibold text-[#1B4D3E]">
          Espacio Informativo Destacado · La Centro 96.3 FM
        </div>
        <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-[#0F2B1D] leading-tight">
          El Informativo de las 11
        </h2>
        <p className="text-sm sm:text-base text-[#4A5E52] leading-relaxed max-w-2xl">
          Noticias locales, análisis de actualidad y la información de primera mano que acontece en Siguatepeque y toda la zona central de Honduras. ¡Porque usted debe saberlo, por eso se lo decimos!
        </p>

        <div className="pt-1 flex flex-wrap items-center gap-3">
          <a
            href={laCentro.directStreamUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="min-h-[46px] px-5 py-2.5 rounded-xl bg-[#1B4D3E] hover:bg-[#143B2F] text-white text-sm font-semibold inline-flex items-center gap-2 transition-colors"
          >
            <Play className="w-4 h-4 fill-current shrink-0" aria-hidden="true" />
            <span>Escuchar La Centro 96.3 FM</span>
            <ExternalLink className="w-3.5 h-3.5 opacity-80 shrink-0" aria-hidden="true" />
          </a>
        </div>
      </div>
    </section>
  );
}
