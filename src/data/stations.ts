export type StationId = 'lacentro' | 'pinares' | 'sensa' | 'sentimientos';
export type TvChannelId = 'tvcentrohd' | 'tvcentromas';

export const CORPOCENTROH_LOGO = '/src/assets/images/corpocentroh_logo.png';
export const CORPOCENTROH_WHATSAPP_NUMBER = '50431459158';
export const CORPOCENTROH_WHATSAPP_DISPLAY = '+504 3145-9158';
export const WORLDWEBCONNECT_WHATSAPP_NUMBER = '50370963727';
export const WORLDWEBCONNECT_WHATSAPP_DISPLAY = '+503 7096-3727';

export function buildWhatsAppUrl(phoneDigits: string, text?: string): string {
  const base = `https://wa.me/${phoneDigits}`;
  if (!text) return base;
  return `${base}?text=${encodeURIComponent(text)}`;
}

export interface ProgramSlot {
  id: string;
  startHour: number;
  endHour: number;
  timeLabel: string;
  title: string;
  host: string;
  genre: string;
}

export interface RadioStation {
  id: StationId;
  name: string;
  shortName: string;
  frequency: string;
  tagline: string;
  description: string;
  accentHex: string;
  surfaceTint: string;
  coverImage: string;
  streamProxyUrl: string;
  directStreamUrl: string;
  whatsappCabin: string;
  schedule: ProgramSlot[];
}

export interface TvChannel {
  id: TvChannelId;
  name: string;
  channelNumber: string;
  tagline: string;
  description: string;
  logoImage: string;
  hlsUrl: string;
}

export const HERO_PINE_IMAGE = '/src/assets/images/siguatepeque_pine_sunrise_1795022912873.jpg';
export const PUBLICIDAD_IMAGE = '/src/assets/images/publicidad_clinica_damaris.png';

export const TV_CHANNELS: TvChannel[] = [
  {
    id: 'tvcentrohd',
    name: 'TV Centro HD',
    channelNumber: 'Canal 27.1',
    tagline: 'Noticieros, cultura, deportes y eventos en vivo de la zona central',
    description:
      'La señal televisiva principal de CORPOCENTROH transmitiendo desde Siguatepeque con cobertura informativa, entretenimiento familiar y programas en vivo.',
    logoImage: '/src/assets/images/tv_centro_hd.png',
    hlsUrl: 'https://cloud2.streaminglivehd.com:1936/8032/8032/playlist.m3u8',
  },
  {
    id: 'tvcentromas',
    name: 'TV Centro+',
    channelNumber: 'Canal 27.2',
    tagline: 'Variedad, música audiovisual, comunidad y programación especial',
    description:
      'Segunda señal digital de CORPOCENTROH dedicada a programación variada, especiales musicales, espacios juveniles y transmisiones comunitarias.',
    logoImage: '/src/assets/images/tv_centro_mas.png',
    hlsUrl: 'https://cloud2.streaminglivehd.com:1936/8004/8004/playlist.m3u8',
  },
];

