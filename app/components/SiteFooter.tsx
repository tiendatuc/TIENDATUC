import "./footer.css";

const svg = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.7,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

/* Señales de confianza: viven en el footer, así aparecen en toda la tienda
   y no ocupan una sección entera del home */
const CONFIANZA = [
  {
    title: "Envío gratis",
    desc: "A todo el país en productos seleccionados.",
    icon: (
      <svg {...svg}>
        <rect x="1" y="7" width="14" height="9" rx="1" /><path d="M15 10h3.5l3 3v3H15" />
        <circle cx="6" cy="19" r="1.8" /><circle cx="17.5" cy="19" r="1.8" />
      </svg>
    ),
  },
  {
    title: "Cuotas sin interés",
    desc: "Hasta 12 cuotas sin interés con tu tarjeta.",
    icon: (
      <svg {...svg}>
        <rect x="2" y="5" width="20" height="14" rx="2" /><line x1="2" y1="10" x2="22" y2="10" />
        <line x1="6" y1="15" x2="10" y2="15" />
      </svg>
    ),
  },
  {
    title: "Compra protegida",
    desc: "Devolvé sin cargo dentro de los plazos.",
    icon: (
      <svg {...svg}>
        <path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3Z" /><path d="m9 12 2 2 4-4" />
      </svg>
    ),
  },
  {
    title: "Medios de pago",
    desc: "Tarjeta, transferencia o efectivo.",
    icon: (
      <svg {...svg}>
        <path d="M3 7a2 2 0 0 1 2-2h13a1 1 0 0 1 1 1v2" />
        <path d="M3 7v11a2 2 0 0 0 2 2h14a1 1 0 0 0 1-1v-6a1 1 0 0 0-1-1h-4a2 2 0 1 0 0 4h5" />
      </svg>
    ),
  },
];

export default function SiteFooter() {
  return (
    <footer className="ft">
      <div className="ft-band-wrap">
        <div className="ft-band">
          {CONFIANZA.map(c => (
            <div key={c.title} className="ft-tile">
              <span className="ft-tile-ico" aria-hidden="true">{c.icon}</span>
              <div>
                <div className="ft-tile-t">{c.title}</div>
                <p className="ft-tile-d">{c.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="ft-in">
        <div className="ft-main">
          <div className="ft-brand">
            <div className="ft-logo">TiendaTuc</div>
            <p className="ft-tag">
              Hogar · Tecnología · Entretenimiento<br />
              Envío a todo Argentina.
            </p>
            <a className="ft-wp" href="https://wa.me/5493815440596" target="_blank" rel="noopener noreferrer">
              <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
              </svg>
              Escribinos por WhatsApp
            </a>
          </div>

          <div>
            <div className="ft-col-t">Tienda</div>
            <nav className="ft-links">
              <a href="/buscar">Todos los productos</a>
              <a href="/#otros">Más vendidos</a>
              <a href="/buscar">Nuestras categorías</a>
              <a href="/cuenta">Mi cuenta</a>
            </nav>
          </div>

          <div>
            <div className="ft-col-t">Ayuda</div>
            <nav className="ft-links">
              <a href="/devoluciones">Cambios y devoluciones</a>
              <a href="/terminos">Términos y condiciones</a>
              <a href="/privacidad">Política de privacidad</a>
            </nav>
          </div>
        </div>

        <div className="ft-bottom">
          <span>© 2026 TiendaTuc</span>
          <span>Precios en pesos argentinos (ARS)</span>
        </div>
      </div>
    </footer>
  );
}
