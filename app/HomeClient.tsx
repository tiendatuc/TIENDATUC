"use client";
import { useCart } from "./store/cartStore";
import { useState, useRef, useEffect } from "react";

type Producto = {
  id: number;
  slug: string;
  nombre: string;
  descripcion: string;
  precio: string;
  precioAnterior?: string;
  precioNum: number;
  cuotas: string;
  envioGratis: boolean;
  imagen: string;
};

const svg = { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };

const ico = {
  camion: <svg {...svg} width="18" height="18"><rect x="1" y="7" width="14" height="9" rx="1" /><path d="M15 10h3.5l3 3v3H15" /><circle cx="6" cy="19" r="1.8" /><circle cx="17.5" cy="19" r="1.8" /></svg>,
  tarjeta: <svg {...svg} width="18" height="18"><rect x="2" y="5" width="20" height="14" rx="2" /><line x1="2" y1="10" x2="22" y2="10" /><line x1="6" y1="15" x2="10" y2="15" /></svg>,
  escudo: <svg {...svg} width="18" height="18"><path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3Z" /><path d="m9 12 2 2 4-4" /></svg>,
  devolver: <svg {...svg} width="18" height="18"><path d="M3 12a9 9 0 1 0 3-6.7" /><polyline points="3 4 3 9 8 9" /></svg>,
  candado: <svg {...svg} width="18" height="18"><rect x="4" y="10" width="16" height="10" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /></svg>,
  flecha: <svg {...svg} width="16" height="16" strokeWidth={2}><path d="M5 12h13" /><path d="m12 5 7 7-7 7" /></svg>,
  carrito: <svg {...svg} width="16" height="16" strokeWidth={2}><circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" /><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" /></svg>,
  whatsapp: <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347M12.05 21.785h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884" /></svg>,
};

// "$39.900" -> 39900
const aNumero = (v: unknown) => Number(String(v ?? "").replace(/[^\d]/g, "")) || 0;

// Porcentaje de descuento entre el precio actual y el anterior
const pctOff = (actual: number, anterior: number) =>
  anterior > actual && actual > 0 ? Math.round((1 - actual / anterior) * 100) : 0;

