"use client";
import { useState, useEffect, useMemo, useRef, type ReactNode } from "react";
import { supabase } from "../lib/supabase";

type Prod = {
  id: number;
  slug: string;
  nombre: string;
  descripcion: string;
  precio: string;
  precioAnterior: string;
  envioGratis: boolean;
  imagen: string;
};

/* La tabla no guarda categoría, así que se deduce por palabras clave del
   nombre/descripción. Mantiene vivos los links del header (/buscar?q=Hogar). */
const CATEGORIAS: { nombre: string; claves: string[] }[] = [
  { nombre: "Tecnología", claves: ["proyector", "android", "bluetooth", "parlante", "auricular", "camara", "led", "smart", "usb", "electric"] },
  { nombre: "Hogar", claves: ["wok", "silla", "ropero", "organizador", "cocina", "sarten", "olla", "mueble", "colchon", "escritorio", "lampara"] },
  { nombre: "Entretenimiento", claves: ["pistola", "juego", "juguete", "agua", "piscina", "aire libre", "bici", "pelota"] },
];

const norm = (s: string) =>
  (s || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

const aNumero = (v: string) => Number(String(v || "").replace(/[^\d]/g, "")) || 0;

const pctOff = (precio: string, anterior: string) => {
  const a = aNumero(anterior), p = aNumero(precio);
  return a > p && a > 0 ? Math.round(((a - p) / a) * 100) : 0;
};

const categoriaDe = (p: Prod) => {
  const texto = norm(`${p.nombre} ${p.descripcion}`);
  return CATEGORIAS.find(c => c.claves.some(k => texto.includes(k)))?.nombre || "Destacados";
};

/* Resalta el tramo que coincide con lo buscado */
function resaltar(texto: string, q: string): ReactNode {
  const t = q.trim();
  if (!t) return texto;
  const i = norm(texto).indexOf(norm(t));
  if (i < 0) return texto;
  return (
    <>
      {texto.slice(0, i)}
      <mark>{texto.slice(i, i + t.length)}</mark>
      {texto.slice(i + t.length)}
    </>
  );
}

const ico = {
  lupa: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
    </svg>
  ),
  cruz: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  ),
  camion: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="7" width="14" height="9" rx="1" /><path d="M15 10h3.5l3 3v3H15" />
      <circle cx="6" cy="19" r="1.8" /><circle cx="17.5" cy="19" r="1.8" />
    </svg>
  ),
};

