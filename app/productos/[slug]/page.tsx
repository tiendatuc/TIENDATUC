"use client";
import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { supabase } from "../../lib/supabase";
import { useCart } from "../../store/cartStore";

const svg = { width: 17, height: 17, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };

const ico = {
  camion: (
    <svg {...svg}><rect x="1" y="7" width="14" height="9" rx="1" /><path d="M15 10h3.5l3 3v3H15" /><circle cx="6" cy="19" r="1.8" /><circle cx="17.5" cy="19" r="1.8" /></svg>
  ),
  escudo: (
    <svg {...svg}><path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3Z" /><path d="m9 12 2 2 4-4" /></svg>
  ),
  devolucion: (
    <svg {...svg}><path d="M3 12a9 9 0 1 0 3-6.7" /><polyline points="3 4 3 9 8 9" /></svg>
  ),
  check: (
    <svg {...svg} width={15} height={15}><polyline points="4 12.5 9 17.5 20 6.5" /></svg>
  ),
  tarjeta: (
    <svg {...svg}><rect x="2" y="5" width="20" height="14" rx="2" /><line x1="2" y1="10" x2="22" y2="10" /><line x1="6" y1="15" x2="10" y2="15" /></svg>
  ),
};

// Rango de entrega estimado: entre 3 y 6 días desde hoy
const rangoEntrega = () => {
  const fmt = (dias: number) => {
    const d = new Date();
    d.setDate(d.getDate() + dias);
    return d.toLocaleDateString("es-AR", { day: "numeric", month: "long" });
  };
  return { desde: fmt(3), hasta: fmt(6) };
};

const fmtARS = (n: number) => "$" + Math.round(n || 0).toLocaleString("es-AR");

// "$39.900" -> 39900
const aNumero = (v: any) => Number(String(v ?? "").replace(/[^\d]/g, "")) || 0;

// Porcentaje de descuento entre el precio actual y el anterior
const pctOff = (actual: number, anterior: number) =>
  anterior > actual && actual > 0 ? `${Math.round((1 - actual / anterior) * 100)}%` : "";