export const STATIONS: RadioStation[] = [
  {
    id: 'lacentro',
    name: 'La Centro · Centro Radial',
    shortName: 'La Centro',
    frequency: '96.3 FM / 950 AM',
    tagline: 'Noticias, deportes y música del recuerdo desde 1965',
    description:
      'La emisora pionera de Siguatepeque y voz emblemática del altiplano central. Información regional, transmisiones deportivas, rancheras y compañía diaria para toda la familia.',
    accentHex: '#1B4D3E',
    surfaceTint: '#EAF2EE',
    coverImage: '/src/assets/images/station_lacentro.png',
    streamProxyUrl: '/api/stream/lacentro',
    directStreamUrl: 'http://198.204.234.10:6175/lacentro',
    whatsappCabin: CORPOCENTROH_WHATSAPP_DISPLAY,
    schedule: [
      {
        id: 'lc-1',
        startHour: 5,
        endHour: 8,
        timeLabel: '05:00 – 08:00',
        title: 'Amanecer en los Pinares',
        host: 'Cabina Matutina',
        genre: 'Rancheras y Saludos',
      },
      {
        id: 'lc-2',
        startHour: 8,
        endHour: 12,
        timeLabel: '08:00 – 12:00',
        title: 'Noticiero Centro Radial en Vivo',
        host: 'Redacción Siguatepeque',
        genre: 'Noticias y Comunidad',
      },
      {
        id: 'lc-3',
        startHour: 12,
        endHour: 16,
        timeLabel: '12:00 – 16:00',
        title: 'Tardes del Recuerdo y Complacencias',
        host: 'Cabina La Centro',
        genre: 'Clásicos y Tropical',
      },
      {
        id: 'lc-4',
        startHour: 16,
        endHour: 20,
        timeLabel: '16:00 – 20:00',
        title: 'Deportes y Panorama Central',
        host: 'Mesa Deportiva CRH',
        genre: 'Deportes y Opinión',
      },
      {
        id: 'lc-5',
        startHour: 20,
        endHour: 24,
        timeLabel: '20:00 – 05:00',
        title: 'Velada Musical Centro Radial',
        host: 'Transmisión Continua',
        genre: 'Éxitos de Siempre',
      },
    ],
  },
  {
    id: 'pinares',
    name: 'Radio Pinares',
    shortName: 'Pinares',
    frequency: '91.5 FM',
    tagline: 'El sonido fresco del altiplano y cultura hondureña',
    description:
      'Inspirada en los pinares de Siguatepeque, acompaña tus mañanas y viajes por la carretera CA-5 con música variada, cultura local y mensajes positivos.',
    accentHex: '#0F5C4D',
    surfaceTint: '#E8F3F0',
    coverImage: '/src/assets/images/station_pinares.png',
    streamProxyUrl: '/api/stream/pinares',
    directStreamUrl: 'http://198.204.234.10:6184/live',
    whatsappCabin: CORPOCENTROH_WHATSAPP_DISPLAY,
    schedule: [
      {
        id: 'pi-1',
        startHour: 5,
        endHour: 9,
        timeLabel: '05:00 – 09:00',
        title: 'Café de Altura y Melodías',
        host: 'Cabina Pinares',
        genre: 'Variada y Folclor',
      },
      {
        id: 'pi-2',
        startHour: 9,
        endHour: 14,
        timeLabel: '09:00 – 14:00',
        title: 'Ruta CA-5 en Compañía',
        host: 'Turno de Día',
        genre: 'Latina y Pop',
      },
      {
        id: 'pi-3',
        startHour: 14,
        endHour: 19,
        timeLabel: '14:00 – 19:00',
        title: 'Tarde entre Pinos',
        host: 'Cabina Siguatepeque',
        genre: 'Éxitos Familiares',
      },
      {
        id: 'pi-4',
        startHour: 19,
        endHour: 24,
        timeLabel: '19:00 – 05:00',
        title: 'Noches de la Ciudad de los Pinares',
        host: 'Señal Continua',
        genre: 'Acústica y Variada',
      },
    ],
  },
  {
    id: 'sensa',
    name: 'Sensa Stereo',
    shortName: 'Sensa',
    frequency: '99.1 FM',
    tagline: 'Pop latino, éxitos actuales y energía juvenil',
    description:
      'La frecuencia con el pulso joven de Comayagua y Siguatepeque. Estrenos musicales, pop en español, ritmo urbano limpio y conexión directa con los oyentes.',
    accentHex: '#B45309',
    surfaceTint: '#FBF3E6',
    coverImage: '/src/assets/images/station_sensa.png',
    streamProxyUrl: '/api/stream/sensa',
    directStreamUrl: 'http://198.204.234.10:6185/live',
    whatsappCabin: CORPOCENTROH_WHATSAPP_DISPLAY,
    schedule: [
      {
        id: 'se-1',
        startHour: 6,
        endHour: 10,
        timeLabel: '06:00 – 10:00',
        title: 'Despierta con Sensa',
        host: 'Turno Juvenil',
        genre: 'Pop y Tendencias',
      },
      {
        id: 'se-2',
        startHour: 10,
        endHour: 15,
        timeLabel: '10:00 – 15:00',
        title: 'Top 99.1 Sin Pausas',
        host: 'Cabina Sensa',
        genre: 'Éxitos del Momento',
      },
      {
        id: 'se-3',
        startHour: 15,
        endHour: 20,
        timeLabel: '15:00 – 20:00',
        title: 'Zona Interactiva de la Tarde',
        host: 'Locución en Vivo',
        genre: 'Urbano y Pop Latino',
      },
      {
        id: 'se-4',
        startHour: 20,
        endHour: 24,
        timeLabel: '20:00 – 06:00',
        title: 'Sensa Night Mix',
        host: 'Mezcla Continua',
        genre: 'Electropop y Hits',
      },
    ],
  },
  {
    id: 'sentimientos',
    name: 'Sentimientos FM',
    shortName: 'Sentimientos',
    frequency: '95.7 FM',
    tagline: 'Baladas, boleros y el sabor romántico de cada tarde',
    description:
      'Tu refugio musical para dedicar canciones, disfrutar clásicos románticos, boleros eternos y ritmos gruperos con el calor humano de nuestra gente.',
    accentHex: '#881337',
    surfaceTint: '#F9ECEF',
    coverImage: '/src/assets/images/station_sentimientos.png',
    streamProxyUrl: '/api/stream/sentimientos',
    directStreamUrl: 'http://198.204.234.10:6186/live',
    whatsappCabin: CORPOCENTROH_WHATSAPP_DISPLAY,
    schedule: [
      {
        id: 'sn-1',
        startHour: 6,
        endHour: 11,
        timeLabel: '06:00 – 11:00',
        title: 'Mañanas con Sentimiento',
        host: 'Cabina Romántica',
        genre: 'Baladas Clásicas',
      },
      {
        id: 'sn-2',
        startHour: 11,
        endHour: 16,
        timeLabel: '11:00 – 16:00',
        title: 'Dedicatorias al Mediodía',
        host: 'Cabina Sentimientos',
        genre: 'Boleros y Grupero',
      },
      {
        id: 'sn-3',
        startHour: 16,
        endHour: 21,
        timeLabel: '16:00 – 21:00',
        title: 'Atardecer Inolvidable',
        host: 'Selección Especial',
        genre: 'Romántica en Español',
      },
      {
        id: 'sn-4',
        startHour: 21,
        endHour: 24,
        timeLabel: '21:00 – 06:00',
        title: 'Bohemia Nocturna 95.7',
        host: 'Transmisión Continua',
        genre: 'Tríos y Baladas',
      },
    ],
  },
];

