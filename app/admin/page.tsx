"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "../lib/supabase";

const ADMIN_PASSWORD = "tiendatuc2026";

type Feature = { tipo: "video" | "imagen"; archivo: string; titulo: string; desc: string; };
type Spec = [string, string];
type Pack = { cantidad: number; precio: string; descuento: string; popular?: boolean };

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
  packs: Pack[];
  specs: Spec[];
  comparativa: string[];
  activo: boolean;
};

const VACIO: Producto = {
  slug: "", nombre: "", descripcion: "",
  precio: "$39.900", precio_num: 39900, precio_anterior: "$49.875", descuento: 20, ahorro: "$9.975", cuotas: "3 cuotas sin interés",
  envio_gratis: true, stock: 10,
  imagenes: [],
  features: [],
  videos: [],
  packs: [
    { cantidad: 1, precio: "$39.900", descuento: "20%" },
    { cantidad: 2, precio: "$69.900", descuento: "30%", popular: true },
    { cantidad: 3, precio: "$94.900", descuento: "40%" }
  ],
  specs: [["", ""]], comparativa: [""], activo: true,
};

export default function AdminPage() {
  const [auth, setAuth] = useState(false);
  const [pass, setPass] = useState("");
  const [passErr, setPassErr] = useState("");
  const [productos, setProductos] = useState<Producto[]>([]);
  const [vista, setVista] = useState<"lista" | "editor">("lista");
  const [p, setP] = useState<Producto>(VACIO);
  const [tab, setTab] = useState<"general" | "precio" | "packs" | "imagenes" | "secciones" | "specs" | "comparativa">("general");
  const [previewTab, setPreviewTab] = useState<"desktop" | "mobile">("desktop");
  const [guardando, setGuardando] = useState(false);
  const [subiendoBloque, setSubiendoBloque] = useState<number | null>(null);
  const [msg, setMsg] = useState("");
  const [uploadingImg, setUploadingImg] = useState(false);
  
  const imgInputRef = useRef<HTMLInputElement>(null);
  const fileInputBloqueRef = useRef<HTMLInputElement>(null);
  const bloqueIndexRef = useRef<number | null>(null);

  useEffect(() => { if (auth) cargar(); }, [auth]);

  const cargar = async () => {
    const { data } = await supabase.from("productos").select("*").order("id");
    if (data) setProductos(data);
  };

  const set = useCallback((field: keyof Producto, val: any) =>
    setP(prev => ({ ...prev, [field]: val })), []);

  const uploadFile = async (file: File, path: string) => {
    const { data, error } = await supabase.storage.from("productos").upload(path, file, { upsert: true });
    if (error) throw error;
    const { data: url } = supabase.storage.from("productos").getPublicUrl(path);
    return url.publicUrl;
  };

  const handleUploadImagenes = async (files: FileList) => {
    setUploadingImg(true);
    try {
      const urls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const f = files[i];
        const path = `${p.slug || "nuevo"}/${Date.now()}_${f.name}`;
        const url = await uploadFile(f, path);
        urls.push(url);
      }
      set("imagenes", [...p.imagenes, ...urls]);
    } catch (e: any) { setMsg("Error subiendo imagen: " + e.message); }
    setUploadingImg(false);
  };

  const handleUploadArchivoBloque = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const index = bloqueIndexRef.current;
    if (!file || index === null) return;

    setSubiendoBloque(index);
    try {
      const path = `secciones/${p.slug || "nuevo"}/${Date.now()}_${file.name}`;
      const url = await uploadFile(file, path);
      
      const arr = [...p.features];
      arr[index] = { ...arr[index], archivo: url };
      set("features", arr);
    } catch (err: any) {
      setMsg("Error subiendo archivo: " + err.message);
    }
    setSubiendoBloque(null);
    e.target.value = "";
  };

  const handleGuardar = async () => {
    if (!p.nombre || !p.slug) { setMsg("Nombre y slug son obligatorios"); return; }
    setGuardando(true);

    const featuresGuardables = p.features
      .filter(f => f.titulo || f.archivo)
      .map(f => ({
        tipo: f.tipo,
        archivo: f.archivo,
        video: f.tipo === "video" ? f.archivo : "",
        imagen: f.tipo === "imagen" ? f.archivo : "",
        titulo: f.titulo,
        desc: f.desc || ""
      }));

    const videosGuardables = featuresGuardables
      .filter(f => f.tipo === "video")
      .map(f => ({ video: f.archivo, titulo: f.titulo, desc: f.desc }));

    const data: any = {
      ...p,
      precio: p.precio || "$0",
      precio_num: p.precio_num || 0,
      imagenes: p.imagenes.filter(Boolean),
      comparativa: p.comparativa.filter(Boolean),
      specs: p.specs.filter(([k]) => k),
      features: featuresGuardables,
      videos: videosGuardables,
      packs: p.packs,
    };

    let { error: err } = p.id 
      ? await supabase.from("productos").update(data).eq("id", p.id)
      : await supabase.from("productos").insert(data);

    // Respaldo en caso de que falte la columna packs en la tabla
    if (err && err.message.includes("'packs'")) {
      delete data.packs;
      const res = p.id 
        ? await supabase.from("productos").update(data).eq("id", p.id)
        : await supabase.from("productos").insert(data);
      err = res.error;
    }

    if (err) setMsg("Error: " + err.message);
    else { setMsg("✓ Publicado con éxito"); await cargar(); setTimeout(() => { setVista("lista"); setMsg(""); }, 1200); }
    setGuardando(false);
  };

  const iStyle: any = { width: "100%", background: "rgba(232,228,224,0.05)", border: "1px solid rgba(232,228,224,0.12)", borderRadius: 7, padding: "9px 11px", fontSize: 13, color: "#e8e4e0", fontFamily: "inherit", outline: "none", boxSizing: "border-box" };
  const lStyle: any = { display: "block", fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(232,228,224,0.4)", marginBottom: 5 };
  const tabBtn = (active: boolean) => ({ padding: "6px 10px", fontSize: 10, fontWeight: 700, cursor: "pointer", background: active ? "#d4845a" : "transparent", color: active ? "#0f0f0f" : "rgba(232,228,224,0.5)", border: "1px solid", borderColor: active ? "#d4845a" : "rgba(232,228,224,0.12)", borderRadius: 5, fontFamily: "inherit" });

  if (!auth) return (
    <div style={{ minHeight: "100vh", background: "#0f0f0f", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: 340, background: "#141414", border: "1px solid rgba(232,228,224,0.08)", borderRadius: 14, padding: 32 }}>
        <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 22, fontWeight: 800, color: "#e8e4e0", marginBottom: 4 }}>Admin</div>
        <div style={{ fontSize: 13, color: "rgba(232,228,224,0.4)", marginBottom: 24 }}>TiendaTuc</div>
        {passErr && <div style={{ background: "rgba(224,85,85,0.08)", border: "1px solid rgba(224,85,85,0.2)", borderRadius: 8, padding: "10px 14px", marginBottom: 14, fontSize: 13, color: "#e05555" }}>{passErr}</div>}
        <label style={lStyle}>Contraseña</label>
        <input type="password" value={pass} onChange={e => setPass(e.target.value)} onKeyDown={e => e.key === "Enter" && (pass === ADMIN_PASSWORD ? setAuth(true) : setPassErr("Incorrecta"))} placeholder="••••••••" style={{ ...iStyle, marginBottom: 14 }} />
        <button onClick={() => pass === ADMIN_PASSWORD ? setAuth(true) : setPassErr("Incorrecta")} style={{ width: "100%", background: "#d4845a", color: "#0f0f0f", border: "none", borderRadius: 8, padding: 13, fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>Entrar</button>
      </div>
    </div>
  );

  if (vista === "lista") return (
    <div style={{ minHeight: "100vh", background: "#0f0f0f", padding: "32px 24px" }}>
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
          <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 22, fontWeight: 800, color: "#e8e4e0" }}>Mis productos</div>
          <button onClick={() => { setP(VACIO); setTab("general"); setVista("editor"); }} style={{ background: "#d4845a", color: "#0f0f0f", border: "none", borderRadius: 8, padding: "10px 22px", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>+ Nuevo producto</button>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {productos.map(prod => (
            <div key={prod.id} style={{ background: "#141414", border: "1px solid rgba(232,228,224,0.07)", borderRadius: 12, padding: "14px 18px", display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ width: 54, height: 54, borderRadius: 8, overflow: "hidden", background: "#1a1a1a", flexShrink: 0 }}>
                {prod.imagenes?.[0] && <img src={prod.imagenes[0]} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: "#e8e4e0" }}>{prod.nombre}</div>
                <div style={{ fontSize: 11, color: "rgba(232,228,224,0.4)", marginTop: 2 }}>{prod.precio} · /productos/{prod.slug}</div>
              </div>
              <button onClick={() => {
                const featNormalizadas = ((prod as any).features || []).map((f: any) => ({
                  tipo: f.tipo || (f.video ? "video" : "imagen"),
                  archivo: f.archivo || f.video || f.imagen || "",
                  titulo: f.titulo || "",
                  desc: f.desc || f.descripcion || ""
                }));
                setP({
                  ...prod,
                  precio: prod.precio || "$0",
                  precio_num: prod.precio_num || 0,
                  imagenes: prod.imagenes || [],
                  features: featNormalizadas,
                  packs: prod.packs || VACIO.packs,
                  specs: prod.specs || [["", ""]],
                  comparativa: prod.comparativa || [""],
                });
                setTab("general");
                setVista("editor");
              }} style={{ background: "rgba(212,132,90,0.1)", border: "1px solid rgba(212,132,90,0.2)", color: "#d4845a", borderRadius: 6, padding: "7px 14px", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>Editar</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", background: "#0a0a0a", overflow: "hidden" }}>
      <input ref={fileInputBloqueRef} type="file" accept="video/*,image/*" style={{ display: "none" }} onChange={handleUploadArchivoBloque} />
      
      {/* Topbar */}
      <div style={{ height: 52, background: "#0f0f0f", borderBottom: "1px solid rgba(232,228,224,0.07)", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 20px", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <button onClick={() => setVista("lista")} style={{ background: "none", border: "none", color: "rgba(232,228,224,0.4)", cursor: "pointer", fontSize: 20 }}>←</button>
          <span style={{ fontFamily: "'Syne',sans-serif", fontSize: 15, fontWeight: 700, color: "#e8e4e0" }}>{p.id ? "Editar producto" : "Nuevo producto"}</span>
        </div>
        {msg && <span style={{ fontSize: 12, color: msg.startsWith("✓") ? "#4caf8a" : "#e05555", fontWeight: 600 }}>{msg}</span>}
        <button onClick={handleGuardar} disabled={guardando} style={{ background: "#d4845a", color: "#0f0f0f", border: "none", borderRadius: 7, padding: "8px 20px", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
          {guardando ? "Guardando..." : "Publicar"}
        </button>
      </div>

      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        {/* PANEL IZQUIERDO */}
        <div style={{ width: 340, flexShrink: 0, background: "#0f0f0f", borderRight: "1px solid rgba(232,228,224,0.07)", display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <div style={{ padding: "10px 10px", borderBottom: "1px solid rgba(232,228,224,0.07)", display: "flex", gap: 4, flexWrap: "wrap" }}>
            {(["general", "precio", "packs", "imagenes", "secciones", "specs", "comparativa"] as const).map(t => (
              <button key={t} onClick={() => setTab(t)} style={tabBtn(tab === t)}>
                {t.toUpperCase()}
              </button>
            ))}
          </div>

          <div style={{ flex: 1, overflowY: "auto", padding: 16 }}>
            {tab === "general" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div>
                  <label style={lStyle}>Nombre del producto</label>
                  <input value={p.nombre} onChange={e => set("nombre", e.target.value)} style={iStyle} />
                </div>
                <div>
                  <label style={lStyle}>Slug (URL)</label>
                  <input value={p.slug} onChange={e => set("slug", e.target.value)} style={iStyle} />
                </div>
                <div>
                  <label style={lStyle}>Descripción General</label>
                  <textarea value={p.descripcion} onChange={e => set("descripcion", e.target.value)} rows={4} style={{ ...iStyle, resize: "none" }} />
                </div>
              </div>
            )}

            {tab === "precio" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div>
                  <label style={lStyle}>Precio Mostrar (ej: $39.900)</label>
                  <input value={p.precio} onChange={e => set("precio", e.target.value)} style={iStyle} />
                </div>
                <div>
                  <label style={lStyle}>Precio Anterior (Tachado)</label>
                  <input value={p.precio_anterior} onChange={e => set("precio_anterior", e.target.value)} style={iStyle} />
                </div>
                <div>
                  <label style={lStyle}>Precio Numérico (Checkout)</label>
                  <input type="number" value={p.precio_num} onChange={e => set("precio_num", Number(e.target.value))} style={iStyle} />
                </div>
              </div>
            )}

            {tab === "packs" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div style={{ fontSize: 11, color: "rgba(232,228,224,0.5)", marginBottom: 4 }}>Configurá los descuentos por cantidad (Packs 1, 2 y 3 unids):</div>
                {p.packs.map((pk, idx) => (
                  <div key={idx} style={{ background: "rgba(232,228,224,0.03)", border: "1px solid rgba(232,228,224,0.08)", borderRadius: 8, padding: 10 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "#d4845a", marginBottom: 6 }}>Pack {pk.cantidad} Unidad(es)</div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                      <div>
                        <label style={lStyle}>Precio</label>
                        <input value={pk.precio} onChange={e => {
                          const newPacks = [...p.packs];
                          newPacks[idx].precio = e.target.value;
                          set("packs", newPacks);
                        }} style={iStyle} />
                      </div>
                      <div>
                        <label style={lStyle}>Ahorro/Badge</label>
                        <input value={pk.descuento} onChange={e => {
                          const newPacks = [...p.packs];
                          newPacks[idx].descuento = e.target.value;
                          set("packs", newPacks);
                        }} style={iStyle} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {tab === "imagenes" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div onClick={() => imgInputRef.current?.click()} style={{ border: "1.5px dashed rgba(232,228,224,0.2)", borderRadius: 10, padding: 20, textAlign: "center", cursor: "pointer" }}>
                  <div style={{ fontSize: 12, color: "rgba(232,228,224,0.5)" }}>{uploadingImg ? "Subiendo..." : "+ Subir imágenes"}</div>
                </div>
                <input ref={imgInputRef} type="file" accept="image/*" multiple style={{ display: "none" }} onChange={e => e.target.files && handleUploadImagenes(e.target.files)} />
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8 }}>
                  {p.imagenes.map((img, i) => (
                    <div key={i} style={{ position: "relative", aspectRatio: "1", borderRadius: 8, overflow: "hidden" }}>
                      <img src={img} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      <button onClick={() => set("imagenes", p.imagenes.filter((_, j) => j !== i))} style={{ position: "absolute", top: 2, right: 2, background: "rgba(0,0,0,0.7)", color: "#fff", border: "none", borderRadius: "50%", width: 18, height: 18 }}>✕</button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {tab === "secciones" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {p.features.map((f, i) => (
                  <div key={i} style={{ background: "rgba(232,228,224,0.03)", border: "1px solid rgba(232,228,224,0.08)", borderRadius: 10, padding: 14 }}>
                    <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
                      <button onClick={() => { const arr = [...p.features]; arr[i] = { ...arr[i], tipo: "imagen" }; set("features", arr); }} style={tabBtn(f.tipo === "imagen")}>Imagen</button>
                      <button onClick={() => { const arr = [...p.features]; arr[i] = { ...arr[i], tipo: "video" }; set("features", arr); }} style={tabBtn(f.tipo === "video")}>Video MP4</button>
                    </div>

                    <div style={{ marginBottom: 8 }}>
                      <button 
                        onClick={() => {
                          bloqueIndexRef.current = i;
                          fileInputBloqueRef.current?.click();
                        }}
                        style={{ width: "100%", background: "rgba(212,132,90,0.15)", border: "1px solid #d4845a", color: "#d4845a", borderRadius: 6, padding: "8px", fontSize: 11, fontWeight: 700, cursor: "pointer", marginBottom: 6 }}
                      >
                        {subiendoBloque === i ? "Subiendo archivo..." : f.archivo ? "📁 Cambiar archivo local" : "📁 Subir Video o Imagen"}
                      </button>
                      <input value={f.archivo || ""} onChange={e => { const arr = [...p.features]; arr[i] = { ...arr[i], archivo: e.target.value }; set("features", arr); }} placeholder="O pegar URL pública" style={iStyle} />
                    </div>

                    <input value={f.titulo} onChange={e => { const arr = [...p.features]; arr[i] = { ...arr[i], titulo: e.target.value }; set("features", arr); }} placeholder="Título sección" style={{ ...iStyle, marginBottom: 8 }} />
                    <textarea value={f.desc} onChange={e => { const arr = [...p.features]; arr[i] = { ...arr[i], desc: e.target.value }; set("features", arr); }} rows={2} placeholder="Descripción detalle" style={{ ...iStyle, resize: "none" }} />
                    <button onClick={() => set("features", p.features.filter((_, j) => j !== i))} style={{ marginTop: 8, background: "none", border: "none", color: "#e05555", fontSize: 11, cursor: "pointer" }}>Eliminar bloque</button>
                  </div>
                ))}
                <button onClick={() => set("features", [...p.features, { tipo: "video", archivo: "", titulo: "", desc: "" }])} style={{ background: "rgba(232,228,224,0.04)", border: "1px dashed rgba(232,228,224,0.15)", color: "#e8e4e0", borderRadius: 8, padding: "10px", cursor: "pointer" }}>+ Agregar bloque Video / Imagen</button>
              </div>
            )}

            {tab === "specs" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {p.specs.map(([k, v], i) => (
                  <div key={i} style={{ display: "flex", gap: 6 }}>
                    <input value={k} onChange={e => { const arr = [...p.specs]; arr[i][0] = e.target.value; set("specs", arr); }} placeholder="Caract. (ej: Batería)" style={iStyle} />
                    <input value={v} onChange={e => { const arr = [...p.specs]; arr[i][1] = e.target.value; set("specs", arr); }} placeholder="Valor (ej: 2000 mAh)" style={iStyle} />
                  </div>
                ))}
                <button onClick={() => set("specs", [...p.specs, ["", ""]])} style={{ background: "rgba(232,228,224,0.04)", border: "1px dashed rgba(232,228,224,0.15)", color: "#e8e4e0", borderRadius: 8, padding: "10px", cursor: "pointer" }}>+ Agregar especificación</button>
              </div>
            )}

            {tab === "comparativa" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {p.comparativa.map((item, i) => (
                  <input key={i} value={item} onChange={e => { const arr = [...p.comparativa]; arr[i] = e.target.value; set("comparativa", arr); }} placeholder="Ventaja comparativa..." style={iStyle} />
                ))}
                <button onClick={() => set("comparativa", [...p.comparativa, ""])} style={{ background: "rgba(232,228,224,0.04)", border: "1px dashed rgba(232,228,224,0.15)", color: "#e8e4e0", borderRadius: 8, padding: "10px", cursor: "pointer" }}>+ Agregar ventaja</button>
              </div>
            )}
          </div>
        </div>

        {/* VISTA PREVIA RENDERIZADA */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <div style={{ height: 42, background: "#141414", borderBottom: "1px solid rgba(232,228,224,0.07)", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 16px", flexShrink: 0 }}>
            <div style={{ fontSize: 11, color: "rgba(232,228,224,0.35)" }}>tiendatuc.store/productos/{p.slug || "..."}</div>
            <div style={{ display: "flex", gap: 6 }}>
              <button onClick={() => setPreviewTab("desktop")} style={tabBtn(previewTab === "desktop")}>Desktop</button>
              <button onClick={() => setPreviewTab("mobile")} style={tabBtn(previewTab === "mobile")}>Mobile</button>
            </div>
          </div>

          <div style={{ flex: 1, overflowY: "auto", background: "#0a0a0a", display: "flex", justifyContent: "center", padding: previewTab === "mobile" ? "24px 16px" : "0" }}>
            <div style={{ width: previewTab === "mobile" ? 375 : "100%", background: "#0f0f0f", overflow: "hidden", minHeight: 600, padding: previewTab === "mobile" ? 16 : 32, maxWidth: 1000, margin: "0 auto" }}>

              <div style={{ display: "flex", flexDirection: previewTab === "mobile" ? "column" : "row", gap: 32, marginBottom: 40 }}>
                {/* Galería Principal */}
                <div style={{ flex: 1 }}>
                  <div style={{ aspectRatio: "1", background: "#141414", borderRadius: 12, overflow: "hidden", marginBottom: 12, border: "1px solid rgba(232,228,224,0.08)" }}>
                    {p.imagenes[0] ? <img src={p.imagenes[0]} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : null}
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 6 }}>
                    {p.imagenes.map((img, idx) => (
                      <div key={idx} style={{ aspectRatio: "1", borderRadius: 6, overflow: "hidden", border: "1px solid rgba(232,228,224,0.1)" }}>
                        <img src={img} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Info & Packs */}
                <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                  <h1 style={{ fontFamily: "'Syne',sans-serif", fontSize: 22, fontWeight: 800, color: "#e8e4e0", marginBottom: 12 }}>{p.nombre || "Nombre del Producto"}</h1>

                  {/* Packs Dinámicos */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
                    {p.packs.map((pk, idx) => (
                      <div key={idx} style={{ background: "#141414", border: pk.popular ? "2px solid #d4845a" : "1px solid rgba(232,228,224,0.15)", borderRadius: 8, padding: "10px 14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div>
                          <span style={{ fontSize: 13, fontWeight: 700, color: "#e8e4e0" }}>{pk.cantidad} Pack </span>
                          <span style={{ fontSize: 10, background: "#d4845a", color: "#000", padding: "2px 6px", borderRadius: 4, fontWeight: 800, marginLeft: 6 }}>AHORRÁ {pk.descuento}</span>
                        </div>
                        <span style={{ fontSize: 15, fontWeight: 800, color: "#e8e4e0" }}>{pk.precio}</span>
                      </div>
                    ))}
                  </div>

                  <p style={{ fontSize: 13, color: "rgba(232,228,224,0.6)", lineHeight: 1.5, marginBottom: 20 }}>{p.descripcion}</p>
                  <button style={{ width: "100%", background: "#d4845a", color: "#0f0f0f", border: "none", borderRadius: 8, padding: 15, fontSize: 14, fontWeight: 800, cursor: "pointer" }}>AGREGAR AL CARRITO</button>
                </div>
              </div>

              {/* Secciones con Videos / Fotos */}
              {p.features.length > 0 && (
                <div style={{ borderTop: "1px solid rgba(232,228,224,0.08)", paddingTop: 32, marginBottom: 30 }}>
                  <h2 style={{ fontFamily: "'Syne',sans-serif", fontSize: 18, fontWeight: 800, color: "#e8e4e0", textAlign: "center", marginBottom: 20 }}>Demostración en Vivo</h2>
                  <div style={{ display: "grid", gridTemplateColumns: previewTab === "mobile" ? "1fr" : "repeat(2, 1fr)", gap: 16 }}>
                    {p.features.map((f, idx) => (
                      <div key={idx} style={{ background: "#141414", border: "1px solid rgba(232,228,224,0.08)", borderRadius: 10, padding: 14 }}>
                        {f.archivo && (
                          <div style={{ aspectRatio: "16/9", borderRadius: 8, overflow: "hidden", marginBottom: 10, background: "#000" }}>
                            {f.tipo === "video" ? <video src={f.archivo} autoPlay loop muted playsInline style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <img src={f.archivo} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />}
                          </div>
                        )}
                        <h3 style={{ fontSize: 14, fontWeight: 700, color: "#e8e4e0", marginBottom: 4 }}>{f.titulo}</h3>
                        <p style={{ fontSize: 12, color: "rgba(232,228,224,0.5)", lineHeight: 1.4 }}>{f.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>

      </div>
    </div>
  );
}