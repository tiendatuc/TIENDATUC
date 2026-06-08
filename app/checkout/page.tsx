"use client";
import { useState, useEffect } from "react";
import { useCart } from "../store/cartStore";
import { supabase } from "../lib/supabase";

type Paso = 1 | 2 | 3;
type TipoEnvio = "domicilio" | "sucursal";

const PROVINCIAS_FIXY = ["CABA"];

// Costo envío a domicilio por provincia (interior) — sucursal siempre gratis
const COSTO_ENVIO: Record<string, number> = {
  "Buenos Aires": 0,       // Urbano cubre bien, gratis
  "CABA": 0,               // Fixy, gratis
  "Córdoba": 8200,
  "Santa Fe": 8400,
  "Mendoza": 8900,
  "Tucumán": 8500,
  "Entre Ríos": 8600,
  "Salta": 9100,
  "Misiones": 9300,
  "Chaco": 9200,
  "Corrientes": 9100,
  "Santiago del Estero": 8800,
  "San Juan": 9000,
  "Jujuy": 9400,
  "Río Negro": 9500,
  "Neuquén": 9600,
  "Formosa": 9500,
  "San Luis": 8700,
  "La Pampa": 8800,
  "Catamarca": 9000,
  "La Rioja": 9100,
  "Chubut": 9800,
  "Santa Cruz": 10200,
  "Tierra del Fuego": 10500,
};

const getCostoEnvio = (prov: string) => COSTO_ENVIO[prov] ?? 9000;
const getCostoFormateado = (prov: string) => {
  const costo = getCostoEnvio(prov);
  return costo === 0 ? "Gratis" : `$${costo.toLocaleString("es-AR")}`;
};

const getTransportista = (prov: string) => {
  if (PROVINCIAS_FIXY.includes(prov)) return { nombre:"Fixy", emoji:"⚡", desc:"Entrega express en CABA y GBA" };
  return { nombre:"Urbano Express", emoji:"📦", desc:"Entrega en todo el país" };
};

const PROVINCIAS = [
  "Buenos Aires","CABA","Catamarca","Chaco","Chubut","Córdoba","Corrientes",
  "Entre Ríos","Formosa","Jujuy","La Pampa","La Rioja","Mendoza","Misiones",
  "Neuquén","Río Negro","Salta","San Juan","San Luis","Santa Cruz","Santa Fe",
  "Santiago del Estero","Tierra del Fuego","Tucumán"
];

