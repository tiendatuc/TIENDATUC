"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { supabase } from "../../lib/supabase";

export default function ProductoPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const [producto, setProducto] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [imgActiva, setImgActiva] = useState(0);
  const [packSeleccionado, setPackSeleccionado] = useState(0);
  const [emailSub, setEmailSub] = useState("");
  const [subOk, setSubOk] = useState(false);

  useEffect(() => {
    if (slug) cargarProducto();
  }, [slug]);

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
  };

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: "#0a0a0a", display: "flex", alignItems: "center", justifyContent: "center", color: "#e8e4e0" }}>
        Cargando producto...
      </div>
    );
  }

  if (!producto) {
    return (
      <div style={{ minHeight: "100vh", background: "#0a0a0a", display: "flex", alignItems: "center", justifyContent: "center", color: "#e8e4e0" }}>
        Producto no encontrado.
      </div>
    );
  }

  const packs = producto.packs && producto.packs.length > 0 ? producto.packs : [
    { cantidad: 1, precio: producto.precio || "$39.900", descuento: "20%" },
    { cantidad: 2, precio: "$69.900", descuento: "30%", popular: true }
  ];

  const packActual = packs[packSeleccionado] || packs[0];

  return (
    <div style={{ background: "#0a0a0a", color: "#e8e4e0", minHeight: "100vh", fontFamily: "sans-serif" }}>
      
      {/* HEADER TOPBAR INFO */}
      <div style={{ background: "#d4845a", color: "#000", fontSize: 11, fontWeight: 700, textAlign: "center", padding: "6px 0", letterSpacing: "0.05em" }}>
        ENVÍO GRATIS A TODO EL PAÍS · 3 Y 6 CUOTAS SIN INTERÉS · GARANTÍA DE SATISFACCIÓN
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "30px 20px" }}>
        
        {/* SECCIÓN PRINCIPAL DE PRODUCTO */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 40, marginBottom: 60 }}>
          
          {/* GALERÍA DE IMÁGENES */}
          <div>
            <div style={{ aspectRatio: "1", background: "#141414", borderRadius: 14, overflow: "hidden", marginBottom: 12, border: "1px solid rgba(232,228,224,0.1)" }}>
              {producto.imagenes?.[imgActiva] && (
                <img src={producto.imagenes[imgActiva]} alt={producto.nombre} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              )}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 8 }}>
              {producto.imagenes?.map((img: string, idx: number) => (
                <div 
                  key={idx} 
                  onClick={() => setImgActiva(idx)}
                  style={{ aspectRatio: "1", borderRadius: 8, overflow: "hidden", border: imgActiva === idx ? "2px solid #d4845a" : "1px solid rgba(232,228,224,0.1)", cursor: "pointer" }}
                >
                  <img src={img} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
              ))}
            </div>
          </div>

          {/* COMPRA Y PACKS */}
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 12, color: "#4caf8a", fontWeight: 700, marginBottom: 6 }}>
              ★ 4.86 / 5.0 (120 Reseñas Verificadas)
            </div>
            <h1 style={{ fontSize: 26, fontWeight: 800, color: "#fff", marginBottom: 10, lineHeight: 1.2 }}>
              {producto.nombre}
            </h1>

            {/* PRECIO DINÁMICO SEGÚN PACK */}
            <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 16 }}>
              <span style={{ fontSize: 32, fontWeight: 900, color: "#fff" }}>{packActual.precio}</span>
              {producto.precio_anterior && (
                <span style={{ fontSize: 18, color: "rgba(232,228,224,0.4)", textDecoration: "line-through" }}>{producto.precio_anterior}</span>
              )}
              <span style={{ background: "rgba(212,132,90,0.2)", color: "#d4845a", fontSize: 11, fontWeight: 800, padding: "3px 8px", borderRadius: 4 }}>
                AHORRÁ {packActual.descuento}
              </span>
            </div>

            <p style={{ fontSize: 13, color: "rgba(232,228,224,0.7)", lineHeight: 1.5, marginBottom: 20 }}>
              {producto.descripcion}
            </p>

            {/* SELECTOR DE PACKS */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
              {packs.map((pk: any, idx: number) => (
                <div 
                  key={idx} 
                  onClick={() => setPackSeleccionado(idx)}
                  style={{ 
                    background: packSeleccionado === idx ? "rgba(212,132,90,0.08)" : "#141414", 
                    border: packSeleccionado === idx ? "2px solid #d4845a" : "1px solid rgba(232,228,224,0.12)", 
                    borderRadius: 10, 
                    padding: "12px 16px", 
                    cursor: "pointer",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center"
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <input type="radio" checked={packSeleccionado === idx} onChange={() => {}} />
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>{pk.cantidad} Pack</div>
                      {pk.popular && <span style={{ fontSize: 9, background: "#d4845a", color: "#000", fontWeight: 800, padding: "2px 6px", borderRadius: 3 }}>MÁS VENDIDO</span>}
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 16, fontWeight: 800, color: "#fff" }}>{pk.precio}</div>
                    <div style={{ fontSize: 10, color: "#d4845a", fontWeight: 700 }}>Ahorrás {pk.descuento}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* BOTONES DE ACCIÓN */}
            <button style={{ width: "100%", background: "#d4845a", color: "#000", border: "none", borderRadius: 8, padding: "16px", fontSize: 14, fontWeight: 800, cursor: "pointer", marginBottom: 10 }}>
              AGREGAR AL CARRITO
            </button>
            <button style={{ width: "100%", background: "#ffffff", color: "#000", border: "none", borderRadius: 8, padding: "16px", fontSize: 14, fontWeight: 800, cursor: "pointer", marginBottom: 20 }}>
              COMPRAR AHORA
            </button>

            {/* MÉTODOS DE PAGO Y GARANTÍAS */}
            <div style={{ borderTop: "1px solid rgba(232,228,224,0.1)", paddingTop: 16, textAlign: "center" }}>
              <div style={{ fontSize: 11, color: "rgba(232,228,224,0.5)", marginBottom: 8, fontWeight: 600 }}>PAGOS SEGUROS PROCESADOS CON MERCADO PAGO</div>
              <div style={{ display: "flex", justifyContent: "center", gap: 12, opacity: 0.7, flexWrap: "wrap", fontSize: 12 }}>
                <span>💳 Visa</span>
                <span>💳 Mastercard</span>
                <span>💳 AMEX</span>
                <span>💵 Efectivo / Rapipago</span>
              </div>
            </div>

          </div>
        </div>

        {/* SECCIÓN DE CARACTERÍSTICAS / VIDEOS MULTIMEDIA */}
        {producto.features && producto.features.length > 0 && (
          <div style={{ borderTop: "1px solid rgba(232,228,224,0.1)", paddingTop: 50, marginBottom: 60 }}>
            <h2 style={{ fontSize: 22, fontWeight: 800, textAlign: "center", marginBottom: 40 }}>
              Demostración y Detalles
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 40 }}>
              {producto.features.map((f: any, idx: number) => (
                <div key={idx} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 24, alignItems: "center", background: "#141414", padding: 24, borderRadius: 14, border: "1px solid rgba(232,228,224,0.08)" }}>
                  
                  {/* MEDIA (VIDEO/IMAGEN) */}
                  <div style={{ borderRadius: 10, overflow: "hidden", background: "#000", display: "flex", justifyContent: "center", alignItems: "center", maxHeight: 400 }}>
                    {f.tipo === "video" || f.video ? (
                      <video 
                        src={f.archivo || f.video} 
                        autoPlay loop muted playsInline 
                        style={{ width: "100%", maxHeight: 400, objectFit: "contain" }} 
                      />
                    ) : (
                      <img src={f.archivo || f.imagen} alt="" style={{ width: "100%", maxHeight: 400, objectFit: "contain" }} />
                    )}
                  </div>

                  {/* DESCRIPCIÓN */}
                  <div>
                    <h3 style={{ fontSize: 20, fontWeight: 800, color: "#fff", marginBottom: 12 }}>{f.titulo}</h3>
                    <p style={{ fontSize: 14, color: "rgba(232,228,224,0.7)", lineHeight: 1.6 }}>{f.desc}</p>
                  </div>

                </div>
              ))}
            </div>
          </div>
        )}

        {/* BLOQUE "NUESTRA MISIÓN" */}
        <div style={{ background: "#141414", borderRadius: 16, padding: "40px 24px", textAlign: "center", border: "1px solid rgba(232,228,224,0.08)", marginBottom: 60 }}>
          <span style={{ fontSize: 11, fontWeight: 800, color: "#d4845a", letterSpacing: "0.1em", textTransform: "uppercase" }}>Nuestra Misión</span>
          <h2 style={{ fontSize: 24, fontWeight: 800, margin: "10px 0 16px" }}>Tu tiempo y tu energía, donde importan.</h2>
          <p style={{ maxWidth: 600, margin: "0 auto", fontSize: 14, color: "rgba(232,228,224,0.6)", lineHeight: 1.6 }}>
            Buscamos brindarte herramientas útiles y funcionales para simplificar tu día a día con productos probados y de máxima calidad.
          </p>
        </div>

        {/* SECCIÓN NEWSLETTER */}
        <div style={{ borderTop: "1px solid rgba(232,228,224,0.1)", paddingTop: 40, textAlign: "center" }}>
          <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 8 }}>Únete a la comunidad TiendaTuc</h3>
          <p style={{ fontSize: 13, color: "rgba(232,228,224,0.5)", marginBottom: 20 }}>Suscríbete para recibir ofertas exclusivas y lanzamientos antes que nadie.</p>
          
          {subOk ? (
            <div style={{ color: "#4caf8a", fontWeight: 700, fontSize: 14 }}>¡Gracias por suscribirte!</div>
          ) : (
            <form onSubmit={(e) => { e.preventDefault(); if (emailSub) setSubOk(true); }} style={{ display: "flex", justifyContent: "center", gap: 8, maxWidth: 400, margin: "0 auto" }}>
              <input 
                type="email" 
                placeholder="Tu correo electrónico" 
                value={emailSub} 
                onChange={(e) => setEmailSub(e.target.value)} 
                required 
                style={{ flex: 1, background: "rgba(232,228,224,0.05)", border: "1px solid rgba(232,228,224,0.15)", borderRadius: 6, padding: "10px 14px", color: "#fff", outline: "none", fontSize: 13 }}
              />
              <button type="submit" style={{ background: "#d4845a", color: "#000", border: "none", borderRadius: 6, padding: "10px 18px", fontWeight: 800, cursor: "pointer", fontSize: 13 }}>
                Suscribirme
              </button>
            </form>
          )}
        </div>

      </div>
    </div>
  );
}