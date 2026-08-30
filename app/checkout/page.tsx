"use client";
import { useState, useEffect, useRef, Fragment } from "react";
import { useCart } from "../store/cartStore";
import "./checkout.css";

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
  if (PROVINCIAS_FIXY.includes(prov)) return { nombre: "Fixy", desc: "Entrega express en CABA y GBA" };
  return { nombre: "Urbano Express", desc: "Entrega en todo el país" };
};

const PROVINCIAS = [
  "Buenos Aires","CABA","Catamarca","Chaco","Chubut","Córdoba","Corrientes",
  "Entre Ríos","Formosa","Jujuy","La Pampa","La Rioja","Mendoza","Misiones",
  "Neuquén","Río Negro","Salta","San Juan","San Luis","Santa Cruz","Santa Fe",
  "Santiago del Estero","Tierra del Fuego","Tucumán"
];

const svg = { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };

const ico = {
  candado: <svg {...svg} width="14" height="14"><rect x="3" y="11" width="18" height="10" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>,
  camion: <svg {...svg} width="18" height="18"><rect x="1" y="7" width="14" height="9" rx="1" /><path d="M15 10h3.5l3 3v3H15" /><circle cx="6" cy="19" r="1.8" /><circle cx="17.5" cy="19" r="1.8" /></svg>,
  casa: <svg {...svg} width="22" height="22"><path d="m3 10 9-7 9 7v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><path d="M9 21v-7h6v7" /></svg>,
  caja: <svg {...svg} width="22" height="22"><path d="m21 8-9-5-9 5 9 5 9-5Z" /><path d="M3 8v8l9 5 9-5V8" /><path d="M12 13v8" /></svg>,
  rayo: <svg {...svg} width="22" height="22"><path d="M13 2 4 14h7l-1 8 9-12h-7l1-8Z" /></svg>,
  escudo: <svg {...svg} width="16" height="16"><path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3Z" /><path d="m9 12 2 2 4-4" /></svg>,
  volver: <svg {...svg} width="16" height="16" strokeWidth={2}><path d="M19 12H5" /><path d="m12 19-7-7 7-7" /></svg>,
  seguir: <svg {...svg} width="16" height="16" strokeWidth={2}><path d="M5 12h13" /><path d="m12 5 7 7-7 7" /></svg>,
  chevron: <svg {...svg} width="16" height="16" strokeWidth={2}><path d="m6 9 6 6 6-6" /></svg>,
  alerta: <svg {...svg} width="16" height="16"><circle cx="12" cy="12" r="9" /><path d="M12 8v5" /><path d="M12 16h.01" /></svg>,
};

