"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "../lib/supabase";
import Cart from "./Cart";
import MobileMenu from "./MobileMenu";
import NavUser from "./NavUser";
import ThemeToggle from "./ThemeToggle";
import "./header.css";

const svg = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

const ico = {
  camion: <svg {...svg} width="14" height="14" strokeWidth={2.2}><rect x="1" y="6" width="14" height="10" rx="1" /><path d="M15 9h3.5l3 3v4H15" /><circle cx="6" cy="19" r="2" /><circle cx="17.5" cy="19" r="2" /></svg>,
  tarjeta: <svg {...svg} width="14" height="14" strokeWidth={2.2}><rect x="2" y="5" width="20" height="14" rx="2" /><line x1="2" y1="10" x2="22" y2="10" /></svg>,
  escudo: <svg {...svg} width="14" height="14" strokeWidth={2.2}><path d="M12 2 3 6v6c0 5 3.8 8.6 9 10 5.2-1.4 9-5 9-10V6l-9-4z" /><path d="m9 12 2 2 4-4" /></svg>,
  wsp: <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347M12.05 21.785h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884" /></svg>,
  lupa: <svg {...svg} width="17" height="17"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></svg>,
  equis: <svg {...svg} width="14" height="14" strokeWidth={2.4}><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>,
  flecha: <svg {...svg} width="14" height="14"><path d="M5 12h13" /><path d="m12 5 7 7-7 7" /></svg>,
  caret: <svg {...svg} width="12" height="12" strokeWidth={2.5} className="hd-cat-caret"><path d="m6 9 6 6 6-6" /></svg>,
  casa: <svg {...svg} width="17" height="17" strokeWidth={1.9}><path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z" /></svg>,
  chip: <svg {...svg} width="17" height="17" strokeWidth={1.9}><rect x="6" y="6" width="12" height="12" rx="2" /><path d="M9 2v4M15 2v4M9 18v4M15 18v4M2 9h4M2 15h4M18 9h4M18 15h4" /></svg>,
  juego: <svg {...svg} width="17" height="17" strokeWidth={1.9}><path d="M6 11h4M8 9v4M15 12h.01M18 10h.01" /><rect x="2" y="6" width="20" height="12" rx="6" /></svg>,
  grilla: <svg {...svg} width="17" height="17" strokeWidth={1.9}><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></svg>,
};

const PROMOS = [
  { icon: ico.camion, texto: <>Envío <b>gratis</b> a todo el país</> },
  { icon: ico.tarjeta, texto: <>Hasta <b>12 cuotas sin interés</b></> },
  { icon: ico.escudo, texto: <><b>6 meses de garantía</b></> },
];

const CATEGORIAS = [
  { titulo: "Hogar", desc: "Cocina, muebles y organización", href: "/buscar?q=Hogar", icon: ico.casa },
  { titulo: "Tecnología", desc: "Proyectores, audio y gadgets", href: "/buscar?q=Tecnolog%C3%ADa", icon: ico.chip },
  { titulo: "Entretenimiento", desc: "Juegos y aire libre", href: "/buscar?q=Entretenimiento", icon: ico.juego },
  { titulo: "Ver todo el catálogo", desc: "Todos los productos disponibles", href: "/buscar", icon: ico.grilla },
];

type Sugerencia = { id: number; slug: string; nombre: string; precio: string; imagen: string };

