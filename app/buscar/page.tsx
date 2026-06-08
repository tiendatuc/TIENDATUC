"use client";
import { useState, useEffect } from "react";

const todosLosProductos = [
  { id:1, nombre:"Proyector HY300 con Android", descripcion:"Netflix, YouTube, Magis TV · Android 11 · Rotación 180°", precio:"$109.900", imagen:"/productos/proyector_1.webp", slug:"proyector-hy300-android", categoria:"Tecnología" },
  { id:2, nombre:"Wok Antiadherente 28cm", descripcion:"Cociná más sano y limpiá en segundos", precio:"$49.900", imagen:"/productos/wok_1.webp", slug:"wok-antiadherente-28cm", categoria:"Hogar" },
  { id:3, nombre:"Silla Ejecutiva Ergonómica", descripcion:"Malla transpirable, ajustable, soporte lumbar", precio:"$139.900", imagen:"/productos/silla_1.png", slug:"silla-ejecutiva-ergonomica", categoria:"Hogar" },
  { id:4, nombre:"Ropero Organizador Armable", descripcion:"1.6m alto, sin herramientas, con cierre cortina", precio:"$74.900", imagen:"/productos/ropero_1.png", slug:"ropero-organizador-armable", categoria:"Hogar" },
];

export default function BuscarPage() {
  const [query, setQuery] = useState("");
  const [resultados, setResultados] = useState(todosLosProductos);
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    const q = query.toLowerCase().trim();
    if (!q) {
      setResultados(todosLosProductos);
    } else {
      setResultados(
        todosLosProductos.filter(p =>
          p.nombre.toLowerCase().includes(q) ||
          p.descripcion.toLowerCase().includes(q) ||
          p.categoria.toLowerCase().includes(q)
        )
      );
    }
  }, [query]);

  return (
    <div style={{ background:"var(--bg)", minHeight:"100vh", padding:"40px 16px 80px" }}>
      <div style={{ maxWidth:800, margin:"0 auto" }}>

        {/* Barra de búsqueda */}
        <div style={{ marginBottom:32 }}>
          <div style={{
            display:"flex", alignItems:"center", gap:12,
            background:"var(--bg-2)",
            border:`1px solid ${focused ? "var(--copper)" : "var(--border-2)"}`,
            borderRadius:12, padding:"14px 18px",
            transition:"border-color 0.2s",
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(232,228,224,0.4)" strokeWidth="2" strokeLinecap="round">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <input
              autoFocus
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              placeholder="Buscá proyector, silla, wok..."
              style={{
                flex:1, background:"transparent", border:"none", outline:"none",
                fontSize:18, color:"var(--text)", fontFamily:"var(--font-body)",
                fontWeight:400,
              }}
            />
            {query && (
              <button onClick={() => setQuery("")} style={{ background:"none", border:"none", cursor:"pointer", color:"rgba(232,228,224,0.4)", padding:0, display:"flex" }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Resultados */}
        {query && (
          <div className="t-xs" style={{ marginBottom:16, color:"var(--text-3)" }}>
            {resultados.length === 0
              ? "Sin resultados"
              : `${resultados.length} resultado${resultados.length !== 1 ? "s" : ""} para "${query}"`
            }
          </div>
        )}

        {resultados.length === 0 ? (
          <div style={{ textAlign:"center", padding:"60px 0" }}>
            <div style={{ fontSize:48, marginBottom:16 }}>🔍</div>
            <h3 style={{ marginBottom:8 }}>Sin resultados</h3>
            <p>Probá con otro término de búsqueda</p>
          </div>
        ) : (
          <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
            {resultados.map(p => (
              <a key={p.id} href={`/productos/${p.slug}`}
                style={{
                  display:"flex", alignItems:"center", gap:16,
                  background:"var(--bg-2)", border:"1px solid var(--border)",
                  borderRadius:12, padding:16, textDecoration:"none",
                  transition:"border-color 0.2s, transform 0.2s",
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = "var(--copper)";
                  e.currentTarget.style.transform = "translateY(-2px)";
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = "var(--border)";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                <div style={{ width:80, height:80, borderRadius:8, overflow:"hidden", background:"var(--bg-3)", flexShrink:0 }}>
                  <img src={p.imagen} alt={p.nombre} style={{ width:"100%", height:"100%", objectFit:"cover" }} />
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div className="t-xs" style={{ color:"var(--copper)", marginBottom:4 }}>{p.categoria}</div>
                  <h4 style={{ marginBottom:4, fontSize:15, fontWeight:600, color:"var(--text)" }}>{p.nombre}</h4>
                  <p className="t-sm" style={{ marginBottom:6, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{p.descripcion}</p>
                  <div style={{ fontSize:16, fontWeight:700, color:"var(--text)" }}>{p.precio}</div>
                </div>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(232,228,224,0.3)" strokeWidth="2" strokeLinecap="round" style={{ flexShrink:0 }}>
                  <path d="M9 18l6-6-6-6"/>
                </svg>
              </a>
            ))}
          </div>
        )}

        {!query && (
          <div style={{ marginTop:32 }}>
            <div className="t-label" style={{ marginBottom:16 }}>Categorías</div>
            <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
              {["Tecnología","Hogar"].map(cat => (
                <button key={cat} onClick={() => setQuery(cat)}
                  style={{ background:"var(--bg-2)", border:"1px solid var(--border-2)", borderRadius:8, padding:"8px 16px", fontSize:13, fontWeight:500, color:"var(--text-2)", cursor:"pointer", fontFamily:"var(--font-body)", transition:"all 0.2s" }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor="var(--copper)"; e.currentTarget.style.color="var(--copper)"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor="var(--border-2)"; e.currentTarget.style.color="var(--text-2)"; }}
                >{cat}</button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
