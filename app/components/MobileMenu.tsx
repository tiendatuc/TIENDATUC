"use client";
import { useState, useEffect, useRef } from "react";

export default function MobileMenu() {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (panelRef.current) {
      panelRef.current.style.cssText = `
        position: fixed !important;
        top: 0 !important;
        left: 0 !important;
        bottom: 0 !important;
        width: 280px !important;
        background-color: #0a0a0a !important;
        background: #0a0a0a !important;
        z-index: 9999 !important;
        display: flex !important;
        flex-direction: column !important;
        border-right: 1px solid rgba(232,228,224,0.1) !important;
        transition: transform 0.3s ease !important;
        transform: ${open ? "translateX(0)" : "translateX(-100%)"} !important;
      `;
    }
  }, [open]);

  return (
    <>
      <style>{`
        .mob-btn {
          display: none;
          width: 38px; height: 38px;
          align-items: center; justify-content: center;
          background: transparent; border: none;
          cursor: pointer; color: #E8E4E0;
          border-radius: 8px; flex-shrink: 0; padding: 0;
        }
        @media (max-width: 640px) { .mob-btn { display: flex; } }

        .mob-overlay {
          display: none;
          position: fixed; inset: 0;
          background: rgba(0,0,0,0.75);
          z-index: 9998;
        }
        .mob-overlay.on { display: block; }

        .mob-panel-header {
          display: flex; align-items: center;
          justify-content: space-between;
          padding: 0 20px; height: 58px;
          border-bottom: 1px solid rgba(232,228,224,0.08);
          flex-shrink: 0;
          background: #0a0a0a;
        }
        .mob-panel-logo {
          font-size: 13px; font-weight: 800;
          letter-spacing: 4px; text-transform: uppercase;
          color: #E8E4E0; text-decoration: none;
          font-family: 'Syne', sans-serif;
        }
        .mob-close-btn {
          width: 34px; height: 34px;
          display: flex; align-items: center; justify-content: center;
          background: rgba(232,228,224,0.08);
          border: none; border-radius: 6px;
          cursor: pointer; color: #E8E4E0;
        }
        .mob-nav { flex: 1; overflow-y: auto; background: #0a0a0a; }
        .mob-nav-link {
          display: flex; align-items: center; gap: 14px;
          padding: 16px 24px;
          font-size: 15px; font-weight: 500;
          color: rgba(232,228,224,0.7);
          text-decoration: none;
          border-bottom: 1px solid rgba(232,228,224,0.05);
          background: #0a0a0a;
        }
        .mob-nav-link:hover { color: #E8E4E0; background: rgba(232,228,224,0.04); }
        .mob-icon-wrap {
          width: 36px; height: 36px; border-radius: 8px;
          background: rgba(232,228,224,0.06);
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        .mob-footer {
          padding: 20px 24px;
          border-top: 1px solid rgba(232,228,224,0.08);
          background: #0a0a0a; flex-shrink: 0;
        }
        .mob-wp {
          display: flex; align-items: center; justify-content: center;
          gap: 10px; width: 100%;
          background: #25D366; color: #0f0f0f;
          padding: 12px 18px; border-radius: 8px;
          font-size: 13px; font-weight: 700;
          text-decoration: none;
        }
      `}</style>

      {/* Botón hamburguesa */}
      <button className="mob-btn" onClick={() => setOpen(true)}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <line x1="3" y1="6" x2="21" y2="6"/>
          <line x1="3" y1="12" x2="21" y2="12"/>
          <line x1="3" y1="18" x2="21" y2="18"/>
        </svg>
      </button>

      {/* Overlay */}
      <div className={`mob-overlay${open ? " on" : ""}`} onClick={() => setOpen(false)} />

      {/* Panel */}
      <div ref={panelRef} style={{
        position: "fixed",
        top: 0, left: 0,
        width: "280px",
        height: "100vh",
        backgroundColor: "#0a0a0a",
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        borderRight: "1px solid rgba(232,228,224,0.1)",
        transition: "transform 0.3s ease",
        transform: open ? "translateX(0)" : "translateX(-100%)",
        overflowY: "auto",
      }}>

        <div className="mob-panel-header">
          <a href="/" className="mob-panel-logo" onClick={() => setOpen(false)}>TiendaTuc</a>
          <button className="mob-close-btn" onClick={() => setOpen(false)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <nav style={{ backgroundColor:"#0a0a0a" }}>
          {[
            {href:"/", label:"Inicio"},
            {href:"/#otros", label:"Productos"},
            {href:"https://wa.me/5493815440596", label:"Contacto"},
          ].map(({href,label}) => (
            <a key={label} href={href}
              onClick={() => setOpen(false)}
              target={href.startsWith("http") ? "_blank" : undefined}
              rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
              style={{ display:"flex",alignItems:"center",gap:14,padding:"18px 24px",fontSize:16,fontWeight:500,color:"rgba(232,228,224,0.8)",textDecoration:"none",borderBottom:"1px solid rgba(232,228,224,0.05)",backgroundColor:"#0a0a0a" }}>
              {label}
            </a>
          ))}
        </nav>

        <div style={{ padding:"20px 24px",borderTop:"1px solid rgba(232,228,224,0.08)",backgroundColor:"#0a0a0a",flexShrink:0 }}>
          <a href="https://wa.me/5493815440596" className="mob-wp" target="_blank" rel="noopener noreferrer">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="#0f0f0f">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            Escribinos por WhatsApp
          </a>
        </div>
      </div>
    </>
  );
}