export default function CheckoutPage() {
  const { items, vaciar } = useCart();
  const [paso, setPaso] = useState<Paso>(1);
  const [tipoEnvio, setTipoEnvio] = useState<TipoEnvio>("domicilio");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");
  const [mpReady, setMpReady] = useState(false);

  // Datos personales
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [dni, setDni] = useState("");
  const [email, setEmail] = useState("");
  const [telefono, setTelefono] = useState("");
  const [notas, setNotas] = useState("");

  // Envío
  const [direccion, setDireccion] = useState("");
  const [apartamento, setApartamento] = useState("");
  const [ciudad, setCiudad] = useState("");
  const [provincia, setProvincia] = useState("");
  const [codigoPostal, setCodigoPostal] = useState("");
  const [sucursalInfo, setSucursalInfo] = useState("");

  // Si cambia a provincia Fixy, forzar domicilio
  useEffect(() => {
    if (PROVINCIAS_FIXY.includes(provincia)) setTipoEnvio("domicilio");
  }, [provincia]);

  const subtotal = items.reduce((acc, item) => acc + item.precioNum * item.cantidad, 0);
  const costoEnvio = (provincia && tipoEnvio === "domicilio") ? getCostoEnvio(provincia) : 0;
  const total = subtotal + costoEnvio;
  const totalFormateado = total.toLocaleString("es-AR");

  // Cargar MercadoPago SDK
  useEffect(() => {
    if (typeof window === "undefined") return;
    const script = document.createElement("script");
    script.src = "https://sdk.mercadopago.com/js/v2";
    script.onload = () => setMpReady(true);
    document.body.appendChild(script);
  }, []);

  // Inicializar Bricks cuando llega al paso 3
  useEffect(() => {
    if (paso !== 3 || !mpReady || typeof window === "undefined") return;
    const mp = new (window as any).MercadoPago("APP_USR-64a7eb8e-5ae0-45e0-a0d1-827f25e9c4b8", { locale:"es-AR" });
    const bricksBuilder = mp.bricks();

    const renderBrick = async () => {
      const container = document.getElementById("cardPaymentBrick_container");
      if (!container || container.children.length > 0) return;

      try {
        const res = await fetch("/api/crear-preferencia", {
          method:"POST",
          headers:{"Content-Type":"application/json"},
          body: JSON.stringify({
            items: items.map(i => ({ id:i.id, nombre:i.nombre, cantidad:i.cantidad, precioNum:i.precioNum })),
          }),
        });
        const data = await res.json();

        await bricksBuilder.create("cardPayment", "cardPaymentBrick_container", {
          initialization: { amount: total, preferenceId: data.id },
          customization: {
            visual: { style: { theme:"dark" } },
            paymentMethods: { creditCard:"all", debitCard:"all" },
          },
          callbacks: {
            onReady: () => {},
            onSubmit: async (formData: any) => {
              setEnviando(true);
              try {
                const res = await fetch("/api/procesar-pago", {
                  method:"POST",
                  headers:{"Content-Type":"application/json"},
                  body: JSON.stringify({
                    formData,
                    pedido: {
                      nombre: `${nombre} ${apellido}`, email, telefono, dni, notas,
                      tipoEnvio,
                      direccion: tipoEnvio === "domicilio" ? `${direccion}${apartamento ? `, ${apartamento}` : ""}, ${ciudad}, ${provincia} (CP: ${codigoPostal})` : sucursalInfo,
                      items,
                      total,
                    },
                  }),
                });
                const result = await res.json();
                if (result.status === "approved") {
                  vaciar();
                  window.location.href = "/gracias";
                } else {
                  setError("El pago no fue aprobado. Revisá los datos e intentá de nuevo.");
                }
              } catch {
                setError("Hubo un error procesando el pago. Intentá de nuevo.");
              }
              setEnviando(false);
            },
            onError: () => setError("Error al cargar el formulario de pago."),
          },
        });
      } catch {
        setError("Error al inicializar el pago.");
      }
    };

    renderBrick();
  }, [paso, mpReady]);

  const validarPaso1 = () => {
    if (!nombre.trim()) return "Ingresá tu nombre";
    if (!apellido.trim()) return "Ingresá tu apellido";
    if (dni.length < 7) return "Ingresá un DNI válido";
    if (!email.includes("@")) return "Ingresá un email válido";
    if (telefono.length < 8) return "Ingresá un teléfono válido";
    return null;
  };

  const validarPaso2 = () => {
    if (!provincia) return "Seleccioná tu provincia";
    if (tipoEnvio === "domicilio") {
      if (!direccion.trim()) return "Ingresá tu dirección";
      if (!ciudad.trim()) return "Ingresá tu ciudad";
      if (!codigoPostal.trim()) return "Ingresá tu código postal";
    } else {
      if (!sucursalInfo.trim()) return "Ingresá la dirección de la sucursal";
    }
    return null;
  };

  const siguientePaso = () => {
    setError("");
    if (paso === 1) {
      const err = validarPaso1();
      if (err) { setError(err); return; }
    }
    if (paso === 2) {
      const err = validarPaso2();
      if (err) { setError(err); return; }
    }
    setPaso((paso + 1) as Paso);
  };

  if (items.length === 0) return (
    <div style={{ minHeight:"100vh", background:"var(--bg)", display:"flex", alignItems:"center", justifyContent:"center", flexDirection:"column", gap:16 }}>
      <div style={{ fontSize:48 }}>🛒</div>
      <h2>Tu carrito está vacío</h2>
      <a href="/" className="btn-copper">Ver productos</a>
    </div>
  );

  const inputStyle: any = {
    width:"100%", background:"var(--bg-3)", border:"1px solid var(--border-2)",
    borderRadius:8, padding:"13px 14px", fontSize:14, color:"var(--text)",
    fontFamily:"var(--font-body)", outline:"none", boxSizing:"border-box",
    transition:"border-color 0.2s",
  };

  const labelStyle: any = {
    display:"block", fontSize:11, fontWeight:700, letterSpacing:"0.1em",
    textTransform:"uppercase", color:"var(--text-3)", marginBottom:6,
  };

  return (
    <div style={{ background:"var(--bg)", minHeight:"100vh", padding:"40px 20px 80px 20px", overflowX:"hidden", maxWidth:"100vw", boxSizing:"border-box" as any }}>
      <style>{`
        @media(max-width:768px){
          .checkout-grid{ grid-template-columns:1fr!important; }
          .checkout-grid .resumen{ order:-1; max-width:100%!important; overflow:hidden!important; }
          .checkout-grid > div { max-width:100%!important; overflow:hidden!important; }
        }
        @media(max-width:640px){
          .envio-cards-grid{ grid-template-columns:1fr 1fr!important; gap:8px!important; }
          .form-2col{ grid-template-columns:1fr!important; }
          .pasos-wrap{ gap:0!important; }
          .paso-label{ display:none!important; }
        }
        html, body { overflow-x: hidden !important; max-width: 100vw !important; }
        .checkout-root { padding: 24px 20px 80px 20px !important; }
        input:focus,select:focus,textarea:focus{ border-color:var(--copper)!important; }
        .envio-card{ cursor:pointer; transition:all 0.2s; }
        .envio-card:hover{ border-color:var(--copper)!important; }
      `}</style>

      <div style={{ maxWidth:1000, margin:"0 auto" }}>

        {/* Header */}
        <div style={{ display:"flex", alignItems:"center", gap:16, marginBottom:36 }}>
          <a href="/" style={{ color:"var(--text-3)", display:"flex" }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/></svg>
          </a>
          <h2 style={{ margin:0 }}>Finalizar compra</h2>
        </div>

        {/* Pasos */}
        <div style={{ display:"flex", alignItems:"center", gap:0, marginBottom:36 }}>
          {[["1","Datos"],["2","Envío"],["3","Pago"]].map(([n, label], i) => (
            <div key={n} style={{ display:"flex", alignItems:"center", flex: i < 2 ? 1 : "none" }}>
              <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                <div style={{ width:32, height:32, borderRadius:"50%", background: Number(n) <= paso ? "var(--copper)" : "var(--bg-2)", border:`2px solid ${Number(n) <= paso ? "var(--copper)" : "var(--border-2)"}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, fontWeight:700, color: Number(n) <= paso ? "#0f0f0f" : "var(--text-3)", transition:"all 0.3s", flexShrink:0 }}>
                  {Number(n) < paso ? "✓" : n}
                </div>
                <span style={{ fontSize:13, fontWeight:500, color: Number(n) <= paso ? "var(--text)" : "var(--text-3)" }}>{label}</span>
              </div>
              {i < 2 && <div style={{ flex:1, height:1, background: Number(n) < paso ? "var(--copper)" : "var(--border)", margin:"0 12px", transition:"background 0.3s" }} />}
            </div>
          ))}
        </div>

        <div className="checkout-grid" style={{ display:"grid", gridTemplateColumns:"1fr 360px", gap:24, alignItems:"start" }}>

          {/* Formulario */}
          <div>
            {error && (
              <div style={{ background:"rgba(224,85,85,0.08)", border:"1px solid rgba(224,85,85,0.2)", borderRadius:8, padding:"12px 16px", marginBottom:20 }}>
                <span className="t-sm" style={{ color:"var(--red)" }}>⚠ {error}</span>
              </div>
            )}

            {/* PASO 1 — Datos personales */}
            {paso === 1 && (
              <div style={{ background:"var(--bg-2)", border:"1px solid var(--border)", borderRadius:14, padding:24 }}>
                <div className="t-label" style={{ marginBottom:20 }}>Datos personales</div>
                <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                    <div>
                      <label style={labelStyle}>Nombre</label>
                      <input type="text" value={nombre} onChange={e=>setNombre(e.target.value)} placeholder="Tu nombre" style={inputStyle}
                        onFocus={e=>e.target.style.borderColor="var(--copper)"} onBlur={e=>e.target.style.borderColor="var(--border-2)"}/>
                    </div>
                    <div>
                      <label style={labelStyle}>Apellido</label>
                      <input type="text" value={apellido} onChange={e=>setApellido(e.target.value)} placeholder="Tu apellido" style={inputStyle}
                        onFocus={e=>e.target.style.borderColor="var(--copper)"} onBlur={e=>e.target.style.borderColor="var(--border-2)"}/>
                    </div>
                  </div>
                  <div>
                    <label style={labelStyle}>DNI</label>
                    <input type="text" value={dni} onChange={e=>setDni(e.target.value)} placeholder="Sin puntos ni guiones" style={inputStyle}
                      onFocus={e=>e.target.style.borderColor="var(--copper)"} onBlur={e=>e.target.style.borderColor="var(--border-2)"}/>
                  </div>
                  <div>
                    <label style={labelStyle}>Email</label>
                    <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="tu@email.com" style={inputStyle}
                      onFocus={e=>e.target.style.borderColor="var(--copper)"} onBlur={e=>e.target.style.borderColor="var(--border-2)"}/>
                    <div className="t-xs" style={{ marginTop:4 }}>Te enviamos la confirmación del pedido acá</div>
                  </div>
                  <div>
                    <label style={labelStyle}>Teléfono / WhatsApp</label>
                    <input type="tel" value={telefono} onChange={e=>setTelefono(e.target.value)} placeholder="Ej: 3815440596" style={inputStyle}
                      onFocus={e=>e.target.style.borderColor="var(--copper)"} onBlur={e=>e.target.style.borderColor="var(--border-2)"}/>
                  </div>
                  <div>
                    <label style={labelStyle}>Notas del pedido <span style={{ color:"var(--text-3)", fontWeight:400 }}>(opcional)</span></label>
                    <textarea value={notas} onChange={e=>setNotas(e.target.value)}
                      placeholder="Instrucciones especiales para la entrega, horarios, etc."
                      rows={3}
                      style={{ ...inputStyle, resize:"none" as any }}
                      onFocus={e=>e.target.style.borderColor="var(--copper)"} onBlur={e=>e.target.style.borderColor="var(--border-2)"}/>
                  </div>
                </div>
                <button onClick={siguientePaso} style={{ width:"100%", marginTop:24, background:"var(--copper)", color:"#0f0f0f", border:"none", borderRadius:10, padding:15, fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:"var(--font-body)", letterSpacing:"0.08em", textTransform:"uppercase" }}>
                  Continuar →
                </button>
              </div>
            )}

            {/* PASO 2 — Envío */}
            {paso === 2 && (
              <div style={{ background:"var(--bg-2)", border:"1px solid var(--border)", borderRadius:14, padding:24 }}>
                <div className="t-label" style={{ marginBottom:20 }}>Método de envío</div>

                {/* Provincia PRIMERO — antes de mostrar opciones */}
                <div style={{ marginBottom:20 }}>
                  <label style={labelStyle}>Provincia</label>
                  <select value={provincia} onChange={e=>setProvincia(e.target.value)} style={{ ...inputStyle, appearance:"none" as any }}
                    onFocus={e=>e.target.style.borderColor="var(--copper)"} onBlur={e=>e.target.style.borderColor="var(--border-2)"}>
                    <option value="">Seleccioná tu provincia</option>
                    {PROVINCIAS.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>

                {/* Selector tipo envío — solo si ya eligió provincia */}
                {!provincia ? (
                  <div style={{ textAlign:"center", padding:"20px 0", color:"var(--text-3)", fontSize:13 }}>
                    Seleccioná tu provincia para ver las opciones de envío
                  </div>
                ) : !PROVINCIAS_FIXY.includes(provincia) ? (
                  <div className="envio-cards-grid" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:24 }}>
                    {([["domicilio","🏠","Envío a domicilio","Recibilo en tu casa"],["sucursal","📦","Retiro en sucursal","Urbano Express"]] as const).map(([tipo, icon, titulo, sub]) => (
                      <div key={tipo} className="envio-card"
                        onClick={() => setTipoEnvio(tipo)}
                        style={{ background:"var(--bg-3)", border:`2px solid ${tipoEnvio===tipo?"var(--copper)":"var(--border-2)"}`, borderRadius:10, padding:16, textAlign:"center", position:"relative" }}>
                        {tipo === "sucursal" && <div style={{ position:"absolute", top:-10, left:"50%", transform:"translateX(-50%)", background:"var(--green)", color:"#0f0f0f", fontSize:9, fontWeight:800, letterSpacing:"0.08em", textTransform:"uppercase", padding:"3px 10px", borderRadius:20, whiteSpace:"nowrap" }}>Recomendado</div>}
                        <div style={{ fontSize:28, marginBottom:8 }}>{icon}</div>
                        <div style={{ fontSize:13, fontWeight:600, color:"var(--text)", marginBottom:2 }}>{titulo}</div>
                        <div className="t-xs">{sub}</div>
                        <div style={{ marginTop:8, fontSize:13, fontWeight:700, color: tipo==="sucursal" ? "var(--green)" : getCostoEnvio(provincia) > 0 ? "var(--copper)" : "var(--green)" }}>
                          {tipo === "sucursal" ? "Gratis" : getCostoFormateado(provincia)}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ display:"grid", gridTemplateColumns:"1fr", gap:12, marginBottom:24 }}>
                    <div className="envio-card"
                      onClick={() => setTipoEnvio("domicilio")}
                      style={{ background:"var(--bg-3)", border:`2px solid var(--copper)`, borderRadius:10, padding:16, textAlign:"center" }}>
                      <div style={{ fontSize:28, marginBottom:8 }}>⚡</div>
                      <div style={{ fontSize:13, fontWeight:600, color:"var(--text)", marginBottom:2 }}>Envío a domicilio</div>
                      <div className="t-xs">{provincia ? "Fixy — Express en CABA" : "Seleccioná tu provincia primero"}</div>
                      <div style={{ marginTop:8, fontSize:13, fontWeight:700, color:"var(--green)" }}>Gratis</div>
                    </div>
                  </div>
                )}

                {tipoEnvio === "domicilio" && provincia && (
                  <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
                    <div>
                      <label style={labelStyle}>Dirección</label>
                      <input type="text" value={direccion} onChange={e=>setDireccion(e.target.value)} placeholder="Calle y número" style={inputStyle}
                        onFocus={e=>e.target.style.borderColor="var(--copper)"} onBlur={e=>e.target.style.borderColor="var(--border-2)"}/>
                    </div>
                    <div>
                      <label style={labelStyle}>Piso / Depto <span style={{ color:"var(--text-3)", fontWeight:400 }}>(opcional)</span></label>
                      <input type="text" value={apartamento} onChange={e=>setApartamento(e.target.value)} placeholder="Ej: 3° B" style={inputStyle}
                        onFocus={e=>e.target.style.borderColor="var(--copper)"} onBlur={e=>e.target.style.borderColor="var(--border-2)"}/>
                    </div>
                    <div className="form-2col" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                      <div>
                        <label style={labelStyle}>Ciudad</label>
                        <input type="text" value={ciudad} onChange={e=>setCiudad(e.target.value)} placeholder="Tu ciudad" style={inputStyle}
                          onFocus={e=>e.target.style.borderColor="var(--copper)"} onBlur={e=>e.target.style.borderColor="var(--border-2)"}/>
                      </div>
                      <div>
                        <label style={labelStyle}>Código postal</label>
                        <input type="text" value={codigoPostal} onChange={e=>setCodigoPostal(e.target.value)} placeholder="Ej: 4000" style={inputStyle}
                          onFocus={e=>e.target.style.borderColor="var(--copper)"} onBlur={e=>e.target.style.borderColor="var(--border-2)"}/>
                      </div>
                    </div>
                    {provincia && (
                      <div style={{ background:"rgba(76,175,138,0.06)", border:"1px solid rgba(76,175,138,0.15)", borderRadius:8, padding:"10px 14px", display:"flex", alignItems:"center", gap:10 }}>
                        <span style={{ fontSize:20 }}>{getTransportista(provincia).emoji}</span>
                        <div>
                          <div style={{ fontSize:13, fontWeight:600, color:"var(--text)" }}>Tu envío va con {getTransportista(provincia).nombre}</div>
                          <div className="t-xs">{getTransportista(provincia).desc}</div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {tipoEnvio === "sucursal" && (
                  <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
                    <div style={{ background:"rgba(212,132,90,0.08)", border:"1px solid rgba(212,132,90,0.2)", borderRadius:8, padding:"12px 16px" }}>
                      <p className="t-sm" style={{ marginBottom:8 }}>Buscá la sucursal Urbano Express más cercana y pegá la dirección abajo.</p>
                      <a href="https://www.urbano.com.ar/sucursales" target="_blank" rel="noopener noreferrer"
                        style={{ display:"inline-flex", alignItems:"center", gap:6, color:"var(--copper)", fontSize:13, fontWeight:600 }}>
                        📦 Ver sucursales Urbano Express →
                      </a>
                    </div>
                    <div>
                      <label style={labelStyle}>Dirección de la sucursal elegida</label>
                      <textarea value={sucursalInfo} onChange={e=>setSucursalInfo(e.target.value)}
                        placeholder="Ej: Av. San Martín 1234, San Miguel de Tucumán, Tucumán"
                        rows={3}
                        style={{ ...inputStyle, resize:"none" as any }}
                        onFocus={e=>e.target.style.borderColor="var(--copper)"} onBlur={e=>e.target.style.borderColor="var(--border-2)"}/>
                    </div>
                  </div>
                )}

                <div style={{ display:"flex", gap:10, marginTop:24 }}>
                  <button onClick={() => { setPaso(1); setError(""); }}
                    style={{ flex:1, background:"transparent", border:"1px solid var(--border-2)", color:"var(--text-2)", borderRadius:10, padding:14, fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:"var(--font-body)" }}>
                    ← Volver
                  </button>
                  <button onClick={siguientePaso}
                    style={{ flex:2, background:"var(--copper)", color:"#0f0f0f", border:"none", borderRadius:10, padding:14, fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:"var(--font-body)", letterSpacing:"0.08em", textTransform:"uppercase" }}>
                    Ir al pago →
                  </button>
                </div>
              </div>
            )}

            {/* PASO 3 — Pago */}
            {paso === 3 && (
              <div style={{ background:"var(--bg-2)", border:"1px solid var(--border)", borderRadius:14, padding:24 }}>
                <div className="t-label" style={{ marginBottom:20 }}>Método de pago</div>
                <div style={{ background:"rgba(76,175,138,0.06)", border:"1px solid rgba(76,175,138,0.15)", borderRadius:8, padding:"10px 14px", marginBottom:20, display:"flex", alignItems:"center", gap:8 }}>
                  <span style={{ fontSize:14 }}>🔒</span>
                  <span className="t-sm" style={{ color:"var(--green)" }}>Pago 100% seguro con MercadoPago</span>
                </div>
                {enviando && (
                  <div style={{ textAlign:"center", padding:"20px 0" }}>
                    <div style={{ width:32, height:32, border:"2px solid var(--border-2)", borderTopColor:"var(--copper)", borderRadius:"50%", animation:"spin 0.8s linear infinite", margin:"0 auto 12px" }} />
                    <p className="t-sm">Procesando tu pago...</p>
                    <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
                  </div>
                )}
                <div id="cardPaymentBrick_container" />
                <button onClick={() => { setPaso(2); setError(""); }}
                  style={{ width:"100%", marginTop:16, background:"transparent", border:"1px solid var(--border-2)", color:"var(--text-2)", borderRadius:10, padding:12, fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:"var(--font-body)" }}>
                  ← Volver
                </button>
              </div>
            )}
          </div>

          {/* Resumen */}
          <div className="resumen" style={{ background:"var(--bg-2)", border:"1px solid var(--border)", borderRadius:14, padding:20, position:"sticky", top:80, overflow:"hidden", maxWidth:"100%" }}>
            <div className="t-label" style={{ marginBottom:16 }}>Resumen del pedido</div>

            <div style={{ display:"flex", flexDirection:"column", gap:12, marginBottom:16 }}>
              {items.map(item => (
                <div key={item.id} style={{ display:"flex", gap:12, alignItems:"center" }}>
                  <div style={{ width:52, height:52, borderRadius:8, overflow:"hidden", background:"var(--bg-3)", flexShrink:0 }}>
                    <img src={item.imagen} alt={item.nombre} style={{ width:"100%", height:"100%", objectFit:"cover" }} />
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div className="t-sm" style={{ color:"var(--text)", fontWeight:500, lineHeight:1.3, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{item.nombre}</div>
                    <div className="t-xs" style={{ marginTop:2 }}>Cant: {item.cantidad}</div>
                  </div>
                  <div style={{ fontSize:13, fontWeight:700, color:"var(--text)", flexShrink:0, whiteSpace:"nowrap" }}>${(item.precioNum * item.cantidad).toLocaleString("es-AR")}</div>
                </div>
              ))}
            </div>

            <div style={{ borderTop:"1px solid var(--border)", paddingTop:14, display:"flex", flexDirection:"column", gap:8 }}>
              <div style={{ display:"flex", justifyContent:"space-between" }}>
                <span className="t-sm">Subtotal</span>
                <span className="t-sm" style={{ color:"var(--text)", fontWeight:500 }}>${subtotal.toLocaleString("es-AR")}</span>
              </div>
              <div style={{ display:"flex", justifyContent:"space-between" }}>
                <span className="t-sm">Envío</span>
                <span className="t-sm" style={{ color: costoEnvio === 0 ? "var(--green)" : "var(--copper)", fontWeight:600 }}>
                  {!provincia ? "—" : tipoEnvio === "sucursal" ? "Gratis" : getCostoFormateado(provincia)}
                </span>
              </div>
              <div style={{ display:"flex", justifyContent:"space-between", borderTop:"1px solid var(--border)", paddingTop:10, marginTop:4 }}>
                <span style={{ fontSize:15, fontWeight:700, color:"var(--text)" }}>Total</span>
                <span style={{ fontSize:16, fontWeight:800, color:"var(--text)", fontFamily:"var(--font-display)", whiteSpace:"nowrap" }}>${totalFormateado}</span>
              </div>
            </div>

            {paso > 1 && (
              <div style={{ marginTop:14, borderTop:"1px solid var(--border)", paddingTop:14 }}>
                <div className="t-xs" style={{ marginBottom:6 }}>Entrega a</div>
                <div className="t-sm" style={{ color:"var(--text)", fontWeight:500 }}>{nombre} {apellido}</div>
                {paso > 2 && (
                  <div className="t-xs" style={{ marginTop:4 }}>
                    {tipoEnvio === "domicilio" ? `${direccion}, ${ciudad}, ${provincia}` : `Sucursal: ${sucursalInfo}`}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
