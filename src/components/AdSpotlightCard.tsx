import { useState } from 'react';
import { MessageCircle } from 'lucide-react';
import {
  CORPOCENTROH_WHATSAPP_NUMBER,
  PUBLICIDAD_IMAGE,
  buildWhatsAppUrl,
} from '../data/stations';

export function AdSpotlightCard() {
  const [imgFailed, setImgFailed] = useState(false);

  const advertiseHref = buildWhatsAppUrl(
    CORPOCENTROH_WHATSAPP_NUMBER,
    'Hola CORPOCENTROH, me interesa contratar un espacio publicitario en su sitio web y emisoras.'
  );

  return (
    <aside
      aria-label="Espacio publicitario destacado"
      className="rounded-2xl bg-white border border-[#DCE4DD] overflow-hidden flex flex-col justify-between h-full min-w-0"
    >
      <div className="px-4 py-3 border-b border-[#E7EDE8] bg-[#F1F5F2] flex items-center justify-between gap-2">
        <span className="font-display text-sm font-bold text-[#0F2B1D]">
          Espacio Publicitario
        </span>
        <span className="text-xs text-[#4A5E52]">Zona Central</span>
      </div>

      <div className="p-3 sm:p-4 flex-1 flex items-center justify-center bg-[#FAFBF9]">
        {!imgFailed ? (
          <img
            src={PUBLICIDAD_IMAGE}
            alt="Publicidad pagada: Limpieza Dental, WhatsApp 8796-9945"
            referrerPolicy="no-referrer"
            onError={() => setImgFailed(true)}
            className="w-full h-auto max-h-[430px] rounded-xl object-contain"
          />
        ) : (
          <div className="w-full aspect-[4/5] rounded-xl bg-[#EDF3EE] flex flex-col items-center justify-center text-center p-6 gap-2 text-[#1B4D3E]">
            <p className="font-display text-base font-bold">Espacio Disponible</p>
            <p className="text-xs text-[#4A5E52]">Anuncia tu marca en CORPOCENTROH</p>
          </div>
        )}
      </div>

      <div className="px-4 py-3 border-t border-[#E7EDE8] bg-white flex items-center justify-between gap-3">
        <span className="text-xs text-[#4A5E52]">¿Deseas pautar aquí?</span>
        <a
          href={advertiseHref}
          target="_blank"
          rel="noopener noreferrer"
          className="min-h-[38px] px-3 py-1.5 rounded-lg bg-[#EDF2EE] hover:bg-[#DCE7DF] text-[#0F2B1D] text-xs font-semibold inline-flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0"
        >
          <MessageCircle className="w-3.5 h-3.5 text-[#1B4D3E]" aria-hidden="true" />
          <span>Anunciar</span>
        </a>
      </div>
    </aside>
  );
}