export default function SiteHeader() {
  /* ── altura real del header, publicada como --hd-h ──
     La usan los toasts para no quedar tapados: el header cambia de alto
     según el ancho de pantalla. */
  const headerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = headerRef.current;
    if (!el) return;
    const medir = () =>
      document.documentElement.style.setProperty("--hd-h", `${el.offsetHeight}px`);
    medir();
    const ro = new ResizeObserver(medir);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  /* ── buscador con sugerencias en vivo ── */
  const [query, setQuery] = useState("");
  const [abierto, setAbierto] = useState(false);
  // Los resultados se guardan junto a la query que los produjo, así
  // "cargando" y la lista visible se derivan y no hace falta resetearlos.
  const [busqueda, setBusqueda] = useState<{ q: string; items: Sugerencia[] } | null>(null);
  const [activo, setActivo] = useState(-1);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const q = query.trim();

  useEffect(() => {
    if (q.length < 2) return;
    let vigente = true;
    const id = setTimeout(async () => {
      const { data } = await supabase
        .from("productos")
        .select("id, slug, nombre, precio, imagenes")
        .eq("activo", true)
        .ilike("nombre", `%${q}%`)
        .limit(5);
      if (!vigente) return;
      setBusqueda({
        q,
        items: (data || []).map(p => ({
          id: p.id,
          slug: p.slug,
          nombre: p.nombre,
          precio: p.precio,
          imagen: p.imagenes?.[0] || "",
        })),
      });
    }, 220);
    return () => {
      vigente = false;
      clearTimeout(id);
    };
  }, [q]);

  const alDia = busqueda?.q === q;
  const resultados = alDia ? busqueda.items : [];
  const cargando = q.length >= 2 && !alDia;

  // Se cierra el panel al hacer click afuera
  useEffect(() => {
    if (!abierto) return;
    const onClick = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setAbierto(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [abierto]);

  const irABuscar = useCallback((texto: string) => {
    const t = texto.trim();
    window.location.href = t ? `/buscar?q=${encodeURIComponent(t)}` : "/buscar";
  }, []);

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      setAbierto(false);
      inputRef.current?.blur();
      return;
    }
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      if (!resultados.length) return;
      e.preventDefault();
      const paso = e.key === "ArrowDown" ? 1 : -1;
      setActivo(a => (a + paso + resultados.length) % resultados.length);
      return;
    }
    if (e.key === "Enter") {
      const elegido = resultados[activo];
      if (elegido) window.location.href = `/productos/${elegido.slug}`;
      else irABuscar(query);
    }
  };

  /* ── desplegable de categorías ── */
  const [mega, setMega] = useState(false);
  const megaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mega) return;
    const onClick = (e: MouseEvent) => {
      if (megaRef.current && !megaRef.current.contains(e.target as Node)) setMega(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMega(false);
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [mega]);

  return (
    <header ref={headerRef} className="hd">

      {/* ── Fila 1 · beneficios ── */}
      <div className="hd-promo">
        <div className="hd-promo-inner">
          {PROMOS.map((p, i) => (
            <span key={i} className="hd-promo-item">
              {p.icon}
              <span>{p.texto}</span>
            </span>
          ))}
          <a
            href="https://wa.me/5493815440596"
            className="hd-promo-side"
            target="_blank"
            rel="noopener noreferrer"
          >
            {ico.wsp} Escribinos
          </a>
        </div>
      </div>

      {/* ── Fila 2 · logo · buscador · acciones ── */}
      <div className="hd-main">
        <MobileMenu />

        <a href="/" className="hd-logo" aria-label="TiendaTuc, ir al inicio">
          <span className="hd-logo-name">TiendaTuc</span>
          <span className="hd-logo-sub">Hogar · Tecnología</span>
        </a>

        <div className={`hd-search${abierto ? " is-open" : ""}`} ref={searchRef}>
          <form
            className="hd-search-box"
            onSubmit={e => {
              e.preventDefault();
              irABuscar(query);
            }}
            role="search"
          >
            {ico.lupa}
            <input
              ref={inputRef}
              className="hd-search-input"
              type="text"
              value={query}
              placeholder="¿Qué estás buscando hoy?"
              aria-label="Buscar productos"
              autoComplete="off"
              onChange={e => {
                setQuery(e.target.value);
                setActivo(-1);
                setAbierto(true);
              }}
              onFocus={() => setAbierto(true)}
              onKeyDown={onKeyDown}
            />
            {query && (
              <button
                type="button"
                className="hd-search-clear"
                onClick={() => {
                  setQuery("");
                  setActivo(-1);
                  inputRef.current?.focus();
                }}
                aria-label="Borrar búsqueda"
              >
                {ico.equis}
              </button>
            )}
          </form>

          {abierto && q.length >= 2 && (
            <div className="hd-sug">
              {cargando ? (
                <div className="hd-sug-empty">Buscando…</div>
              ) : resultados.length === 0 ? (
                <div className="hd-sug-empty">
                  Sin resultados para “{q}”.<br />Probá con otra palabra.
                </div>
              ) : (
                <>
                  <div className="hd-sug-head">Productos</div>
                  {resultados.map((r, i) => (
                    <a
                      key={r.id}
                      href={`/productos/${r.slug}`}
                      className={`hd-sug-item${i === activo ? " is-active" : ""}`}
                      onMouseEnter={() => setActivo(i)}
                    >
                      <span className="hd-sug-thumb">
                        {r.imagen && <img src={r.imagen} alt="" />}
                      </span>
                      <span className="hd-sug-info">
                        <span className="hd-sug-name">{r.nombre}</span>
                        <span className="hd-sug-price">{r.precio}</span>
                      </span>
                    </a>
                  ))}
                  <a className="hd-sug-all" href={`/buscar?q=${encodeURIComponent(q)}`}>
                    Ver todos los resultados {ico.flecha}
                  </a>
                </>
              )}
            </div>
          )}
        </div>

        <div className="hd-actions">
          <ThemeToggle />
          <NavUser />
          <Cart />
        </div>
      </div>

      {/* ── Fila 3 · categorías ── */}
      <nav className="hd-cats" aria-label="Categorías">
        <div className="hd-cats-inner">
          <a href="/" className="hd-cat">Inicio</a>

          <div ref={megaRef} style={{ position: "relative" }}>
            <button
              type="button"
              className={`hd-cat${mega ? " is-open" : ""}`}
              onClick={() => setMega(v => !v)}
              aria-expanded={mega}
              aria-haspopup="true"
            >
              Productos {ico.caret}
            </button>
            {mega && (
              <div className="hd-mega">
                {CATEGORIAS.map(c => (
                  <a key={c.titulo} href={c.href} className="hd-mega-item" onClick={() => setMega(false)}>
                    <span className="hd-mega-ico">{c.icon}</span>
                    <span>
                      <span className="hd-mega-title">{c.titulo}</span>
                      <span className="hd-mega-desc">{c.desc}</span>
                    </span>
                  </a>
                ))}
              </div>
            )}
          </div>

          <a href="/#otros" className="hd-cat">
            Ofertas <span className="hd-cat-hot">Hot</span>
          </a>
          <a href="/devoluciones" className="hd-cat">Devoluciones</a>
          <a
            href="https://wa.me/5493815440596"
            className="hd-cat"
            target="_blank"
            rel="noopener noreferrer"
          >
            Contacto
          </a>

          <span className="hd-cats-note">
            {ico.escudo} Comprá seguro con MercadoPago
          </span>
        </div>
      </nav>
    </header>
  );
}
