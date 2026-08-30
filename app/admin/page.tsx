"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { supabase } from "../lib/supabase";
import ThemeToggle from "../components/ThemeToggle";
import "./admin.css";

const ADMIN_PASSWORD = "tiendatuc2026";
const AUTH_KEY = "tiendatuc-admin";

type Feature = {
  tipo: "video" | "imagen";
  archivo: string;
  titulo: string;
  desc: string;
};

type Producto = {
  id?: number;
  slug: string;
  nombre: string;
  descripcion: string;
  precio: string;
  precio_num: number;
  precio_anterior: string;
  descuento: number;
  ahorro: string;
  cuotas: string;
  envio_gratis: boolean;
  stock: number;
  imagenes: string[];
  features: Feature[];
  videos: { video: string; titulo: string; desc: string }[];
  packs: unknown;
  specs: unknown;
  comparativa: unknown;
  activo: boolean;
};

const VACIO: Producto = {
  slug: "",
  nombre: "",
  descripcion: "",
  precio: "",
  precio_num: 0,
  precio_anterior: "",
  descuento: 0,
  ahorro: "",
  cuotas: "3 y 6 cuotas sin interés",
  envio_gratis: true,
  stock: 10,
  imagenes: [],
  features: [],
  videos: [],
  packs: [],
  specs: [],
  comparativa: [],
  activo: true,
};

const aNumero = (v: unknown) => Number(String(v ?? "").replace(/\D/g, "")) || 0;
const fmtARS = (n: number) =>
  n > 0 ? "$" + Math.round(n).toLocaleString("es-AR") : "";
const pctOff = (actual: number, anterior: number) =>
  anterior > actual && actual > 0 ? Math.round((1 - actual / anterior) * 100) : 0;