export const COVERAGE_DEPARTMENTS = [
  'Comayagua',
  'Intibucá',
  'Santa Bárbara',
  'La Paz',
  'Cortés',
  'Francisco Morazán',
  'Yoro',
  'Olancho',
  'Lempira',
];

export const TESTIMONIALS = [
  {
    name: 'Dra. Damaris Núñez',
    role: 'Clínica de Ortodoncia y Estética · Siguatepeque',
    quote:
      'CORPOCENTROH y Prof. Baires han sido mi mejor apoyo desde 2011 en toda la publicidad de mi clínica, acompañando nuestro crecimiento con cercanía y confianza.',
  },
  {
    name: 'Isaías Martínez',
    role: 'Emprendedor Local · Zona Central',
    quote:
      'Como emprendedor soy un soñador, y mis metas comerciales han tomado impulso en gran medida gracias al alcance de las emisoras de CORPOCENTROH.',
  },
  {
    name: 'Santiago Isaac',
    role: 'Agua Purificada Vatten',
    quote:
      'Cuando necesité apoyo con la difusión y diseño para mis eventos, todo el equipo de CORPOCENTROH y TV Centro nos orientó con entrega y trato de amigos.',
  },
];

export function getHondurasHour(): number {
  try {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/Tegucigalpa',
      hour: 'numeric',
      hour12: false,
    });
    const parsed = Number(formatter.format(new Date()));
    return Number.isNaN(parsed) ? new Date().getHours() : parsed % 24;
  } catch {
    return new Date().getHours();
  }
}

export function getHondurasClockLabel(): string {
  try {
    return new Intl.DateTimeFormat('es-HN', {
      timeZone: 'America/Tegucigalpa',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }).format(new Date());
  } catch {
    return '';
  }
}

export function getCurrentShowForStation(station: RadioStation, hour = getHondurasHour()): ProgramSlot {
  const match = station.schedule.find((slot) => {
    if (slot.endHour > slot.startHour) {
      return hour >= slot.startHour && hour < slot.endHour;
    }
    return hour >= slot.startHour || hour < slot.endHour;
  });
  return match ?? station.schedule[0];
}