export default function BuscarPage() {
  const [query, setQuery] = useState("");
  const [productos, setProductos] = useState<Prod[] | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const montado = useRef(false);

  /* El buscador del header llega acá con /buscar?q=… */
  useEffect(() => {
    const q = new URLSearchParams(window.location.search).get("q");
    if (q) setQuery(q);
  }, []);

  /* La query viaja en la URL para que el resultado sea compartible */
  useEffect(() => {
    if (!montado.current) { montado.current = true; return; }
    const url = new URL(window.location.href);
    if (query.trim()) url.searchParams.set("q", query.trim());
    else url.searchParams.delete("q");
    window.history.replaceState(null, "", url);
  }, [query]);

  useEffect(() => {
    let vigente = true;
    (async () => {
      const { data } = await supabase
        .from("productos")
        .select("id, slug, nombre, descripcion, precio, precio_anterior, envio_gratis, imagenes")
        .eq("activo", true)
        .order("id");
      if (!vigente) return;
      setProductos(
        (data || []).map(p => ({
          id: p.id,
          slug: p.slug,
          nombre: p.nombre,
          descripcion: p.descripcion || "",
          precio: p.precio,
          precioAnterior: p.precio_anterior || "",
          envioGratis: !!p.envio_gratis,
          imagen: p.imagenes?.[0] || "",
        }))
      );
    })();
    return () => { vigente = false; };
  }, []);

  const cargando = productos === null;

  const resultados = useMemo(() => {
    const lista = productos || [];
    const q = norm(query.trim());
    if (!q) return lista;
    return lista.filter(p =>
      norm(p.nombre).includes(q) ||
      norm(p.descripcion).includes(q) ||
      norm(categoriaDe(p)).includes(q)
    );
  }, [productos, query]);

  const catActiva = CATEGORIAS.find(c => norm(c.nombre) === norm(query.trim()))?.nombre || "";

  return (
    <div className="bus">
      <style jsx>{`
        .bus{background:var(--bg);min-height:100vh;padding:44px 20px 96px;}
        .bus-in{max-width:1080px;margin:0 auto;}

        /* ══════════ ENCABEZADO ══════════ */
        .bus-head{text-align:center;margin-bottom:26px;}
        .bus-eyebrow{font-size:10px;font-weight:700;letter-spacing:.18em;text-transform:uppercase;color:var(--text-3);}
        .bus-title{font-family:var(--font-display);font-size:clamp(26px,4vw,38px);font-weight:800;
          letter-spacing:-.03em;color:var(--text);margin-top:9px;line-height:1.1;}
        .bus-sub{font-size:14px;color:var(--text-2);margin-top:10px;}

        /* ══════════ BARRA DE BÚSQUEDA ══════════ */
        .bus-bar{position:relative;display:flex;align-items:center;gap:12px;max-width:680px;margin:0 auto;
          background:var(--surface);border:1px solid var(--border-2);border-radius:16px;
          padding:10px 12px 10px 14px;box-shadow:var(--card-shadow);
          transition:border-color .2s,box-shadow .2s;}
        .bus-bar:focus-within{border-color:var(--text-2);}
        .bus-lupa{display:grid;place-items:center;flex-shrink:0;color:var(--text-3);padding-left:2px;}
        .bus-lupa :global(svg){width:19px;height:19px;}
        .bus-input{flex:1;min-width:0;background:transparent;border:none;outline:none;
          font-family:var(--font-body);font-size:16.5px;font-weight:500;color:var(--text);padding:0;}
        .bus-input::placeholder{color:var(--text-3);font-weight:400;}
        .bus-clear{display:grid;place-items:center;width:32px;height:32px;flex-shrink:0;
          border:none;border-radius:7px;background:transparent;color:var(--text-3);
          cursor:pointer;transition:color .16s,background .16s;}
        .bus-clear:hover{background:var(--hover);color:var(--text);}
        .bus-clear :global(svg){width:15px;height:15px;}

        /* ══════════ CHIPS ══════════ */
        .bus-chips{display:flex;justify-content:center;flex-wrap:wrap;gap:8px;margin-top:16px;}
        .chip{font-family:var(--font-body);font-size:12.5px;font-weight:600;color:var(--text-2);
          background:transparent;border:1px solid var(--border-2);border-radius:8px;
          padding:8px 15px;cursor:pointer;transition:color .16s,border-color .16s,background .16s;}
        .chip:hover{border-color:var(--text-3);color:var(--text);}
        .chip.on{background:var(--text);border-color:var(--text);color:var(--bg);}

        /* ══════════ CONTEO ══════════ */
        .bus-count{display:flex;align-items:center;gap:9px;margin:34px 0 16px;
          font-size:12.5px;font-weight:600;color:var(--text-3);}
        .bus-count b{color:var(--text);font-weight:800;}
        .bus-count em{font-style:normal;color:var(--text);font-weight:700;}
        .bus-count::after{content:"";flex:1;height:1px;background:var(--border);}

        /* ══════════ GRILLA ══════════ */
        .bus-grid{display:grid;gap:16px;grid-template-columns:repeat(auto-fill,minmax(232px,1fr));}

        .rcard{display:flex;flex-direction:column;overflow:hidden;
          background:var(--surface);border:1px solid var(--border);border-radius:18px;
          text-decoration:none;transition:transform .2s,border-color .2s,box-shadow .2s;}
        .rcard:hover{border-color:var(--text-3);}
        .rcard-img{position:relative;aspect-ratio:1/1;background:var(--img-bg);overflow:hidden;}
        .rcard-img :global(img){width:100%;height:100%;object-fit:contain;padding:14px;}
        .rcard-off{position:absolute;top:10px;left:10px;background:var(--text);color:var(--bg);
          font-size:10.5px;font-weight:800;letter-spacing:.01em;padding:4px 8px;border-radius:5px;}

        .rcard-body{display:flex;flex-direction:column;flex:1;gap:6px;padding:14px 15px 15px;}
        .rcard-cat{font-size:9.5px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:var(--text-3);}
        .rcard-name{font-size:14px;font-weight:700;color:var(--text);line-height:1.35;letter-spacing:-.01em;
          display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;}
        .rcard-name :global(mark){background:transparent;color:inherit;font-weight:800;
          border-bottom:2px solid var(--border-2);}
        .rcard-desc{font-size:12px;color:var(--text-3);line-height:1.5;
          display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;}
        .rcard-foot{display:flex;align-items:center;flex-wrap:wrap;gap:8px;margin-top:auto;padding-top:10px;}
        .rcard-precio{font-family:var(--font-display);font-size:19px;font-weight:900;
          letter-spacing:-.035em;color:var(--text);line-height:1;}
        .rcard-antes{font-size:12px;color:var(--text-3);text-decoration:line-through;}
        .rcard-ship{display:inline-flex;align-items:center;gap:5px;margin-left:auto;
          font-size:9.5px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;
          color:var(--text-3);border:1px solid var(--border-2);
          padding:4px 8px;border-radius:5px;}
        .rcard-ship :global(svg){width:12px;height:12px;}

        /* ══════════ ESQUELETO ══════════ */
        .sk{border:1px solid var(--border);border-radius:18px;overflow:hidden;background:var(--surface);}
        .sk-img{aspect-ratio:1/1;background:var(--bg-3);}
        .sk-l{height:11px;border-radius:6px;background:var(--bg-3);margin:14px 15px 0;}
        .sk-l.w40{width:40%;} .sk-l.w80{width:80%;} .sk-l.w55{width:55%;margin-bottom:16px;}
        .sk-img,.sk-l{animation:pulso 1.3s ease-in-out infinite;}
        @keyframes pulso{0%,100%{opacity:1;}50%{opacity:.5;}}

        /* ══════════ VACÍO ══════════ */
        .vacio{text-align:center;padding:56px 20px 64px;border:1px dashed var(--border-2);
          border-radius:20px;background:var(--bg-2);}
        .vacio-ico{display:grid;place-items:center;margin:0 auto 16px;color:var(--text-3);}
        .vacio-ico :global(svg){width:26px;height:26px;}
        .vacio h3{font-family:var(--font-display);font-size:19px;font-weight:800;color:var(--text);}
        .vacio p{font-size:13.5px;color:var(--text-2);margin-top:8px;}
        .vacio-btn{display:inline-flex;align-items:center;justify-content:center;margin-top:20px;
          font-family:var(--font-body);font-size:12.5px;font-weight:700;color:var(--bg);
          background:var(--text);border:none;border-radius:8px;padding:12px 22px;cursor:pointer;
          transition:opacity .16s;}
        .vacio-btn:hover{opacity:.85;}

        @media (max-width:560px){
          .bus{padding:30px 14px 72px;}
          .bus-bar{padding:9px 10px 9px 12px;border-radius:14px;}
          .bus-input{font-size:15.5px;}
          .bus-grid{grid-template-columns:repeat(auto-fill,minmax(158px,1fr));gap:12px;}
          .rcard-body{padding:12px 12px 13px;}
          .rcard-desc{display:none;}
          .rcard-precio{font-size:17px;}
          .rcard-ship{margin-left:0;}
        }
              `}</style>

      <div className="bus-in">
        <div className="bus-head">
          <div className="bus-eyebrow">Catálogo</div>
          <h1 className="bus-title">¿Qué estás buscando?</h1>
          <p className="bus-sub">Escribí un producto o elegí una categoría.</p>
        </div>

        {/* ══════════ BARRA ══════════ */}
        <div className="bus-bar">
          <span className="bus-lupa" aria-hidden="true">{ico.lupa}</span>
          <input
            ref={inputRef}
            autoFocus
            type="search"
            className="bus-input"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => { if (e.key === "Escape") setQuery(""); }}
            placeholder="Proyector, silla, pistola de agua…"
            aria-label="Buscar productos"
          />
          {query && (
            <button
              className="bus-clear"
              onClick={() => { setQuery(""); inputRef.current?.focus(); }}
              aria-label="Borrar búsqueda"
            >
              {ico.cruz}
            </button>
          )}
        </div>

        {/* ══════════ CHIPS ══════════ */}
        <div className="bus-chips">
          <button className={`chip${!query.trim() ? " on" : ""}`} onClick={() => setQuery("")}>
            Todos
          </button>
          {CATEGORIAS.map(c => (
            <button
              key={c.nombre}
              className={`chip${catActiva === c.nombre ? " on" : ""}`}
              onClick={() => setQuery(catActiva === c.nombre ? "" : c.nombre)}
            >
              {c.nombre}
            </button>
          ))}
        </div>

        {/* ══════════ CONTEO ══════════ */}
        {!cargando && (
          <div className="bus-count">
            {query.trim() ? (
              <span>
                <b>{resultados.length}</b> {resultados.length === 1 ? "resultado" : "resultados"} para <em>“{query.trim()}”</em>
              </span>
            ) : (
              <span><b>{resultados.length}</b> {resultados.length === 1 ? "producto" : "productos"} disponibles</span>
            )}
          </div>
        )}

        {/* ══════════ RESULTADOS ══════════ */}
        {cargando ? (
          <div className="bus-grid" style={{ marginTop: 34 }} aria-hidden="true">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="sk">
                <div className="sk-img" />
                <div className="sk-l w40" /><div className="sk-l w80" /><div className="sk-l w55" />
              </div>
            ))}
          </div>
        ) : resultados.length === 0 ? (
          <div className="vacio">
            <div className="vacio-ico">{ico.lupa}</div>
            <h3>Sin resultados para “{query.trim()}”</h3>
            <p>Probá con otra palabra o mirá todo el catálogo.</p>
            <button className="vacio-btn" onClick={() => { setQuery(""); inputRef.current?.focus(); }}>
              Ver todos los productos
            </button>
          </div>
        ) : (
          <div className="bus-grid">
            {resultados.map(p => {
              const off = pctOff(p.precio, p.precioAnterior);
              return (
                <a key={p.id} className="rcard" href={`/productos/${p.slug}`}>
                  <div className="rcard-img">
                    <img src={p.imagen} alt={p.nombre} loading="lazy" />
                    {off > 0 && <span className="rcard-off">-{off}%</span>}
                  </div>
                  <div className="rcard-body">
                    <span className="rcard-cat">{categoriaDe(p)}</span>
                    <h3 className="rcard-name">{resaltar(p.nombre, query)}</h3>
                    {p.descripcion && <p className="rcard-desc">{p.descripcion}</p>}
                    <div className="rcard-foot">
                      <span className="rcard-precio">{p.precio}</span>
                      {p.precioAnterior && <span className="rcard-antes">{p.precioAnterior}</span>}
                      {p.envioGratis && (
                        <span className="rcard-ship">{ico.camion} Gratis</span>
                      )}
                    </div>
                  </div>
                </a>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
