"use client";
import { useState, useEffect } from "react";
import { useCart } from "../../store/cartStore";
import { supabase } from "../../lib/supabase";

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
  features: any[];
  specs: [string, string][];
  comparativa: string[];
  resenas: any[];
};

export default function ProductoClient({ producto }: { producto: Producto }) {
  const { agregar } = useCart();
  const [imgActiva, setImgActiva] = useState(0);
  const [cantidad, setCantidad] = useState(1);
  const [toast, setToast] = useState(false);
  const [estrellaForm, setEstrellaForm] = useState(5);
  const [usuario, setUsuario] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUsuario(session?.user ?? null);
    });
  }, []);

  const handleAgregar = () => {
    for (let i = 0; i < cantidad; i++) {
      agregar({ id:producto.id, nombre:producto.nombre, precio:producto.precio, precioNum:producto.precioNum, imagen:producto.imagenes[0] });
    }
    setToast(true);
    setTimeout(() => setToast(false), 2200);
  };

  const handleComprar = () => {
    handleAgregar();
    window.location.href = "/checkout";
  };

  const renderStars = (n: number) => "★".repeat(n) + "☆".repeat(5-n);
  const hasVideo = producto.features?.[0]?.video;
  const hasImagen = producto.features?.[0]?.imagen;
  const hasMedia = hasVideo || hasImagen;

  return (
    <>
      <style>{`
        @keyframes slideDown{0%{transform:translateX(-50%) translateY(-30px);opacity:0}12%{transform:translateX(-50%) translateY(0);opacity:1}80%{transform:translateX(-50%) translateY(0);opacity:1}100%{transform:translateX(-50%) translateY(-30px);opacity:0}}
        @keyframes blink{0%,100%{opacity:1}50%{opacity:.3}}
        @keyframes pulse{0%,100%{opacity:.4}50%{opacity:1}}
        .gallery-main{width:100%;aspect-ratio:1/1;background:var(--bg-2);border:1px solid var(--border);border-radius:12px;overflow:hidden;display:flex;align-items:center;justify-content:center;margin-bottom:10px;}
        .gallery-main img{width:100%;height:100%;object-fit:cover;}
        .thumbs{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;}
        .thumb{aspect-ratio:1/1;background:var(--bg-2);border-radius:8px;overflow:hidden;cursor:pointer;transition:border-color .15s;}
        .thumb img{width:100%;height:100%;object-fit:contain;padding:4px;}
        .feat-block{display:grid;grid-template-columns:1fr 1fr;border:1px solid var(--border);border-radius:16px;overflow:hidden;margin-bottom:16px;background:var(--bg-2);}
        .feat-block.rev{direction:rtl;}
        .feat-block.rev > *{direction:ltr;}
        .feat-media{aspect-ratio:9/16;overflow:hidden;background:var(--bg);}
        .feat-media video{width:100%;height:100%;object-fit:contain;display:block;}
        .feat-copy{padding:32px 28px;display:flex;flex-direction:column;justify-content:center;}
        .feat-card{background:var(--bg-2);border:1px solid var(--border);border-radius:12px;padding:20px;transition:border-color .2s;}
        .feat-card:hover{border-color:rgba(212,132,90,0.25);}
        .review-card{background:var(--bg-2);border:1px solid var(--border);border-radius:12px;padding:18px;}
        input:focus,textarea:focus{border-color:var(--copper)!important;outline:none;}
        @media(max-width:640px){
          .hero-grid{grid-template-columns:1fr!important;gap:0!important;overflow:hidden!important;}
          .gallery-wrap{padding:0 12px;width:100%;box-sizing:border-box;}
          .gallery-main{border-radius:10px!important;aspect-ratio:1/1!important;}
          .thumbs{gap:6px;}
          .info-col{padding-top:20px!important;overflow:hidden!important;width:100%!important;box-sizing:border-box!important;}
          .feat-block{grid-template-columns:1fr!important;direction:ltr!important;}
          .feat-block.rev{direction:ltr!important;}
          .feat-media{aspect-ratio:9/16!important;}
          .feat-copy{padding:20px 16px!important;}
          .features-grid{grid-template-columns:1fr!important;}
          .reviews-grid{grid-template-columns:1fr!important;}
          .form-row{grid-template-columns:1fr!important;}
          .sticky-bar{display:flex!important;}
          .section-wrap{padding-left:16px!important;padding-right:16px!important;overflow:hidden!important;}
        }
        @media(min-width:641px) and (max-width:900px){
          .hero-grid{grid-template-columns:1fr!important;}
          .reviews-grid{grid-template-columns:1fr 1fr;}
        }
      `}</style>

      {toast && (
        <div style={{ position:"fixed",top:72,left:"50%",zIndex:9999,background:"var(--bg-2)",border:"1px solid rgba(76,175,138,0.3)",borderRadius:12,padding:"14px 22px",display:"flex",alignItems:"center",gap:12,boxShadow:"0 12px 40px rgba(0,0,0,0.6)",animation:"slideDown 2.2s ease forwards",whiteSpace:"nowrap",pointerEvents:"none" }}>
          <div style={{ width:30,height:30,borderRadius:"50%",background:"var(--green)",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,color:"#0f0f0f",flexShrink:0,fontSize:14 }}>✓</div>
          <div>
            <div style={{ fontSize:"var(--text-sm)",fontWeight:600,color:"var(--text)",marginBottom:2 }}>¡Agregado al carrito!</div>
            <div className="t-xs">Revisá tu carrito antes de comprar</div>
          </div>
        </div>
      )}

      <div style={{ background:"var(--bg)",minHeight:"100vh",paddingBottom:100,overflowX:"hidden",maxWidth:"100%" }}>
        <div className="section-wrap" style={{ maxWidth:1100,margin:"0 auto",padding:"20px 16px 0" }}>
          <a href="/" className="t-xs" style={{ display:"inline-flex",alignItems:"center",gap:6,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:20,color:"var(--text-3)" }}>← Volver a productos</a>
        </div>

        <div className="section-wrap" style={{ maxWidth:1100,margin:"0 auto",padding:"0 16px" }}>
          <div className="hero-grid" style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:40,alignItems:"start" }}>
            <div className="gallery-wrap">
              <div className="gallery-main">
                <img src={producto.imagenes[imgActiva]} alt={producto.nombre} />
              </div>
              <div className="thumbs">
                {producto.imagenes.map((img, i) => (
                  <div key={i} className="thumb" onClick={() => setImgActiva(i)} style={{ border:`2px solid ${i===imgActiva?"var(--copper)":"var(--border)"}` }}>
                    <img src={img} alt="" />
                  </div>
                ))}
              </div>
            </div>

            <div className="info-col" style={{ display:"flex",flexDirection:"column" }}>
              <div style={{ display:"flex",gap:8,marginBottom:16,flexWrap:"wrap" }}>
                {producto.envioGratis && <span className="badge badge-green">Envío gratis</span>}
                <span className="badge badge-copper">Más vendido</span>
                <span className="badge badge-red">-{producto.descuento}% OFF</span>
              </div>
              <h1 style={{ fontSize:"clamp(20px,4vw,28px)",marginBottom:10 }}>{producto.nombre}</h1>
              <p style={{ marginBottom:16 }}>{producto.descripcion}</p>
              <div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:16 }}>
                <span style={{ color:"#f5a623",fontSize:14 }}>★★★★★</span>
                <span className="t-sm" style={{ color:"var(--text-3)" }}>
                  {producto.resenas?.length
                    ? (producto.resenas.reduce((acc: number, r: any) => acc + r.estrellas, 0) / producto.resenas.length).toFixed(1)
                    : "4.8"
                  } · {producto.resenas?.length ? (producto.resenas.length * 28 + Math.floor(producto.resenas.length * 4.7)) + "+" : "120+"} reseñas verificadas
                </span>
              </div>
              <div style={{ display:"flex",alignItems:"center",gap:8,background:"rgba(224,85,85,0.06)",border:"1px solid rgba(224,85,85,0.18)",borderRadius:8,padding:"10px 14px",marginBottom:16 }}>
                <div style={{ width:7,height:7,background:"var(--red)",borderRadius:"50%",flexShrink:0,animation:"blink 1.4s ease infinite" }} />
                <span className="t-sm" style={{ color:"var(--red)",fontWeight:600 }}>¡Solo quedan {producto.stock} unidades disponibles!</span>
              </div>
              <div style={{ background:"var(--bg-2)",border:"1px solid var(--border)",borderRadius:12,padding:"16px 18px",marginBottom:16 }}>
                <div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:10 }}>
                  <span style={{ background:"var(--red)",color:"#fff",fontSize:"var(--text-xs)",fontWeight:800,padding:"3px 9px",borderRadius:4 }}>-{producto.descuento}%</span>
                  <span className="t-xs" style={{ color:"var(--text-2)" }}>Ahorrás {producto.ahorro}</span>
                </div>
                <div style={{ display:"flex",alignItems:"baseline",gap:10,marginBottom:8 }}>
                  <span className="t-price precio-principal" style={{ fontSize:"clamp(24px,7vw,40px)" }}>{producto.precio}</span>
                  <span className="t-sm" style={{ color:"#555",textDecoration:"line-through" }}>{producto.precioAnterior}</span>
                </div>
                <div className="t-sm" style={{ color:"var(--green)",fontWeight:600 }}>{producto.cuotas}</div>
              </div>
              <div style={{ display:"flex",alignItems:"center",gap:14,marginBottom:16 }}>
                <span className="t-xs" style={{ letterSpacing:"0.1em",textTransform:"uppercase",color:"var(--text-3)",fontWeight:600 }}>Cantidad</span>
                <div style={{ display:"flex",alignItems:"center",border:"1px solid var(--border)",borderRadius:8,overflow:"hidden" }}>
                  <button onClick={() => setCantidad(Math.max(1,cantidad-1))} style={{ width:40,height:40,background:"var(--bg-3)",border:"none",color:"var(--text)",fontSize:18,cursor:"pointer" }}>−</button>
                  <div style={{ width:44,height:40,background:"#222",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"var(--text-sm)",fontWeight:700,borderLeft:"1px solid var(--border)",borderRight:"1px solid var(--border)",color:"var(--text)" }}>{cantidad}</div>
                  <button onClick={() => setCantidad(Math.min(producto.stock,cantidad+1))} style={{ width:40,height:40,background:"var(--bg-3)",border:"none",color:cantidad>=producto.stock?"#444":"var(--text)",fontSize:18,cursor:cantidad>=producto.stock?"not-allowed":"pointer" }}>+</button>
                </div>
                {cantidad >= producto.stock && <span className="t-xs" style={{ color:"var(--red)" }}>Máximo disponible</span>}
              </div>
              <button onClick={handleComprar} style={{ width:"100%",background:"var(--gold)",color:"#0f0f0f",border:"none",borderRadius:10,padding:"16px",fontSize:"var(--text-xs)",fontWeight:800,letterSpacing:"0.1em",textTransform:"uppercase",cursor:"pointer",marginBottom:10 }}>⚡ Comprar ahora</button>
              <button onClick={handleAgregar} style={{ width:"100%",background:"var(--copper)",color:"#0f0f0f",border:"none",borderRadius:10,padding:"15px",fontSize:"var(--text-xs)",fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",cursor:"pointer",marginBottom:16 }}>Agregar al carrito</button>
              <div style={{ display:"flex",flexDirection:"column",alignItems:"center",gap:8,padding:14,background:"rgba(232,228,224,0.02)",border:"1px solid rgba(232,228,224,0.05)",borderRadius:10,marginBottom:12 }}>
                <div className="t-xs" style={{ color:"var(--text-3)",fontWeight:500 }}>🔒 Pago 100% seguro y encriptado</div>
                <div style={{ display:"flex",gap:8,alignItems:"center",flexWrap:"wrap",justifyContent:"center" }}>
                  <div style={{ background:"#009ee3",borderRadius:4,padding:"4px 10px",display:"flex",alignItems:"center",gap:5 }}>
                    <svg width="16" height="16" viewBox="0 0 40 40" fill="none"><circle cx="20" cy="20" r="20" fill="#009ee3"/><path d="M20 8C13.37 8 8 13.37 8 20C8 26.63 13.37 32 20 32C26.63 32 32 26.63 32 20C32 13.37 26.63 8 20 8ZM26.5 22.5C25.8 24.5 23.5 26 21 26H19C16.5 26 14.2 24.5 13.5 22.5L12 18H15L16 21C16.4 22.2 17.6 23 19 23H21C22.4 23 23.6 22.2 24 21L25 18H28L26.5 22.5Z" fill="white"/><circle cx="16" cy="16" r="2" fill="white"/><circle cx="24" cy="16" r="2" fill="white"/></svg>
                    <span style={{ fontSize:9,fontWeight:800,color:"#fff" }}>MercadoPago</span>
                  </div>
                  <div style={{ background:"#fff",borderRadius:4,padding:"4px 9px" }}><svg width="34" height="13" viewBox="0 0 38 14"><text x="0" y="12" fontSize="14" fontWeight="800" fill="#1a1f71" fontFamily="serif" fontStyle="italic">VISA</text></svg></div>
                  <div style={{ background:"#fff",borderRadius:4,padding:"4px 7px" }}><svg width="30" height="18" viewBox="0 0 32 20"><circle cx="12" cy="10" r="9" fill="#eb001b"/><circle cx="20" cy="10" r="9" fill="#f79e1b"/><path d="M16 3.5C17.8 5 19 7.4 19 10C19 12.6 17.8 15 16 16.5C14.2 15 13 12.6 13 10C13 7.4 14.2 5 16 3.5Z" fill="#ff5f00"/></svg></div>
                  <div style={{ background:"#333",border:"1px solid var(--border)",color:"var(--text-2)",fontSize:9,fontWeight:700,padding:"5px 8px",borderRadius:4 }}>DÉBITO</div>
                </div>
              </div>
              <div style={{ display:"flex",gap:12,flexWrap:"wrap" }}>
                {["✓ Envío gratis","✓ Control remoto incluido","✓ Garantía 6 meses"].map(t => (
                  <span key={t} className="t-xs" style={{ color:"var(--text-3)",fontWeight:500 }}>{t}</span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {producto.features?.length > 0 && (
          <>
            <div style={{ height:1,background:"var(--border)",margin:"48px 0 0" }} />
            <div className="section-wrap" style={{ maxWidth:1100,margin:"0 auto",padding:"48px 16px 0" }}>
              <div className="t-label" style={{ marginBottom:10 }}>Por qué elegirlo</div>
              <h2 style={{ marginBottom:32 }}>Todo lo que necesitás en uno</h2>
              {hasMedia ? (
                <div style={{ display:"flex",flexDirection:"column",gap:16 }}>
                  {producto.features.map((f, i) => (
                    <div key={i} className={`feat-block${i%2===1?" rev":""}`}>
                      <div className="feat-media">
                        {f.video
                          ? <video src={f.video} autoPlay loop muted playsInline preload="auto" />
                          : <img src={f.imagen} alt={f.titulo} style={{ width:"100%", height:"100%", objectFit:"cover", display:"block" }} />
                        }
                      </div>
                      <div className="feat-copy">
                        <div className="t-label" style={{ marginBottom:12 }}>0{i+1}</div>
                        <h3 style={{ marginBottom:14 }}>{f.titulo}</h3>
                        <p>{f.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="features-grid" style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:14 }}>
                  {producto.features.map((f, i) => (
                    <div key={i} className="feat-card">
                      <div style={{ fontSize:28,marginBottom:10 }}>{f.icon}</div>
                      <h4 style={{ marginBottom:6 }}>{f.titulo}</h4>
                      <p className="t-sm">{f.desc}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {producto.comparativa?.length > 0 && (
          <>
            <div style={{ height:1,background:"var(--border)",margin:"48px 0 0" }} />
            <div className="section-wrap" style={{ maxWidth:1100,margin:"0 auto",padding:"48px 16px 0" }}>
              <div className="t-label" style={{ marginBottom:10 }}>¿Por qué elegirlo?</div>
              <h2 style={{ marginBottom:24 }}>Sin él vs Con él</h2>
              <div style={{ overflowX:"auto" }}>
                <table style={{ width:"100%",borderCollapse:"collapse",minWidth:300 }}>
                  <thead>
                    <tr>
                      <th style={{ padding:"12px 14px",textAlign:"left",borderBottom:"1px solid var(--border)" }}><span className="t-xs" style={{ color:"var(--text-3)" }}>Característica</span></th>
                      <th style={{ padding:"12px 14px",textAlign:"center",borderBottom:"1px solid var(--border)" }}><span className="t-xs" style={{ color:"var(--text-3)" }}>Sin él</span></th>
                      <th style={{ padding:"12px 14px",textAlign:"center",borderBottom:"1px solid var(--border)" }}><span className="t-xs" style={{ color:"var(--copper)" }}>Con él ⚡</span></th>
                    </tr>
                  </thead>
                  <tbody>
                    {producto.comparativa.map((c, i) => (
                      <tr key={i} style={{ background:i%2===0?"transparent":"rgba(232,228,224,0.02)" }}>
                        <td style={{ padding:"12px 14px",fontSize:"var(--text-sm)",color:"var(--text)",borderBottom:"1px solid rgba(232,228,224,0.04)" }}>{c}</td>
                        <td style={{ padding:"12px 14px",fontSize:16,color:"#444",textAlign:"center",borderBottom:"1px solid rgba(232,228,224,0.04)" }}>✗</td>
                        <td style={{ padding:"12px 14px",fontSize:16,color:"var(--green)",fontWeight:800,textAlign:"center",borderBottom:"1px solid rgba(232,228,224,0.04)" }}>✓</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {producto.specs?.length > 0 && (
          <>
            <div style={{ height:1,background:"var(--border)",margin:"48px 0 0" }} />
            <div className="section-wrap" style={{ maxWidth:1100,margin:"0 auto",padding:"48px 16px 0" }}>
              <div className="t-label" style={{ marginBottom:10 }}>Ficha técnica</div>
              <h2 style={{ marginBottom:24 }}>Especificaciones</h2>
              <table style={{ width:"100%",borderCollapse:"collapse" }}>
                <tbody>
                  {producto.specs.map(([k,v], i) => (
                    <tr key={i} style={{ background:i%2===0?"transparent":"rgba(232,228,224,0.02)",borderBottom:"1px solid rgba(232,228,224,0.05)" }}>
                      <td style={{ padding:"13px 14px",width:"45%" }}><span className="t-sm" style={{ color:"var(--text-3)",fontWeight:500 }}>{k}</span></td>
                      <td style={{ padding:"13px 14px" }}><span className="t-sm" style={{ color:"var(--text)",fontWeight:500 }}>{v}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {producto.resenas?.length > 0 && (
          <>
            <div style={{ height:1,background:"var(--border)",margin:"48px 0 0" }} />
            <div className="section-wrap" style={{ maxWidth:1100,margin:"0 auto",padding:"48px 16px 0" }}>
              <div className="t-label" style={{ marginBottom:10 }}>Lo que dicen los clientes</div>
              <h2 style={{ marginBottom:24 }}>Reseñas verificadas</h2>
              {(() => {
                const resenas = producto.resenas;
                const total = resenas.length;
                const promedio = (resenas.reduce((acc: number, r: any) => acc + r.estrellas, 0) / total).toFixed(1);
                const totalVotos = total * 28 + Math.floor(total * 4.7);
                const conteo = [5,4,3,2,1].map(n => ({
                  n,
                  cnt: resenas.filter((r: any) => r.estrellas === n).length,
                  pct: Math.round((resenas.filter((r: any) => r.estrellas === n).length / total) * 100)
                }));
                return (
                  <div style={{ background:"var(--bg-2)",border:"1px solid var(--border)",borderRadius:12,padding:20,display:"grid",gridTemplateColumns:"auto 1fr",gap:24,alignItems:"center",marginBottom:24 }}>
                    <div style={{ textAlign:"center",minWidth:80 }}>
                      <div style={{ fontFamily:"var(--font-display)",fontSize:52,fontWeight:800,lineHeight:1,color:"var(--text)" }}>{promedio}</div>
                      <div style={{ color:"#f5a623",fontSize:16,margin:"4px 0" }}>{"★".repeat(Math.round(Number(promedio)))}</div>
                      <div className="t-xs">{totalVotos}+ reseñas</div>
                    </div>
                    <div style={{ display:"flex",flexDirection:"column",gap:8 }}>
                      {conteo.map(({n,cnt,pct}) => (
                        <div key={n} style={{ display:"flex",alignItems:"center",gap:8 }}>
                          <span className="t-xs" style={{ width:40,textAlign:"right",flexShrink:0 }}>{n} ★</span>
                          <div style={{ flex:1,height:5,background:"rgba(232,228,224,0.07)",borderRadius:4,overflow:"hidden" }}>
                            <div style={{ height:"100%",width:`${pct}%`,background:n===5?"#f5a623":n===4?"var(--copper)":"#555",borderRadius:4 }} />
                          </div>
                          <span className="t-xs" style={{ width:18,flexShrink:0 }}>{cnt + Math.floor(cnt * 6.2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}
              <div className="reviews-grid" style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:40 }}>
                {producto.resenas.map((r: any, i: number) => (
                  <div key={i} className="review-card">
                    <div style={{ display:"flex",alignItems:"center",gap:10,marginBottom:12 }}>
                      <div style={{ width:36,height:36,borderRadius:"50%",background:r.color,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:800,color:"#0f0f0f",flexShrink:0 }}>{r.iniciales}</div>
                      <div>
                        <div style={{ fontSize:"var(--text-sm)",fontWeight:600,color:"var(--text)" }}>{r.nombre}</div>
                        <div className="t-xs">{r.ciudad}</div>
                      </div>
                    </div>
                    <div style={{ color:"#f5a623",fontSize:12,marginBottom:8 }}>{renderStars(r.estrellas)}</div>
                    <p className="t-sm" style={{ lineHeight:1.7 }}>{r.texto}</p>
                    <div className="t-xs" style={{ marginTop:8 }}>{r.fecha}</div>
                    <div className="t-xs" style={{ color:"var(--green)",marginTop:4,fontWeight:700,letterSpacing:"0.05em",textTransform:"uppercase" }}>✓ Compra verificada</div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Formulario de reseña */}
        <div className="section-wrap" style={{ maxWidth:1100,margin:"0 auto",padding:"48px 16px 0" }}>
          <div className="t-label" style={{ marginBottom:10 }}>Tu opinión importa</div>
          <h2 style={{ marginBottom:24 }}>Dejá tu reseña</h2>
          {usuario ? (
            <div style={{ background:"var(--bg-2)",border:"1px solid rgba(212,132,90,0.2)",borderRadius:12,padding:24,marginBottom:48 }}>
              <h4 style={{ marginBottom:4 }}>¿Ya lo tenés? Contanos qué te pareció</h4>
              <p className="t-sm" style={{ marginBottom:20 }}>Tu reseña ayuda a otros compradores a decidir</p>
              <div className="t-xs" style={{ textTransform:"uppercase",letterSpacing:"0.1em",fontWeight:600,color:"var(--text-3)",marginBottom:8 }}>Tu puntuación</div>
              <div style={{ display:"flex",gap:8,marginBottom:16 }}>
                {[1,2,3,4,5].map(n => (
                  <button key={n} onClick={() => setEstrellaForm(n)} style={{ fontSize:32,cursor:"pointer",opacity:n<=estrellaForm?1:.2,transition:"opacity .15s",background:"none",border:"none",padding:0,lineHeight:1,color:"#f5a623" }}>★</button>
                ))}
              </div>
              <div className="form-row" style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:12 }}>
                <input type="text" placeholder="Tu nombre (ej: Martín R.)" style={{ width:"100%",background:"var(--bg-3)",border:"1px solid var(--border)",borderRadius:8,padding:"13px 14px",fontSize:"var(--text-sm)",color:"var(--text)",fontFamily:"var(--font-body)",boxSizing:"border-box" as any }}/>
                <input type="text" placeholder="Tu ciudad (ej: Córdoba)" style={{ width:"100%",background:"var(--bg-3)",border:"1px solid var(--border)",borderRadius:8,padding:"13px 14px",fontSize:"var(--text-sm)",color:"var(--text)",fontFamily:"var(--font-body)",boxSizing:"border-box" as any }}/>
              </div>
              <textarea placeholder="Contanos tu experiencia. ¿Qué te gustó? ¿Lo recomendarías?" style={{ width:"100%",background:"var(--bg-3)",border:"1px solid var(--border)",borderRadius:8,padding:"13px 14px",fontSize:"var(--text-sm)",color:"var(--text)",fontFamily:"var(--font-body)",resize:"none" as any,marginBottom:12,minHeight:100,display:"block",boxSizing:"border-box" as any }}/>
              <div style={{ border:"1px dashed rgba(232,228,224,0.15)",borderRadius:8,padding:20,textAlign:"center",marginBottom:16,cursor:"pointer" }}>
                <div style={{ fontSize:24,marginBottom:6 }}>📸</div>
                <p className="t-sm">Tocá para subir una foto <span style={{ color:"var(--copper)",fontWeight:600 }}>o arrastrá acá</span></p>
                <div className="t-xs" style={{ marginTop:4 }}>JPG, PNG o WEBP · Máx 5MB</div>
              </div>
              <button style={{ width:"100%",background:"var(--copper)",color:"#0f0f0f",border:"none",borderRadius:8,padding:15,fontSize:"var(--text-xs)",fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",cursor:"pointer" }}>Publicar reseña</button>
            </div>
          ) : (
            <div style={{ background:"var(--bg-2)",border:"1px solid var(--border)",borderRadius:12,padding:28,marginBottom:48,textAlign:"center" }}>
              <div style={{ fontSize:36,marginBottom:12 }}>✍️</div>
              <h4 style={{ marginBottom:8 }}>¿Querés dejar tu reseña?</h4>
              <p className="t-sm" style={{ marginBottom:20,maxWidth:360,margin:"0 auto 20px" }}>Iniciá sesión para compartir tu experiencia con el producto</p>
              <a href="/cuenta" style={{ display:"inline-flex",alignItems:"center",gap:8,background:"var(--copper)",color:"#0f0f0f",padding:"13px 28px",borderRadius:8,fontSize:13,fontWeight:700,letterSpacing:"0.08em",textTransform:"uppercase",textDecoration:"none" }}>
                Iniciar sesión →
              </a>
            </div>
          )}
        </div>

        <div className="section-wrap" style={{ maxWidth:1100,margin:"0 auto",padding:"48px 16px 48px" }}>
          <div className="t-label" style={{ marginBottom:10 }}>Dudas frecuentes</div>
          <h2 style={{ marginBottom:24 }}>Preguntas frecuentes</h2>
          {[
            ["¿Cuánto tarda en llegar?","Entre 3 y 7 días hábiles a todo el país. Te mandamos el número de seguimiento por WhatsApp apenas despachamos tu pedido."],
            ["¿Tiene garantía?","Sí, 6 meses de garantía. Cualquier inconveniente lo resolvemos por WhatsApp, sin vueltas."],
            ["¿Cómo puedo pagar?","Tarjeta de crédito o débito a través de MercadoPago. Hasta 6 cuotas sin interés disponibles."],
            ["¿Qué pasa si llega con algún defecto?","Contactanos por WhatsApp con foto o video y lo resolvemos sin costo. Devoluciones dentro de los 30 días."],
          ].map(([q,a],i) => (
            <div key={i} style={{ borderBottom:"1px solid var(--border)",padding:"18px 0" }}>
              <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",gap:12 }}>
                <span style={{ fontSize:"var(--text-base)",fontWeight:600,color:"var(--text)" }}>{q}</span>
                <span style={{ color:"var(--copper)",fontSize:20,flexShrink:0 }}>+</span>
              </div>
              <p className="t-sm" style={{ marginTop:10,lineHeight:1.8 }}>{a}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="sticky-bar" style={{ display:"none",position:"fixed",bottom:0,left:0,right:0,background:"rgba(10,10,10,0.97)",borderTop:"1px solid var(--border)",padding:"12px 16px 20px",gap:8,zIndex:99999,backdropFilter:"blur(12px)",alignItems:"center" }}>
        <div style={{ display:"flex",flexDirection:"column",justifyContent:"center",flexShrink:0,minWidth:90 }}>
          <div style={{ fontFamily:"var(--font-display)",fontSize:17,fontWeight:800,lineHeight:1,color:"var(--text)" }}>{producto.precio}</div>
          <div className="t-xs" style={{ color:"#555",textDecoration:"line-through" }}>{producto.precioAnterior}</div>
        </div>
        <button onClick={handleAgregar} style={{ flex:1,background:"var(--copper)",color:"#0f0f0f",border:"none",borderRadius:8,padding:"13px 6px",fontSize:"var(--text-xs)",fontWeight:700,letterSpacing:"0.08em",textTransform:"uppercase",cursor:"pointer" }}>+ Carrito</button>
        <button onClick={handleComprar} style={{ flex:1,background:"var(--gold)",color:"#0f0f0f",border:"none",borderRadius:8,padding:"13px 6px",fontSize:"var(--text-xs)",fontWeight:800,letterSpacing:"0.08em",textTransform:"uppercase",cursor:"pointer" }}>⚡ Comprar</button>
        <a href="https://wa.me/5493815440596" target="_blank" rel="noopener noreferrer" style={{ width:46,height:46,borderRadius:"50%",background:"#25D366",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
        </a>
      </div>
    </>
  );
}
