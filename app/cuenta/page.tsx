"use client";
import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

type Vista = "login" | "registro" | "perfil" | "editar";

export default function CuentaPage() {
  const [vista, setVista] = useState<Vista>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nombre, setNombre] = useState("");
  const [usuario, setUsuario] = useState<any>(null);
  const [perfil, setPerfil] = useState<any>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [enviando, setEnviando] = useState(false);

  // Campos de edición
  const [editNombre, setEditNombre] = useState("");
  const [editTelefono, setEditTelefono] = useState("");
  const [editDireccion, setEditDireccion] = useState("");
  const [editCiudad, setEditCiudad] = useState("");

  const cargarPerfil = async (userId: string) => {
    const { data } = await supabase.from("perfiles").select("*").eq("id", userId).single();
    if (data) {
      setPerfil(data);
      setEditNombre(data.nombre || "");
      setEditTelefono(data.telefono || "");
      setEditDireccion(data.direccion || "");
      setEditCiudad(data.ciudad || "");
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUsuario(session?.user ?? null);
      if (session?.user) {
        cargarPerfil(session.user.id);
        setVista("perfil");
      }
      setCargando(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUsuario(session?.user ?? null);
      if (session?.user) {
        cargarPerfil(session.user.id);
        setVista("perfil");
      } else {
        setVista("login");
        setPerfil(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: "https://tiendatuc.store/cuenta" },
    });
  };

  const handleLogin = async () => {
    setError(""); setEnviando(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setError("Email o contraseña incorrectos");
    setEnviando(false);
  };

  const handleRegistro = async () => {
    setError(""); setEnviando(true);
    if (!nombre.trim()) { setError("Ingresá tu nombre"); setEnviando(false); return; }
    if (password.length < 6) { setError("La contraseña debe tener al menos 6 caracteres"); setEnviando(false); return; }
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) { setError(error.message); setEnviando(false); return; }
if (data.user) {
  await supabase.from("perfiles").insert({ id: data.user.id, nombre, email });
  await fetch("/api/emails", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      tipo: "bienvenida",
      email: email,
      nombre: nombre,
    }),
  });
}
    setEnviando(false);
  };

  const handleGuardarPerfil = async () => {
    setError(""); setEnviando(true);
    const { error } = await supabase.from("perfiles").update({
      nombre: editNombre,
      telefono: editTelefono,
      direccion: editDireccion,
      ciudad: editCiudad,
    }).eq("id", usuario.id);
    if (error) { setError("Error al guardar"); }
    else {
      await cargarPerfil(usuario.id);
      setMensaje("Perfil actualizado");
      setVista("perfil");
      setTimeout(() => setMensaje(""), 3000);
    }
    setEnviando(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setEmail(""); setPassword(""); setNombre("");
  };

  const iniciales = perfil?.nombre
    ? perfil.nombre.split(" ").map((n: string) => n[0]).slice(0, 2).join("").toUpperCase()
    : usuario?.email?.[0].toUpperCase();

  const inputStyle: any = {
    width:"100%", background:"var(--bg-3)", border:"1px solid var(--border-2)",
    borderRadius:8, padding:"13px 14px", fontSize:14, color:"var(--text)",
    fontFamily:"var(--font-body)", outline:"none", boxSizing:"border-box",
    transition:"border-color 0.2s",
  };

  if (cargando) return (
    <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:"var(--bg)" }}>
      <div style={{ width:32, height:32, border:"2px solid var(--border-2)", borderTopColor:"var(--copper)", borderRadius:"50%", animation:"spin 0.8s linear infinite" }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  return (
    <div style={{ background:"var(--bg)", minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", padding:"40px 16px" }}>
      <div style={{ width:"100%", maxWidth:440 }}>

        {/* ── PERFIL ── */}
        {vista === "perfil" && usuario && (
          <div>
            {mensaje && (
              <div style={{ background:"rgba(76,175,138,0.08)", border:"1px solid rgba(76,175,138,0.2)", borderRadius:8, padding:"12px 16px", marginBottom:20 }}>
                <span className="t-sm" style={{ color:"var(--green)" }}>✓ {mensaje}</span>
              </div>
            )}

            {/* Avatar + nombre */}
            <div style={{ textAlign:"center", marginBottom:28 }}>
              <div style={{ width:80, height:80, borderRadius:"50%", background:"linear-gradient(135deg, var(--copper), var(--gold))", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 14px", fontSize:26, fontWeight:800, color:"#0f0f0f", boxShadow:"0 8px 24px rgba(212,132,90,0.3)" }}>
                {iniciales}
              </div>
              <h2 style={{ marginBottom:4 }}>{perfil?.nombre || "Mi cuenta"}</h2>
              <p className="t-sm">{usuario.email}</p>
            </div>

            {/* Info */}
            <div style={{ background:"var(--bg-2)", border:"1px solid var(--border)", borderRadius:12, padding:20, marginBottom:14 }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
                <div className="t-label">Información personal</div>
                <button onClick={() => setVista("editar")}
                  style={{ background:"none", border:"none", color:"var(--copper)", fontSize:12, fontWeight:600, cursor:"pointer", fontFamily:"var(--font-body)", display:"flex", alignItems:"center", gap:4 }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                  Editar
                </button>
              </div>
              <div style={{ display:"flex", flexDirection:"column", gap:0 }}>
                {[
                  ["Nombre", perfil?.nombre || "—"],
                  ["Email", usuario.email],
                  ["Teléfono", perfil?.telefono || "—"],
                  ["Dirección", perfil?.direccion || "—"],
                  ["Ciudad", perfil?.ciudad || "—"],
                  ["Miembro desde", new Date(usuario.created_at).toLocaleDateString("es-AR", { year:"numeric", month:"long", day:"numeric" })],
                ].map(([k, v], i, arr) => (
                  <div key={k} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"11px 0", borderBottom: i < arr.length-1 ? "1px solid var(--border)" : "none", gap:12 }}>
                    <span className="t-sm" style={{ color:"var(--text-3)", flexShrink:0 }}>{k}</span>
                    <span className="t-sm" style={{ color:"var(--text)", fontWeight:500, textAlign:"right", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{v}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Pedidos */}
            <div style={{ background:"var(--bg-2)", border:"1px solid var(--border)", borderRadius:12, padding:20, marginBottom:20 }}>
              <div className="t-label" style={{ marginBottom:16 }}>Mis pedidos</div>
              <div style={{ textAlign:"center", padding:"24px 0" }}>
                <div style={{ fontSize:36, marginBottom:10 }}>📦</div>
                <p className="t-sm" style={{ marginBottom:12 }}>No tenés pedidos todavía</p>
                <a href="/" style={{ display:"inline-flex", alignItems:"center", gap:6, background:"var(--copper)", color:"#0f0f0f", padding:"10px 20px", borderRadius:6, fontSize:12, fontWeight:700, letterSpacing:"0.08em", textTransform:"uppercase" }}>
                  Ver productos →
                </a>
              </div>
            </div>

            <button onClick={handleLogout}
              style={{ width:"100%", background:"transparent", border:"1px solid var(--border-2)", color:"var(--text-3)", borderRadius:10, padding:14, fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:"var(--font-body)", transition:"all 0.2s" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor="var(--red)"; e.currentTarget.style.color="var(--red)"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor="var(--border-2)"; e.currentTarget.style.color="var(--text-3)"; }}
            >Cerrar sesión</button>
          </div>
        )}

        {/* ── EDITAR PERFIL ── */}
        {vista === "editar" && (
          <div>
            <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:28 }}>
              <button onClick={() => setVista("perfil")}
                style={{ background:"none", border:"none", cursor:"pointer", color:"var(--text-3)", display:"flex", padding:0 }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/></svg>
              </button>
              <h2 style={{ margin:0 }}>Editar perfil</h2>
            </div>

            {error && (
              <div style={{ background:"rgba(224,85,85,0.08)", border:"1px solid rgba(224,85,85,0.2)", borderRadius:8, padding:"12px 16px", marginBottom:16 }}>
                <span className="t-sm" style={{ color:"var(--red)" }}>{error}</span>
              </div>
            )}

            <div style={{ display:"flex", flexDirection:"column", gap:14, marginBottom:24 }}>
              {[
                { label:"Nombre completo", value:editNombre, onChange:setEditNombre, placeholder:"Tu nombre", type:"text" },
                { label:"Teléfono", value:editTelefono, onChange:setEditTelefono, placeholder:"Ej: 3815440596", type:"tel" },
                { label:"Dirección de envío", value:editDireccion, onChange:setEditDireccion, placeholder:"Calle y número", type:"text" },
                { label:"Ciudad", value:editCiudad, onChange:setEditCiudad, placeholder:"Tu ciudad", type:"text" },
              ].map(({ label, value, onChange, placeholder, type }) => (
                <div key={label}>
                  <div className="t-xs" style={{ marginBottom:6, textTransform:"uppercase", letterSpacing:"0.1em" }}>{label}</div>
                  <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
                    style={inputStyle}
                    onFocus={e => e.target.style.borderColor="var(--copper)"}
                    onBlur={e => e.target.style.borderColor="var(--border-2)"}
                  />
                </div>
              ))}
            </div>

            <button onClick={handleGuardarPerfil} disabled={enviando}
              style={{ width:"100%", background:"var(--copper)", color:"#0f0f0f", border:"none", borderRadius:10, padding:15, fontSize:13, fontWeight:700, cursor:enviando?"not-allowed":"pointer", fontFamily:"var(--font-body)", letterSpacing:"0.08em", textTransform:"uppercase", opacity:enviando?0.7:1 }}>
              {enviando ? "Guardando..." : "Guardar cambios"}
            </button>
          </div>
        )}

        {/* ── LOGIN ── */}
        {vista === "login" && (
          <div>
            <div style={{ textAlign:"center", marginBottom:32 }}>
              <div style={{ width:56, height:56, borderRadius:"50%", background:"var(--bg-2)", border:"1px solid var(--border-2)", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 16px" }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="rgba(232,228,224,0.5)" strokeWidth="1.5" strokeLinecap="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                </svg>
              </div>
              <h2 style={{ marginBottom:6 }}>Iniciar sesión</h2>
              <p className="t-sm">Accedé a tu cuenta de TiendaTuc</p>
            </div>

            {error && (
              <div style={{ background:"rgba(224,85,85,0.08)", border:"1px solid rgba(224,85,85,0.2)", borderRadius:8, padding:"12px 16px", marginBottom:16 }}>
                <span className="t-sm" style={{ color:"var(--red)" }}>{error}</span>
              </div>
            )}

            <div style={{ display:"flex", flexDirection:"column", gap:12, marginBottom:20 }}>
              <div>
                <div className="t-xs" style={{ marginBottom:6, textTransform:"uppercase", letterSpacing:"0.1em" }}>Email</div>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="tu@email.com"
                  style={inputStyle}
                  onFocus={e => e.target.style.borderColor="var(--copper)"}
                  onBlur={e => e.target.style.borderColor="var(--border-2)"}
                />
              </div>
              <div>
                <div className="t-xs" style={{ marginBottom:6, textTransform:"uppercase", letterSpacing:"0.1em" }}>Contraseña</div>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••"
                  onKeyDown={e => e.key === "Enter" && handleLogin()}
                  style={inputStyle}
                  onFocus={e => e.target.style.borderColor="var(--copper)"}
                  onBlur={e => e.target.style.borderColor="var(--border-2)"}
                />
              </div>
            </div>

            <button onClick={handleLogin} disabled={enviando}
              style={{ width:"100%", background:"var(--copper)", color:"#0f0f0f", border:"none", borderRadius:10, padding:15, fontSize:13, fontWeight:700, cursor:enviando?"not-allowed":"pointer", fontFamily:"var(--font-body)", letterSpacing:"0.08em", textTransform:"uppercase", opacity:enviando?0.7:1, marginBottom:12 }}>
              {enviando ? "Ingresando..." : "Iniciar sesión"}
            </button>

            <div style={{ display:"flex", alignItems:"center", gap:10, margin:"4px 0 12px" }}>
              <div style={{ flex:1, height:1, background:"var(--border)" }} />
              <span className="t-xs">o continuá con</span>
              <div style={{ flex:1, height:1, background:"var(--border)" }} />
            </div>

            <button onClick={handleGoogleLogin}
              style={{ width:"100%", background:"var(--bg-2)", border:"1px solid var(--border-2)", borderRadius:10, padding:13, fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:"var(--font-body)", color:"var(--text)", display:"flex", alignItems:"center", justifyContent:"center", gap:10, marginBottom:16 }}>
              <svg width="18" height="18" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
              Continuar con Google
            </button>

            <div style={{ textAlign:"center" }}>
              <span className="t-sm" style={{ color:"var(--text-3)" }}>¿No tenés cuenta? </span>
              <button onClick={() => { setVista("registro"); setError(""); }}
                style={{ background:"none", border:"none", color:"var(--copper)", fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:"var(--font-body)", padding:0 }}>
                Crear cuenta
              </button>
            </div>
          </div>
        )}

        {/* ── REGISTRO ── */}
        {vista === "registro" && (
          <div>
            <div style={{ textAlign:"center", marginBottom:32 }}>
              <div style={{ width:56, height:56, borderRadius:"50%", background:"var(--bg-2)", border:"1px solid var(--border-2)", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 16px" }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="rgba(232,228,224,0.5)" strokeWidth="1.5" strokeLinecap="round">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/>
                </svg>
              </div>
              <h2 style={{ marginBottom:6 }}>Crear cuenta</h2>
              <p className="t-sm">Registrate para comprar en TiendaTuc</p>
            </div>

            {error && (
              <div style={{ background:"rgba(224,85,85,0.08)", border:"1px solid rgba(224,85,85,0.2)", borderRadius:8, padding:"12px 16px", marginBottom:16 }}>
                <span className="t-sm" style={{ color:"var(--red)" }}>{error}</span>
              </div>
            )}

            <div style={{ display:"flex", flexDirection:"column", gap:12, marginBottom:20 }}>
              {[
                { label:"Nombre completo", type:"text", value:nombre, onChange:setNombre, placeholder:"Tu nombre" },
                { label:"Email", type:"email", value:email, onChange:setEmail, placeholder:"tu@email.com" },
                { label:"Contraseña", type:"password", value:password, onChange:setPassword, placeholder:"Mínimo 6 caracteres" },
              ].map(({ label, type, value, onChange, placeholder }) => (
                <div key={label}>
                  <div className="t-xs" style={{ marginBottom:6, textTransform:"uppercase", letterSpacing:"0.1em" }}>{label}</div>
                  <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
                    style={inputStyle}
                    onFocus={e => e.target.style.borderColor="var(--copper)"}
                    onBlur={e => e.target.style.borderColor="var(--border-2)"}
                  />
                </div>
              ))}
            </div>

            <button onClick={handleRegistro} disabled={enviando}
              style={{ width:"100%", background:"var(--copper)", color:"#0f0f0f", border:"none", borderRadius:10, padding:15, fontSize:13, fontWeight:700, cursor:enviando?"not-allowed":"pointer", fontFamily:"var(--font-body)", letterSpacing:"0.08em", textTransform:"uppercase", opacity:enviando?0.7:1, marginBottom:12 }}>
              {enviando ? "Creando cuenta..." : "Crear cuenta"}
            </button>

            <div style={{ display:"flex", alignItems:"center", gap:10, margin:"4px 0 12px" }}>
              <div style={{ flex:1, height:1, background:"var(--border)" }} />
              <span className="t-xs">o registrate con</span>
              <div style={{ flex:1, height:1, background:"var(--border)" }} />
            </div>

            <button onClick={handleGoogleLogin}
              style={{ width:"100%", background:"var(--bg-2)", border:"1px solid var(--border-2)", borderRadius:10, padding:13, fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:"var(--font-body)", color:"var(--text)", display:"flex", alignItems:"center", justifyContent:"center", gap:10, marginBottom:16 }}>
              <svg width="18" height="18" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
              Continuar con Google
            </button>

            <div style={{ textAlign:"center" }}>
              <span className="t-sm" style={{ color:"var(--text-3)" }}>¿Ya tenés cuenta? </span>
              <button onClick={() => { setVista("login"); setError(""); }}
                style={{ background:"none", border:"none", color:"var(--copper)", fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:"var(--font-body)", padding:0 }}>
                Iniciar sesión
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
