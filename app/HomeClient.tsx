"use client";
import { useCart } from "./store/cartStore";
import { useState } from "react";

type Producto = {
  id: number;
  slug: string;
  nombre: string;
  descripcion: string;
  precio: string;
  precioNum: number;
  cuotas: string;
  envioGratis: boolean;
  imagen: string;
};

export default function HomeClient({ hero, productos }: { hero: Producto; productos: Producto[] }) {
  const { agregar } = useCart();
  const [toast, setToast] = useState(false);

  const handleAgregar = (p: Producto, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    agregar({ id: p.id, nombre: p.nombre, precio: p.precio, precioNum: p.precioNum, imagen: p.imagen });
    setToast(true);
    setTimeout(() => setToast(false), 2200);
  };

  return (
    <>
      <style>{`
        @keyframes marquee { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }
        @keyframes slideDown {
          0%{transform:translateX(-50%) translateY(-30px);opacity:0}
          12%{transform:translateX(-50%) translateY(0);opacity:1}
          80%{transform:translateX(-50%) translateY(0);opacity:1}
          100%{transform:translateX(-50%) translateY(-30px);opacity:0}
        }
        @keyframes fadeUp {
          from{opacity:0;transform:translateY(24px)}
          to{opacity:1;transform:translateY(0)}
        }
        .hero-video-desktop { display: block; }
        .hero-video-mobile  { display: none; }
        @media (max-width: 640px) {
          .hero-video-desktop { display: none; }
          .hero-video-mobile  { display: block; }
        }
        .hero-wrap {
          position: relative; width: 100%;
          height: calc(100svh - 36px); min-height: 560px;
          overflow: hidden; display: flex;
        }
        .hero-video {
          position: absolute; inset: 0;
          width: 100%; height: 100%;
          object-fit: cover; object-position: center center;
        }
        .hero-overlay {
          position: absolute; inset: 0;
          background: linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.45) 40%, rgba(0,0,0,0.7) 75%, rgba(0,0,0,0.92) 100%);
        }
        .hero-content {
          position: relative; z-index: 10; flex: 1;
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          text-align: center; padding: 60px 24px 80px;
        }
        .hero-eyebrow { font-family: var(--font-body); font-size: 11px; font-weight: 700; letter-spacing: 0.2em; text-transform: uppercase; color: rgba(255,255,255,0.7); margin-bottom: 16px; animation: fadeUp 0.8s ease 0.2s both; }
        .hero-title { font-family: var(--font-display); font-size: clamp(38px, 7vw, 80px); font-weight: 800; line-height: 1.0; letter-spacing: -0.03em; color: #fff; margin-bottom: 20px; animation: fadeUp 0.8s ease 0.35s both; max-width: 800px; }
        .hero-sub { font-family: var(--font-body); font-size: clamp(14px, 2vw, 17px); font-weight: 300; color: rgba(255,255,255,0.65); line-height: 1.7; margin-bottom: 36px; max-width: 520px; animation: fadeUp 0.8s ease 0.5s both; }
        .hero-ctas { display: flex; gap: 12px; animation: fadeUp 0.8s ease 0.65s both; flex-wrap: wrap; justify-content: center; }
        .cta-primary { display: inline-flex; align-items: center; justify-content: center; background: #fff; color: #0f0f0f; font-family: var(--font-body); font-size: 12px; font-weight: 800; letter-spacing: 0.1em; text-transform: uppercase; padding: 16px 36px; border-radius: 4px; text-decoration: none; transition: opacity 0.2s; }
        .cta-primary:hover { opacity: 0.9; }
        .cta-secondary { display: inline-flex; align-items: center; justify-content: center; background: transparent; color: #fff; font-family: var(--font-body); font-size: 12px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; padding: 16px 32px; border-radius: 4px; border: 1px solid rgba(255,255,255,0.4); text-decoration: none; transition: border-color 0.2s; }
        .cta-secondary:hover { border-color: rgba(255,255,255,0.8); }
        .scroll-hint { position: absolute; bottom: 24px; left: 50%; transform: translateX(-50%); display: flex; flex-direction: column; align-items: center; gap: 6px; z-index: 10; animation: fadeUp 1s ease 1s both; }
        .scroll-hint span { font-size: 8px; letter-spacing: 0.3em; text-transform: uppercase; color: rgba(255,255,255,0.3); font-family: var(--font-body); }
        .scroll-line { width: 1px; height: 40px; background: linear-gradient(180deg, rgba(255,255,255,0.4), transparent); }
        .card { transition: transform 0.3s ease, box-shadow 0.3s ease; }
        .card:hover { transform: translateY(-5px); box-shadow: 0 16px 48px rgba(0,0,0,0.5); }
        .card-btn { transition: background 0.2s; }
        .card-btn:hover { background: var(--copper-dim) !important; }
        @media (max-width: 640px) {
          .hero-content { padding: 0 20px 80px; }
          .hero-ctas { flex-direction: column; width: 100%; }
          .cta-primary, .cta-secondary { width: 100%; }
          .products-grid { grid-template-columns: repeat(2,1fr) !important; gap: 12px !important; }
          .section-head { flex-direction: column !important; gap: 8px !important; align-items: flex-start !important; }
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

{/* HERO */}
    <div className="hero-wrap">
      <video className="hero-video hero-video-desktop" src="/productos/banner_pc_pistola.mp4" autoPlay loop muted playsInline />
      <video className="hero-video hero-video-mobile" src="/productos/banner_pistola.mp4" autoPlay loop muted playsInline />
      <div className="hero-overlay" />
      <div className="hero-content">
        <div className="hero-eyebrow">Pistola de Agua Eléctrica</div>
        <h1 className="hero-title">Diversión sin límites,<br />en cada disparo</h1>
        <p className="hero-sub">Luz LED, batería recargable y máxima potencia para tus batallas de agua.</p>
        <div className="hero-ctas">
          <a href="/productos/pistola-de-agua-electrica" className="cta-primary">
            Comprar ahora – $39.900
          </a>
          <a href="#otros" className="cta-secondary">Ver más productos</a>
        </div>
        <div className="scroll-hint">
          <div className="scroll-line" />
          <span>scroll</span>
        </div>
      </div>
    </div>    {/* OTROS PRODUCTOS */}
      {productos.length > 0 && (
        <section id="otros" style={{ background:"var(--bg)",padding:"64px 16px 80px" }}>
          <div style={{ maxWidth:1240,margin:"0 auto" }}>
            <div className="section-head" style={{ display:"flex",alignItems:"flex-end",justifyContent:"space-between",paddingBottom:20,borderBottom:"1px solid var(--border)",marginBottom:32 }}>
              <div>
                <div className="t-label" style={{ marginBottom:8 }}>También puede interesarte</div>
                <h2 style={{ margin:0 }}>Otros productos</h2>
              </div>
            </div>
            <div className="products-grid" style={{ display:"grid",gridTemplateColumns: productos.length === 1 ? "repeat(3, 1fr)" : `repeat(${Math.min(productos.length, 3)},1fr)`,gap:20 }}>
              {productos.map(p => (
                <a key={p.id} href={`/productos/${p.slug}`} className="card"
                  style={{ borderRadius:10,overflow:"hidden",display:"block",textDecoration:"none",position:"relative" }}>
                  <div style={{ aspectRatio:"1",background:"var(--bg-3)",border:"1px solid var(--border)",borderBottom:"none",borderRadius:"10px 10px 0 0",overflow:"hidden" }}>
                    <img src={p.imagen} alt={p.nombre} style={{ width:"100%",height:"100%",objectFit:"contain", padding:8 }} />
                  </div>
                  <div style={{ background:"var(--surface)",border:"1px solid var(--border)",borderTop:"1px solid rgba(232,228,224,0.03)",borderRadius:"0 0 10px 10px",padding:"14px 14px 16px" }}>
                    {p.envioGratis && <span className="badge badge-green" style={{ marginBottom:10,display:"inline-flex" }}>Envío gratis</span>}
                    <div className="t-sm" style={{ marginBottom:8,lineHeight:1.4,color:"var(--text)" }}>{p.nombre}</div>

                    <div style={{ fontSize:"var(--text-lg)",fontWeight:700,color:"var(--text)",lineHeight:1.1,marginBottom:4 }}>{p.precio}</div>
                    <div className="t-xs" style={{ color:"var(--green)",fontWeight:500,marginBottom:14 }}>{p.cuotas}</div>
                    <button className="card-btn" onClick={(e) => handleAgregar(p, e)}
                      style={{ width:"100%",background:"var(--copper)",color:"#0f0f0f",border:"none",borderRadius:6,fontSize:"var(--text-xs)",fontWeight:700,letterSpacing:"0.08em",textTransform:"uppercase",padding:"12px 8px",cursor:"pointer" }}>
                      Agregar al carrito
                    </button>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
