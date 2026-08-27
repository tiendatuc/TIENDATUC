import type { Metadata } from "next";
import "./globals.css";
import Cart from "./components/Cart";
import MobileMenu from "./components/MobileMenu";
import NavUser from "./components/NavUser";

export const metadata: Metadata = {
  title: "TiendaTuc - Hogar y Tecnología",
  description: "Productos para tu hogar y entretenimiento. Envío a todo Argentina.",
icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.png", type: "image/png" },
    ],
    apple: [
      { url: "/icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body>
        <style>{`
          /* Trust bar top */
          .trust-bar-top {
            background: var(--copper);
            padding: 8px 0;
            overflow: hidden;
            position: relative;
            z-index: 300;
          }
          .trust-track-top {
            display: flex;
            animation: marquee 22s linear infinite;
            width: max-content;
          }
          @keyframes marquee { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }

          .nav-icon-btn {
            width: 36px;
            height: 36px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 8px;
            background: transparent;
            border: 1px solid transparent;
            cursor: pointer;
            color: rgba(232,228,224,0.55);
            transition: all 0.15s;
            text-decoration: none;
            flex-shrink: 0;
          }
          .nav-icon-btn:hover {
            background: rgba(232,228,224,0.06);
            border-color: rgba(232,228,224,0.1);
            color: var(--text);
          }
          @media (max-width: 640px) {
            .nav-links-desktop { display: none !important; }
            .nav-logo { font-size: 13px !important; letter-spacing: 3px !important; }
            .nav-wrap { padding: 0 16px !important; }
            .nav-search-text { display: none; }
          }
        `}</style>

        {/* ── TRUST BAR TOP ── */}
        <div className="trust-bar-top">
          <div className="trust-track-top">
            {["Envío gratis a todo el país","Pago 100% seguro","12 cuotas sin interés","Garantía 6 meses","Soporte por WhatsApp","Stock disponible","Envío gratis a todo el país","Pago 100% seguro","12 cuotas sin interés","Garantía 6 meses","Soporte por WhatsApp","Stock disponible"].map((item, i) => (
              <span key={i} style={{ display:"inline-flex",alignItems:"center",gap:10,fontSize:11,fontWeight:700,color:"#0f0f0f",whiteSpace:"nowrap",padding:"0 28px",letterSpacing:"0.04em" }}>
                <span style={{ width:4,height:4,background:"rgba(0,0,0,0.3)",borderRadius:"50%",flexShrink:0 }} />
                {item}
              </span>
            ))}
          </div>
        </div>

        <header style={{
          position: "sticky", top: 0, zIndex: 200,
          background: "rgba(10,10,10,0.96)",
          borderBottom: "1px solid rgba(232,228,224,0.07)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
        }}>
          <div className="nav-wrap" style={{
            maxWidth: 1240, margin: "0 auto",
            padding: "0 24px", height: 58,
            display: "flex", alignItems: "center",
            justifyContent: "space-between",
            gap: 16,
          }}>

            {/* Hamburguesa mobile */}
            <MobileMenu />

            {/* Logo */}
            <a href="/" className="nav-logo" style={{
              fontFamily: "var(--font-display)",
              fontSize: 15, fontWeight: 800,
              letterSpacing: 5, textTransform: "uppercase",
              color: "var(--text)", flexShrink: 0,
            }}>TiendaTuc</a>

            {/* Nav links */}
            <nav className="nav-links-desktop" style={{ display: "flex", gap: 28, flex: 1, justifyContent: "center" }}>
              <a href="/" className="nav-link">Inicio</a>
              <a href="/#otros" className="nav-link">Productos</a>
              <a href="https://wa.me/5493815440596" className="nav-link" target="_blank" rel="noopener noreferrer">Contacto</a>
            </nav>

            {/* Iconos derecha */}
            <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>

              {/* Búsqueda */}
              <a href="/buscar" className="nav-icon-btn" title="Buscar">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                </svg>
              </a>

              {/* Cuenta */}
              <NavUser />

              {/* Carrito */}
              <Cart />
            </div>
          </div>
        </header>

        <main>{children}</main>

        <footer style={{
          background: "#060606",
          borderTop: "1px solid var(--border)",
          padding: "48px 24px 32px",
        }}>
          <div style={{
            maxWidth: 1240, margin: "0 auto",
            display: "flex", justifyContent: "space-between",
            alignItems: "flex-end", flexWrap: "wrap", gap: 24,
          }}>
            <div>
              <div style={{
                fontFamily: "var(--font-display)",
                fontSize: 13, fontWeight: 800,
                letterSpacing: 5, marginBottom: 10,
                color: "var(--text)", textTransform: "uppercase",
              }}>TiendaTuc</div>
              <p className="t-sm" style={{ lineHeight: 1.8 }}>
                Hogar · Tecnología · Entretenimiento<br />
                Envío a todo Argentina
              </p>
            </div>
            <span className="t-xs">© 2026 TiendaTuc</span>
<div style={{ display:"flex", gap:16, marginTop:8 }}>
  <a href="/privacidad" style={{ color:"var(--text-3)", fontSize:12, textDecoration:"none" }}>Privacidad</a>
  <a href="/terminos" style={{ color:"var(--text-3)", fontSize:12, textDecoration:"none" }}>Términos</a>
  <a href="/devoluciones" style={{ color:"var(--text-3)", fontSize:12, textDecoration:"none" }}>Devoluciones</a>
</div>
          </div>
        </footer>

        {/* WhatsApp */}
        <a
          href="https://wa.me/5493815440596"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            position: "fixed", bottom: 22, right: 22, zIndex: 999,
            background: "#25D366",
            width: 52, height: 52, borderRadius: "50%",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 4px 20px rgba(37,211,102,0.35)",
          }}
        >
          <svg width="26" height="26" viewBox="0 0 24 24" fill="white">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
        </a>
      </body>
    </html>
  );
}
