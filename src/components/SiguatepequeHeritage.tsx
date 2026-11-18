import { useState, type FormEvent } from 'react';
import { CheckCircle2, Tv, MapPin, MessageCircle } from 'lucide-react';
import {
  CORPOCENTROH_WHATSAPP_DISPLAY,
  CORPOCENTROH_WHATSAPP_NUMBER,
  COVERAGE_DEPARTMENTS,
  STATIONS,
  TESTIMONIALS,
  TV_CHANNELS,
  buildWhatsAppUrl,
} from '../data/stations';

export function SiguatepequeHeritage() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [station, setStation] = useState('Todas las emisoras (Paquete CORPOCENTROH)');
  const [message, setMessage] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [whatsappReadyUrl, setWhatsappReadyUrl] = useState<string | null>(null);

  const directWhatsAppHref = buildWhatsAppUrl(
    CORPOCENTROH_WHATSAPP_NUMBER,
    'Hola CORPOCENTROH, me gustaría recibir información sobre publicidad y contacto.'
  );

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitError(null);
    setWhatsappReadyUrl(null);

    if (name.trim().length < 2) {
      setSubmitError('Por favor ingresa tu nombre o el nombre de tu empresa.');
      return;
    }

    if (phone.trim().length < 7 && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setSubmitError('Ingresa tu número de WhatsApp/teléfono o correo electrónico válido.');
      return;
    }

    if (message.trim().length < 6) {
      setSubmitError('Cuéntanos brevemente tu consulta o campaña publicitaria.');
      return;
    }

    const formattedText = [
      `Hola CORPOCENTROH, te escribo desde la web oficial:`,
      `• Nombre / Negocio: ${name.trim()}`,
      phone.trim() ? `• Teléfono: ${phone.trim()}` : null,
      email.trim() ? `• Correo: ${email.trim()}` : null,
      `• Medio de interés: ${station}`,
      `• Mensaje: ${message.trim()}`,
    ]
      .filter(Boolean)
      .join('\n');

    const waUrl = buildWhatsAppUrl(CORPOCENTROH_WHATSAPP_NUMBER, formattedText);

    setSubmitting(true);
    try {
      await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.trim(),
          email: email.trim(),
          station,
          message: message.trim(),
        }),
      }).catch(() => null);

      setWhatsappReadyUrl(waUrl);

      // Open WhatsApp directly using a transient anchor element without window.open
      const link = document.createElement('a');
      link.href = waUrl;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section id="nosotros" className="scroll-mt-20 space-y-14 sm:space-y-16">
      {/* Heritage & Regional Reach */}
      <div className="rounded-2xl bg-[#EDF3EE] border border-[#D4E1D7] p-6 sm:p-8 lg:p-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-7 space-y-4">
          <div className="text-xs font-semibold text-[#1B4D3E]">
            Corporación Centro Radial Hondureña · Desde 1965
          </div>
          <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-[#0F2B1D] leading-tight">
            Más de cinco décadas conectando el corazón de Honduras
          </h2>
          <p className="text-sm sm:text-base text-[#374B3F] leading-relaxed">
            Fundada en Siguatepeque como Centro Radial Hondureño, la primera emisora de la ciudad, CORPOCENTROH reúne hoy cuatro señales de radio y dos canales de televisión abierta para acompañar cada hogar, comercio y comunidad del altiplano central y nuestra diáspora en el exterior.
          </p>

          <div className="pt-2 space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#0F2B1D]">
              <MapPin className="w-4 h-4 text-[#1B4D3E] shrink-0" aria-hidden="true" />
              <span>Cobertura en 9 departamentos de Honduras y señal mundial en línea</span>
            </div>
            <p className="text-sm text-[#4A5E52] leading-relaxed">
              {COVERAGE_DEPARTMENTS.join(' · ')}
            </p>
          </div>
        </div>

        <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3.5">
          <div className="rounded-xl bg-white border border-[#DCE4DD] p-4 space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#1B4D3E]">
              <Tv className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span>Contacto Directo por WhatsApp</span>
            </div>
            <div className="font-display text-base font-bold font-mono tabular-nums text-[#0F2B1D]">
              {CORPOCENTROH_WHATSAPP_DISPLAY}
            </div>
            <p className="text-xs text-[#4A5E52] leading-relaxed">
              Cabina en vivo, saludos, cobertura informativa y contratación de pauta publicitaria.
            </p>
            <a
              href={directWhatsAppHref}
              target="_blank"
              rel="noopener noreferrer"
              className="min-h-[40px] px-3.5 py-2 rounded-lg bg-[#1B4D3E] hover:bg-[#143B2F] text-white text-xs font-semibold inline-flex items-center gap-2 transition-colors"
            >
              <MessageCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span>Escribir al WhatsApp</span>
            </a>
          </div>

          <div className="rounded-xl bg-white border border-[#DCE4DD] p-4 grid grid-cols-2 gap-4">
            <div>
              <div className="font-display text-2xl font-bold font-mono tabular-nums text-[#0F2B1D]">
                1965
              </div>
              <div className="text-xs text-[#4A5E52]">Año de fundación en Siguatepeque</div>
            </div>
            <div>
              <div className="font-display text-2xl font-bold font-mono tabular-nums text-[#0F2B1D]">
                4 + 2
              </div>
              <div className="text-xs text-[#4A5E52]">Emisoras FM/AM y canales de TV</div>
            </div>
          </div>
        </div>
      </div>

      {/* Testimonials + WhatsApp Advertising Contact */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-6 space-y-4">
          <div className="space-y-1">
            <h3 className="font-display text-xl sm:text-2xl font-bold text-[#0F2B1D]">
              Comercios que crecen con nosotros
            </h3>
            <p className="text-sm text-[#4A5E52]">
              Voces reales de clientes y emprendedores de Siguatepeque y la zona central.
            </p>
          </div>

          <div className="divide-y divide-[#DCE4DD] rounded-2xl bg-white border border-[#DCE4DD]">
            {TESTIMONIALS.map((item) => (
              <blockquote key={item.name} className="p-5 space-y-2">
                <p className="text-sm text-[#24362B] leading-relaxed">“{item.quote}”</p>
                <footer className="text-xs text-[#52665A]">
                  <span className="font-semibold text-[#0F2B1D]">{item.name}</span>
                  <span aria-hidden="true"> · </span>
                  <span>{item.role}</span>
                </footer>
              </blockquote>
            ))}
          </div>
        </div>

        {/* WhatsApp Contact Form */}
        <div className="lg:col-span-6 rounded-2xl bg-white border border-[#DCE4DD] p-5 sm:p-7 space-y-5">
          <div className="space-y-1">
            <h3 className="font-display text-xl sm:text-2xl font-bold text-[#0F2B1D]">
              Contacto y Publicidad vía WhatsApp
            </h3>
            <p className="text-sm text-[#4A5E52]">
              Envía tu consulta o solicitud de pauta directamente a nuestro WhatsApp{' '}
              <a
                href={directWhatsAppHref}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono font-semibold text-[#1B4D3E] hover:underline"
              >
                {CORPOCENTROH_WHATSAPP_DISPLAY}
              </a>
              .
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3.5" noValidate>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="space-y-1">
                <label htmlFor="contact-name" className="block text-xs font-semibold text-[#24362B]">
                  Nombre o negocio
                </label>
                <input
                  id="contact-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ej. Café del Pinar"
                  className="w-full min-h-[44px] px-3.5 py-2 text-sm rounded-xl border border-[#CBD6CD] bg-[#FAFBF9] text-[#111E17] focus:outline-2 focus:outline-[#1B4D3E]"
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="contact-phone" className="block text-xs font-semibold text-[#24362B]">
                  Tu WhatsApp o teléfono
                </label>
                <input
                  id="contact-phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+504 9999-0000"
                  className="w-full min-h-[44px] px-3.5 py-2 text-sm rounded-xl border border-[#CBD6CD] bg-[#FAFBF9] text-[#111E17] focus:outline-2 focus:outline-[#1B4D3E]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="space-y-1">
                <label htmlFor="contact-email" className="block text-xs font-semibold text-[#24362B]">
                  Correo electrónico (opcional)
                </label>
                <input
                  id="contact-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="correo@negocio.hn"
                  className="w-full min-h-[44px] px-3.5 py-2 text-sm rounded-xl border border-[#CBD6CD] bg-[#FAFBF9] text-[#111E17] focus:outline-2 focus:outline-[#1B4D3E]"
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="contact-station" className="block text-xs font-semibold text-[#24362B]">
                  Medio de interés
                </label>
                <select
                  id="contact-station"
                  value={station}
                  onChange={(e) => setStation(e.target.value)}
                  className="w-full min-h-[44px] px-3.5 py-2 text-sm rounded-xl border border-[#CBD6CD] bg-[#FAFBF9] text-[#111E17] focus:outline-2 focus:outline-[#1B4D3E]"
                >
                  <option value="Todas las emisoras (Paquete CORPOCENTROH)">
                    Todas las emisoras y TV (Paquete)
                  </option>
                  {STATIONS.map((s) => (
                    <option key={s.id} value={`${s.name} (${s.frequency})`}>
                      {s.shortName} · {s.frequency}
                    </option>
                  ))}
                  {TV_CHANNELS.map((tv) => (
                    <option key={tv.id} value={`${tv.name} (${tv.channelNumber})`}>
                      {tv.name} · {tv.channelNumber}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label htmlFor="contact-message" className="block text-xs font-semibold text-[#24362B]">
                Mensaje
              </label>
              <textarea
                id="contact-message"
                rows={3}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Cuéntanos sobre tu producto, saludo o consulta..."
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-[#CBD6CD] bg-[#FAFBF9] text-[#111E17] focus:outline-2 focus:outline-[#1B4D3E]"
              />
            </div>

            {submitError && (
              <p role="alert" className="text-xs font-medium text-rose-700">
                {submitError}
              </p>
            )}

            {whatsappReadyUrl && (
              <div
                role="status"
                className="rounded-xl bg-[#EDF5EF] border border-[#C1D8C6] px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs sm:text-sm text-[#0F2B1D]"
              >
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#1B4D3E] shrink-0 mt-0.5" aria-hidden="true" />
                  <span>Tu mensaje está listo para enviarse por WhatsApp al {CORPOCENTROH_WHATSAPP_DISPLAY}.</span>
                </div>
                <a
                  href={whatsappReadyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="min-h-[38px] px-3.5 py-1.5 rounded-lg bg-[#1B4D3E] text-white text-xs font-semibold inline-flex items-center justify-center gap-1.5 shrink-0"
                >
                  <MessageCircle className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Abrir WhatsApp</span>
                </a>
              </div>
            )}

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="submit"
                disabled={submitting}
                className="w-full sm:w-auto min-h-[46px] px-6 py-2.5 rounded-xl bg-[#1B4D3E] hover:bg-[#143B2F] disabled:opacity-60 text-white font-semibold text-sm inline-flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <MessageCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span>{submitting ? 'Preparando WhatsApp...' : 'Enviar por WhatsApp'}</span>
              </button>

              <a
                href={directWhatsAppHref}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto min-h-[46px] px-4 py-2.5 rounded-xl border border-[#CBD6CD] hover:bg-[#F1F5F2] text-[#0F2B1D] font-semibold text-sm inline-flex items-center justify-center gap-2 transition-colors"
              >
                <span className="font-mono tabular-nums">{CORPOCENTROH_WHATSAPP_DISPLAY}</span>
              </a>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
