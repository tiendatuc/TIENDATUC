"use client";
import { useState, useEffect, useRef } from "react";
import { supabase } from "../lib/supabase";

export default function NavUser() {
  const [usuario, setUsuario] = useState<any>(null);
  const [perfil, setPerfil] = useState<any>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUsuario(session?.user ?? null);
      if (session?.user) cargarPerfil(session.user.id);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUsuario(session?.user ?? null);
      if (session?.user) cargarPerfil(session.user.id);
      else setPerfil(null);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const cargarPerfil = async (id: string) => {
    const { data } = await supabase.from("perfiles").select("nombre").eq("id", id).single();
    if (data) setPerfil(data);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setMenuOpen(false);
  };

  const iniciales = perfil?.nombre
    ? perfil.nombre.split(" ").map((n: string) => n[0]).slice(0, 2).join("").toUpperCase()
    : usuario?.email?.[0].toUpperCase();

  const nombreCorto = perfil?.nombre
    ? perfil.nombre.split(" ")[0]
    : null;

  if (!usuario) {
    return (
      <a href="/cuenta" className="nav-icon-btn" title="Mi cuenta">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
        </svg>
      </a>
    );
  }

  return (
    <div ref={ref} style={{ position:"relative" }}>
      {/* Botón avatar + nombre */}
      <button
        onClick={() => setMenuOpen(!menuOpen)}
        style={{ display:"flex", alignItems:"center", gap:8, background:"rgba(232,228,224,0.06)", border:"1px solid rgba(232,228,224,0.1)", borderRadius:8, padding:"5px 10px 5px 5px", cursor:"pointer", transition:"all 0.15s" }}
        onMouseEnter={e => e.currentTarget.style.borderColor="var(--copper)"}
        onMouseLeave={e => e.currentTarget.style.borderColor="rgba(232,228,224,0.1)"}
      >
        {/* Avatar */}
        <div style={{ width:28, height:28, borderRadius:"50%", background:"linear-gradient(135deg, var(--copper), var(--gold))", display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:800, color:"#0f0f0f", flexShrink:0 }}>
          {iniciales}
        </div>
        {/* Nombre — solo en desktop */}
        {nombreCorto && (
          <span style={{ fontSize:13, fontWeight:500, color:"var(--text)", maxWidth:80, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}
            className="nav-user-name">
            {nombreCorto}
          </span>
        )}
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(232,228,224,0.4)" strokeWidth="2.5" strokeLinecap="round">
          <path d="M6 9l6 6 6-6"/>
        </svg>
      </button>

      {/* Dropdown */}
      {menuOpen && (
        <div style={{ position:"absolute", top:"calc(100% + 8px)", right:0, background:"#111", border:"1px solid rgba(232,228,224,0.1)", borderRadius:10, minWidth:180, boxShadow:"0 16px 48px rgba(0,0,0,0.6)", zIndex:500, overflow:"hidden" }}>
          {/* Info */}
          <div style={{ padding:"12px 14px", borderBottom:"1px solid rgba(232,228,224,0.07)" }}>
            <div style={{ fontSize:13, fontWeight:600, color:"var(--text)", marginBottom:2 }}>{perfil?.nombre || "Mi cuenta"}</div>
            <div style={{ fontSize:11, color:"var(--text-3)", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{usuario.email}</div>
          </div>
          {/* Links */}
          <a href="/cuenta" onClick={() => setMenuOpen(false)}
            style={{ display:"flex", alignItems:"center", gap:10, padding:"11px 14px", fontSize:13, color:"rgba(232,228,224,0.7)", textDecoration:"none", transition:"background 0.15s" }}
            onMouseEnter={e => e.currentTarget.style.background="rgba(232,228,224,0.05)"}
            onMouseLeave={e => e.currentTarget.style.background="transparent"}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            Mi perfil
          </a>
          <a href="/cuenta" onClick={() => setMenuOpen(false)}
            style={{ display:"flex", alignItems:"center", gap:10, padding:"11px 14px", fontSize:13, color:"rgba(232,228,224,0.7)", textDecoration:"none", transition:"background 0.15s", borderBottom:"1px solid rgba(232,228,224,0.07)" }}
            onMouseEnter={e => e.currentTarget.style.background="rgba(232,228,224,0.05)"}
            onMouseLeave={e => e.currentTarget.style.background="transparent"}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
            Mis pedidos
          </a>
          <button onClick={handleLogout}
            style={{ display:"flex", alignItems:"center", gap:10, padding:"11px 14px", fontSize:13, color:"var(--red)", background:"none", border:"none", cursor:"pointer", width:"100%", fontFamily:"var(--font-body)", transition:"background 0.15s" }}
            onMouseEnter={e => e.currentTarget.style.background="rgba(224,85,85,0.06)"}
            onMouseLeave={e => e.currentTarget.style.background="transparent"}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            Cerrar sesión
          </button>
        </div>
      )}

      <style>{`
        @media (max-width: 640px) {
          .nav-user-name { display: none !important; }
        }
      `}</style>
    </div>
  );
}