export default function CheckoutPage() {
  const { items, vaciar } = useCart();
  const [paso, setPaso] = useState<Paso>(1);
  const [tipoEnvio, setTipoEnvio] = useState<TipoEnvio>("domicilio");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");
  const [errores, setErrores] = useState<Record<string, string>>({});
  const [mpReady, setMpReady] = useState(false);
  const [brickListo, setBrickListo] = useState(false);
  const [resumenAbierto, setResumenAbierto] = useState(false);

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
  const fmt = (n: number) => "$" + Math.round(n || 0).toLocaleString("es-AR");

  const brickRef = useRef<any>(null);
  const creatingBrick = useRef(false);
  const pedidoRef = useRef({
    nombre, apellido, email, telefono, dni, notas,
    tipoEnvio, direccion, apartamento, ciudad, provincia, codigoPostal, sucursalInfo,
    items, total, costoEnvio, vaciar,
  });
  pedidoRef.current = {
    nombre, apellido, email, telefono, dni, notas,
    tipoEnvio, direccion, apartamento, ciudad, provincia, codigoPostal, sucursalInfo,
    items, total, costoEnvio, vaciar,
  };

  // Cargar MercadoPago SDK
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mark = () => setMpReady(true);
    if ((window as any).MercadoPago) {
      mark();
      return;
    }
    const src = "https://sdk.mercadopago.com/js/v2";
    let script = document.querySelector(`script[src="${src}"]`) as HTMLScriptElement | null;
    if (script) {
      script.addEventListener("load", mark);
      if ((window as any).MercadoPago) mark();
      return;
    }
    script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.onload = mark;
    document.body.appendChild(script);
  }, []);

  // Brick: una sola instancia. No se destruye en el remount de React (si no, el spinner queda eterno).
  useEffect(() => {
    if (paso !== 3) {
      try { brickRef.current?.unmount?.(); } catch { /* ignore */ }
      brickRef.current = null;
      creatingBrick.current = false;
      setBrickListo(false);
      return;
    }
    if (!mpReady || typeof window === "undefined") return;
    if (brickRef.current) {
      setBrickListo(true);
      return;
    }
    if (creatingBrick.current) return;

    creatingBrick.current = true;

    const renderBrick = async () => {
      const waitForContainer = async () => {
        for (let i = 0; i < 20; i++) {
          const el = document.getElementById("cardPaymentBrick_container");
          if (el) return el;
          await new Promise(r => setTimeout(r, 50));
        }
        return null;
      };

      const container = await waitForContainer();
      if (!container) {
        creatingBrick.current = false;
        setError("Error al inicializar el pago.");
        return;
      }

      try {
        const mp = new (window as any).MercadoPago("APP_USR-64a7eb8e-5ae0-45e0-a0d1-827f25e9c4b8", { locale: "es-AR" });
        const d0 = pedidoRef.current;
        const controller = await mp.bricks().create("cardPayment", "cardPaymentBrick_container", {
          initialization: {
            amount: d0.total,
            payer: { email: d0.email },
          },
          customization: {
            visual: { style: { theme: document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "default" } },
            paymentMethods: { maxInstallments: 12 },
          },
          callbacks: {
            onReady: () => setBrickListo(true),
            onSubmit: async (payload: any) => {
              const card = payload?.token ? payload : (payload?.formData ?? payload);
              const d = pedidoRef.current;
              setEnviando(true);
              setError("");
              try {
                const payRes = await fetch("/api/procesar-pago", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    formData: card,
                    pedido: {
                      nombre: `${d.nombre} ${d.apellido}`,
                      email: d.email,
                      telefono: d.telefono,
                      dni: d.dni,
                      notas: d.notas,
                      tipoEnvio: d.tipoEnvio,
                      direccion: d.tipoEnvio === "domicilio"
                        ? `${d.direccion}${d.apartamento ? `, ${d.apartamento}` : ""}, ${d.ciudad}, ${d.provincia} (CP: ${d.codigoPostal})`
                        : d.sucursalInfo,
                      items: d.items,
                      total: d.total,
                      costoEnvio: d.costoEnvio,
                    },
                  }),
                });
                const result = await payRes.json();
                if (result.status === "approved") {
                  d.vaciar();
                  window.location.href = "/gracias";
                  return;
                }
                setError("El pago no fue aprobado. Revisá los datos e intentá de nuevo.");
                throw new Error(result.detail || "rejected");
              } catch (err) {
                if (!(err instanceof Error) || err.message === "rejected") {
                  /* ya hay mensaje */
                } else {
                  setError("Hubo un error procesando el pago. Intentá de nuevo.");
                }
                throw err;
              } finally {
                setEnviando(false);
              }
            },
            onError: () => setError("Error al cargar el formulario de pago."),
          },
        });

        brickRef.current = controller;
        creatingBrick.current = false;
        setBrickListo(true);
      } catch {
        creatingBrick.current = false;
        setError("Error al inicializar el pago.");
      }
    };

    renderBrick();
  }, [paso, mpReady]);

  const validarPaso1 = () => {
    const e: Record<string, string> = {};
    if (!nombre.trim()) e.nombre = "Ingresá tu nombre";
    if (!apellido.trim()) e.apellido = "Ingresá tu apellido";
    if (dni.replace(/\D/g, "").length < 7) e.dni = "Ingresá un DNI válido";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = "Ingresá un email válido";
    if (telefono.replace(/\D/g, "").length < 8) e.telefono = "Ingresá un teléfono válido";
    return e;
  };

  const validarPaso2 = () => {
    const e: Record<string, string> = {};
    if (!provincia) e.provincia = "Seleccioná tu provincia";
    if (tipoEnvio === "domicilio") {
      if (!direccion.trim()) e.direccion = "Ingresá tu dirección";
      if (!ciudad.trim()) e.ciudad = "Ingresá tu ciudad";
      if (!codigoPostal.trim()) e.codigoPostal = "Ingresá tu código postal";
    } else if (!sucursalInfo.trim()) {
      e.sucursalInfo = "Ingresá la dirección de la sucursal";
    }
    return e;
  };

  const siguientePaso = () => {
    setError("");
    const e = paso === 1 ? validarPaso1() : paso === 2 ? validarPaso2() : {};
    setErrores(e);
    if (Object.keys(e).length > 0) {
      // El mensaje recién existe después del re-render
      requestAnimationFrame(() => {
        document.querySelector(".ck-field-err")?.scrollIntoView({ behavior: "smooth", block: "center" });
      });
      return;
    }
    setPaso((paso + 1) as Paso);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const volverA = (n: Paso) => {
    setError("");
    setErrores({});
    setPaso(n);
  };

  // Campo de formulario reutilizable (se llama como función para no perder el foco al re-renderizar)
  const campo = (p: {
    id: string; label: string; valor: string; set: (v: string) => void;
    placeholder?: string; type?: string; opcional?: boolean; ayuda?: string;
    autoComplete?: string; inputMode?: "text" | "numeric" | "tel" | "email"; area?: boolean;
  }) => {
    const err = errores[p.id];
    const onChange = (v: string) => {
      p.set(v);
      if (err) setErrores(prev => ({ ...prev, [p.id]: "" }));
    };
    return (
      <div className="ck-campo">
        <label className="ck-label" htmlFor={p.id}>
          {p.label}{p.opcional && <em> (opcional)</em>}
        </label>
        {p.area ? (
          <textarea
            id={p.id}
            className={`ck-input${err ? " err" : ""}`}
            value={p.valor}
            onChange={e => onChange(e.target.value)}
            placeholder={p.placeholder}
            rows={3}
          />
        ) : (
          <input
            id={p.id}
            className={`ck-input${err ? " err" : ""}`}
            type={p.type || "text"}
            value={p.valor}
            onChange={e => onChange(e.target.value)}
            placeholder={p.placeholder}
            autoComplete={p.autoComplete}
            inputMode={p.inputMode}
          />
        )}
        {err ? (
          <div className="ck-field-err">{ico.alerta}{err}</div>
        ) : p.ayuda ? (
          <div className="ck-ayuda">{p.ayuda}</div>
        ) : null}
      </div>
    );
  };

  const transportista = provincia ? getTransportista(provincia) : null;

  if (items.length === 0) {
    return (
      <div className="ck">
        <div className="ck-vacio">
          <div className="ck-vacio-ico">
            <svg {...svg} width="38" height="38"><circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" /><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" /></svg>
          </div>
          <h2 style={{ marginBottom: 8 }}>Todavía no hay nada acá</h2>
          <p className="t-sm" style={{ marginBottom: 24, maxWidth: 360 }}>
            Agregá un producto al carrito y volvé para completar el pedido.
          </p>
          <a href="/" className="ck-btn" style={{ display: "inline-flex", flex: "none", padding: "16px 34px" }}>
            Ver productos
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="ck">
      <div className="ck-wrap">

        <div className="ck-head">
          <div className="ck-head-left">
            <a href="/" className="ck-back" aria-label="Volver a la tienda">{ico.volver}</a>
            <div>
              <div className="ck-kicker">Completar pedido</div>
              <h1 className="ck-h1">Casi listo</h1>
              <p className="ck-lead">Tus datos, el envío y el pago. Tres pasos y el pedido queda confirmado.</p>
            </div>
          </div>
          <span className="ck-safe">{ico.candado} Pago protegido</span>
        </div>

        <nav className="ck-pasos" aria-label="Pasos del pedido">
          {([[1, "Tus datos"], [2, "Envío"], [3, "Pago"]] as const).map(([n, label], i) => {
            const done = n < paso;
            return (
              <Fragment key={n}>
                {i > 0 && <span className={`ck-paso-line${paso >= n ? " on" : ""}`} aria-hidden />}
                <button
                  type="button"
                  className={`ck-paso${n === paso ? " on" : ""}${done ? " done clickable" : ""}`}
                  onClick={() => done && volverA(n as Paso)}
                  disabled={n > paso}
                  aria-current={n === paso ? "step" : undefined}
                >
                  <span className="ck-paso-n">{done ? "✓" : n}</span>
                  <span className="ck-paso-label">{label}</span>
                </button>
              </Fragment>
            );
          })}
        </nav>

        <div className="ck-grid">

          {/* ══════════ FORMULARIO ══════════ */}
          <div>
            {error && <div className="ck-error">{ico.alerta}{error}</div>}

            {/* PASO 1 — Datos personales */}
            {paso === 1 && (
              <form className="ck-card" onSubmit={(e) => { e.preventDefault(); siguientePaso(); }}>
                <div className="ck-card-head">
                  <div className="ck-card-title">¿Cómo te contactamos?</div>
                  <div className="ck-card-sub">Con esto armamos el envío y te mandamos la confirmación del pedido.</div>
                </div>

                <div className="ck-campos">
                  <div className="ck-2col">
                    {campo({ id: "nombre", label: "Nombre", valor: nombre, set: setNombre, placeholder: "Tu nombre", autoComplete: "given-name" })}
                    {campo({ id: "apellido", label: "Apellido", valor: apellido, set: setApellido, placeholder: "Tu apellido", autoComplete: "family-name" })}
                  </div>
                  {campo({ id: "dni", label: "DNI", valor: dni, set: setDni, placeholder: "Sin puntos ni guiones", inputMode: "numeric" })}
                  {campo({ id: "email", label: "Email", valor: email, set: setEmail, placeholder: "tu@email.com", type: "email", autoComplete: "email", inputMode: "email", ayuda: "Te llega el comprobante a este correo." })}
                  {campo({ id: "telefono", label: "WhatsApp", valor: telefono, set: setTelefono, placeholder: "381 544 0596", type: "tel", autoComplete: "tel", inputMode: "tel", ayuda: "Por acá coordinamos la entrega." })}
                </div>

                <div className="ck-acciones">
                  <button type="submit" className="ck-btn">Continuar al envío {ico.seguir}</button>
                </div>
              </form>
            )}

            {/* PASO 2 — Envío */}
            {paso === 2 && (
              <form className="ck-card" onSubmit={(e) => { e.preventDefault(); siguientePaso(); }}>
                <div className="ck-card-head">
                  <div className="ck-card-title">¿Dónde lo recibís?</div>
                  <div className="ck-card-sub">Primero la provincia: según dónde estés cambia el costo y el correo.</div>
                </div>

                {/* Provincia PRIMERO — define las opciones y el costo */}
                <div className="ck-campo" style={{ marginBottom: 20 }}>
                  <label className="ck-label" htmlFor="provincia">Provincia</label>
                  <div className="ck-select">
                    <select
                      id="provincia"
                      className={`ck-input${errores.provincia ? " err" : ""}`}
                      value={provincia}
                      onChange={e => { setProvincia(e.target.value); setErrores(prev => ({ ...prev, provincia: "" })); }}
                    >
                      <option value="">Seleccioná tu provincia</option>
                      {PROVINCIAS.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                    {ico.chevron}
                  </div>
                  {errores.provincia && <div className="ck-field-err">{ico.alerta}{errores.provincia}</div>}
                </div>

                {/* Opciones de envío — solo cuando ya hay provincia */}
                {!provincia ? (
                  <div className="ck-vacio-envio">Elegí tu provincia para ver las opciones de envío y su costo.</div>
                ) : PROVINCIAS_FIXY.includes(provincia) ? (
                  <div className="ck-envios">
                    <div className="ck-envio on">
                      <span className="ck-envio-radio" aria-hidden />
                      <span className="ck-envio-ico">{ico.rayo}</span>
                      <span className="ck-envio-t">Envío a domicilio</span>
                      <span className="ck-envio-s">Fixy — Express en CABA y GBA</span>
                      <span className="ck-envio-p free">Gratis</span>
                    </div>
                  </div>
                ) : (
                  <div className="ck-envios" role="radiogroup" aria-label="Método de envío">
                    {([
                      ["domicilio", ico.casa, "Envío a domicilio", "Recibilo en tu casa"],
                      ["sucursal", ico.caja, "Retiro en sucursal", "Urbano Express"],
                    ] as const).map(([tipo, icono, titulo, sub]) => {
                      const activo = tipoEnvio === tipo;
                      const gratis = tipo === "sucursal" || getCostoEnvio(provincia) === 0;
                      return (
                        <button
                          type="button"
                          key={tipo}
                          role="radio"
                          aria-checked={activo}
                          className={`ck-envio${activo ? " on" : ""}`}
                          onClick={() => setTipoEnvio(tipo)}
                        >
                          {tipo === "sucursal" && <span className="ck-envio-tag">Recomendado</span>}
                          <span className="ck-envio-radio" aria-hidden />
                          <span className="ck-envio-ico">{icono}</span>
                          <span className="ck-envio-t">{titulo}</span>
                          <span className="ck-envio-s">{sub}</span>
                          <span className={`ck-envio-p${gratis ? " free" : ""}`}>
                            {tipo === "sucursal" ? "Gratis" : getCostoFormateado(provincia)}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}

                {tipoEnvio === "domicilio" && provincia && (
                  <div className="ck-campos">
                    {campo({ id: "direccion", label: "Dirección", valor: direccion, set: setDireccion, placeholder: "Calle y número", autoComplete: "street-address" })}
                    {campo({ id: "apartamento", label: "Piso / Depto", valor: apartamento, set: setApartamento, placeholder: "Ej: 3° B", opcional: true })}
                    <div className="ck-2col">
                      {campo({ id: "ciudad", label: "Ciudad", valor: ciudad, set: setCiudad, placeholder: "Tu ciudad", autoComplete: "address-level2" })}
                      {campo({ id: "codigoPostal", label: "Código postal", valor: codigoPostal, set: setCodigoPostal, placeholder: "Ej: 4000", autoComplete: "postal-code", inputMode: "numeric" })}
                    </div>
                    {transportista && (
                      <div className="ck-nota">
                        {ico.camion}
                        <div>
                          <b>Tu envío va con {transportista.nombre}</b>
                          <span>{transportista.desc}</span>
                        </div>
                      </div>
                    )}
                    {campo({ id: "notas", label: "Notas para el repartidor", valor: notas, set: setNotas, placeholder: "Timbre, horario, referencias…", opcional: true, area: true })}
                  </div>
                )}

                {tipoEnvio === "sucursal" && provincia && (
                  <div className="ck-campos">
                    <div className="ck-info">
                      <p>Buscá la sucursal de Urbano Express más cercana y pegá la dirección acá abajo.</p>
                      <a href="https://www.urbano.com.ar/sucursales" target="_blank" rel="noopener noreferrer">
                        Ver sucursales Urbano Express →
                      </a>
                    </div>
                    {campo({ id: "sucursalInfo", label: "Dirección de la sucursal elegida", valor: sucursalInfo, set: setSucursalInfo, placeholder: "Ej: Av. San Martín 1234, San Miguel de Tucumán, Tucumán", area: true })}
                    {campo({ id: "notas", label: "Comentario", valor: notas, set: setNotas, placeholder: "Algo que debamos saber…", opcional: true, area: true })}
                  </div>
                )}

                <div className="ck-acciones">
                  <button type="button" className="ck-btn-ghost" onClick={() => volverA(1)}>{ico.volver} Volver</button>
                  <button type="submit" className="ck-btn">Continuar al pago {ico.seguir}</button>
                </div>
              </form>
            )}

            {/* PASO 3 — Pago */}
            {paso === 3 && (
              <div className="ck-card">
                <div className="ck-card-head">
                  <div className="ck-card-title">Pagá con tarjeta</div>
                  <div className="ck-card-sub">MercadoPago procesa el cobro. No vemos ni guardamos los datos de tu tarjeta.</div>
                </div>

                <div className="ck-recap">
                  <div className="ck-recap-row">
                    <div>
                      <div className="ck-recap-k">Tus datos</div>
                      <div className="ck-recap-v">
                        <b>{nombre} {apellido}</b><br />
                        {email} · {telefono}
                      </div>
                    </div>
                    <button type="button" className="ck-recap-edit" onClick={() => volverA(1)}>Editar</button>
                  </div>
                  <div className="ck-recap-row">
                    <div>
                      <div className="ck-recap-k">{tipoEnvio === "domicilio" ? "Envío a domicilio" : "Retiro en sucursal"}</div>
                      <div className="ck-recap-v">
                        {tipoEnvio === "domicilio"
                          ? `${direccion}${apartamento ? `, ${apartamento}` : ""}, ${ciudad}, ${provincia}`
                          : sucursalInfo}
                      </div>
                    </div>
                    <button type="button" className="ck-recap-edit" onClick={() => volverA(2)}>Editar</button>
                  </div>
                </div>

                {enviando ? (
                  <div className="ck-cargando">
                    <div className="ck-spin" />
                    <p className="t-sm">Procesando tu pago...</p>
                  </div>
                ) : !brickListo && !error ? (
                  <div className="ck-cargando">
                    <div className="ck-spin" />
                    <p className="t-sm">Cargando el formulario de pago seguro...</p>
                  </div>
                ) : null}

                <div className="ck-brick" id="cardPaymentBrick_container" style={{ display: enviando ? "none" : "block" }} />

                <div className="ck-tarjetas">
                  {ico.escudo} Aceptamos tarjetas de crédito y débito · Hasta 12 cuotas
                </div>

                <div className="ck-acciones">
                  <button type="button" className="ck-btn-ghost" onClick={() => volverA(2)} disabled={enviando}>
                    {ico.volver} Volver al envío
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ══════════ RESUMEN ══════════ */}
          <aside className="ck-res">
            <button type="button" className="ck-res-top" onClick={() => setResumenAbierto(v => !v)}>
              <span className="ck-res-title">Resumen</span>
              <span className="ck-res-toggle">
                {fmt(total)}
                <span style={{ display: "flex", transform: resumenAbierto ? "rotate(180deg)" : "none", transition: "transform .2s" }}>
                  {ico.chevron}
                </span>
              </span>
            </button>

            <div className={`ck-res-body${resumenAbierto ? " on" : ""}`}>
              <div className="ck-items">
                {items.map(item => (
                  <div key={item.id} className="ck-item">
                    <div className="ck-item-img">
                      <img src={item.imagen} alt={item.nombre} />
                      <span className="ck-item-qty">{item.cantidad}</span>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="ck-item-name">{item.nombre}</div>
                    </div>
                    <div className="ck-item-precio">{fmt(item.precioNum * item.cantidad)}</div>
                  </div>
                ))}
              </div>

              <div style={{ borderTop: "1px solid var(--border)", paddingTop: 12 }}>
                <div className="ck-linea"><span>Subtotal</span><b>{fmt(subtotal)}</b></div>
                <div className="ck-linea">
                  <span>Envío</span>
                  {!provincia
                    ? <b style={{ color: "var(--text-3)" }}>A calcular</b>
                    : costoEnvio === 0
                      ? <b className="free">Gratis</b>
                      : <b>{getCostoFormateado(provincia)}</b>}
                </div>
                <div className="ck-total">
                  <span>Total</span>
                  <b>{fmt(total)}</b>
                </div>
              </div>

              {paso > 1 && nombre && (
                <div className="ck-entrega">
                  <div className="ck-entrega-t">Entrega a</div>
                  <div className="ck-entrega-n">{nombre} {apellido}</div>
                  {paso > 2 && (
                    <div className="ck-entrega-d">
                      {tipoEnvio === "domicilio"
                        ? `${direccion}${apartamento ? `, ${apartamento}` : ""}, ${ciudad}, ${provincia}`
                        : `Sucursal: ${sucursalInfo}`}
                    </div>
                  )}
                </div>
              )}

              <div className="ck-benef">
                <div>{ico.escudo} Garantía de 6 meses</div>
                <div>{ico.camion} Seguimiento del envío por email</div>
                <div>{ico.candado} Pago protegido con MercadoPago</div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
