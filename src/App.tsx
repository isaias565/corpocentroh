import { useEffect, useRef, useState } from 'react';
import { STATIONS, getCurrentShowForStation, type RadioStation, type StationId } from './data/stations';
import { Header } from './components/Header';
import { LivePlayerDeck } from './components/LivePlayerDeck';
import { AdSpotlightCard } from './components/AdSpotlightCard';
import { StationsAndSchedule } from './components/StationsAndSchedule';
import { TvChannelsSection } from './components/TvChannelsSection';
import { SiguatepequeHeritage } from './components/SiguatepequeHeritage';
import { MobileBottomNav } from './components/MobileBottomNav';
import { Footer } from './components/Footer';

type StreamBackendMode = 'node' | 'php' | 'direct';

function buildAudioSrc(station: RadioStation, mode: StreamBackendMode): string {
  const bust = Date.now();
  if (mode === 'node') {
    return `${station.streamProxyUrl}?t=${bust}`;
  }
  if (mode === 'php') {
    return `/stream.php?station=${station.id}&t=${bust}`;
  }
  return station.directStreamUrl;
}

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
  const backendModeRef = useRef<StreamBackendMode>('node');
  const playAttemptRef = useRef<number>(0);

  const activeStation =
    STATIONS.find((s) => s.id === activeStationId) ?? STATIONS[0];

  // Detect whether Node (/api/health) or cPanel PHP (/stream.php?ping=1) is hosting the app
  useEffect(() => {
    let cancelled = false;

    async function detectBackend() {
      try {
        const res = await fetch('/api/health', { cache: 'no-store' });
        const ct = res.headers.get('content-type') || '';
        if (res.ok && ct.includes('application/json')) {
          const data = await res.json();
          if (!cancelled && data?.ok) {
            backendModeRef.current = 'node';
            return;
          }
        }
      } catch {
        // Not running Node/Express backend
      }

      try {
        const phpRes = await fetch('/stream.php?ping=1', { cache: 'no-store' });
        const ct = phpRes.headers.get('content-type') || '';
        if (phpRes.ok && ct.includes('application/json')) {
          const data = await phpRes.json();
          if (!cancelled && data?.ok) {
            backendModeRef.current = 'php';
            return;
          }
        }
      } catch {
        // PHP proxy not available either
      }

      if (!cancelled) {
        backendModeRef.current = 'direct';
      }
    }

    void detectBackend();
    return () => {
      cancelled = true;
    };
  }, []);

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
      startStream(activeStation.id);
    });
    navigator.mediaSession.setActionHandler('pause', () => {
      pauseStream();
    });
  }, [activeStation]);

  function startStream(stationId: StationId, overrideMode?: StreamBackendMode) {
    const audio = audioRef.current;
    const station = STATIONS.find((s) => s.id === stationId) ?? STATIONS[0];
    if (!audio) return;

    const attemptId = ++playAttemptRef.current;
    const mode = overrideMode ?? backendModeRef.current;

    setStreamError(null);
    setIsBuffering(true);
    setIsPlaying(true);

    audio.src = buildAudioSrc(station, mode);
    audio.volume = isMuted ? 0 : volume;
    audio.load();

    // Call play() synchronously inside user gesture so iOS Safari / Android Chrome allow playback
    const playPromise = audio.play();
    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch((err: unknown) => {
        if (playAttemptRef.current !== attemptId) return;

        // If Node proxy failed (e.g. static cPanel build before detection finished), try PHP then direct
        if (mode === 'node') {
          backendModeRef.current = 'php';
          startStream(stationId, 'php');
          return;
        }
        if (mode === 'php') {
          backendModeRef.current = 'direct';
          startStream(stationId, 'direct');
          return;
        }

        setIsBuffering(false);
        setIsPlaying(false);
        const errName = err instanceof Error ? err.name : '';
        if (errName === 'NotAllowedError') {
          setStreamError('Toca "Reproducir" nuevamente para activar el audio en tu navegador.');
        } else {
          setStreamError(
            'No se pudo conectar con la señal de audio en este momento. Intenta de nuevo.'
          );
        }
      });
    }
  }

  function pauseStream() {
    playAttemptRef.current += 1;
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
      startStream(activeStationId);
    }
  }

  function handleSelectStation(stationId: StationId, autoPlay = true) {
    setActiveStationId(stationId);
    setStreamError(null);
    if (autoPlay || isPlaying) {
      startStream(stationId);
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F8F5] text-[#111E17] overflow-x-clip">
      {/* Persistent HTML5 audio element for mobile & desktop live radio */}
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
          const mode = backendModeRef.current;
          if (mode === 'node') {
            backendModeRef.current = 'php';
            startStream(activeStationId, 'php');
            return;
          }
          if (mode === 'php') {
            backendModeRef.current = 'direct';
            startStream(activeStationId, 'direct');
            return;
          }
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
              onRetryStream={() => startStream(activeStationId)}
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
