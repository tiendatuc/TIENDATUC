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
      <div style={{ padding: "80px 20px", textAlign: "center", color: "#fff", background: "var(--bg)", minHeight: "60vh" }}>
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
        .gallery-main{width:100%;aspect-ratio:1/1;background:var(--bg-2);border:1px solid var(--border);border-radius:12px;overflow:hidden;display:flex;align-items:center;justify-content:center;margin-bottom:10px;}
        .gallery-main img{width:100%;height:100%;object-fit:cover;}
        .thumbs{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;}
        .thumb{aspect-ratio:1/1;background:var(--bg-2);border-radius:8px;overflow:hidden;cursor:pointer;transition:border-color .15s;}
        .thumb img{width:100%;height:100%;object-fit:contain;padding:4px;}
        .feat-block{display:grid;grid-template-columns:1fr 1fr;border:1px solid var(--border);border-radius:16px;overflow:hidden;margin-bottom:24px;background:var(--bg-2);}
        .feat-block.rev{direction:rtl;}
        .feat-block.rev > *{direction:ltr;}
        .feat-media{aspect-ratio:16/9;overflow:hidden;background:var(--bg);}
        .feat-media img, .feat-media video{width:100%;height:100%;object-fit:cover;display:block;}
        .feat-copy{padding:32px 28px;display:flex;flex-direction:column;justify-content:center;}
        @media(max-width:640px){
          .hero-grid{grid-template-columns:1fr!important;gap:0!important;overflow:hidden!important;}
          .gallery-wrap{padding:0 12px;width:100%;box-sizing:border-box;}
          .info-col{padding-top:20px!important;width:100%!important;box-sizing:border-box!important;}
          .feat-block{grid-template-columns:1fr!important;}
        }
      `}</style>

      {toast && (
        <div style={{ position: "fixed", top: 72, left: "50%", zIndex: 9999, background: "var(--bg-2)", border: "1px solid rgba(76,175,138,0.3)", borderRadius: 12, padding: "14px 22px", display: "flex", alignItems: "center", justifyContent: "center", gap: 12, boxShadow: "0 12px 40px rgba(0,0,0,0.6)", animation: "slideDown 2.2s ease forwards", whiteSpace: "nowrap", pointerEvents: "none" }}>
          <div style={{ width: 30, height: 30, borderRadius: "50%", background: "var(--green)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, color: "#0f0f0f", flexShrink: 0, fontSize: 14 }}>✓</div>
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

        {/* SECCIÓN HERO (FOTOS Y COMPRA) */}
        <div className="section-wrap" style={{ maxWidth: 1100, margin: "0 auto", padding: "0 16px" }}>
          <div className="hero-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 40, alignItems: "start" }}>
            
            <div className="gallery-wrap">
              <div className="gallery-main">
                <img src={imagenes[imgActiva]} alt={producto.nombre} />
              </div>
              <div className="thumbs">
                {imagenes.map((img, i) => (
                  <div key={i} className="thumb" onClick={() => setImgActiva(i)} style={{ border: `2px solid ${i === imgActiva ? "var(--copper)" : "var(--border)"}` }}>
                    <img src={img} alt="" />
                  </div>
                ))}
              </div>
            </div>

            <div className="info-col" style={{ display: "flex", flexDirection: "column" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8, color: "#00b67a", fontSize: 13, fontWeight: 600 }}>
                <span>★★★★★</span>
                <span style={{ color: "var(--text-2)" }}>
                  <strong>{producto.rating || 4.86}</strong> | {producto.totalResenas || 120} Reseñas Verificadas
                </span>
              </div>

              <h1 style={{ fontSize: "clamp(22px, 4vw, 30px)", fontWeight: 800, marginBottom: 12, lineHeight: 1.2 }}>
                {producto.nombre}
              </h1>

              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                <span style={{ fontSize: "clamp(26px, 6vw, 34px)", fontWeight: 800, color: "var(--text)" }}>
                  {formatARS(precioFinalCalculado)}
                </span>
                {activePack?.precioAnteriorTotal && (
                  <span style={{ fontSize: 18, color: "#777", textDecoration: "line-through" }}>
                    {formatARS(activePack.precioAnteriorTotal)}
                  </span>
                )}
                {activePack?.descuento && (
                  <span style={{ background: "#000", color: "#fff", fontSize: 11, fontWeight: 800, padding: "3px 8px", borderRadius: 4 }}>
                    {activePack.descuento}
                  </span>
                )}
              </div>

              <p style={{ fontSize: 14, color: "var(--text-2)", marginBottom: 14, lineHeight: 1.5 }}>
                {producto.descripcion}
              </p>

              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                <div style={{ width: 8, height: 8, background: "#10b981", borderRadius: "50%", animation: "blink 1.4s ease infinite" }} />
                <span style={{ fontSize: 13, fontWeight: 700, color: "#10b981" }}>En Stock · Listo para Enviar</span>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 16 }}>
                {packs.map((pack) => {
                  const isSelected = packSeleccionado === pack.id;
                  return (
                    <div
                      key={pack.id}
                      onClick={() => setPackSeleccionado(pack.id)}
                      style={{
                        border: `2px solid ${isSelected ? "var(--text)" : "var(--border)"}`,
                        borderRadius: 12,
                        padding: 14,
                        background: isSelected ? "var(--bg-2)" : "transparent",
                        cursor: "pointer",
                        transition: "all 0.2s ease",
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                          <input
                            type="radio"
                            name="pack"
                            checked={isSelected}
                            onChange={() => setPackSeleccionado(pack.id)}
                            style={{ marginTop: 3, accentColor: "#000" }}
                          />
                          <div>
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                              <span style={{ fontWeight: 800, fontSize: 15 }}>{pack.titulo}</span>
                              <span style={{ background: pack.destacado ? "#ef4444" : "#e5e5e5", color: pack.destacado ? "#fff" : "#111", fontSize: 10, fontWeight: 800, padding: "2px 6px", borderRadius: 4 }}>
                                {pack.descuento}
                              </span>
                            </div>
                            {pack.envioGratis && <p style={{ fontSize: 12, color: "var(--text-3)", marginTop: 2 }}>Incluye ENVÍO GRATIS</p>}
                          </div>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <span style={{ fontWeight: 800, fontSize: 15, display: "block" }}>{formatARS(pack.precioTotal)}</span>
                          <span style={{ fontSize: 12, color: "#888", textDecoration: "line-through" }}>{formatARS(pack.precioAnteriorTotal)}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <button
                onClick={handleComprar}
                style={{ width: "100%", background: "#000", color: "#fff", border: "none", borderRadius: 8, padding: "18px", fontSize: 14, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", cursor: "pointer", marginBottom: 12 }}
              >
                AGREGAR AL CARRITO
              </button>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, textAlign: "center", paddingTop: 14, borderTop: "1px solid var(--border)", fontSize: 12, fontWeight: 600, color: "var(--text-2)" }}>
                <div>🚚 Envío Gratis</div>
                <div>🛡️ Garantía Oficial</div>
                <div>⚙️ Soporte Directo</div>
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