export default function HomeClient({ hero, productos }: { hero: Producto; productos: Producto[] }) {
  const { agregar } = useCart();
  const [toast, setToast] = useState<string | null>(null);
  const [pagina, setPagina] = useState(0);
  const [paginas, setPaginas] = useState(1);
  const trackRef = useRef<HTMLDivElement>(null);

  // El mismo contenedor es grilla en escritorio y carrusel con snap en mobile:
  // se miden las "páginas" reales para dibujar solo los puntos que hacen falta
  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    const medir = () => {
      const ancho = el.clientWidth || 1;
      setPaginas(Math.max(1, Math.round(el.scrollWidth / ancho)));
    };
    medir();
    const ro = new ResizeObserver(medir);
    ro.observe(el);
    return () => ro.disconnect();
  }, [productos.length]);

  const onScroll = () => {
    const el = trackRef.current;
    if (!el) return;
    setPagina(Math.round(el.scrollLeft / (el.clientWidth || 1)));
  };

  const irAPagina = (i: number) => {
    const el = trackRef.current;
    if (el) el.scrollTo({ left: i * el.clientWidth, behavior: "smooth" });
  };

  const handleAgregar = (p: Producto, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    agregar({ id: p.id, nombre: p.nombre, precio: p.precio, precioNum: p.precioNum, imagen: p.imagen });
    setToast(p.nombre);
    setTimeout(() => setToast(null), 2200);
  };

  const heroOff = pctOff(aNumero(hero?.precio), aNumero(hero?.precioAnterior));
  const heroHref = hero ? `/productos/${hero.slug}` : "#otros";

  return (
    <>
      <style>{`
        @keyframes slideDown{0%{transform:translateX(-50%) translateY(-30px);opacity:0}12%{transform:translateX(-50%) translateY(0);opacity:1}80%{transform:translateX(-50%) translateY(0);opacity:1}100%{transform:translateX(-50%) translateY(-30px);opacity:0}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(22px)}to{opacity:1;transform:translateY(0)}}

        /* ══════════ HERO ══════════ */
        .hero{position:relative;overflow:hidden;border-bottom:1px solid var(--border);}
        .hero-inner{position:relative;max-width:1240px;margin:0 auto;padding:72px 24px 80px;
          display:grid;grid-template-columns:minmax(0,1.05fr) minmax(0,1fr);gap:56px;align-items:center;}
        .hero-copy{display:flex;flex-direction:column;align-items:flex-start;min-width:0;}

        .hero-pill{display:inline-flex;align-items:center;color:var(--copper);
          font-size:10px;font-weight:800;letter-spacing:.18em;text-transform:uppercase;
          margin-bottom:16px;animation:fadeUp .7s ease .05s both;}

        .hero-title{font-family:var(--font-display);font-size:clamp(34px,4.6vw,58px);font-weight:800;
          line-height:1.04;letter-spacing:-.03em;color:var(--text);margin-bottom:18px;animation:fadeUp .7s ease .15s both;}
        .hero-title em{font-style:normal;color:var(--copper);}
        .hero-sub{font-size:clamp(14px,1.4vw,16.5px);color:var(--text-2);line-height:1.7;
          margin-bottom:26px;max-width:460px;animation:fadeUp .7s ease .25s both;}

        /* Bloque de oferta: junta precio, descuento y beneficios de pago
           en una sola tarjeta para darle peso a la columna de texto */
        .hero-oferta{width:100%;max-width:430px;background:var(--surface);border:1px solid var(--border-2);
          border-radius:18px;padding:18px 20px;margin-bottom:26px;box-shadow:0 10px 30px -22px rgba(0,0,0,.45);
          animation:fadeUp .7s ease .3s both;}
        .hero-oferta-top{display:flex;align-items:baseline;flex-wrap:wrap;gap:10px;}
        .hero-oferta-top b{font-size:clamp(30px,3.8vw,42px);font-weight:900;letter-spacing:-.03em;color:var(--text);line-height:1;}
        .hero-oferta-top s{font-size:15px;color:var(--text-3);text-decoration-thickness:1.5px;}
        .hero-off{background:var(--copper);color:var(--on-accent);font-size:12.5px;font-weight:900;
          letter-spacing:.02em;padding:5px 10px;border-radius:7px;line-height:1;}
        .hero-oferta-rows{display:flex;flex-direction:column;gap:8px;margin-top:14px;
          padding-top:14px;border-top:1px dashed var(--border-2);}
        .hero-oferta-row{display:flex;align-items:center;gap:9px;font-size:13px;font-weight:600;color:var(--text-2);}
        .hero-oferta-row svg{flex-shrink:0;color:var(--copper);width:16px;height:16px;}
        .hero-oferta-row b{color:var(--text);font-weight:800;}
        .hero-oferta-row.is-verde{color:var(--green);}
        .hero-oferta-row.is-verde svg{color:var(--green);}
        .hero-oferta-row.is-verde b{color:var(--green);}

        .hero-ctas{display:flex;gap:12px;flex-wrap:wrap;animation:fadeUp .7s ease .45s both;}
        .btn-buy{display:inline-flex;align-items:center;justify-content:center;gap:10px;background:var(--gold);
          color:var(--on-gold);font-size:14px;font-weight:800;letter-spacing:.01em;padding:17px 30px;
          border-radius:10px;transition:filter .16s;}
        .btn-buy:hover{filter:brightness(1.06);}
        .btn-line{display:inline-flex;align-items:center;justify-content:center;gap:8px;background:var(--bg-2);
          color:var(--text);font-size:14px;font-weight:700;padding:17px 26px;border-radius:12px;
          border:1px solid var(--border-2);transition:border-color .18s,color .18s;}
        .btn-line:hover{border-color:var(--copper);color:var(--copper);}

        .hero-trust{list-style:none;display:flex;flex-wrap:wrap;gap:8px;margin-top:24px;padding:0;animation:fadeUp .7s ease .55s both;}
        .hero-trust li{display:inline-flex;align-items:center;gap:7px;font-size:12px;font-weight:700;
          color:var(--text-2);background:var(--bg-2);border:1px solid var(--border);
          padding:8px 13px;border-radius:999px;}
        .hero-trust svg{color:var(--copper);flex-shrink:0;width:15px;height:15px;}

        /* Media del hero */
        .hero-media-wrap{position:relative;width:100%;max-width:520px;justify-self:end;animation:fadeUp .8s ease .2s both;}
        .hero-media{position:relative;width:100%;aspect-ratio:4/5;border-radius:26px;overflow:hidden;
          border:1px solid var(--border-2);box-shadow:var(--card-shadow);background:var(--bg-2);
          isolation:isolate;}
        .hero-video{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;}
        .hero-video-desktop{display:block;} .hero-video-mobile{display:none;}
        @media (max-width:640px){.hero-video-desktop{display:none;}.hero-video-mobile{display:block;}}

        /* Etiqueta de descuento sobre el video */
        .hero-media-off{position:absolute;top:16px;left:16px;z-index:6;
          display:inline-flex;align-items:baseline;gap:6px;padding:7px 11px;border-radius:6px;
          background:rgba(12,9,7,.66);border:1px solid rgba(255,255,255,.18);color:#fff;
          -webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px);}
        .hero-media-off b{font-size:13px;font-weight:800;letter-spacing:-.02em;line-height:1;}
        .hero-media-off i{font-style:normal;font-size:9px;font-weight:700;letter-spacing:.14em;
          line-height:1;color:rgba(255,255,255,.7);}

        /* Viñeta al pie del video: funde la imagen con la barra de info */
        .hero-scrim{position:absolute;left:0;right:0;bottom:0;height:62%;z-index:2;pointer-events:none;
          background:linear-gradient(to top, rgba(8,6,4,.9) 0%, rgba(8,6,4,.5) 42%, rgba(8,6,4,0) 100%);}

        /* Ficha del producto destacado: barra de vidrio pegada al borde inferior
           del marco, integrada al video en vez de flotar sobre él */
        .hero-card{position:absolute;left:0;right:0;bottom:0;z-index:5;
          display:flex;align-items:center;gap:14px;padding:16px 17px 18px;
          background:linear-gradient(180deg, rgba(16,11,8,.28), rgba(16,11,8,.66));
          -webkit-backdrop-filter:blur(14px) saturate(1.25);backdrop-filter:blur(14px) saturate(1.25);
          border-top:1px solid rgba(255,255,255,.15);
          animation:fadeUp .8s ease .75s both;transition:background .22s;}
        .hero-card:hover{background:linear-gradient(180deg, rgba(16,11,8,.4), rgba(16,11,8,.78));}

        .hero-card-info{min-width:0;flex:1;}
        .hero-card-name{font-size:13px;font-weight:700;color:rgba(255,255,255,.95);line-height:1.35;
          display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;
          text-shadow:0 1px 8px rgba(0,0,0,.4);}
        .hero-card-meta{display:flex;align-items:center;flex-wrap:wrap;gap:9px;margin-top:8px;}
        .hero-card-precio{font-family:var(--font-display);font-size:23px;font-weight:900;
          letter-spacing:-.035em;color:#fff;line-height:1;text-shadow:0 2px 12px rgba(0,0,0,.45);}
        .hero-card-antes{font-size:12px;color:rgba(255,255,255,.58);text-decoration:line-through;}
        .hero-card-ship{display:inline-flex;align-items:center;gap:5px;
          font-size:9.5px;font-weight:700;letter-spacing:.07em;text-transform:uppercase;
          color:rgba(255,255,255,.78);border:1px solid rgba(255,255,255,.22);
          padding:4px 9px;border-radius:5px;}
        .hero-card-ship svg{width:12px;height:12px;}
        .hero-card-go{display:inline-flex;align-items:center;gap:8px;flex-shrink:0;
          height:42px;padding:0 18px;border-radius:9px;background:var(--copper);color:var(--on-accent);
          font-size:12.5px;font-weight:800;letter-spacing:.01em;transition:filter .16s;}
        .hero-card-go svg{transition:transform .18s;}
        .hero-card:hover .hero-card-go{filter:brightness(1.06);}
        .hero-card:hover .hero-card-go svg{transform:translateX(3px);}

        @media (max-width:900px){
          .hero-inner{grid-template-columns:1fr;gap:36px;padding:44px 20px 64px;}
          .hero-copy{align-items:center;text-align:center;order:2;}
          .hero-sub{max-width:520px;}
          .hero-ctas,.hero-trust{justify-content:center;}
          .hero-media-wrap{justify-self:center;order:1;max-width:440px;}
          .hero-media{aspect-ratio:1/1;}
          .hero-oferta{max-width:430px;text-align:left;}
          .hero-oferta-top{justify-content:center;}
        }
        @media (max-width:640px){
          .hero-ctas{flex-direction:column;width:100%;}
          .btn-buy,.btn-line{width:100%;}
          .hero-trust{gap:8px;}
          .hero-card{padding:13px 13px 14px;gap:10px;}
          .hero-card-name{font-size:12px;-webkit-line-clamp:1;}
          .hero-card-meta{margin-top:6px;gap:7px;}
          .hero-card-precio{font-size:19px;}
          .hero-card-antes{display:none;}
          .hero-card-go{height:40px;padding:0 14px;}
          .hero-card-go-txt{display:none;}
          .hero-media-off{top:12px;left:12px;width:54px;height:54px;}
          .hero-media-off b{font-size:15px;}
        }

        /* ══════════ ENCABEZADOS DE SECCIÓN ══════════ */
        .sec{max-width:1240px;margin:0 auto;padding:0 24px;}
        .sec-head{display:flex;align-items:flex-end;justify-content:space-between;gap:16px;margin-bottom:22px;}
        .sec-eyebrow{font-size:10px;font-weight:800;letter-spacing:.16em;text-transform:uppercase;color:var(--copper);}
        .sec-title{font-family:var(--font-display);font-size:clamp(21px,2.6vw,28px);font-weight:800;
          letter-spacing:-.02em;color:var(--text);margin-top:7px;}
        .sec-link{display:inline-flex;align-items:center;gap:6px;font-size:13px;font-weight:700;
          color:var(--copper);white-space:nowrap;transition:gap .18s;}
        .sec-link:hover{gap:10px;}

        @media (max-width:560px){.sec{padding:0 16px;}}

        /* ══════════ PRODUCTOS ══════════ */
        .prods{padding:56px 0 72px;}
        .prod-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(214px,1fr));gap:18px;}
        .prod-card{position:relative;display:flex;flex-direction:column;background:var(--surface);
          border:1px solid var(--border);border-radius:16px;overflow:hidden;
          transition:transform .18s,box-shadow .18s,border-color .18s;}
        .prod-card:hover{transform:translateY(-4px);box-shadow:var(--card-shadow);border-color:var(--copper);}
        .prod-img{position:relative;aspect-ratio:1;background:var(--img-bg);overflow:hidden;}
        .prod-img img{width:100%;height:100%;object-fit:contain;padding:16px;transition:transform .4s ease;}
        .prod-card:hover .prod-img img{transform:scale(1.07);}
        .prod-off{position:absolute;top:10px;left:10px;background:var(--green);color:var(--on-green);
          font-size:10.5px;font-weight:800;padding:3px 8px;border-radius:6px;}
        .prod-body{padding:14px 15px 16px;display:flex;flex-direction:column;gap:3px;flex:1;}
        .prod-name{font-size:13.5px;font-weight:600;color:var(--text);line-height:1.35;
          display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;min-height:2.7em;}
        .prod-precio{display:flex;align-items:baseline;gap:7px;margin-top:5px;}
        .prod-precio b{font-size:18px;font-weight:900;letter-spacing:-.02em;color:var(--text);}
        .prod-precio s{font-size:12px;font-weight:600;color:var(--text-3);}
        .prod-cuotas{font-size:11.5px;font-weight:700;color:var(--green);}
        .prod-ship{display:inline-flex;align-self:flex-start;margin-top:8px;background:var(--green-soft);
          color:var(--green);font-size:10px;font-weight:800;letter-spacing:.04em;text-transform:uppercase;
          padding:3px 8px;border-radius:5px;}
        .prod-add{position:absolute;top:10px;right:10px;width:36px;height:36px;border-radius:50%;
          background:var(--copper);color:var(--on-accent);border:none;display:flex;align-items:center;
          justify-content:center;cursor:pointer;
          opacity:0;transform:scale(.8);transition:opacity .18s,transform .18s,background .18s;}
        .prod-card:hover .prod-add,.prod-add:focus-visible{opacity:1;transform:scale(1);}
        .prod-add:hover{background:var(--copper-dim);}
        .prod-more{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;
          text-align:center;border:1px dashed var(--border-2);border-radius:16px;background:transparent;
          color:var(--copper);font-size:13px;font-weight:800;min-height:200px;transition:background .18s,border-color .18s;}
        .prod-more:hover{background:var(--accent-soft);border-color:var(--copper);}
        .prod-more span{display:flex;align-items:center;justify-content:center;}

        .prod-dots{display:none;gap:6px;justify-content:center;margin-top:18px;}
        .prod-dot{width:7px;height:7px;border-radius:50%;background:var(--border-2);border:none;padding:0;
          cursor:pointer;transition:width .2s,background .2s;}
        .prod-dot.on{width:22px;border-radius:4px;background:var(--copper);}

        @media (max-width:900px){
          .prods{padding:40px 0 56px;}
          .prod-grid{display:flex;overflow-x:auto;gap:12px;scroll-snap-type:x mandatory;
            scrollbar-width:none;-ms-overflow-style:none;margin:0 -16px;padding:2px 16px 6px;}
          .prod-grid::-webkit-scrollbar{display:none;}
          .prod-card,.prod-more{flex:0 0 calc(50% - 22px);scroll-snap-align:start;}
          .prod-add{opacity:1;transform:scale(1);width:32px;height:32px;}
          .prod-dots{display:flex;}
        }
        @media (max-width:420px){.prod-card,.prod-more{flex-basis:calc(70% - 16px);}}

        /* ══════════ BANDA DE AYUDA ══════════ */
        .ayuda{padding:0 0 72px;}
        .ayuda-box{display:flex;align-items:center;justify-content:space-between;gap:24px;flex-wrap:wrap;
          padding:34px;border-radius:22px;border:1px solid var(--border);
          background:var(--surface);}
        .ayuda-box h3{font-family:var(--font-display);font-size:clamp(19px,2.2vw,24px);font-weight:800;
          letter-spacing:-.02em;color:var(--text);margin-bottom:6px;}
        .ayuda-box p{font-size:13.5px;color:var(--text-2);line-height:1.6;max-width:520px;}
        .ayuda-wp{display:inline-flex;align-items:center;gap:10px;background:var(--whatsapp);color:var(--on-whatsapp);
          font-size:14px;font-weight:800;padding:15px 24px;border-radius:12px;white-space:nowrap;
          transition:filter .16s;}
        .ayuda-wp:hover{filter:brightness(1.05);}
        @media (max-width:560px){
          .ayuda-box{padding:24px;border-radius:18px;}
          .ayuda-wp{width:100%;justify-content:center;}
        }

        /* ══════════ TOAST ══════════ */
        .toast{position:fixed;top:calc(var(--hd-h, 58px) + 14px);left:50%;z-index:9999;display:flex;align-items:center;gap:12px;
          max-width:min(420px,calc(100vw - 32px));background:var(--bg-2);border-radius:14px;padding:13px 20px;
          border:1px solid color-mix(in srgb, var(--green) 35%, transparent);box-shadow:var(--toast-shadow);
          animation:slideDown 2.2s ease forwards;pointer-events:none;}
        .toast-ok{width:30px;height:30px;flex-shrink:0;border-radius:50%;background:var(--green);
          color:var(--on-green);display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:800;}
        .toast-t{font-size:13px;font-weight:700;color:var(--text);}
        .toast-s{font-size:11.5px;color:var(--text-3);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}

        @media (prefers-reduced-motion: reduce){
          .hero-pill,.hero-title,.hero-sub,.hero-oferta,.hero-ctas,.hero-trust,
          .hero-media-wrap,.hero-card{animation:none!important;}
          .prod-card:hover,.btn-buy:hover,.ayuda-wp:hover{transform:none;}
        }
      `}</style>

      {toast && (
        <div className="toast" role="status">
          <div className="toast-ok">✓</div>
          <div style={{ minWidth: 0 }}>
            <div className="toast-t">¡Agregado al carrito!</div>
            <div className="toast-s">{toast}</div>
          </div>
        </div>
      )}

      {/* ══════════ HERO ══════════ */}
      <section className="hero">
        <div className="hero-inner">
          <div className="hero-copy">
            <span className="hero-pill">Producto destacado</span>
            <h1 className="hero-title">Diversión sin límites,<br /><em>en cada disparo</em></h1>
            <p className="hero-sub">
              Pistola de agua eléctrica con luz LED, batería recargable y máxima potencia para tus batallas de verano.
            </p>

            <div className="hero-oferta">
              <div className="hero-oferta-top">
                <b>{hero?.precio || "$39.900"}</b>
                {hero?.precioAnterior && <s>{hero.precioAnterior}</s>}
                {heroOff > 0 && <span className="hero-off">-{heroOff}%</span>}
              </div>
              <div className="hero-oferta-rows">
                <span className="hero-oferta-row is-verde">
                  {ico.tarjeta} <b>{hero?.cuotas || "3 y 6 cuotas sin interés"}</b>
                </span>
                <span className="hero-oferta-row">
                  {ico.camion} <b>Envío gratis</b> a todo el país
                </span>
              </div>
            </div>

            <div className="hero-ctas">
              <a href={heroHref} className="btn-buy">Comprar ahora {ico.flecha}</a>
              <a href="#otros" className="btn-line">Ver todos los productos</a>
            </div>

            <ul className="hero-trust">
              <li>{ico.escudo} Garantía 6 meses</li>
              <li>{ico.devolver} Devolución sin cargo</li>
              <li>{ico.candado} Pago protegido</li>
            </ul>
          </div>

          <div className="hero-media-wrap">
            <div className="hero-media">
              <video className="hero-video hero-video-desktop" src="/productos/banner_pc_pistola.mp4" autoPlay loop muted playsInline />
              <video className="hero-video hero-video-mobile" src="/productos/banner_pistola.mp4" autoPlay loop muted playsInline />
              <div className="hero-scrim" aria-hidden="true" />

              {heroOff > 0 && (
                <span className="hero-media-off" aria-label={`${heroOff}% de descuento`}>
                  <b>{heroOff}%</b><i>OFF</i>
                </span>
              )}

              {hero && (
                <a href={heroHref} className="hero-card">
                  <div className="hero-card-info">
                    <div className="hero-card-name">{hero.nombre}</div>
                    <div className="hero-card-meta">
                      <span className="hero-card-precio">{hero.precio}</span>
                      {hero.precioAnterior && <span className="hero-card-antes">{hero.precioAnterior}</span>}
                      {hero.envioGratis && <span className="hero-card-ship">{ico.camion} Envío gratis</span>}
                    </div>
                  </div>
                  <span className="hero-card-go">
                    <span className="hero-card-go-txt">Ver producto</span>
                    {ico.flecha}
                  </span>
                </a>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════ OTROS PRODUCTOS ══════════ */}
      {productos.length > 0 && (
        <section id="otros" className="prods">
          <div className="sec">
            <div className="sec-head">
              <div>
                <div className="sec-eyebrow">También puede interesarte</div>
                <h2 className="sec-title">Otros productos</h2>
              </div>
              <a href="/buscar" className="sec-link">Ver todos {ico.flecha}</a>
            </div>

            <div className="prod-grid" ref={trackRef} onScroll={onScroll}>
              {productos.map(p => {
                const off = pctOff(aNumero(p.precio), aNumero(p.precioAnterior));
                return (
                  <div key={p.id} className="prod-card">
                    <a href={`/productos/${p.slug}`} style={{ display: "flex", flexDirection: "column", flex: 1 }}>
                      <div className="prod-img">
                        <img src={p.imagen} alt={p.nombre} loading="lazy" />
                        {off > 0 && <span className="prod-off">-{off}%</span>}
                      </div>
                      <div className="prod-body">
                        <h3 className="prod-name">{p.nombre}</h3>
                        <div className="prod-precio">
                          <b>{p.precio}</b>
                          {p.precioAnterior && <s>{p.precioAnterior}</s>}
                        </div>
                        {p.cuotas && <div className="prod-cuotas">{p.cuotas}</div>}
                        {p.envioGratis && <span className="prod-ship">Envío gratis</span>}
                      </div>
                    </a>
                    <button className="prod-add" onClick={(e) => handleAgregar(p, e)} aria-label={`Agregar ${p.nombre} al carrito`}>
                      {ico.carrito}
                    </button>
                  </div>
                );
              })}
              <a href="/buscar" className="prod-more">
                <span>{ico.flecha}</span>
                Ver todos<br />los productos
              </a>
            </div>

            {paginas > 1 && (
              <div className="prod-dots">
                {Array.from({ length: paginas }).map((_, i) => (
                  <button
                    key={i}
                    className={`prod-dot${i === pagina ? " on" : ""}`}
                    onClick={() => irAPagina(i)}
                    aria-label={`Ir al grupo ${i + 1}`}
                  />
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* ══════════ AYUDA ══════════ */}
      <section className="ayuda">
        <div className="sec">
          <div className="ayuda-box">
            <div>
              <h3>¿Necesitás ayuda para elegir?</h3>
              <p>Escribinos por WhatsApp y te asesoramos con el producto, el envío a tu provincia y las formas de pago.</p>
            </div>
            <a href="https://wa.me/5493815440596" target="_blank" rel="noopener noreferrer" className="ayuda-wp">
              {ico.whatsapp} Hablar con la tienda
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
