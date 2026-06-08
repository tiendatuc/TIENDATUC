"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "../lib/supabase";

const ADMIN_PASSWORD = "tiendatuc2026";

type Feature = { tipo: "video" | "imagen"; archivo: string; titulo: string; desc: string; };
type Spec = [string, string];
type Resena = { iniciales: string; nombre: string; ciudad: string; estrellas: number; texto: string; fecha: string; color: string; };

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
  specs: Spec[];
  comparativa: string[];
  resenas: Resena[];
  activo: boolean;
};

const VACIO: Producto = {
  slug:"", nombre:"", descripcion:"",
  precio:"", precio_num:0, precio_anterior:"", descuento:0, ahorro:"", cuotas:"",
  envio_gratis:true, stock:5,
  imagenes:[], features:[], specs:[["",""]], comparativa:[""], resenas:[], activo:true,
};

const COLORES_RESENA = ["#d4845a","#4caf8a","#7f77dd","#e8a438"];

export default function AdminPage() {
  const [auth, setAuth] = useState(false);
  const [pass, setPass] = useState("");
  const [passErr, setPassErr] = useState("");
  const [productos, setProductos] = useState<Producto[]>([]);
  const [vista, setVista] = useState<"lista"|"editor">("lista");
  const [p, setP] = useState<Producto>(VACIO);
  const [tab, setTab] = useState<"general"|"imagenes"|"secciones"|"precio"|"specs"|"comparativa">("general");
  const [previewTab, setPreviewTab] = useState<"desktop"|"mobile">("desktop");
  const [guardando, setGuardando] = useState(false);
  const [msg, setMsg] = useState("");
  const [uploadingImg, setUploadingImg] = useState(false);
  const imgInputRef = useRef<HTMLInputElement>(null);
  const featImgRefs = useRef<(HTMLInputElement|null)[]>([]);

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

  const handleUploadFeat = async (file: File, idx: number, tipo: "imagen"|"video") => {
    try {
      const path = `${p.slug || "nuevo"}/feat_${Date.now()}_${file.name}`;
      const url = await uploadFile(file, path);
      const arr = [...p.features];
      arr[idx] = { ...arr[idx], archivo: url, tipo };
      set("features", arr);
    } catch (e: any) { setMsg("Error: " + e.message); }
  };

  const handleGuardar = async () => {
    if (!p.nombre || !p.slug) { setMsg("Nombre y slug son obligatorios"); return; }
    setGuardando(true);
    const data = {
      ...p,
      imagenes: p.imagenes.filter(Boolean),
      comparativa: p.comparativa.filter(Boolean),
      specs: p.specs.filter(([k]) => k),
      features: p.features.filter(f => f.titulo),
      videos: p.features.filter(f => f.tipo === "video").map(f => ({ video: f.archivo, titulo: f.titulo, desc: f.desc })),
    };
    let err;
    if (p.id) ({ error: err } = await supabase.from("productos").update(data).eq("id", p.id));
    else ({ error: err } = await supabase.from("productos").insert(data));
    if (err) setMsg("Error: " + err.message);
    else { setMsg("✓ Publicado"); await cargar(); setTimeout(() => { setVista("lista"); setMsg(""); }, 1200); }
    setGuardando(false);
  };

  const iStyle: any = { width:"100%", background:"rgba(232,228,224,0.05)", border:"1px solid rgba(232,228,224,0.12)", borderRadius:7, padding:"9px 11px", fontSize:13, color:"#e8e4e0", fontFamily:"inherit", outline:"none", boxSizing:"border-box" };
  const lStyle: any = { display:"block", fontSize:10, fontWeight:700, letterSpacing:"0.1em", textTransform:"uppercase", color:"rgba(232,228,224,0.4)", marginBottom:5 };
  const tabBtn = (active: boolean) => ({ padding:"6px 12px", fontSize:11, fontWeight:600, cursor:"pointer", background: active ? "#d4845a" : "transparent", color: active ? "#0f0f0f" : "rgba(232,228,224,0.5)", border:"1px solid", borderColor: active ? "#d4845a" : "rgba(232,228,224,0.12)", borderRadius:5, fontFamily:"inherit" });

  if (!auth) return (
    <div style={{ minHeight:"100vh", background:"#0f0f0f", display:"flex", alignItems:"center", justifyContent:"center" }}>
      <div style={{ width:340, background:"#141414", border:"1px solid rgba(232,228,224,0.08)", borderRadius:14, padding:32 }}>
        <div style={{ fontFamily:"'Syne',sans-serif", fontSize:22, fontWeight:800, color:"#e8e4e0", marginBottom:4 }}>Admin</div>
        <div style={{ fontSize:13, color:"rgba(232,228,224,0.4)", marginBottom:24 }}>TiendaTuc</div>
        {passErr && <div style={{ background:"rgba(224,85,85,0.08)", border:"1px solid rgba(224,85,85,0.2)", borderRadius:8, padding:"10px 14px", marginBottom:14, fontSize:13, color:"#e05555" }}>{passErr}</div>}
        <label style={lStyle}>Contraseña</label>
        <input type="password" value={pass} onChange={e=>setPass(e.target.value)} onKeyDown={e=>e.key==="Enter"&&(pass===ADMIN_PASSWORD?setAuth(true):setPassErr("Incorrecta"))} placeholder="••••••••" style={{ ...iStyle, marginBottom:14 }} />
        <button onClick={()=>pass===ADMIN_PASSWORD?setAuth(true):setPassErr("Incorrecta")} style={{ width:"100%", background:"#d4845a", color:"#0f0f0f", border:"none", borderRadius:8, padding:13, fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:"inherit" }}>Entrar</button>
      </div>
    </div>
  );

  if (vista === "lista") return (
    <div style={{ minHeight:"100vh", background:"#0f0f0f", padding:"32px 24px" }}>
      <div style={{ maxWidth:900, margin:"0 auto" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:28 }}>
          <div style={{ fontFamily:"'Syne',sans-serif", fontSize:22, fontWeight:800, color:"#e8e4e0" }}>Mis productos</div>
          <button onClick={()=>{ setP(VACIO); setTab("general"); setVista("editor"); }} style={{ background:"#d4845a", color:"#0f0f0f", border:"none", borderRadius:8, padding:"10px 22px", fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:"inherit" }}>+ Nuevo producto</button>
        </div>
        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          {productos.map(prod => (
            <div key={prod.id} style={{ background:"#141414", border:"1px solid rgba(232,228,224,0.07)", borderRadius:12, padding:"14px 18px", display:"flex", alignItems:"center", gap:14 }}>
              <div style={{ width:54, height:54, borderRadius:8, overflow:"hidden", background:"#1a1a1a", flexShrink:0 }}>
                {prod.imagenes?.[0] && <img src={prod.imagenes[0]} alt="" style={{ width:"100%", height:"100%", objectFit:"cover" }} />}
              </div>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:14, fontWeight:600, color:"#e8e4e0" }}>{prod.nombre}</div>
                <div style={{ fontSize:11, color:"rgba(232,228,224,0.4)", marginTop:2 }}>{prod.precio} · /productos/{prod.slug}</div>
              </div>
              <span style={{ fontSize:9, fontWeight:700, padding:"3px 8px", borderRadius:4, background: prod.activo ? "rgba(76,175,138,0.1)" : "rgba(224,85,85,0.1)", color: prod.activo ? "#4caf8a" : "#e05555", border:`1px solid ${prod.activo ? "rgba(76,175,138,0.2)" : "rgba(224,85,85,0.2)"}` }}>{prod.activo ? "Activo" : "Inactivo"}</span>
              <button onClick={()=>{ setP({ ...prod, imagenes:prod.imagenes||[], features:(prod as any).features||[], specs:prod.specs||[["",""]], comparativa:prod.comparativa||[""], resenas:prod.resenas||[] }); setTab("general"); setVista("editor"); }} style={{ background:"rgba(212,132,90,0.1)", border:"1px solid rgba(212,132,90,0.2)", color:"#d4845a", borderRadius:6, padding:"7px 14px", fontSize:12, fontWeight:600, cursor:"pointer", fontFamily:"inherit" }}>Editar</button>
              <button onClick={async()=>{ if(confirm("¿Eliminar?")) { await supabase.from("productos").delete().eq("id",prod.id!); cargar(); }}} style={{ background:"rgba(224,85,85,0.08)", border:"1px solid rgba(224,85,85,0.15)", color:"#e05555", borderRadius:6, padding:"7px 14px", fontSize:12, fontWeight:600, cursor:"pointer", fontFamily:"inherit" }}>Eliminar</button>
            </div>
          ))}
          {productos.length===0 && <div style={{ textAlign:"center", padding:"60px 0", color:"rgba(232,228,224,0.3)", fontSize:14 }}><div style={{ fontSize:36, marginBottom:12 }}>📦</div>No hay productos</div>}
        </div>
      </div>
    </div>
  );

  // EDITOR
  return (
    <div style={{ height:"100vh", display:"flex", flexDirection:"column", background:"#0a0a0a", overflow:"hidden" }}>

      {/* Top bar */}
      <div style={{ height:52, background:"#0f0f0f", borderBottom:"1px solid rgba(232,228,224,0.07)", display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0 20px", flexShrink:0 }}>
        <div style={{ display:"flex", alignItems:"center", gap:14 }}>
          <button onClick={()=>setVista("lista")} style={{ background:"none", border:"none", color:"rgba(232,228,224,0.4)", cursor:"pointer", display:"flex", padding:0, fontSize:20 }}>←</button>
          <span style={{ fontFamily:"'Syne',sans-serif", fontSize:15, fontWeight:700, color:"#e8e4e0" }}>{p.id ? "Editar producto" : "Nuevo producto"}</span>
        </div>
        {msg && <span style={{ fontSize:12, color: msg.startsWith("✓") ? "#4caf8a" : "#e05555", fontWeight:600 }}>{msg}</span>}
        <div style={{ display:"flex", gap:8, alignItems:"center" }}>
          <label style={{ display:"flex", alignItems:"center", gap:6, fontSize:12, color:"rgba(232,228,224,0.5)", cursor:"pointer" }}>
            <input type="checkbox" checked={p.activo} onChange={e=>set("activo",e.target.checked)} />
            Activo
          </label>
          <button onClick={handleGuardar} disabled={guardando} style={{ background:"#d4845a", color:"#0f0f0f", border:"none", borderRadius:7, padding:"8px 20px", fontSize:12, fontWeight:700, cursor:"pointer", fontFamily:"inherit", opacity:guardando?0.7:1 }}>
            {guardando ? "Guardando..." : "Publicar"}
          </button>
        </div>
      </div>

      <div style={{ flex:1, display:"flex", overflow:"hidden" }}>

        {/* PANEL EDITOR */}
        <div style={{ width:320, flexShrink:0, background:"#0f0f0f", borderRight:"1px solid rgba(232,228,224,0.07)", display:"flex", flexDirection:"column", overflow:"hidden" }}>

          {/* Tabs */}
          <div style={{ padding:"10px 14px", borderBottom:"1px solid rgba(232,228,224,0.07)", display:"flex", gap:6, flexWrap:"wrap" }}>
            {(["general","imagenes","secciones","precio","specs","comparativa"] as const).map(t => (
              <button key={t} onClick={()=>setTab(t)} style={tabBtn(tab===t)}>
                {t==="general"?"General":t==="imagenes"?"Imágenes":t==="secciones"?"Secciones":t==="precio"?"Precio":t==="specs"?"Specs":"Comparativa"}
              </button>
            ))}
          </div>

          {/* Campos */}
          <div style={{ flex:1, overflowY:"auto", padding:16 }}>

            {/* TAB GENERAL */}
            {tab==="general" && (
              <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
                <div>
                  <label style={lStyle}>Nombre del producto</label>
                  <input value={p.nombre} onChange={e=>set("nombre",e.target.value)} placeholder="Proyector HY300..." style={iStyle} />
                </div>
                <div>
                  <label style={lStyle}>Slug (URL)</label>
                  <input value={p.slug} onChange={e=>set("slug",e.target.value.toLowerCase().replace(/\s+/g,"-").replace(/[^a-z0-9-]/g,""))} placeholder="proyector-hy300" style={iStyle} />
                  <div style={{ fontSize:10, color:"rgba(232,228,224,0.3)", marginTop:4 }}>tiendatuc.store/productos/{p.slug||"..."}</div>
                </div>
                <div>
                  <label style={lStyle}>Descripción</label>
                  <textarea value={p.descripcion} onChange={e=>set("descripcion",e.target.value)} rows={4} placeholder="Descripción del producto..." style={{ ...iStyle, resize:"none" }} />
                </div>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
                  <div>
                    <label style={lStyle}>Stock</label>
                    <input type="number" value={p.stock} onChange={e=>set("stock",Number(e.target.value))} style={iStyle} />
                  </div>
                  <div>
                    <label style={lStyle}>Cuotas</label>
                    <input value={p.cuotas} onChange={e=>set("cuotas",e.target.value)} placeholder="6 cuotas sin interés" style={iStyle} />
                  </div>
                </div>
                <label style={{ display:"flex", alignItems:"center", gap:8, cursor:"pointer", fontSize:13, color:"#e8e4e0" }}>
                  <input type="checkbox" checked={p.envio_gratis} onChange={e=>set("envio_gratis",e.target.checked)} />
                  Envío gratis
                </label>
              </div>
            )}

            {/* TAB PRECIO */}
            {tab==="precio" && (
              <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
                <div>
                  <label style={lStyle}>Precio actual</label>
                  <input value={p.precio} onChange={e=>set("precio",e.target.value)} placeholder="$119.900" style={iStyle} />
                </div>
                <div>
                  <label style={lStyle}>Precio anterior (tachado)</label>
                  <input value={p.precio_anterior} onChange={e=>set("precio_anterior",e.target.value)} placeholder="$159.900" style={iStyle} />
                </div>
                <div>
                  <label style={lStyle}>Precio numérico (para MP)</label>
                  <input type="number" value={p.precio_num} onChange={e=>set("precio_num",Number(e.target.value))} placeholder="119900" style={iStyle} />
                </div>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
                  <div>
                    <label style={lStyle}>Descuento %</label>
                    <input type="number" value={p.descuento} onChange={e=>set("descuento",Number(e.target.value))} style={iStyle} />
                  </div>
                  <div>
                    <label style={lStyle}>Ahorro</label>
                    <input value={p.ahorro} onChange={e=>set("ahorro",e.target.value)} placeholder="$40.000" style={iStyle} />
                  </div>
                </div>
              </div>
            )}

            {/* TAB IMÁGENES */}
            {tab==="imagenes" && (
              <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
                <div>
                  <label style={lStyle}>Subir imágenes</label>
                  <div onClick={()=>imgInputRef.current?.click()}
                    style={{ border:"1.5px dashed rgba(232,228,224,0.2)", borderRadius:10, padding:20, textAlign:"center", cursor:"pointer", background:"rgba(232,228,224,0.02)", transition:"all 0.2s" }}
                    onDragOver={e=>e.preventDefault()}
                    onDrop={e=>{ e.preventDefault(); handleUploadImagenes(e.dataTransfer.files); }}>
                    <div style={{ fontSize:28, marginBottom:6 }}>📁</div>
                    <div style={{ fontSize:12, color:"rgba(232,228,224,0.5)" }}>{uploadingImg ? "Subiendo..." : "Arrastrá archivos o hacé click"}</div>
                    <div style={{ fontSize:10, color:"rgba(232,228,224,0.3)", marginTop:3 }}>JPG, WEBP, PNG · Máx 10MB</div>
                  </div>
                  <input ref={imgInputRef} type="file" accept="image/*" multiple style={{ display:"none" }} onChange={e=>e.target.files&&handleUploadImagenes(e.target.files)} />
                </div>
                {p.imagenes.length > 0 && (
                  <div>
                    <label style={lStyle}>Imágenes ({p.imagenes.length})</label>
                    <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:8 }}>
                      {p.imagenes.map((img,i) => (
                        <div key={i} style={{ position:"relative", aspectRatio:"1", borderRadius:8, overflow:"hidden", background:"#1a1a1a", border: i===0 ? "2px solid #d4845a" : "1px solid rgba(232,228,224,0.08)" }}>
                          <img src={img} alt="" style={{ width:"100%", height:"100%", objectFit:"cover" }} />
                          {i===0 && <div style={{ position:"absolute", bottom:4, left:4, background:"#d4845a", color:"#0f0f0f", fontSize:8, fontWeight:800, padding:"2px 5px", borderRadius:3 }}>Principal</div>}
                          <button onClick={()=>set("imagenes",p.imagenes.filter((_,j)=>j!==i))} style={{ position:"absolute", top:4, right:4, background:"rgba(0,0,0,0.7)", border:"none", color:"#fff", borderRadius:"50%", width:20, height:20, cursor:"pointer", fontSize:12, display:"flex", alignItems:"center", justifyContent:"center" }}>✕</button>
                        </div>
                      ))}
                    </div>
                    <div style={{ fontSize:10, color:"rgba(232,228,224,0.3)", marginTop:6 }}>La primera imagen es la principal</div>
                  </div>
                )}
              </div>
            )}

            {/* TAB SECCIONES */}
            {tab==="secciones" && (
              <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
                <div style={{ fontSize:12, color:"rgba(232,228,224,0.4)", marginBottom:4 }}>Cada sección aparece con imagen o video + texto</div>
                {p.features.map((f,i) => (
                  <div key={i} style={{ background:"rgba(232,228,224,0.03)", border:"1px solid rgba(232,228,224,0.08)", borderRadius:10, padding:14 }}>
                    <div style={{ display:"flex", justifyContent:"space-between", marginBottom:10 }}>
                      <span style={{ fontSize:11, fontWeight:600, color:"rgba(232,228,224,0.5)" }}>Sección {i+1}</span>
                      <button onClick={()=>set("features",p.features.filter((_,j)=>j!==i))} style={{ background:"none", border:"none", color:"#e05555", cursor:"pointer", fontSize:12 }}>Eliminar</button>
                    </div>
                    {/* Tipo */}
                    <div style={{ display:"flex", gap:6, marginBottom:10 }}>
                      <button onClick={()=>{ const arr=[...p.features]; arr[i]={...arr[i],tipo:"imagen"}; set("features",arr); }} style={{ ...tabBtn(f.tipo==="imagen"), fontSize:10, padding:"4px 10px" }}>Imagen</button>
                      <button onClick={()=>{ const arr=[...p.features]; arr[i]={...arr[i],tipo:"video"}; set("features",arr); }} style={{ ...tabBtn(f.tipo==="video"), fontSize:10, padding:"4px 10px" }}>Video</button>
                    </div>
                    {/* Upload */}
                    <div onClick={()=>{ featImgRefs.current[i]?.click(); }}
                      style={{ border:"1px dashed rgba(232,228,224,0.15)", borderRadius:7, padding:10, textAlign:"center", cursor:"pointer", marginBottom:10, background:"rgba(232,228,224,0.02)" }}>
                      {f.archivo ? (
                        f.tipo==="video"
                          ? <video src={f.archivo} style={{ maxHeight:80, borderRadius:6 }} muted />
                          : <img src={f.archivo} style={{ maxHeight:80, borderRadius:6, objectFit:"cover" }} alt="" />
                      ) : (
                        <>
                          <div style={{ fontSize:18, marginBottom:4 }}>{f.tipo==="video"?"🎬":"🖼️"}</div>
                          <div style={{ fontSize:10, color:"rgba(232,228,224,0.4)" }}>Subir {f.tipo==="video"?"video":"imagen"}</div>
                        </>
                      )}
                    </div>
                    <input ref={el=>{ featImgRefs.current[i]=el; }} type="file" accept={f.tipo==="video"?"video/*":"image/*"} style={{ display:"none" }}
                      onChange={e=>{ if(e.target.files?.[0]) handleUploadFeat(e.target.files[0],i,f.tipo); }} />
                    <div style={{ marginBottom:8 }}>
                      <label style={lStyle}>Título</label>
                      <input value={f.titulo} onChange={e=>{ const arr=[...p.features]; arr[i]={...arr[i],titulo:e.target.value}; set("features",arr); }} placeholder="Pantalla gigante hasta 130&quot;" style={iStyle} />
                    </div>
                    <div>
                      <label style={lStyle}>Descripción</label>
                      <textarea value={f.desc} onChange={e=>{ const arr=[...p.features]; arr[i]={...arr[i],desc:e.target.value}; set("features",arr); }} rows={2} style={{ ...iStyle, resize:"none" }} />
                    </div>
                  </div>
                ))}
                <button onClick={()=>set("features",[...p.features,{tipo:"imagen",archivo:"",titulo:"",desc:""}])}
                  style={{ background:"rgba(232,228,224,0.04)", border:"1px dashed rgba(232,228,224,0.15)", color:"rgba(232,228,224,0.5)", borderRadius:8, padding:"10px", fontSize:12, cursor:"pointer", fontFamily:"inherit" }}>
                  + Agregar sección
                </button>
              </div>
            )}

            {/* TAB SPECS */}
            {tab==="specs" && (
              <div>
                <div style={{ fontSize:11, color:"rgba(232,228,224,0.4)", marginBottom:12 }}>Ficha técnica del producto</div>
                {p.specs.map(([k,v],i) => (
                  <div key={i} style={{ display:"grid", gridTemplateColumns:"1fr 1fr auto", gap:6, marginBottom:7 }}>
                    <input value={k} onChange={e=>{ const arr=[...p.specs]; arr[i]=[e.target.value,arr[i][1]]; set("specs",arr); }} placeholder="Modelo" style={iStyle} />
                    <input value={v} onChange={e=>{ const arr=[...p.specs]; arr[i]=[arr[i][0],e.target.value]; set("specs",arr); }} placeholder="HY300" style={iStyle} />
                    <button onClick={()=>set("specs",p.specs.filter((_,j)=>j!==i))} style={{ background:"rgba(224,85,85,0.08)", border:"none", color:"#e05555", borderRadius:6, padding:"0 10px", cursor:"pointer", fontSize:16 }}>✕</button>
                  </div>
                ))}
                <button onClick={()=>set("specs",[...p.specs,["",""]])} style={{ background:"rgba(232,228,224,0.04)", border:"1px dashed rgba(232,228,224,0.15)", color:"rgba(232,228,224,0.5)", borderRadius:8, padding:"8px 16px", fontSize:12, cursor:"pointer", fontFamily:"inherit", marginTop:4 }}>+ Agregar</button>
              </div>
            )}

            {/* TAB COMPARATIVA */}
            {tab==="comparativa" && (
              <div>
                <div style={{ fontSize:11, color:"rgba(232,228,224,0.4)", marginBottom:12 }}>Items de la tabla "Sin él vs Con él"</div>
                {p.comparativa.map((c,i) => (
                  <div key={i} style={{ display:"flex", gap:6, marginBottom:7 }}>
                    <input value={c} onChange={e=>{ const arr=[...p.comparativa]; arr[i]=e.target.value; set("comparativa",arr); }} placeholder="Android 11 integrado" style={{ ...iStyle, flex:1 }} />
                    <button onClick={()=>set("comparativa",p.comparativa.filter((_,j)=>j!==i))} style={{ background:"rgba(224,85,85,0.08)", border:"none", color:"#e05555", borderRadius:6, padding:"0 10px", cursor:"pointer", fontSize:16 }}>✕</button>
                  </div>
                ))}
                <button onClick={()=>set("comparativa",[...p.comparativa,""])} style={{ background:"rgba(232,228,224,0.04)", border:"1px dashed rgba(232,228,224,0.15)", color:"rgba(232,228,224,0.5)", borderRadius:8, padding:"8px 16px", fontSize:12, cursor:"pointer", fontFamily:"inherit", marginTop:4 }}>+ Agregar</button>
              </div>
            )}
          </div>
        </div>

        {/* PANEL VISTA PREVIA */}
        <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden" }}>
          {/* Preview toolbar */}
          <div style={{ height:42, background:"#141414", borderBottom:"1px solid rgba(232,228,224,0.07)", display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0 16px", flexShrink:0 }}>
            <div style={{ fontSize:11, color:"rgba(232,228,224,0.35)" }}>tiendatuc.store/productos/{p.slug||"..."}</div>
            <div style={{ display:"flex", gap:6 }}>
              <button onClick={()=>setPreviewTab("desktop")} style={{ ...tabBtn(previewTab==="desktop"), fontSize:10, padding:"3px 10px" }}>Desktop</button>
              <button onClick={()=>setPreviewTab("mobile")} style={{ ...tabBtn(previewTab==="mobile"), fontSize:10, padding:"3px 10px" }}>Mobile</button>
            </div>
          </div>

          {/* Preview scroll */}
          <div style={{ flex:1, overflowY:"scroll", overflowX:"hidden", background:"#0a0a0a", display:"flex", justifyContent:"center", padding:"24px 16px" }}>
            <div style={{ width: previewTab==="mobile" ? 375 : "100%", maxWidth:900, background:"#0f0f0f", borderRadius:previewTab==="mobile"?16:0, overflow:"visible", boxShadow: previewTab==="mobile" ? "0 20px 60px rgba(0,0,0,0.6)" : "none", border: previewTab==="mobile" ? "8px solid #1a1a1a" : "none", minHeight:600 }}>

              {/* Header simulado */}
              <div style={{ background:"rgba(10,10,10,0.97)", borderBottom:"1px solid rgba(232,228,224,0.07)", padding:"14px 16px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <span style={{ fontFamily:"'Syne',sans-serif", fontSize:12, fontWeight:800, letterSpacing:4, color:"#e8e4e0" }}>TIENDATUC</span>
                <span style={{ fontSize:11, color:"rgba(232,228,224,0.4)" }}>🛒</span>
              </div>

              <div style={{ padding:16 }}>
                <a style={{ fontSize:10, color:"rgba(232,228,224,0.3)", letterSpacing:"0.08em", textTransform:"uppercase", display:"block", marginBottom:16 }}>← Volver</a>

                {/* Hero grid */}
                <div style={{ display:"grid", gridTemplateColumns: previewTab==="mobile"?"1fr":"1fr 1fr", gap:16, marginBottom:24 }}>
                  {/* Galería */}
                  <div>
                    <div style={{ aspectRatio:"1", background:"#141414", border:"1px solid rgba(232,228,224,0.07)", borderRadius:10, overflow:"hidden", display:"flex", alignItems:"center", justifyContent:"center", marginBottom:8 }}>
                      {p.imagenes[0]
                        ? <img src={p.imagenes[0]} alt="" style={{ width:"100%", height:"100%", objectFit:"cover" }} />
                        : <span style={{ fontSize:32, opacity:0.2 }}>📷</span>
                      }
                    </div>
                    {p.imagenes.length>1 && (
                      <div style={{ display:"grid", gridTemplateColumns:`repeat(${Math.min(p.imagenes.length,4)},1fr)`, gap:5 }}>
                        {p.imagenes.slice(0,4).map((img,i)=>(
                          <div key={i} style={{ aspectRatio:"1", borderRadius:6, overflow:"hidden", border:`1.5px solid ${i===0?"#d4845a":"rgba(232,228,224,0.07)"}` }}>
                            <img src={img} alt="" style={{ width:"100%", height:"100%", objectFit:"contain", padding:2 }} />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div>
                    <div style={{ display:"flex", gap:5, marginBottom:10, flexWrap:"wrap" }}>
                      {p.envio_gratis && <span style={{ fontSize:8, fontWeight:700, padding:"3px 7px", borderRadius:3, background:"rgba(76,175,138,0.1)", color:"#4caf8a", border:"1px solid rgba(76,175,138,0.2)" }}>Envío gratis</span>}
                      <span style={{ fontSize:8, fontWeight:700, padding:"3px 7px", borderRadius:3, background:"rgba(212,132,90,0.12)", color:"#d4845a", border:"1px solid rgba(212,132,90,0.22)" }}>Más vendido</span>
                      {p.descuento>0 && <span style={{ fontSize:8, fontWeight:700, padding:"3px 7px", borderRadius:3, background:"rgba(224,85,85,0.1)", color:"#e05555", border:"1px solid rgba(224,85,85,0.2)" }}>-{p.descuento}% OFF</span>}
                    </div>
                    <div style={{ fontFamily:"'Syne',sans-serif", fontSize: previewTab==="mobile"?18:16, fontWeight:800, color:"#e8e4e0", marginBottom:8, lineHeight:1.2 }}>{p.nombre||<span style={{ color:"rgba(232,228,224,0.2)" }}>Nombre del producto</span>}</div>
                    <div style={{ fontSize:11, color:"rgba(232,228,224,0.45)", lineHeight:1.6, marginBottom:12 }}>{p.descripcion||<span style={{ color:"rgba(232,228,224,0.15)" }}>Descripción...</span>}</div>
                    {p.precio && (
                      <div style={{ background:"#141414", border:"1px solid rgba(232,228,224,0.07)", borderRadius:8, padding:"12px 14px", marginBottom:10 }}>
                        <div style={{ display:"flex", alignItems:"baseline", gap:8, marginBottom:4 }}>
                          <span style={{ fontFamily:"'Syne',sans-serif", fontSize: previewTab==="mobile"?22:18, fontWeight:800, color:"#e8e4e0" }}>{p.precio}</span>
                          {p.precio_anterior && <span style={{ fontSize:12, color:"#555", textDecoration:"line-through" }}>{p.precio_anterior}</span>}
                        </div>
                        {p.cuotas && <div style={{ fontSize:11, color:"#4caf8a", fontWeight:600 }}>{p.cuotas}</div>}
                      </div>
                    )}
                    <div style={{ background:"#e8a438", borderRadius:8, padding:"11px", textAlign:"center", marginBottom:7 }}>
                      <span style={{ fontSize:10, fontWeight:800, color:"#0f0f0f", letterSpacing:"0.08em", textTransform:"uppercase" }}>⚡ Comprar ahora</span>
                    </div>
                    <div style={{ background:"#d4845a", borderRadius:8, padding:"10px", textAlign:"center" }}>
                      <span style={{ fontSize:10, fontWeight:700, color:"#0f0f0f", letterSpacing:"0.08em", textTransform:"uppercase" }}>Agregar al carrito</span>
                    </div>
                  </div>
                </div>

                {/* Features preview */}
                {p.features.filter(f=>f.titulo).length>0 && (
                  <div style={{ borderTop:"1px solid rgba(232,228,224,0.07)", paddingTop:16, marginBottom:16 }}>
                    <div style={{ fontSize:8, fontWeight:700, letterSpacing:"0.15em", textTransform:"uppercase", color:"#d4845a", marginBottom:5 }}>Por qué elegirlo</div>
                    <div style={{ fontFamily:"'Syne',sans-serif", fontSize:14, fontWeight:800, color:"#e8e4e0", marginBottom:12 }}>Todo lo que necesitás en uno</div>
                    {p.features.filter(f=>f.titulo).slice(0,2).map((f,i)=>(
                      <div key={i} style={{ display:"grid", gridTemplateColumns: previewTab==="mobile"?"1fr":"1fr 1fr", border:"1px solid rgba(232,228,224,0.07)", borderRadius:10, overflow:"hidden", marginBottom:8, background:"#141414" }}>
                        <div style={{ background:"#0f0f0f", minHeight:80, display:"flex", alignItems:"center", justifyContent:"center" }}>
                          {f.archivo
                            ? f.tipo==="video"
                              ? <video src={f.archivo} style={{ width:"100%", maxHeight:120, objectFit:"contain" }} muted />
                              : <img src={f.archivo} style={{ width:"100%", maxHeight:120, objectFit:"cover" }} alt="" />
                            : <span style={{ fontSize:20, opacity:0.2 }}>{f.tipo==="video"?"🎬":"🖼️"}</span>
                          }
                        </div>
                        <div style={{ padding:"12px 14px", display:"flex", flexDirection:"column", justifyContent:"center" }}>
                          <div style={{ fontSize:8, fontWeight:700, color:"#d4845a", letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:5 }}>0{i+1}</div>
                          <div style={{ fontFamily:"'Syne',sans-serif", fontSize:12, fontWeight:700, color:"#e8e4e0", marginBottom:5 }}>{f.titulo}</div>
                          <div style={{ fontSize:10, color:"rgba(232,228,224,0.5)", lineHeight:1.6 }}>{f.desc}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Specs preview */}
                {p.specs.filter(([k])=>k).length>0 && (
                  <div style={{ borderTop:"1px solid rgba(232,228,224,0.07)", paddingTop:16 }}>
                    <div style={{ fontFamily:"'Syne',sans-serif", fontSize:13, fontWeight:800, color:"#e8e4e0", marginBottom:10 }}>Especificaciones</div>
                    <table style={{ width:"100%", borderCollapse:"collapse" }}>
                      <tbody>
                        {p.specs.filter(([k])=>k).slice(0,4).map(([k,v],i)=>(
                          <tr key={i} style={{ background:i%2===0?"transparent":"rgba(232,228,224,0.02)", borderBottom:"1px solid rgba(232,228,224,0.05)" }}>
                            <td style={{ padding:"8px 10px", fontSize:10, color:"rgba(232,228,224,0.4)", width:"45%" }}>{k}</td>
                            <td style={{ padding:"8px 10px", fontSize:10, color:"#e8e4e0" }}>{v}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
