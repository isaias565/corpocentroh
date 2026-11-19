import { useState } from 'react';
import { Play, Pause, Radio } from 'lucide-react';
import {
  STATIONS,
  getCurrentShowForStation,
  getHondurasHour,
  type StationId,
} from '../data/stations';

interface StationsAndScheduleProps {
  activeStationId: StationId;
  isPlaying: boolean;
  onSelectStation: (stationId: StationId, autoPlay?: boolean) => void;
  onTogglePlay: () => void;
}

export function StationsAndSchedule({
  activeStationId,
  isPlaying,
  onSelectStation,
  onTogglePlay,
}: StationsAndScheduleProps) {
  const [scheduleTab, setScheduleTab] = useState<StationId>(activeStationId);
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});

  const hondurasHour = getHondurasHour();
  const scheduleStation = STATIONS.find((s) => s.id === scheduleTab) ?? STATIONS[0];
  const currentScheduleShow = getCurrentShowForStation(scheduleStation, hondurasHour);

  return (
    <div className="space-y-14 sm:space-y-16">
      {/* Section: Emisoras CORPOCENTROH */}
      <section id="emisoras" className="scroll-mt-20 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div className="space-y-1.5 max-w-2xl">
            <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-[#0F2B1D]">
              Cuatro frecuencias de Siguatepeque para ti
            </h2>
            <p className="text-sm sm:text-base text-[#4A5E52] leading-relaxed">
              Desde noticias regionales hasta música del recuerdo, éxitos juveniles y baladas románticas. Elige tu señal favorita con un toque.
            </p>
          </div>
          <div className="text-xs font-medium text-[#52665A] shrink-0">
            Audio digital 128 kbps · Señal continua
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {STATIONS.map((station) => {
            const isSelected = station.id === activeStationId;
            const isThisPlaying = isSelected && isPlaying;
            const currentShow = getCurrentShowForStation(station, hondurasHour);

            return (
              <article
                key={station.id}
                className={`rounded-2xl bg-white border transition-colors flex flex-col overflow-hidden min-w-0 ${
                  isSelected ? 'border-[#1B4D3E]' : 'border-[#DCE4DD] hover:border-[#B6C7B9]'
                }`}
              >
                {/* Official Station Logo */}
                <div className="relative aspect-square w-full bg-[#F5F7F5] p-5 border-b border-[#E7EDE8] flex items-center justify-center overflow-hidden">
                  {!failedImages[station.id] ? (
                    <img
                      src={station.coverImage}
                      alt={`Logo de ${station.name}`}
                      referrerPolicy="no-referrer"
                      onError={() =>
                        setFailedImages((prev) => ({ ...prev, [station.id]: true }))
                      }
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <div className="w-full h-full rounded-xl flex items-center justify-center bg-[#143B2F] text-amber-300">
                      <Radio className="w-10 h-10" aria-hidden="true" />
                    </div>
                  )}
                </div>

                {/* Body */}
                <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between gap-4 min-w-0">
                  <div className="space-y-2 min-w-0">
                    <div>
                      <div className="font-mono text-xs tabular-nums text-[#1B4D3E] font-semibold">
                        {station.frequency}
                      </div>
                      <h3 className="font-display text-lg font-bold text-[#0F2B1D] leading-tight truncate mt-0.5">
                        {station.name}
                      </h3>
                    </div>
                    <p className="text-xs font-medium text-[#374B3F]">
                      Al aire: <span className="text-[#0F2B1D] font-semibold">{currentShow.title}</span>
                    </p>
                    <p className="text-sm text-[#4A5E52] leading-relaxed">
                      {station.description}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      if (isSelected) {
                        onTogglePlay();
                      } else {
                        onSelectStation(station.id, true);
                        setScheduleTab(station.id);
                      }
                    }}
                    className={`w-full min-h-[44px] px-4 py-2 rounded-xl text-sm font-semibold inline-flex items-center justify-center gap-2 transition-colors cursor-pointer ${
                      isThisPlaying
                        ? 'bg-amber-500 hover:bg-amber-400 text-[#0F2B1D]'
                        : isSelected
                          ? 'bg-[#1B4D3E] hover:bg-[#143B2F] text-white'
                          : 'bg-[#EDF2EE] hover:bg-[#DCE7DF] text-[#0F2B1D]'
                    }`}
                  >
                    {isThisPlaying ? (
                      <>
                        <Pause className="w-4 h-4 fill-current shrink-0" aria-hidden="true" />
                        <span>Pausar señal</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 fill-current shrink-0" aria-hidden="true" />
                        <span>Sintonizar</span>
                      </>
                    )}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* Section: Programación Diaria */}
      <section id="programacion" className="scroll-mt-20 space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-1.5">
            <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-[#0F2B1D]">
              Programación en horario de Honduras
            </h2>
            <p className="text-sm sm:text-base text-[#4A5E52]">
              Consulta los bloques musicales, informativos y deportivos de cada emisora.
            </p>
          </div>

          {/* Interactive Filter Tabs */}
          <div
            role="tablist"
            aria-label="Filtrar programación por emisora"
            className="grid grid-cols-2 sm:inline-flex items-center gap-1 p-1 rounded-xl bg-[#E8EFEA] border border-[#DCE4DD]"
          >
            {STATIONS.map((station) => {
              const active = scheduleTab === station.id;
              return (
                <button
                  key={station.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setScheduleTab(station.id)}
                  className={`min-h-[40px] px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors cursor-pointer whitespace-nowrap ${
                    active
                      ? 'bg-white text-[#0F2B1D] shadow-xs'
                      : 'text-[#4A5E52] hover:text-[#0F2B1D]'
                  }`}
                >
                  {station.shortName}
                </button>
              );
            })}
          </div>
        </div>

        <div className="rounded-2xl bg-white border border-[#DCE4DD] overflow-hidden">
          <div className="px-5 py-4 bg-[#F1F5F2] border-b border-[#DCE4DD] flex flex-wrap items-center justify-between gap-2">
            <div className="text-sm font-semibold text-[#0F2B1D]">
              {scheduleStation.name} · <span className="font-mono tabular-nums text-[#375143]">{scheduleStation.frequency}</span>
            </div>
            <div className="text-xs text-[#4A5E52]">
              Cabina directa WhatsApp:{' '}
              <a
                href={`https://wa.me/50431459158?text=${encodeURIComponent(`Hola ${scheduleStation.name}, les escribo desde la web.`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono tabular-nums font-semibold text-[#1B4D3E] hover:underline"
              >
                {scheduleStation.whatsappCabin}
              </a>
            </div>
          </div>

          <ul className="divide-y divide-[#E7EDE8]">
            {scheduleStation.schedule.map((slot) => {
              const isLiveNow = slot.id === currentScheduleShow.id;
              return (
                <li
                  key={slot.id}
                  className={`px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4 transition-colors ${
                    isLiveNow ? 'bg-[#EDF5EF]' : 'bg-white'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-5 min-w-0">
                    <span className="font-mono text-xs sm:text-sm tabular-nums font-semibold text-[#1B4D3E] shrink-0 w-32">
                      {slot.timeLabel}
                    </span>
                    <div className="min-w-0">
                      <div className="text-sm sm:text-base font-semibold text-[#0F2B1D]">
                        {slot.title}
                      </div>
                      <div className="text-xs sm:text-sm text-[#4A5E52]">
                        {slot.host} <span aria-hidden="true">·</span> {slot.genre}
                      </div>
                    </div>
                  </div>

                  <div className="shrink-0">
                    {isLiveNow ? (
                      <button
                        type="button"
                        onClick={() => onSelectStation(scheduleStation.id, true)}
                        className="min-h-[36px] px-3 py-1.5 rounded-lg bg-[#1B4D3E] hover:bg-[#143B2F] text-white text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" aria-hidden="true" />
                        <span>Al Aire · Escuchar</span>
                      </button>
                    ) : (
                      <span className="text-xs font-medium text-[#64786C]">Programado</span>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </section>
    </div>
  );
}
