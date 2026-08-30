"use client";

import { useState, useEffect } from "react";
import { useCart } from "../../store/cartStore";
import { supabase } from "../../lib/supabase";

type Pack = {
  id: string;
  cantidad: number;
  titulo: string;
  descuento: string;
  destacado?: boolean;
  precioTotal: number;
  precioAnteriorTotal: number;
  precioUnitario?: number;
  envioGratis?: boolean;
  regalos?: string[];
};

type Producto = {
  id: number;
  nombre: string;
  descripcion: string;
  precio: string;
  precioNum: number;
  precioAnterior: string;
  descuento: number;
  ahorro: string;
  cuotas: string;
  envioGratis: boolean;
  stock: number;
  imagenes: string[];
  features?: any[];
  specs?: [string, string][];
  comparativa?: string[];
  resenas?: any[];
  rating?: number;
  totalResenas?: number;
  packs?: Pack[];
  addons?: { id: string; nombre: string; precio: number }[];
};

export default function ProductoClient({ producto }: { producto: Producto }) {
  if (!producto) {
    return (
      <div style={{ padding: "80px 20px", textAlign: "center", color: "var(--text)", background: "var(--bg)", minHeight: "60vh" }}>
        <h2>Producto no encontrado</h2>
        <a href="/" style={{ display: "inline-block", marginTop: 20, color: "var(--copper)", textDecoration: "underline" }}>
          ← Volver a la tienda
        </a>
      </div>
    );
  }

  const defaultPacks: Pack[] = [
    {
      id: "pack-1",
      cantidad: 1,
      titulo: "1 Pack",
      descuento: `AHORRÁ ${producto.descuento || 50}%`,
      destacado: false,
      precioTotal: producto.precioNum || 0,
      precioAnteriorTotal: (producto.precioNum || 0) * 2,
      envioGratis: producto.envioGratis,
      regalos: ["+ 1 Regalo Especial GRATIS"],
    },
    {
      id: "pack-2",
      cantidad: 2,
      titulo: "2 Pack",
      descuento: "AHORRÁ 58%",
      destacado: true,
      precioTotal: Math.round((producto.precioNum || 0) * 1.7),
      precioAnteriorTotal: (producto.precioNum || 0) * 4,
      precioUnitario: Math.round(((producto.precioNum || 0) * 1.7) / 2),
      envioGratis: true,
      regalos: ["+ 2 Regalos Especiales GRATIS", "+ Envío Gratis"],
    },
  ];

  const packs = producto.packs?.length ? producto.packs : defaultPacks;
  const imagenes = producto.imagenes?.length ? producto.imagenes : ["/placeholder.jpg"];

  const { agregar } = useCart();
  const [imgActiva, setImgActiva] = useState(0);
  const [toast, setToast] = useState(false);
  const [usuario, setUsuario] = useState<any>(null);
  const [packSeleccionado, setPackSeleccionado] = useState<string>(packs[0]?.id || "");
  const [addonSeleccionado, setAddonSeleccionado] = useState<boolean>(false);

  const activePack = packs.find((p) => p.id === packSeleccionado) || packs[0];
  const addonPrecio = producto.addons?.[0]?.precio || 4500;
  const precioFinalCalculado = (activePack?.precioTotal || 0) + (addonSeleccionado ? addonPrecio : 0);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }: { data: { session: any } }) => {
      setUsuario(data?.session?.user ?? null);
    });
  }, []);

  const formatARS = (val: number) =>
    "$" + (val || 0).toLocaleString("es-AR", { minimumFractionDigits: 0, maximumFractionDigits: 0 });

  const handleAgregar = () => {
    for (let i = 0; i < (activePack?.cantidad || 1); i++) {
      agregar({
        id: producto.id,
        nombre: `${producto.nombre} (${activePack?.titulo})`,
        precio: formatARS(precioFinalCalculado),
        precioNum: precioFinalCalculado,
        imagen: imagenes[0],
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
    <>
      <style>{`
        @keyframes slideDown{0%{transform:translateX(-50%) translateY(-30px);opacity:0}12%{transform:translateX(-50%) translateY(0);opacity:1}80%{transform:translateX(-50%) translateY(0);opacity:1}100%{transform:translateX(-50%) translateY(-30px);opacity:0}}
        @keyframes blink{0%,100%{opacity:1}50%{opacity:.3}}
        .gallery-main{flex:1;min-width:0;aspect-ratio:1/1;background:var(--bg-2);border:1px solid var(--border);border-radius:12px;overflow:hidden;display:flex;align-items:center;justify-content:center;}
        .gallery-main img{width:100%;height:100%;object-fit:cover;}
        .thumbs-col{display:flex;flex-direction:column;gap:8px;width:64px;flex-shrink:0;max-height:460px;overflow-y:auto;}
        .thumb{aspect-ratio:1/1;width:64px;flex-shrink:0;background:var(--bg-2);border-radius:8px;overflow:hidden;cursor:pointer;transition:border-color .15s;}
        .thumb img{width:100%;height:100%;object-fit:contain;padding:4px;}
        .pack-chip{min-width:52px;padding:10px 14px;border-radius:8px;font-weight:700;font-size:14px;cursor:pointer;position:relative;background:transparent;}
        .buybox-btn-primary{width:100%;background:var(--gold);color:var(--on-gold);border:none;border-radius:8px;padding:16px;font-size:14px;font-weight:800;letter-spacing:0.04em;cursor:pointer;}
        .buybox-btn-secondary{width:100%;background:transparent;color:var(--text);border:1px solid var(--border);border-radius:8px;padding:14px;font-size:14px;font-weight:700;cursor:pointer;}
        .feat-block{display:grid;grid-template-columns:1fr 1fr;border:1px solid var(--border);border-radius:16px;overflow:hidden;margin-bottom:24px;background:var(--bg-2);}
        .feat-block.rev{direction:rtl;}
        .feat-block.rev > *{direction:ltr;}
        .feat-media{aspect-ratio:16/9;overflow:hidden;background:var(--bg);}
        .feat-media img, .feat-media video{width:100%;height:100%;object-fit:cover;display:block;}
        .feat-copy{padding:32px 28px;display:flex;flex-direction:column;justify-content:center;}
        @media(max-width:960px){
          .ml-hero{grid-template-columns:1fr 1fr!important;}
          .buybox-col{grid-column:1 / -1;position:static!important;}
        }
        @media(max-width:640px){
          .ml-hero{grid-template-columns:1fr!important;gap:20px!important;overflow:hidden!important;}
          .gallery-wrap{padding:0 12px;width:100%;box-sizing:border-box;}
          .info-col{width:100%!important;box-sizing:border-box!important;}
          .buybox-col{grid-column:auto!important;}
          .feat-block{grid-template-columns:1fr!important;}
        }
      `}</style>

      {toast && (
        <div style={{ position: "fixed", top: "calc(var(--hd-h, 58px) + 14px)", left: "50%", zIndex: 9999, background: "var(--bg-2)", border: "1px solid color-mix(in srgb, var(--green) 35%, transparent)", borderRadius: 12, padding: "14px 22px", display: "flex", alignItems: "center", justifyContent: "center", gap: 12, boxShadow: "var(--toast-shadow)", animation: "slideDown 2.2s ease forwards", whiteSpace: "nowrap", pointerEvents: "none" }}>
          <div style={{ width: 30, height: 30, borderRadius: "50%", background: "var(--green)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, color: "var(--on-green)", flexShrink: 0, fontSize: 14 }}>✓</div>
          <div>
            <div style={{ fontSize: "var(--text-sm)", fontWeight: 600, color: "var(--text)", marginBottom: 2 }}>¡Agregado al carrito!</div>
            <div className="t-xs">Revisá tu carrito antes de comprar</div>
          </div>
        </div>
      )}

      <div style={{ background: "var(--bg)", minHeight: "100vh", paddingBottom: 100, overflowX: "hidden", maxWidth: "100%" }}>
        <div className="section-wrap" style={{ maxWidth: 1100, margin: "0 auto", padding: "20px 16px 0" }}>
          <a href="/" className="t-xs" style={{ display: "inline-flex", alignItems: "center", gap: 6, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 20, color: "var(--text-3)" }}>← Volver a productos</a>
        </div>

        {/* SECCIÓN HERO (FOTOS, INFO Y COMPRA — estilo marketplace) */}
        <div className="section-wrap" style={{ maxWidth: 1200, margin: "0 auto", padding: "0 16px" }}>
          <div className="ml-hero" style={{ display: "grid", gridTemplateColumns: "minmax(320px, 1fr) minmax(260px, 1.1fr) 300px", gap: 32, alignItems: "start" }}>

            {/* Columna 1: galería (thumbs verticales + imagen principal) */}
            <div className="gallery-wrap" style={{ display: "flex", gap: 12 }}>
              <div className="thumbs-col">
                {imagenes.map((img, i) => (
                  <div key={i} className="thumb" onClick={() => setImgActiva(i)} style={{ border: `2px solid ${i === imgActiva ? "var(--copper)" : "var(--border)"}` }}>
                    <img src={img} alt="" />
                  </div>
                ))}
              </div>
              <div className="gallery-main">
                <img src={imagenes[imgActiva]} alt={producto.nombre} />
              </div>
            </div>

            {/* Columna 2: información del producto */}
            <div className="info-col" style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8, color: "var(--green)", fontSize: 13, fontWeight: 600 }}>
                <span>★★★★★</span>
                <span style={{ color: "var(--text-2)" }}>
                  <strong>{producto.rating || 4.86}</strong> | {producto.totalResenas || 120} Reseñas Verificadas
                </span>
              </div>

              <h1 style={{ fontSize: "clamp(22px, 4vw, 28px)", fontWeight: 800, marginBottom: 12, lineHeight: 1.2 }}>
                {producto.nombre}
              </h1>

              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14, flexWrap: "wrap" }}>
                <span style={{ fontSize: "clamp(24px, 5vw, 30px)", fontWeight: 800, color: "var(--text)" }}>
                  {formatARS(precioFinalCalculado)}
                </span>
                {activePack?.precioAnteriorTotal && (
                  <span style={{ fontSize: 16, color: "var(--text-3)", textDecoration: "line-through" }}>
                    {formatARS(activePack.precioAnteriorTotal)}
                  </span>
                )}
                {activePack?.descuento && (
                  <span style={{ background: "var(--gold)", color: "var(--on-gold)", fontSize: 11, fontWeight: 800, padding: "3px 8px", borderRadius: 4 }}>
                    {activePack.descuento}
                  </span>
                )}
              </div>

              <p style={{ fontSize: 14, color: "var(--text-2)", marginBottom: 20, lineHeight: 1.5 }}>
                {producto.descripcion}
              </p>

              {/* Selector de packs, estilo variante de marketplace */}
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10 }}>
                  Cantidad: <span style={{ fontWeight: 400, color: "var(--text-2)" }}>{activePack?.titulo}</span>
                </div>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "flex-end" }}>
                  {packs.map((pack) => {
                    const isSelected = packSeleccionado === pack.id;
                    return (
                      <div key={pack.id} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                        {pack.destacado && (
                          <span style={{ background: "var(--red)", color: "#fff", fontSize: 8, fontWeight: 800, padding: "2px 5px", borderRadius: 4, whiteSpace: "nowrap" }}>
                            MÁS VENDIDO
                          </span>
                        )}
                        <button
                          className="pack-chip"
                          onClick={() => setPackSeleccionado(pack.id)}
                          style={{ border: `2px solid ${isSelected ? "var(--text)" : "var(--border)"}`, background: isSelected ? "var(--bg-2)" : "transparent", color: "var(--text)" }}
                        >
                          {pack.cantidad}
                        </button>
                      </div>
                    );
                  })}
                </div>

                {activePack && (
                  <div style={{ marginTop: 12, padding: 12, background: "var(--bg-2)", border: "1px solid var(--border)", borderRadius: 8 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: 13, fontWeight: 700 }}>{activePack.titulo}</span>
                      <span style={{ background: activePack.destacado ? "var(--red)" : "var(--bg-3)", color: activePack.destacado ? "#fff" : "var(--text)", fontSize: 10, fontWeight: 800, padding: "2px 6px", borderRadius: 4 }}>
                        {activePack.descuento}
                      </span>
                    </div>
                    {activePack.regalos && activePack.regalos.length > 0 && (
                      <div style={{ marginTop: 6 }}>
                        {activePack.regalos.map((r, i) => (
                          <p key={i} style={{ fontSize: 12, color: "var(--green)", fontWeight: 600 }}>{r}</p>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 8, height: 8, background: "var(--green)", borderRadius: "50%", animation: "blink 1.4s ease infinite" }} />
                <span style={{ fontSize: 13, fontWeight: 700, color: "var(--green)" }}>En Stock · Listo para Enviar</span>
              </div>
            </div>

            {/* Columna 3: caja de compra, estilo marketplace */}
            <div className="buybox-col" style={{ border: "1px solid var(--border)", borderRadius: 12, padding: 20, position: "sticky", top: 90, background: "var(--bg)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                <div style={{ width: 8, height: 8, background: "var(--green)", borderRadius: "50%", flexShrink: 0 }} />
                <span style={{ fontSize: 13, fontWeight: 700, color: "var(--green)" }}>Stock disponible</span>
              </div>

              <button onClick={handleComprar} className="buybox-btn-primary" style={{ marginBottom: 10 }}>
                Comprar ahora
              </button>
              <button onClick={handleAgregar} className="buybox-btn-secondary" style={{ marginBottom: 18 }}>
                Agregar al carrito
              </button>

              <div style={{ display: "flex", flexDirection: "column", gap: 10, paddingTop: 16, borderTop: "1px solid var(--border)", fontSize: 13, color: "var(--text-2)" }}>
                {(activePack?.envioGratis || producto.envioGratis) && (
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span>🚚</span><span>Envío gratis</span>
                  </div>
                )}
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span>🛡️</span><span>Garantía de 6 meses contra defectos de fábrica</span>
                </div>
                <a href="/devoluciones" style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--text-2)", textDecoration: "none" }}>
                  <span>↩️</span><span style={{ textDecoration: "underline" }}>Devolución gratis · 30 días</span>
                </a>
              </div>

              <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid var(--border)", fontSize: 12, color: "var(--text-3)" }}>
                Vendido y enviado por <strong style={{ color: "var(--text)" }}>TiendaTuc</strong>
              </div>
            </div>
          </div>
        </div>

        {/* SECCIÓN CARACTERÍSTICAS / FEATURES (DINÁMICA O FALLBACK) */}
        {producto.features && producto.features.length > 0 && (
          <div style={{ maxWidth: 1100, margin: "60px auto 0", padding: "0 16px" }}>
            <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 24, textAlign: "center" }}>Características Principales</h2>
            {producto.features.map((feat: any, idx: number) => (
              <div key={idx} className={`feat-block ${idx % 2 !== 0 ? "rev" : ""}`}>
                <div className="feat-media">
                  {feat.video ? (
                    <video src={feat.video} autoPlay loop muted playsInline />
                  ) : (
                    <img src={feat.imagen || imagenes[0]} alt={feat.titulo || ""} />
                  )}
                </div>
                <div className="feat-copy">
                  <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 10 }}>{feat.titulo}</h3>
                  <p style={{ fontSize: 14, color: "var(--text-2)", lineHeight: 1.6 }}>{feat.descripcion}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* SECCIÓN ESPECIFICACIONES TÉCNICAS */}
        {producto.specs && producto.specs.length > 0 && (
          <div style={{ maxWidth: 800, margin: "60px auto 0", padding: "0 16px" }}>
            <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 20, textAlign: "center" }}>Especificaciones Técnicas</h2>
            <div style={{ border: "1px solid var(--border)", borderRadius: 12, overflow: "hidden" }}>
              {producto.specs.map(([label, val], idx) => (
                <div key={idx} style={{ display: "flex", justifyContent: "space-between", padding: "12px 20px", background: idx % 2 === 0 ? "var(--bg-2)" : "transparent", borderBottom: "1px solid var(--border)", fontSize: 14 }}>
                  <span style={{ fontWeight: 600, color: "var(--text-2)" }}>{label}</span>
                  <span style={{ fontWeight: 700 }}>{val}</span>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </>
  );
}