export default function ProductoPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const { agregar } = useCart();

  const [producto, setProducto] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [imgActiva, setImgActiva] = useState(0);
  const [pack, setPack] = useState<1 | 2>(2);
  const [emailSub, setEmailSub] = useState("");
  const [subOk, setSubOk] = useState(false);
  const [zoom, setZoom] = useState(false);
  const [verMas, setVerMas] = useState(false);
  const [relacionados, setRelacionados] = useState<any[]>([]);
  const [toast, setToast] = useState(false);
  // Relación de aspecto real de cada foto (se mide al cargar) para decidir cómo encajarla
  const [ratios, setRatios] = useState<Record<number, number>>({});
  const trackRef = useRef<HTMLDivElement>(null);
  const videosRef = useRef<(HTMLVideoElement | null)[]>([]);

  const imagenes: string[] = Array.isArray(producto?.imagenes) ? producto.imagenes.filter(Boolean) : [];

  // La galería muestra las fotos y, a continuación, los videos del producto
  type Medio = { tipo: "img" | "video"; src: string; titulo?: string };
  const medios: Medio[] = [
    ...imagenes.map((src) => ({ tipo: "img" as const, src })),
    ...(Array.isArray(producto?.features) ? producto.features : [])
      .filter((f: any) => (f.tipo === "video" || f.video) && (f.archivo || f.video))
      .map((f: any) => ({ tipo: "video" as const, src: f.archivo || f.video, titulo: f.titulo })),
  ];
  const medioActivo = medios[imgActiva];

  useEffect(() => {
    if (slug) cargarProducto();
  }, [slug]);

  // El recuadro es 3/4 (0.75). Las fotos cuadradas o verticales lo llenan y las
  // apaisadas se ven completas. Los videos verticales lo llenan sin bordes.
  const fitDe = (i: number) => {
    const r = ratios[i];
    if (!r) return "contain";
    if (medios[i]?.tipo === "video") return r < 0.76 ? "cover" : "contain";
    return r >= 0.62 && r <= 1.15 ? "cover" : "contain";
  };

  const medir = (i: number, w: number, h: number) =>
    w && h && setRatios((prev) => (prev[i] ? prev : { ...prev, [i]: w / h }));

  const irA = (i: number) => {
    const total = medios.length;
    if (!total) return;
    const idx = (i + total) % total;
    setImgActiva(idx);
    const track = trackRef.current;
    if (track) track.scrollTo({ left: idx * track.clientWidth, behavior: "smooth" });
  };

  const onTrackScroll = () => {
    const track = trackRef.current;
    if (!track || !track.clientWidth) return;
    const idx = Math.round(track.scrollLeft / track.clientWidth);
    setImgActiva((prev) => (prev === idx ? prev : idx));
  };

  // Teclado dentro del visor ampliado + bloqueo del scroll de fondo
  useEffect(() => {
    if (!zoom) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setZoom(false);
      if (e.key === "ArrowRight") irA(imgActiva + 1);
      if (e.key === "ArrowLeft") irA(imgActiva - 1);
    };
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [zoom, imgActiva, medios.length]);

  // Solo se reproduce el video que está a la vista en la galería
  useEffect(() => {
    videosRef.current.forEach((v, i) => {
      if (!v) return;
      if (i === imgActiva) {
        v.play().catch(() => {});
      } else {
        v.pause();
        v.currentTime = 0;
      }
    });
  }, [imgActiva, medios.length]);

  const cargarProducto = async () => {
    const { data } = await supabase
      .from("productos")
      .select("*")
      .eq("slug", slug)
      .single();

    if (data) {
      setProducto(data);
    }
    setLoading(false);

    const { data: otros } = await supabase
      .from("productos")
      .select("id, slug, nombre, precio, precio_anterior, cuotas, envio_gratis, imagenes")
      .eq("activo", true)
      .neq("slug", slug)
      .order("id")
      .limit(12);

    setRelacionados(otros || []);
  };

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text)" }}>
        Cargando producto...
      </div>
    );
  }

  if (!producto) {
    return (
      <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text)" }}>
        Producto no encontrado.
      </div>
    );
  }

  // Precios reales del producto (el campo de texto manda; precio_num es el respaldo)
  const precioBase = aNumero(producto.precio) || Number(producto.precio_num) || 0;
  const precioAntBase = aNumero(producto.precio_anterior);
  const stock = Math.min(Number(producto.stock) || 10, 10);
  const puedeDuo = stock >= 2;
  const cantidad = puedeDuo ? pack : 1;
  const frases = String(producto.descripcion || "")
    .split(/\.\s+/)
    .map((f) => f.trim().replace(/\.$/, ""))
    .filter(Boolean);

  const aCien = (n: number) => Math.round((n || 0) / 100) * 100;
  const unit1 = precioBase;
  const unit2 = aCien(precioBase * 0.85);
  const packs = [
    {
      n: 1 as const,
      titulo: "1 Pack",
      total: unit1,
      anterior: precioAntBase,
      sub: producto.envio_gratis !== false ? "Incluye ENVÍO GRATIS" : "1 unidad",
    },
    ...(puedeDuo
      ? [{
          n: 2 as const,
          titulo: "2 Pack",
          total: unit2 * 2,
          anterior: precioAntBase > 0 ? precioAntBase * 2 : unit1 * 2,
          sub: `Pagas ${fmtARS(unit2)} c/u`,
        }]
      : []),
  ];

  const precioUnitario = cantidad >= 2 ? unit2 : unit1;
  const total = precioUnitario * cantidad;
  const totalAnterior = precioAntBase * cantidad;
  const descuentoTotal = pctOff(total, totalAnterior);
  const entrega = rangoEntrega();
  const fotoPack = imagenes[0] || "";

  // Se carga el precio por unidad y se repite según el pack, así el carrito
  // muestra la cantidad real y los totales cierran con el precio del pack
  const handleAgregar = () => {
    for (let i = 0; i < cantidad; i++) {
      agregar({
        id: producto.id,
        nombre: cantidad === 2 ? `${producto.nombre} (2 Pack)` : producto.nombre,
        precio: fmtARS(precioUnitario),
        precioNum: precioUnitario,
        imagen: imagenes[0] || "",
      });
    }
    setToast(true);
    setTimeout(() => setToast(false), 2200);
  };

  const handleComprar = () => {
    handleAgregar();
    window.location.href = "/checkout";
  };

  return (
    <div style={{ background: "var(--bg)", color: "var(--text)", minHeight: "100vh", fontFamily: "sans-serif" }}>

      <style>{`
        @keyframes slideDown{0%{transform:translateX(-50%) translateY(-30px);opacity:0}12%{transform:translateX(-50%) translateY(0);opacity:1}80%{transform:translateX(-50%) translateY(0);opacity:1}100%{transform:translateX(-50%) translateY(-30px);opacity:0}}
        /* ---- COLUMNA DE INFORMACIÓN ---- */
        .info-rating{display:flex;align-items:center;gap:6px;font-size:12.5px;color:var(--text-2);margin-bottom:10px;}
        .info-rating strong{color:var(--text);font-weight:800;}
        .info-stars{color:var(--gold);letter-spacing:1px;font-size:13px;}
        .info-titulo{font-size:clamp(22px,2.6vw,28px);font-weight:800;color:var(--text);line-height:1.2;letter-spacing:-.01em;margin-bottom:12px;}
        .info-desc{font-size:14px;color:var(--text-2);line-height:1.55;margin-bottom:14px;}
        .info-lista{list-style:none;padding:0;margin:0 0 6px;display:flex;flex-direction:column;gap:9px;}
        .info-lista li{display:flex;gap:9px;align-items:flex-start;font-size:13px;color:var(--text-2);line-height:1.45;}
        .info-lista svg{color:var(--green);flex-shrink:0;margin-top:2px;}
        .info-vermas{background:none;border:none;padding:0;margin-top:4px;font-size:12.5px;font-weight:700;color:var(--copper);cursor:pointer;text-decoration:underline;text-underline-offset:3px;}
        .info-vermas:hover{opacity:.8;}
        .opts-label{font-size:10px;font-weight:800;letter-spacing:.1em;text-transform:uppercase;color:var(--text-4);margin-bottom:10px;}
        .pack-list{display:flex;flex-direction:column;gap:10px;}
        .pack{display:grid;grid-template-columns:76px minmax(0,1fr) auto;gap:12px;align-items:center;width:100%;text-align:left;background:var(--bg-2);border:1.5px solid var(--border-2);border-radius:14px;padding:12px 14px;cursor:pointer;letter-spacing:0;font-weight:400;transition:border-color .15s,box-shadow .15s,background .15s;}
        .pack:hover{border-color:var(--copper);}
        .pack.on{border-color:var(--copper);box-shadow:0 0 0 1px var(--copper);background:var(--accent-soft);}
        .pack-visual{position:relative;width:76px;height:64px;flex-shrink:0;}
        .pack-visual img{width:58px;height:58px;object-fit:contain;background:var(--img-bg);border-radius:8px;border:1px solid var(--border);position:absolute;bottom:3px;}
        .pack-visual.one img{left:9px;}
        .pack-visual.duo img.a{left:0;z-index:1;}
        .pack-visual.duo img.b{left:18px;z-index:2;}
        .pack-mid{min-width:0;}
        .pack-title-row{display:flex;align-items:center;gap:8px;flex-wrap:wrap;}
        .pack-title{font-size:16px;font-weight:800;color:var(--text);letter-spacing:-.02em;}
        .pack-badge{background:var(--text);color:var(--bg-2);font-size:10px;font-weight:800;letter-spacing:.03em;padding:4px 8px;border-radius:999px;white-space:nowrap;}
        .pack-sub{margin-top:5px;font-size:12.5px;color:var(--text-2);line-height:1.35;}
        .pack-prices{text-align:right;flex-shrink:0;}
        .pack-now{font-size:18px;font-weight:800;color:var(--text);letter-spacing:-.02em;line-height:1.1;font-variant-numeric:tabular-nums;}
        .pack-was{display:block;margin-top:4px;font-size:12.5px;font-weight:600;color:var(--red);text-decoration:line-through;font-variant-numeric:tabular-nums;}

        /* ---- CAJA DE COMPRA ---- */
        .bx{position:sticky;top:20px;border:1px solid var(--border);border-radius:16px;background:var(--bg-2);box-shadow:var(--card-shadow);overflow:hidden;}
        .bx-sec{padding:22px 20px;}
        .bx-sec + .bx-sec{border-top:1px solid var(--border);}
        .bx-stock{display:inline-flex;align-items:center;gap:7px;background:var(--green-soft);color:var(--green);font-size:10.5px;font-weight:800;letter-spacing:.06em;text-transform:uppercase;padding:5px 10px;border-radius:999px;}
        .bx-dot{width:7px;height:7px;border-radius:50%;background:var(--green);animation:pulso 1.6s ease infinite;}
        @keyframes pulso{0%,100%{opacity:1}50%{opacity:.25}}
        .bx-price{font-size:34px;font-weight:900;letter-spacing:-.02em;line-height:1.05;color:var(--text);}
        .bx-old{font-size:15px;color:var(--text-3);text-decoration:line-through;}
        .bx-off{background:var(--green-soft);color:var(--green);font-size:11px;font-weight:800;padding:3px 8px;border-radius:6px;white-space:nowrap;}
        .bx-cuotas{font-size:12.5px;color:var(--green);font-weight:700;}
        .bx-unit{display:flex;justify-content:space-between;align-items:center;gap:10px;margin-top:14px;padding:11px 13px;border-radius:9px;background:var(--bg);border:1px solid var(--border);font-size:12px;color:var(--text-2);}
        .bx-cta{width:100%;border:none;border-radius:11px;padding:18px;font-size:15px;font-weight:800;letter-spacing:.02em;cursor:pointer;background:var(--gold);color:var(--on-gold);transition:filter .16s;}
        .bx-cta:hover{filter:brightness(1.07);transform:translateY(-1px);}
        .bx-cta:active{transform:translateY(0);}
        .bx-cta2{width:100%;margin-top:11px;border:1.5px solid var(--copper);background:transparent;color:var(--copper);border-radius:11px;padding:16px;font-size:15px;font-weight:800;cursor:pointer;transition:background .16s;}
        .bx-cta2:hover{background:var(--accent-soft);}
        .bx-envio{display:flex;gap:9px;align-items:flex-start;margin-top:16px;padding:13px;border-radius:10px;background:var(--green-soft);font-size:12.5px;color:var(--text-2);line-height:1.45;}
        .bx-envio svg{color:var(--green);flex-shrink:0;margin-top:1px;}
        .bx-envio strong{color:var(--green);font-weight:800;}
        .bx-row{display:flex;gap:10px;align-items:flex-start;font-size:12.5px;color:var(--text-2);line-height:1.45;text-decoration:none;}
        .bx-row + .bx-row{margin-top:16px;}
        .bx-row svg{flex-shrink:0;margin-top:1px;color:var(--copper);}
        .bx-row strong{color:var(--text);font-weight:700;display:block;}
        a.bx-row:hover strong{color:var(--copper);}

        /* ---- GALERÍA DE PRODUCTO ---- */
        .pdp-gallery{display:flex;gap:12px;align-items:flex-start;}
        .pdp-thumbs{display:flex;flex-direction:column;gap:10px;width:72px;flex-shrink:0;max-height:660px;overflow-y:auto;scrollbar-width:none;}
        .pdp-thumbs::-webkit-scrollbar{display:none;}
        .pdp-thumb{position:relative;width:72px;height:72px;flex-shrink:0;padding:0;border-radius:10px;overflow:hidden;cursor:pointer;background:var(--img-bg);border:1px solid var(--border-2);transition:border-color .18s,transform .18s;}
        .pdp-thumb:hover{transform:translateY(-2px);border-color:var(--copper);}
        .pdp-thumb.on{border:2px solid var(--copper);}
        .pdp-thumb img{width:100%;height:100%;object-fit:contain;padding:5px;box-sizing:border-box;display:block;}
        .pdp-thumb video{width:100%;height:100%;object-fit:cover;display:block;background:#0A0A0F;}
        .pdp-play{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:11px;color:#fff;background:rgba(0,0,0,.35);text-shadow:0 1px 4px rgba(0,0,0,.6);}
        .pdp-slide.vid{background:#0A0A0F;cursor:default;}
        .pdp-stage{position:relative;flex:1;min-width:0;border-radius:16px;overflow:hidden;background:var(--img-bg);border:1px solid var(--border-2);}
        .pdp-track{display:flex;overflow-x:auto;overscroll-behavior-x:contain;scroll-snap-type:x mandatory;scrollbar-width:none;-ms-overflow-style:none;}
        .pdp-track::-webkit-scrollbar{display:none;}
        .pdp-slide{flex:0 0 100%;width:100%;scroll-snap-align:center;aspect-ratio:3/4;overflow:hidden;cursor:zoom-in;}
        .pdp-slide img{width:100%;height:100%;display:block;box-sizing:border-box;transition:transform .45s cubic-bezier(.2,.7,.3,1);}
        .pdp-stage:hover .pdp-slide img{transform:scale(1.06);}
        .pdp-arrow{position:absolute;top:50%;transform:translateY(-50%);width:38px;height:38px;border-radius:50%;border:1px solid var(--border-2);background:var(--fav-bg);backdrop-filter:blur(8px);color:var(--text);display:flex;align-items:center;justify-content:center;cursor:pointer;z-index:3;opacity:0;transition:opacity .18s,background .18s;padding:0;}
        .pdp-stage:hover .pdp-arrow{opacity:1;}
        .pdp-arrow:hover{background:var(--bg-2);}
        .pdp-arrow.l{left:12px;} .pdp-arrow.r{right:12px;}
        .pdp-badge{position:absolute;z-index:3;background:var(--fav-bg);backdrop-filter:blur(8px);border:1px solid var(--border);border-radius:999px;padding:5px 10px;font-size:11px;font-weight:700;color:var(--text-2);display:flex;align-items:center;gap:5px;pointer-events:none;}
        .pdp-count{right:12px;bottom:12px;}
        .pdp-hint{left:12px;bottom:12px;opacity:0;transition:opacity .18s;}
        .pdp-stage:hover .pdp-hint{opacity:1;}
        .pdp-dots{display:none;gap:6px;justify-content:center;margin-top:12px;}
        .pdp-dot{width:7px;height:7px;border-radius:50%;background:var(--border-2);border:none;padding:0;transition:width .2s,background .2s;}
        .pdp-dot.on{width:20px;border-radius:4px;background:var(--copper);}

        /* ---- TAMBIÉN PODRÍA INTERESARTE ---- */
        .feat-eyebrow{font-size:10px;font-weight:800;letter-spacing:.14em;text-transform:uppercase;color:var(--copper);}
        .rel-wrap{border-top:1px solid var(--border);padding-top:48px;margin-bottom:64px;}
        .rel-head{display:flex;align-items:flex-end;justify-content:space-between;gap:16px;margin-bottom:26px;}
        .rel-title{font-size:clamp(20px,2.6vw,26px);font-weight:800;letter-spacing:-.01em;margin-top:8px;color:var(--text);}
        .rel-todos{font-size:13px;font-weight:700;color:var(--copper);text-decoration:none;white-space:nowrap;}
        .rel-todos:hover{text-decoration:underline;}
        .rel-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(210px,1fr));gap:18px;}
        .rel-card{display:flex;flex-direction:column;border:1px solid var(--border);border-radius:14px;background:var(--bg-2);overflow:hidden;text-decoration:none;transition:transform .18s,box-shadow .18s,border-color .18s;}
        .rel-card:hover{transform:translateY(-4px);box-shadow:var(--card-shadow);border-color:var(--copper);}
        .rel-img{position:relative;aspect-ratio:1;background:var(--img-bg);overflow:hidden;}
        .rel-img img{width:100%;height:100%;object-fit:contain;padding:14px;box-sizing:border-box;transition:transform .35s ease;}
        .rel-card:hover .rel-img img{transform:scale(1.06);}
        .rel-off{position:absolute;top:10px;left:10px;background:var(--green);color:var(--on-green);font-size:10.5px;font-weight:800;padding:3px 7px;border-radius:6px;}
        .rel-body{padding:13px 14px 16px;display:flex;flex-direction:column;gap:4px;}
        .rel-nombre{font-size:13.5px;font-weight:700;color:var(--text);line-height:1.35;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;min-height:2.7em;}
        .rel-precio{display:flex;align-items:baseline;gap:7px;font-size:18px;font-weight:900;color:var(--text);margin-top:2px;}
        .rel-antes{font-size:12px;font-weight:600;color:var(--text-3);text-decoration:line-through;}
        .rel-cuotas{font-size:11.5px;color:var(--green);font-weight:700;}
        .rel-envio{font-size:11px;color:var(--text-3);font-weight:700;}
        @media(max-width:640px){
          .rel-grid{grid-template-columns:repeat(2,1fr);gap:12px;}
          .rel-nombre{font-size:12.5px;}
          .rel-precio{font-size:16px;}
        }

        /* ---- VISOR AMPLIADO ---- */
        .pdp-lb{position:fixed;inset:0;z-index:9999;background:rgba(3,7,18,.88);backdrop-filter:blur(6px);display:flex;align-items:center;justify-content:center;padding:24px;}
        .pdp-lb img,.pdp-lb video{max-width:min(1080px,92vw);max-height:84vh;object-fit:contain;border-radius:12px;}
        .pdp-lb-btn{position:absolute;width:44px;height:44px;border-radius:50%;border:1px solid rgba(255,255,255,.22);background:rgba(255,255,255,.10);color:#fff;font-size:20px;display:flex;align-items:center;justify-content:center;cursor:pointer;padding:0;transition:background .18s;}
        .pdp-lb-btn:hover{background:rgba(255,255,255,.22);}
        .pdp-lb-close{top:20px;right:20px;}
        .pdp-lb-prev{left:20px;top:50%;transform:translateY(-50%);}
        .pdp-lb-next{right:20px;top:50%;transform:translateY(-50%);}
        .pdp-lb-count{position:absolute;bottom:24px;left:50%;transform:translateX(-50%);color:rgba(255,255,255,.75);font-size:12px;font-weight:700;letter-spacing:.06em;}

        @media(max-width:960px){
          .ml-hero{grid-template-columns:1fr 1fr!important;}
          .bx{grid-column:1 / -1;position:static!important;}
        }
        @media(max-width:640px){
          .ml-hero{grid-template-columns:1fr!important;gap:22px!important;}
          .bx{grid-column:auto!important;}
          .bx-price{font-size:28px;}
          .pdp-gallery{flex-direction:column-reverse;gap:10px;}
          .pdp-thumbs{flex-direction:row;width:100%;max-height:none;overflow-x:auto;overflow-y:hidden;gap:8px;padding-bottom:2px;}
          .pdp-thumb{width:56px;height:56px;}
          .pdp-arrow,.pdp-hint{display:none;}
          .pdp-dots{display:flex;}
          .pdp-slide{cursor:default;}
          .pdp-stage:hover .pdp-slide img{transform:none;}
          .pdp-lb-prev{left:8px;} .pdp-lb-next{right:8px;}
          .pack{grid-template-columns:64px minmax(0,1fr) auto;gap:10px;padding:10px 12px;}
          .pack-visual{width:64px;height:56px;}
          .pack-visual img{width:50px;height:50px;}
          .pack-visual.one img{left:7px;}
          .pack-visual.duo img.b{left:14px;}
          .pack-title{font-size:15px;}
          .pack-now{font-size:16px;}
        }
      `}</style>

      {toast && (
        <div style={{ position: "fixed", top: "calc(var(--hd-h, 58px) + 14px)", left: "50%", zIndex: 9999, background: "var(--bg-2)", border: "1px solid var(--border-2)", borderRadius: 12, padding: "14px 22px", display: "flex", alignItems: "center", gap: 12, boxShadow: "var(--toast-shadow)", animation: "slideDown 2.2s ease forwards", whiteSpace: "nowrap", pointerEvents: "none" }}>
          <div style={{ width: 30, height: 30, borderRadius: "50%", background: "var(--green)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, color: "var(--on-green)", flexShrink: 0, fontSize: 14 }}>✓</div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text)" }}>¡Agregado al carrito!</div>
            <div style={{ fontSize: 11, color: "var(--text-3)" }}>Revisá tu carrito antes de comprar</div>
          </div>
        </div>
      )}

      {zoom && medioActivo && (
        <div className="pdp-lb" onClick={() => setZoom(false)}>
          {medioActivo.tipo === "video" ? (
            <video src={medioActivo.src} controls autoPlay loop playsInline onClick={(e) => e.stopPropagation()} />
          ) : (
            <img src={medioActivo.src} alt={producto.nombre} onClick={(e) => e.stopPropagation()} />
          )}
          <button className="pdp-lb-btn pdp-lb-close" onClick={() => setZoom(false)} aria-label="Cerrar">✕</button>
          {medios.length > 1 && (
            <>
              <button className="pdp-lb-btn pdp-lb-prev" onClick={(e) => { e.stopPropagation(); irA(imgActiva - 1); }} aria-label="Anterior">‹</button>
              <button className="pdp-lb-btn pdp-lb-next" onClick={(e) => { e.stopPropagation(); irA(imgActiva + 1); }} aria-label="Siguiente">›</button>
              <div className="pdp-lb-count">{imgActiva + 1} / {medios.length}</div>
            </>
          )}
        </div>
      )}

      {/* HEADER TOPBAR INFO */}
      <div style={{ background: "var(--copper)", color: "var(--on-accent)", fontSize: 11, fontWeight: 700, textAlign: "center", padding: "6px 0", letterSpacing: "0.05em" }}>
        ENVÍO GRATIS A TODO EL PAÍS · 3 Y 6 CUOTAS SIN INTERÉS · GARANTÍA DE SATISFACCIÓN
      </div>

      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "30px 24px" }}>

        {/* SECCIÓN PRINCIPAL DE PRODUCTO — estilo marketplace: galería | info | caja de compra */}
        <div className="ml-hero" style={{ display: "grid", gridTemplateColumns: "minmax(340px, 1.3fr) minmax(260px, 1fr) 290px", gap: 28, alignItems: "start", marginBottom: 60 }}>

          {/* GALERÍA DE IMÁGENES: miniaturas + carrusel principal con zoom */}
          <div>
            <div className="pdp-gallery">
              {medios.length > 1 && (
                <div className="pdp-thumbs">
                  {medios.map((m, idx) => (
                    <button
                      key={idx}
                      type="button"
                      className={`pdp-thumb${imgActiva === idx ? " on" : ""}`}
                      onClick={() => irA(idx)}
                      aria-label={m.tipo === "video" ? `Ver video ${m.titulo || ""}` : `Ver imagen ${idx + 1}`}
                    >
                      {m.tipo === "video" ? (
                        <>
                          <video src={`${m.src}#t=0.1`} muted playsInline preload="metadata" />
                          <span className="pdp-play">▶</span>
                        </>
                      ) : (
                        <img src={m.src} alt="" loading="lazy" />
                      )}
                    </button>
                  ))}
                </div>
              )}

              <div className="pdp-stage">
                {medios.length > 0 ? (
                  <div className="pdp-track" ref={trackRef} onScroll={onTrackScroll}>
                    {medios.map((m, idx) => (
                      <div
                        key={idx}
                        className={`pdp-slide${m.tipo === "video" ? " vid" : ""}`}
                        onClick={() => m.tipo === "img" && setZoom(true)}
                      >
                        {m.tipo === "video" ? (
                          <video
                            ref={(el) => { videosRef.current[idx] = el; }}
                            src={m.src}
                            loop
                            muted
                            playsInline
                            preload="metadata"
                            onLoadedMetadata={(e) => medir(idx, e.currentTarget.videoWidth, e.currentTarget.videoHeight)}
                            style={{ objectFit: fitDe(idx) }}
                          />
                        ) : (
                          <img
                            src={m.src}
                            alt={`${producto.nombre} — imagen ${idx + 1}`}
                            loading={idx === 0 ? "eager" : "lazy"}
                            onLoad={(e) => medir(idx, e.currentTarget.naturalWidth, e.currentTarget.naturalHeight)}
                            style={{
                              objectFit: fitDe(idx),
                              padding: fitDe(idx) === "contain" ? 18 : 0,
                            }}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="pdp-slide" style={{ display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-4)", fontSize: 13 }}>
                    Sin imágenes
                  </div>
                )}

                {medios.length > 1 && (
                  <>
                    <button type="button" className="pdp-arrow l" onClick={() => irA(imgActiva - 1)} aria-label="Anterior">‹</button>
                    <button type="button" className="pdp-arrow r" onClick={() => irA(imgActiva + 1)} aria-label="Siguiente">›</button>
                    <div className="pdp-badge pdp-count">{imgActiva + 1} / {medios.length}</div>
                  </>
                )}
                {medioActivo?.tipo === "img" && (
                  <div className="pdp-badge pdp-hint">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <circle cx="11" cy="11" r="7" /><path d="m20 20-3.6-3.6" /><path d="M11 8v6M8 11h6" />
                    </svg>
                    Clic para ampliar
                  </div>
                )}
                {medioActivo?.tipo === "video" && medioActivo.titulo && (
                  <div className="pdp-badge pdp-hint">▶ {medioActivo.titulo}</div>
                )}
              </div>
            </div>

            {medios.length > 1 && (
              <div className="pdp-dots">
                {medios.map((_, idx) => (
                  <button key={idx} type="button" className={`pdp-dot${imgActiva === idx ? " on" : ""}`} onClick={() => irA(idx)} aria-label={`Ver ${idx + 1}`} />
                ))}
              </div>
            )}
          </div>

          {/* INFO DEL PRODUCTO */}
          <div style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
            <div className="info-rating">
              <span className="info-stars">★★★★★</span>
              <strong>4.86</strong>
              <span>· 120 reseñas verificadas</span>
            </div>

            <h1 className="info-titulo">{producto.nombre}</h1>

            {/* La descripción se parte en una frase de entrada + puntos escaneables */}
            {frases.length > 0 && <p className="info-desc">{frases[0]}.</p>}
            {frases.length > 1 && (
              <ul className="info-lista">
                {(verMas ? frases.slice(1) : frases.slice(1, 4)).map((f: string, i: number) => (
                  <li key={i}>{ico.check}<span>{f}.</span></li>
                ))}
              </ul>
            )}
            {frases.length > 4 && (
              <button type="button" className="info-vermas" onClick={() => setVerMas((v) => !v)}>
                {verMas
                  ? "Ver menos"
                  : `Ver ${frases.length - 4} detalle${frases.length - 4 > 1 ? "s" : ""} más`}
              </button>
            )}

            {/* PACKS: 1 unidad vs 2 con mejor precio por unidad */}
            <div style={{ marginTop: 24 }}>
              <div className="opts-label">Elegí tu pack</div>
              <div className="pack-list" role="radiogroup" aria-label="Pack">
                {packs.map((pk) => {
                  const off = pctOff(pk.total, pk.anterior);
                  const on = cantidad === pk.n;
                  return (
                    <button
                      key={pk.n}
                      type="button"
                      role="radio"
                      aria-checked={on}
                      className={`pack${on ? " on" : ""}`}
                      onClick={() => setPack(pk.n)}
                    >
                      <div className={`pack-visual ${pk.n === 2 ? "duo" : "one"}`}>
                        {fotoPack && <img className="a" src={fotoPack} alt="" />}
                        {pk.n === 2 && fotoPack && <img className="b" src={fotoPack} alt="" />}
                      </div>
                      <div className="pack-mid">
                        <div className="pack-title-row">
                          <span className="pack-title">{pk.titulo}</span>
                          {off && <span className="pack-badge">AHORRÁ {off}</span>}
                        </div>
                        <div className="pack-sub">{pk.sub}</div>
                      </div>
                      <div className="pack-prices">
                        <span className="pack-now">{fmtARS(pk.total)}</span>
                        {pk.anterior > pk.total && (
                          <span className="pack-was">{fmtARS(pk.anterior)}</span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* CAJA DE COMPRA */}
          <aside className="bx">
            {/* Precio y stock */}
            <div className="bx-sec">
              <span className="bx-stock"><i className="bx-dot" /> En stock · listo para enviar</span>

              <div style={{ display: "flex", alignItems: "baseline", gap: 9, flexWrap: "wrap", margin: "12px 0 6px" }}>
                <span className="bx-price">{fmtARS(total)}</span>
                {totalAnterior > 0 && <span className="bx-old">{fmtARS(totalAnterior)}</span>}
                {descuentoTotal && <span className="bx-off">-{descuentoTotal}</span>}
              </div>

              <div className="bx-cuotas">{producto.cuotas || "3 y 6 cuotas sin interés"}</div>

              {cantidad > 1 && (
                <div className="bx-unit">
                  <span>Llevás <strong style={{ color: "var(--text)" }}>2 Pack</strong></span>
                  <span style={{ fontWeight: 800, color: "var(--text)" }}>{fmtARS(precioUnitario)} c/u</span>
                </div>
              )}
            </div>

            {/* Acciones */}
            <div className="bx-sec">
              <button className="bx-cta" onClick={handleComprar}>Comprar ahora</button>
              <button className="bx-cta2" onClick={handleAgregar}>Agregar al carrito</button>

              <div className="bx-envio">
                {ico.camion}
                <span><strong>Llega gratis</strong> entre el {entrega.desde} y el {entrega.hasta} a todo el país.</span>
              </div>
            </div>

            {/* Beneficios */}
            <div className="bx-sec">
              <div className="bx-row">
                {ico.escudo}
                <span><strong>Garantía de 6 meses</strong>Contra defectos de fábrica.</span>
              </div>
              <a className="bx-row" href="/devoluciones">
                {ico.devolucion}
                <span><strong>Devolución gratis · 30 días</strong>Si no te gusta, lo devolvés sin costo.</span>
              </a>
              <div className="bx-row">
                {ico.tarjeta}
                <span><strong>Pagá como quieras</strong>Tarjeta, transferencia o efectivo.</span>
              </div>
            </div>

          </aside>
        </div>

        {/* TAMBIÉN PODRÍA INTERESARTE */}
        {relacionados.length > 0 && (
          <section className="rel-wrap">
            <div className="rel-head">
              <div>
                <span className="feat-eyebrow">Seguí mirando</span>
                <h2 className="rel-title">También podría interesarte</h2>
              </div>
              <a className="rel-todos" href="/buscar">Ver todos →</a>
            </div>

            <div className="rel-grid">
              {relacionados.map((p: any) => {
                const off = pctOff(aNumero(p.precio), aNumero(p.precio_anterior));
                return (
                  <a key={p.id} className="rel-card" href={`/productos/${p.slug}`}>
                    <div className="rel-img">
                      <img src={p.imagenes?.[0] || ""} alt={p.nombre} loading="lazy" />
                      {off && <span className="rel-off">-{off}</span>}
                    </div>
                    <div className="rel-body">
                      <h3 className="rel-nombre">{p.nombre}</h3>
                      <div className="rel-precio">
                        {p.precio}
                        {p.precio_anterior && <span className="rel-antes">{p.precio_anterior}</span>}
                      </div>
                      {p.cuotas && <div className="rel-cuotas">{p.cuotas}</div>}
                      {p.envio_gratis && <div className="rel-envio">Envío gratis</div>}
                    </div>
                  </a>
                );
              })}
            </div>
          </section>
        )}

        {/* BLOQUE "NUESTRA MISIÓN" */}
        <div style={{ background: "var(--bg-2)", borderRadius: 16, padding: "40px 24px", textAlign: "center", border: "1px solid var(--border)", marginBottom: 60 }}>
          <span style={{ fontSize: 11, fontWeight: 800, color: "var(--copper)", letterSpacing: "0.1em", textTransform: "uppercase" }}>Nuestra Misión</span>
          <h2 style={{ fontSize: 24, fontWeight: 800, margin: "10px 0 16px" }}>Tu tiempo y tu energía, donde importan.</h2>
          <p style={{ maxWidth: 600, margin: "0 auto", fontSize: 14, color: "var(--text-2)", lineHeight: 1.6 }}>
            Buscamos brindarte herramientas útiles y funcionales para simplificar tu día a día con productos probados y de máxima calidad.
          </p>
        </div>

        {/* SECCIÓN NEWSLETTER */}
        <div style={{ borderTop: "1px solid var(--border-2)", paddingTop: 40, textAlign: "center" }}>
          <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 8 }}>Únete a la comunidad TiendaTuc</h3>
          <p style={{ fontSize: 13, color: "var(--text-3)", marginBottom: 20 }}>Suscríbete para recibir ofertas exclusivas y lanzamientos antes que nadie.</p>
          
          {subOk ? (
            <div style={{ color: "var(--green)", fontWeight: 700, fontSize: 14 }}>¡Gracias por suscribirte!</div>
          ) : (
            <form onSubmit={(e) => { e.preventDefault(); if (emailSub) setSubOk(true); }} style={{ display: "flex", justifyContent: "center", gap: 8, maxWidth: 400, margin: "0 auto" }}>
              <input 
                type="email" 
                placeholder="Tu correo electrónico" 
                value={emailSub} 
                onChange={(e) => setEmailSub(e.target.value)} 
                required 
                style={{ flex: 1, background: "var(--hover)", border: "1px solid var(--border-2)", borderRadius: 6, padding: "10px 14px", color: "var(--text)", outline: "none", fontSize: 13 }}
              />
              <button type="submit" style={{ background: "var(--copper)", color: "var(--on-accent)", border: "none", borderRadius: 6, padding: "10px 18px", fontWeight: 800, cursor: "pointer", fontSize: 13 }}>
                Suscribirme
              </button>
            </form>
          )}
        </div>

      </div>
    </div>
  );
}