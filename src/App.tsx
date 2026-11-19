import { useState } from 'react';
import { STATIONS, type StationId } from './data/stations';
import { Header } from './components/Header';
import { LivePlayerDeck } from './components/LivePlayerDeck';
import { AdSpotlightCard } from './components/AdSpotlightCard';
import { StationsAndSchedule } from './components/StationsAndSchedule';
import { TvChannelsSection } from './components/TvChannelsSection';
import { SiguatepequeHeritage } from './components/SiguatepequeHeritage';
import { MobileBottomNav } from './components/MobileBottomNav';
import { Footer } from './components/Footer';

export default function App() {
  const [activeStationId, setActiveStationId] = useState<StationId>('lacentro');

  const activeStation =
    STATIONS.find((s) => s.id === activeStationId) ?? STATIONS[0];

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F8F5] text-[#111E17] overflow-x-clip">
      <Header activeStation={activeStation} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-8 space-y-14 sm:space-y-16">
        {/* Dominant Hero Studio: Live Radio Deck + Featured Advertising */}
        <div
          id="en-vivo"
          className="scroll-mt-20 grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6 items-stretch"
        >
          <div className="lg:col-span-8 min-w-0 flex flex-col">
            <LivePlayerDeck
              activeStation={activeStation}
              onSelectStation={setActiveStationId}
            />
          </div>

          <div className="lg:col-span-4 min-w-0 flex flex-col">
            <AdSpotlightCard />
          </div>
        </div>

        <TvChannelsSection onTvStartPlaying={() => {}} />

        <StationsAndSchedule
          activeStationId={activeStationId}
          onSelectStation={setActiveStationId}
        />

        <SiguatepequeHeritage />
      </main>

      <Footer />
      <MobileBottomNav />
    </div>
  );
}
