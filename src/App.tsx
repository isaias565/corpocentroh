import { useEffect, useRef, useState } from 'react';
import { STATIONS, getCurrentShowForStation, type StationId } from './data/stations';
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
  const [isPlaying, setIsPlaying] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [streamError, setStreamError] = useState<string | null>(null);
  const [volume, setVolume] = useState<number>(() => {
    try {
      const saved = Number(localStorage.getItem('corpocentroh_volume'));
      return Number.isFinite(saved) && saved >= 0 && saved <= 1 ? saved : 0.85;
    } catch {
      return 0.85;
    }
  });
  const [isMuted, setIsMuted] = useState(false);
  const [sleepMinutes, setSleepMinutes] = useState<number | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const sleepTimerRef = useRef<number | null>(null);

  const activeStation =
    STATIONS.find((s) => s.id === activeStationId) ?? STATIONS[0];

  // Sync audio volume
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = isMuted ? 0 : volume;
    try {
      localStorage.setItem('corpocentroh_volume', String(volume));
    } catch {
      // Ignore storage errors
    }
  }, [volume, isMuted]);

  // Sleep timer lifecycle
  useEffect(() => {
    if (sleepTimerRef.current !== null) {
      window.clearTimeout(sleepTimerRef.current);
      sleepTimerRef.current = null;
    }

    if (sleepMinutes !== null && isPlaying) {
      sleepTimerRef.current = window.setTimeout(() => {
        audioRef.current?.pause();
        setIsPlaying(false);
        setIsBuffering(false);
        setSleepMinutes(null);
      }, sleepMinutes * 60 * 1000);
    }

    return () => {
      if (sleepTimerRef.current !== null) {
        window.clearTimeout(sleepTimerRef.current);
      }
    };
  }, [sleepMinutes, isPlaying]);

  // Mobile lock-screen Media Session metadata & controls
  useEffect(() => {
    if (!('mediaSession' in navigator)) return;
    const currentShow = getCurrentShowForStation(activeStation);
    const absoluteArt = `${window.location.origin}${activeStation.coverImage}`;

    navigator.mediaSession.metadata = new MediaMetadata({
      title: `${activeStation.name} (${activeStation.frequency})`,
      artist: currentShow.title,
      album: 'CORPOCENTROH · Siguatepeque, Honduras',
      artwork: [{ src: absoluteArt, sizes: '512x512', type: 'image/png' }],
    });

    navigator.mediaSession.setActionHandler('play', () => {
      void startStream(activeStation.id);
    });
    navigator.mediaSession.setActionHandler('pause', () => {
      pauseStream();
    });
  }, [activeStation]);

  async function startStream(stationId: StationId) {
    const audio = audioRef.current;
    const station = STATIONS.find((s) => s.id === stationId) ?? STATIONS[0];
    if (!audio) return;

    setStreamError(null);
    setIsBuffering(true);
    setIsPlaying(true);

    // Cache-bust live stream URL so browsers always join the fresh live edge
    const nextSrc = `${station.streamProxyUrl}?t=${Date.now()}`;
    audio.src = nextSrc;
    audio.volume = isMuted ? 0 : volume;

    try {
      await audio.play();
    } catch {
      setIsBuffering(false);
      setIsPlaying(false);
      setStreamError('Toca "Reproducir" para iniciar el audio en tu dispositivo.');
    }
  }

  function pauseStream() {
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.removeAttribute('src');
      audio.load();
    }
    setIsPlaying(false);
    setIsBuffering(false);
  }

  function handleTogglePlay() {
    if (isPlaying) {
      pauseStream();
    } else {
      void startStream(activeStationId);
    }
  }

  function handleSelectStation(stationId: StationId, autoPlay = true) {
    setActiveStationId(stationId);
    setStreamError(null);
    if (autoPlay || isPlaying) {
      void startStream(stationId);
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F8F5] text-[#111E17] overflow-x-clip">
      {/* Hidden persistent audio element for uninterrupted listening */}
      <audio
        ref={audioRef}
        preload="none"
        playsInline
        onPlaying={() => {
          setIsBuffering(false);
          setIsPlaying(true);
          setStreamError(null);
        }}
        onWaiting={() => {
          if (isPlaying) setIsBuffering(true);
        }}
        onPause={() => {
          setIsBuffering(false);
        }}
        onError={() => {
          if (!audioRef.current?.getAttribute('src')) return;
          setIsBuffering(false);
          setIsPlaying(false);
          setStreamError(
            'La señal tuvo una interrupción momentánea. Verifica tu conexión o intenta reconectar.'
          );
        }}
      />

      <Header
        activeStation={activeStation}
        isPlaying={isPlaying}
        isBuffering={isBuffering}
        onTogglePlay={handleTogglePlay}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-8 space-y-14 sm:space-y-16">
        {/* Dominant Hero Studio: Live Radio Player + Featured Advertising */}
        <div
          id="en-vivo"
          className="scroll-mt-20 grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6 items-stretch"
        >
          <div className="lg:col-span-8 min-w-0 flex flex-col">
            <LivePlayerDeck
              activeStation={activeStation}
              isPlaying={isPlaying}
              isBuffering={isBuffering}
              streamError={streamError}
              volume={volume}
              isMuted={isMuted}
              sleepMinutes={sleepMinutes}
              onSelectStation={handleSelectStation}
              onTogglePlay={handleTogglePlay}
              onRetryStream={() => void startStream(activeStationId)}
              onVolumeChange={(v) => {
                setVolume(v);
                if (v > 0 && isMuted) setIsMuted(false);
              }}
              onToggleMute={() => setIsMuted((prev) => !prev)}
              onSetSleepMinutes={setSleepMinutes}
            />
          </div>

          <div className="lg:col-span-4 min-w-0 flex flex-col">
            <AdSpotlightCard />
          </div>
        </div>

        <TvChannelsSection onTvStartPlaying={pauseStream} />

        <StationsAndSchedule
          activeStationId={activeStationId}
          isPlaying={isPlaying}
          onSelectStation={handleSelectStation}
          onTogglePlay={handleTogglePlay}
        />

        <SiguatepequeHeritage />
      </main>

      <Footer />
      <MobileBottomNav />
    </div>
  );
}