function slugify(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

function frasesDe(texto: string) {
  return String(texto || "")
    .split(/\.\s+/)
    .map((f) => f.trim().replace(/\.$/, ""))
    .filter(Boolean);
}

function safeName(name: string) {
  return name.replace(/[^\w.\-]+/g, "_").slice(0, 80);
}

function moveItem<T>(arr: T[], from: number, to: number) {
  const next = [...arr];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

function normalizar(prod: any): Producto {
  const features: Feature[] = (prod.features || []).map((f: any) => ({
    tipo: f.tipo || (f.video ? "video" : "imagen"),
    archivo: f.archivo || f.video || f.imagen || "",
    titulo: f.titulo || "",
    desc: f.desc || f.descripcion || "",
  }));
  return {
    ...VACIO,
    ...prod,
    precio: prod.precio || fmtARS(prod.precio_num) || "",
    precio_num: aNumero(prod.precio) || Number(prod.precio_num) || 0,
    precio_anterior: prod.precio_anterior || "",
    imagenes: Array.isArray(prod.imagenes) ? prod.imagenes.filter(Boolean) : [],
    features,
    videos: prod.videos || [],
    packs: prod.packs ?? [],
    specs: prod.specs ?? [],
    comparativa: prod.comparativa ?? [],
    activo: prod.activo !== false,
  };
}

export default function AdminPage() {
  const [auth, setAuth] = useState(false);
  const [sesionLista, setSesionLista] = useState(false);
  const [pass, setPass] = useState("");
  const [passErr, setPassErr] = useState("");
  const [productos, setProductos] = useState<Producto[]>([]);
  const [cargando, setCargando] = useState(false);
  const [vista, setVista] = useState<"lista" | "editor">("lista");
  const [p, setP] = useState<Producto>(VACIO);
  const [slugManual, setSlugManual] = useState(false);
  const [editSlug, setEditSlug] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [msg, setMsg] = useState<{ tipo: "ok" | "err"; texto: string } | null>(null);
  const [busqueda, setBusqueda] = useState("");
  const [uploadingImg, setUploadingImg] = useState("");
  const [uploadingVid, setUploadingVid] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  const imgInputRef = useRef<HTMLInputElement>(null);
  const vidInputRef = useRef<HTMLInputElement>(null);
  const snapshotRef = useRef("");

  useEffect(() => {
    try {
      if (sessionStorage.getItem(AUTH_KEY) === "1") setAuth(true);
    } catch {
      /* ignore */
    }
    setSesionLista(true);
  }, []);

  useEffect(() => {
    if (auth) cargar();
  }, [auth]);

  const cargar = async () => {
    setCargando(true);
    const { data } = await supabase.from("productos").select("*").order("id");
    if (data) setProductos(data.map(normalizar));
    setCargando(false);
  };

  const entrar = () => {
    if (pass === ADMIN_PASSWORD) {
      setAuth(true);
      try {
        sessionStorage.setItem(AUTH_KEY, "1");
      } catch {
        /* ignore */
      }
    } else {
      setPassErr("Contraseña incorrecta");
    }
  };

  const salir = () => {
    setAuth(false);
    setVista("lista");
    try {
      sessionStorage.removeItem(AUTH_KEY);
    } catch {
      /* ignore */
    }
  };

  const patch = (parcial: Partial<Producto>) =>
    setP((prev) => ({ ...prev, ...parcial }));

  const abrirNuevo = () => {
    setP(VACIO);
    setSlugManual(false);
    setEditSlug(false);
    snapshotRef.current = JSON.stringify(VACIO);
    setMsg(null);
    setVista("editor");
  };

  const abrirEditar = (prod: Producto) => {
    const n = normalizar(prod);
    setP(n);
    setSlugManual(true);
    setEditSlug(false);
    snapshotRef.current = JSON.stringify(n);
    setMsg(null);
    setVista("editor");
  };

  const sucio = JSON.stringify(p) !== snapshotRef.current;

  const volver = () => {
    if (sucio && !confirm("Hay cambios sin guardar. ¿Salir igual?")) return;
    setVista("lista");
    setMsg(null);
  };

  const onNombre = (nombre: string) => {
    if (slugManual) patch({ nombre });
    else patch({ nombre, slug: slugify(nombre) });
  };

  const precioAntNum = aNumero(p.precio_anterior);
  const descuento = pctOff(p.precio_num, precioAntNum);
  const ahorro = precioAntNum > p.precio_num ? precioAntNum - p.precio_num : 0;
  const frases = frasesDe(p.descripcion);
  const otrosFeatures = p.features.filter((f) => f.tipo !== "video");

  const checklist = useMemo(
    () => [
      { ok: !!p.nombre.trim(), label: "Nombre del producto" },
      { ok: p.precio_num > 0, label: "Precio de venta" },
      { ok: p.imagenes.length > 0, label: "Al menos una foto" },
    ],
    [p.nombre, p.precio_num, p.imagenes.length]
  );
  const listo = checklist.every((c) => c.ok);

  const filtrados = productos.filter((prod) => {
    const q = busqueda.trim().toLowerCase();
    if (!q) return true;
    return (
      prod.nombre.toLowerCase().includes(q) ||
      prod.slug.toLowerCase().includes(q)
    );
  });

  const uploadFile = async (file: File, path: string) => {
    const { error } = await supabase.storage
      .from("productos")
      .upload(path, file, { upsert: true });
    if (error) throw error;
    const { data: url } = supabase.storage.from("productos").getPublicUrl(path);
    return url.publicUrl;
  };

  const handleUploadImagenes = async (files: FileList | File[]) => {
    const list = Array.from(files).filter((f) => f.type.startsWith("image/"));
    if (!list.length) return;
    const folder = p.slug || "nuevo";
    try {
      const urls: string[] = [];
      for (let i = 0; i < list.length; i++) {
        const f = list[i];
        setUploadingImg(`Subiendo ${i + 1} de ${list.length}…`);
        const path = `${folder}/${Date.now()}_${safeName(f.name)}`;
        urls.push(await uploadFile(f, path));
      }
      setP((prev) => ({ ...prev, imagenes: [...prev.imagenes, ...urls] }));
    } catch (e: any) {
      setMsg({ tipo: "err", texto: "No se pudo subir la foto: " + e.message });
    }
    setUploadingImg("");
  };

  const handleUploadVideo = async (file: File) => {
    setUploadingVid(true);
    try {
      const folder = p.slug || "nuevo";
      const path = `videos/${folder}/${Date.now()}_${safeName(file.name)}`;
      const url = await uploadFile(file, path);
      setP((prev) => ({
        ...prev,
        features: [
          ...prev.features,
          { tipo: "video", archivo: url, titulo: "", desc: "" },
        ],
      }));
    } catch (e: any) {
      setMsg({ tipo: "err", texto: "No se pudo subir el video: " + e.message });
    }
    setUploadingVid(false);
  };

  const handleGuardar = async () => {
    if (!p.nombre.trim()) {
      setMsg({ tipo: "err", texto: "Ponéle un nombre al producto." });
      return;
    }
    if (p.precio_num <= 0) {
      setMsg({ tipo: "err", texto: "Ingresá el precio de venta." });
      return;
    }
    if (!p.imagenes.length) {
      setMsg({ tipo: "err", texto: "Subí al menos una foto para el catálogo." });
      return;
    }

    const slug = p.slug || slugify(p.nombre);
    if (!slug) {
      setMsg({ tipo: "err", texto: "El nombre no genera un enlace válido." });
      return;
    }

    setGuardando(true);
    setMsg(null);

    const videoFeatures = p.features
      .filter((f) => f.tipo === "video" && f.archivo)
      .map((f) => ({
        tipo: "video" as const,
        archivo: f.archivo,
        video: f.archivo,
        imagen: "",
        titulo: f.titulo,
        desc: f.desc || "",
      }));

    const data: any = {
      slug,
      nombre: p.nombre.trim(),
      descripcion: p.descripcion.trim(),
      precio: fmtARS(p.precio_num),
      precio_num: p.precio_num,
      precio_anterior: precioAntNum ? fmtARS(precioAntNum) : "",
      descuento,
      ahorro: ahorro ? fmtARS(ahorro) : "",
      cuotas: p.cuotas.trim() || "3 y 6 cuotas sin interés",
      envio_gratis: p.envio_gratis,
      stock: Number(p.stock) || 0,
      imagenes: p.imagenes.filter(Boolean),
      features: [...videoFeatures, ...otrosFeatures],
      videos: videoFeatures.map((f) => ({
        video: f.archivo,
        titulo: f.titulo,
        desc: f.desc || "",
      })),
      packs: p.packs ?? [],
      specs: p.specs ?? [],
      comparativa: p.comparativa ?? [],
      activo: p.activo,
    };

    let { error: err } = p.id
      ? await supabase.from("productos").update(data).eq("id", p.id)
      : await supabase.from("productos").insert(data);

    if (err && /packs/i.test(err.message)) {
      delete data.packs;
      const res = p.id
        ? await supabase.from("productos").update(data).eq("id", p.id)
        : await supabase.from("productos").insert(data);
      err = res.error;
    }

    setGuardando(false);
    if (err) {
      setMsg({ tipo: "err", texto: "No se pudo guardar: " + err.message });
      return;
    }

    snapshotRef.current = JSON.stringify({ ...p, slug });
    setMsg({ tipo: "ok", texto: p.id ? "Cambios guardados" : "Producto publicado" });
    await cargar();
    setTimeout(() => {
      setVista("lista");
      setMsg(null);
    }, 900);
  };

  const toggleActivo = async (prod: Producto) => {
    if (!prod.id) return;
    const next = !prod.activo;
    const { error } = await supabase
      .from("productos")
      .update({ activo: next })
      .eq("id", prod.id);
    if (error) {
      setMsg({ tipo: "err", texto: error.message });
      return;
    }
    setProductos((prev) =>
      prev.map((x) => (x.id === prod.id ? { ...x, activo: next } : x))
    );
  };

  const borrar = async (prod: Producto) => {
    if (!prod.id) return;
    if (
      !confirm(
        `¿Eliminar “${prod.nombre}”? Deja de verse en la tienda. Esta acción no se puede deshacer.`
      )
    )
      return;
    const { error } = await supabase.from("productos").delete().eq("id", prod.id);
    if (error) {
      setMsg({ tipo: "err", texto: "No se pudo eliminar: " + error.message });
      return;
    }
    setProductos((prev) => prev.filter((x) => x.id !== prod.id));
  };

  if (!sesionLista) {
    return <div className="adm-app" />;
  }

  if (!auth) {
    return (
      <div className="adm-app adm-login">
        <div className="adm-login-card">
          <h1>Publicar productos</h1>
          <p>Entrá para cargar o editar lo que se ve en la tienda.</p>
          {passErr && (
            <div className="adm-msg err" style={{ marginBottom: 14 }}>
              {passErr}
            </div>
          )}
          <label className="adm-label">Contraseña</label>
          <input
            className="adm-input"
            type="password"
            value={pass}
            onChange={(e) => {
              setPass(e.target.value);
              setPassErr("");
            }}
            onKeyDown={(e) => e.key === "Enter" && entrar()}
            placeholder="••••••••"
            autoFocus
            style={{ marginBottom: 14 }}
          />
          <button className="adm-btn adm-btn-primary" style={{ width: "100%", height: 44 }} onClick={entrar}>
            Entrar
          </button>
        </div>
      </div>
    );
  }

  if (vista === "lista") {
    return (
      <div className="adm-app">
        <header className="adm-top">
          <div className="adm-top-left">
            <span className="adm-brand">TiendaTuc</span>
          </div>
          <div className="adm-top-right">
            <ThemeToggle />
            <button className="adm-btn adm-btn-ghost adm-btn-sm" onClick={salir}>
              Salir
            </button>
          </div>
        </header>

        <div className="adm-wrap">
          <div className="adm-hero">
            <div>
              <h1>Tus productos</h1>
              <p>
                Acá cargás lo que ven tus clientes: nombre, fotos y precio. El resto
                de la ficha se arma solo.
              </p>
            </div>
            <button className="adm-btn adm-btn-primary" onClick={abrirNuevo}>
              + Nuevo producto
            </button>
          </div>

          {msg && <div className={`adm-msg ${msg.tipo}`} style={{ marginBottom: 14 }}>{msg.texto}</div>}

          {productos.length > 0 && (
            <div className="adm-toolbar">
              <div className="adm-search">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.35-4.35" />
                </svg>
                <input
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  placeholder="Buscar por nombre…"
                />
              </div>
            </div>
          )}

          {cargando && <p className="adm-section-lead">Cargando productos…</p>}

          {!cargando && productos.length === 0 && (
            <div className="adm-empty">
              <div style={{ fontSize: 32 }}>📦</div>
              <h2>Todavía no hay productos</h2>
              <p>Publicá el primero: nombre, fotos y precio. En un minuto está en la tienda.</p>
              <button className="adm-btn adm-btn-primary" onClick={abrirNuevo}>
                Publicar el primero
              </button>
            </div>
          )}

          <div className="adm-list">
            {filtrados.map((prod) => (
              <div key={prod.id} className="adm-row">
                <div className="adm-row-img">
                  {prod.imagenes[0] ? <img src={prod.imagenes[0]} alt="" /> : null}
                </div>
                <div className="adm-row-body">
                  <strong>{prod.nombre || "Sin nombre"}</strong>
                  <div className="adm-row-meta">
                    {prod.precio || "Sin precio"}
                    {prod.stock != null && ` · ${prod.stock} en stock`}
                  </div>
                </div>
                <span className={`adm-badge ${prod.activo ? "adm-badge-on" : "adm-badge-off"}`}>
                  {prod.activo ? "Visible" : "Oculto"}
                </span>
                <div className="adm-row-actions">
                  <button
                    className="adm-btn adm-btn-ghost adm-btn-sm"
                    onClick={() => toggleActivo(prod)}
                    title={prod.activo ? "Ocultar de la tienda" : "Mostrar en la tienda"}
                  >
                    {prod.activo ? "Ocultar" : "Mostrar"}
                  </button>
                  {prod.slug && (
                    <a
                      className="adm-btn adm-btn-ghost adm-btn-sm"
                      href={`/productos/${prod.slug}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Ver
                    </a>
                  )}
                  <button className="adm-btn adm-btn-primary adm-btn-sm" onClick={() => abrirEditar(prod)}>
                    Editar
                  </button>
                  <button className="adm-btn adm-btn-danger adm-btn-sm" onClick={() => borrar(prod)}>
                    Borrar
                  </button>
                </div>
              </div>
            ))}
            {!cargando && productos.length > 0 && filtrados.length === 0 && (
              <div className="adm-empty">
                <h2>Sin resultados</h2>
                <p>Ningún producto coincide con “{busqueda}”.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="adm-app">
      <header className="adm-top">
        <div className="adm-top-left">
          <button className="adm-btn adm-btn-icon" onClick={volver} aria-label="Volver">
            ←
          </button>
          <span className="adm-top-title">
            {p.id ? p.nombre || "Editar producto" : "Nuevo producto"}
          </span>
        </div>
        <div className="adm-top-right">
          {msg && <span className={`adm-msg ${msg.tipo}`}>{msg.texto}</span>}
          <ThemeToggle />
          <button className="adm-btn adm-btn-ghost adm-btn-sm adm-hide-sm" onClick={volver}>
            Cancelar
          </button>
          <button className="adm-btn adm-btn-primary" onClick={handleGuardar} disabled={guardando}>
            {guardando ? "Guardando…" : p.id ? "Guardar cambios" : "Publicar en la tienda"}
          </button>
        </div>
      </header>

      <div className="adm-editor">
        <div className="adm-stack">
          <section className="adm-section">
            <h2>1. ¿Qué estás vendiendo?</h2>
            <p className="adm-section-lead">
              El nombre y la descripción son lo primero que lee el cliente en la ficha.
            </p>
            <div className="adm-field">
              <label className="adm-label">Nombre</label>
              <input
                className="adm-input"
                value={p.nombre}
                onChange={(e) => onNombre(e.target.value)}
                placeholder="Ej: Aspiradora portátil para auto"
              />
              <div className="adm-url">
                <span>Enlace:</span>
                {editSlug ? (
                  <input
                    className="adm-input"
                    style={{ maxWidth: 280, height: 32, padding: "4px 8px", fontSize: 12 }}
                    value={p.slug}
                    onChange={(e) => {
                      setSlugManual(true);
                      patch({ slug: slugify(e.target.value) });
                    }}
                  />
                ) : (
                  <code>/productos/{p.slug || "…"}</code>
                )}
                <button type="button" onClick={() => setEditSlug((v) => !v)}>
                  {editSlug ? "Listo" : "Cambiar"}
                </button>
              </div>
            </div>
            <div className="adm-field">
              <label className="adm-label">Descripción</label>
              <textarea
                className="adm-textarea"
                value={p.descripcion}
                onChange={(e) => patch({ descripcion: e.target.value })}
                placeholder="Aspirá el auto en minutos sin cable. Incluye 3 boquillas para rendijas. Batería recargable de larga duración."
              />
              <p className="adm-hint">
                Escribí con oraciones. La primera es la introducción; cada oración siguiente se muestra como un punto a favor.
              </p>
              {frases.length > 0 && (
                <div className="adm-bullets">
                  <div className="adm-bullets-title">Así se lee en la tienda</div>
                  <p style={{ fontSize: 13, color: "var(--text)", marginBottom: 8 }}>
                    {frases[0]}.
                  </p>
                  {frases.length > 1 && (
                    <ul>
                      {frases.slice(1).map((f, i) => (
                        <li key={i}>{f}.</li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>
          </section>

          <section className="adm-section">
            <h2>2. Fotos</h2>
            <p className="adm-section-lead">
              La primera foto es la portada: se ve en el catálogo, el carrito y WhatsApp. Subí varias; el cliente las recorre en la ficha.
            </p>
            <div
              className={`adm-drop${dragOver ? " over" : ""}`}
              onClick={() => imgInputRef.current?.click()}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragOver(false);
                if (e.dataTransfer.files.length) handleUploadImagenes(e.dataTransfer.files);
              }}
            >
              <div style={{ fontSize: 22 }}>📷</div>
              <strong>{uploadingImg || "Arrastrá fotos acá o hacé clic para subir"}</strong>
              <span>JPG, PNG o WEBP. Podés seleccionar varias a la vez.</span>
            </div>
            <input
              ref={imgInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              multiple
              hidden
              onChange={(e) => {
                if (e.target.files) handleUploadImagenes(e.target.files);
                e.target.value = "";
              }}
            />
            {p.imagenes.length > 0 && (
              <div className="adm-photos">
                {p.imagenes.map((img, i) => (
                  <div
                    key={img + i}
                    className="adm-photo"
                    draggable
                    onDragStart={() => setDragIndex(i)}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={() => {
                      if (dragIndex === null || dragIndex === i) return;
                      const from = dragIndex;
                      setP((prev) => ({
                        ...prev,
                        imagenes: moveItem(prev.imagenes, from, i),
                      }));
                      setDragIndex(null);
                    }}
                  >
                    <img src={img} alt="" />
                    {i === 0 && <span className="adm-photo-cover">Portada</span>}
                    <div className="adm-photo-tools">
                      <button
                        type="button"
                        disabled={i === 0}
                        onClick={() =>
                          setP((prev) => ({
                            ...prev,
                            imagenes: moveItem(prev.imagenes, i, i - 1),
                          }))
                        }
                        title="Mover a la izquierda"
                      >
                        ‹
                      </button>
                      {i !== 0 && (
                        <button
                          type="button"
                          onClick={() =>
                            setP((prev) => ({
                              ...prev,
                              imagenes: moveItem(prev.imagenes, i, 0),
                            }))
                          }
                          title="Usar como portada"
                        >
                          ★
                        </button>
                      )}
                      <button
                        type="button"
                        disabled={i === p.imagenes.length - 1}
                        onClick={() =>
                          setP((prev) => ({
                            ...prev,
                            imagenes: moveItem(prev.imagenes, i, i + 1),
                          }))
                        }
                        title="Mover a la derecha"
                      >
                        ›
                      </button>
                      <button
                        type="button"
                        className="danger"
                        onClick={() =>
                          setP((prev) => ({
                            ...prev,
                            imagenes: prev.imagenes.filter((_, j) => j !== i),
                          }))
                        }
                        title="Quitar"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="adm-section">
            <h2>3. Videos (opcional)</h2>
            <p className="adm-section-lead">
              Se muestran en la galería, después de las fotos. Un video corto del producto en uso ayuda mucho.
            </p>
            <input
              ref={vidInputRef}
              type="file"
              accept="video/mp4,video/webm,video/quicktime"
              hidden
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleUploadVideo(file);
                e.target.value = "";
              }}
            />
            <div className="adm-videos">
              {p.features.map((v, idx) =>
                v.tipo === "video" && v.archivo ? (
                  <div key={`${v.archivo}-${idx}`} className="adm-video">
                    <video src={v.archivo} muted playsInline preload="metadata" />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <input
                        className="adm-input"
                        value={v.titulo}
                        placeholder="Título corto (opcional), ej: Cómo se usa"
                        onChange={(e) => {
                          const arr = [...p.features];
                          arr[idx] = { ...arr[idx], titulo: e.target.value };
                          patch({ features: arr });
                        }}
                      />
                    </div>
                    <button
                      className="adm-btn adm-btn-danger adm-btn-sm"
                      onClick={() =>
                        patch({ features: p.features.filter((_, j) => j !== idx) })
                      }
                    >
                      Quitar
                    </button>
                  </div>
                ) : null
              )}
              <button
                className="adm-btn adm-btn-ghost"
                style={{ width: "100%" }}
                onClick={() => vidInputRef.current?.click()}
                disabled={uploadingVid}
              >
                {uploadingVid ? "Subiendo video…" : "+ Subir un video"}
              </button>
            </div>
          </section>

          <section className="adm-section">
            <h2>4. Precio y stock</h2>
            <p className="adm-section-lead">
              El cliente paga el precio de venta por 1 Pack. En la ficha también se ofrece un 2 Pack
              un 15% más barato por unidad, para que convenga llevar dos.
              Si cargás un precio anterior más alto, se tacha como oferta.
            </p>
            <div className="adm-two">
              <div className="adm-field">
                <label className="adm-label">Precio de venta</label>
                <input
                  className="adm-input"
                  inputMode="numeric"
                  value={p.precio_num ? fmtARS(p.precio_num) : ""}
                  placeholder="$39.900"
                  onChange={(e) =>
                    patch({
                      precio_num: aNumero(e.target.value),
                      precio: fmtARS(aNumero(e.target.value)),
                    })
                  }
                />
                <p className="adm-hint">Lo que paga por 1 unidad.</p>
              </div>
              <div className="adm-field">
                <label className="adm-label">Precio anterior (opcional)</label>
                <input
                  className="adm-input"
                  inputMode="numeric"
                  value={precioAntNum ? fmtARS(precioAntNum) : ""}
                  placeholder="$49.900"
                  onChange={(e) => patch({ precio_anterior: fmtARS(aNumero(e.target.value)) })}
                />
                <p className="adm-hint">Se tacha para mostrar el descuento.</p>
              </div>
            </div>
            {p.precio_num > 0 && (
              <div className="adm-offer">
                En la tienda se ve: <strong>{fmtARS(p.precio_num)}</strong>
                {precioAntNum > 0 && <s>{fmtARS(precioAntNum)}</s>}
                {descuento > 0 && <span className="adm-off">-{descuento}%</span>}
                {ahorro > 0 && (
                  <div className="adm-hint" style={{ marginTop: 6 }}>
                    El cliente ahorra {fmtARS(ahorro)} respecto del precio anterior.
                  </div>
                )}
              </div>
            )}
            <div className="adm-two" style={{ marginTop: 16 }}>
              <div className="adm-field">
                <label className="adm-label">Unidades en stock</label>
                <input
                  className="adm-input"
                  type="number"
                  min={0}
                  value={p.stock}
                  onChange={(e) => patch({ stock: Number(e.target.value) })}
                />
              </div>
              <div className="adm-field">
                <label className="adm-label">Texto de cuotas</label>
                <input
                  className="adm-input"
                  value={p.cuotas}
                  onChange={(e) => patch({ cuotas: e.target.value })}
                  placeholder="3 y 6 cuotas sin interés"
                />
              </div>
            </div>
            <div className="adm-switch-row">
              <div className="adm-switch-copy">
                <strong>Envío gratis</strong>
                <span>Se muestra “Llega gratis a todo el país” en la ficha.</span>
              </div>
              <label className="adm-switch">
                <input
                  type="checkbox"
                  checked={p.envio_gratis}
                  onChange={(e) => patch({ envio_gratis: e.target.checked })}
                />
                <span />
              </label>
            </div>
          </section>

          <section className="adm-section">
            <h2>5. Visibilidad</h2>
            <p className="adm-section-lead">
              Si está oculto, no aparece en el catálogo. Podés dejarlo guardado y mostrarlo después.
            </p>
            <div className="adm-switch-row">
              <div className="adm-switch-copy">
                <strong>Mostrar en la tienda</strong>
                <span>
                  {p.activo
                    ? "Los clientes lo van a ver apenas lo publiques."
                    : "Queda guardado, pero nadie lo ve hasta que lo actives."}
                </span>
              </div>
              <label className="adm-switch">
                <input
                  type="checkbox"
                  checked={p.activo}
                  onChange={(e) => patch({ activo: e.target.checked })}
                />
                <span />
              </label>
            </div>
          </section>
        </div>

        <aside className="adm-side">
          <div className="adm-preview">
            <div className="adm-preview-label">Vista previa en el catálogo</div>
            <div className="adm-preview-img">
              {p.imagenes[0] ? (
                <img src={p.imagenes[0]} alt="" />
              ) : (
                "La portada aparece acá"
              )}
            </div>
            <div className="adm-preview-body">
              <h3>{p.nombre || "Nombre del producto"}</h3>
              <div className="adm-preview-price">
                {p.precio_num ? fmtARS(p.precio_num) : "$ —"}
                {precioAntNum > 0 && (
                  <s style={{ fontSize: 13, fontWeight: 600, color: "var(--text-3)", marginLeft: 8 }}>
                    {fmtARS(precioAntNum)}
                  </s>
                )}
              </div>
              <div className="adm-preview-cuotas">{p.cuotas || "3 y 6 cuotas sin interés"}</div>
              {p.envio_gratis && (
                <div style={{ fontSize: 12, color: "var(--text-3)", fontWeight: 700, marginTop: 6 }}>
                  Envío gratis
                </div>
              )}
            </div>
          </div>

          <div className="adm-checklist">
            <h3>Para publicar</h3>
            {checklist.map((c) => (
              <div key={c.label} className="adm-check">
                <span className={`adm-dot ${c.ok ? "on" : "off"}`}>{c.ok ? "✓" : ""}</span>
                {c.label}
              </div>
            ))}
          </div>

          <div className="adm-footer-actions">
            <button
              className="adm-btn adm-btn-primary"
              style={{ width: "100%", height: 44 }}
              onClick={handleGuardar}
              disabled={guardando || !listo}
            >
              {guardando ? "Guardando…" : p.id ? "Guardar cambios" : "Publicar en la tienda"}
            </button>
            {!listo && (
              <p className="adm-hint" style={{ textAlign: "center" }}>
                Completá nombre, precio y una foto.
              </p>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
