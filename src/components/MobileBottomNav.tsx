import { Radio, Tv, MessageSquare, CalendarClock } from 'lucide-react';

export function MobileBottomNav() {
  return (
    <nav
      aria-label="Navegación rápida móvil"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 h-14 bg-[#F7F8F5]/95 backdrop-blur-md border-t border-[#DCE4DD] px-2 pb-[env(safe-area-inset-bottom)]"
    >
      <div className="grid grid-cols-4 h-full items-center">
        <a
          href="#en-vivo"
          className="min-h-[44px] flex flex-col items-center justify-center gap-0.5 text-[#0F2B1D] active:bg-[#E4ECE6] rounded-lg transition-colors"
        >
          <Radio className="w-5 h-5" aria-hidden="true" />
          <span className="text-[11px] font-medium leading-none">Radio</span>
        </a>

        <a
          href="#tv-en-vivo"
          className="min-h-[44px] flex flex-col items-center justify-center gap-0.5 text-[#374B3F] active:bg-[#E4ECE6] rounded-lg transition-colors"
        >
          <Tv className="w-5 h-5" aria-hidden="true" />
          <span className="text-[11px] font-medium leading-none">TV Vivo</span>
        </a>

        <a
          href="#chat-oyentes"
          className="min-h-[44px] flex flex-col items-center justify-center gap-0.5 text-[#374B3F] active:bg-[#E4ECE6] rounded-lg transition-colors"
        >
          <MessageSquare className="w-5 h-5" aria-hidden="true" />
          <span className="text-[11px] font-medium leading-none">Chat</span>
        </a>

        <a
          href="#programacion"
          className="min-h-[44px] flex flex-col items-center justify-center gap-0.5 text-[#374B3F] active:bg-[#E4ECE6] rounded-lg transition-colors"
        >
          <CalendarClock className="w-5 h-5" aria-hidden="true" />
          <span className="text-[11px] font-medium leading-none">Programas</span>
        </a>
      </div>
    </nav>
  );
}
