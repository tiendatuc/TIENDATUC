"use client";
import { useState, useEffect } from "react";
import { useCart } from "../store/cartStore";

const svg = { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };

export default function Cart() {
  const [abierto, setAbierto] = useState(false);
  const { items, quitar, cambiarCantidad, vaciar, total, cantidadTotal } = useCart();

  useEffect(() => {
    useCart.persist.rehydrate();
  }, []);

  // Con el panel abierto: se cierra con Escape y se bloquea el scroll del fondo
  useEffect(() => {
    if (!abierto) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setAbierto(false);
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [abierto]);

  const formatPrecio = (n: number) => "$" + Math.round(n || 0).toLocaleString("es-AR");
  const cantidad = cantidadTotal();

  const handlePagar = () => {
    setAbierto(false);
    window.location.href = "/checkout";
  };

  return (
    <>
      <style>{`
        .cart-btn{position:relative;display:flex;align-items:center;gap:8px;background:transparent;
          border:1px solid var(--border-2);border-radius:8px;padding:8px 13px;color:var(--text);
          font-size:12px;font-weight:700;cursor:pointer;transition:border-color .16s,background .16s;}
        .cart-btn:hover{border-color:var(--copper);background:var(--accent-soft);}
        .cart-count{position:absolute;top:-7px;right:-7px;min-width:19px;height:19px;padding:0 5px;
          background:var(--copper);color:var(--on-accent);font-size:10px;font-weight:800;border-radius:999px;
          display:flex;align-items:center;justify-content:center;box-shadow:0 0 0 2px var(--nav-bg);}

        .cart-ov{position:fixed;inset:0;z-index:800;background:var(--overlay);opacity:0;pointer-events:none;
          transition:opacity .28s ease;backdrop-filter:blur(2px);}
        .cart-ov.on{opacity:1;pointer-events:auto;}

        .cart-panel{position:fixed;top:0;right:0;z-index:801;width:min(430px,100vw);height:100dvh;
          display:flex;flex-direction:column;background:var(--menu-bg);border-left:1px solid var(--border-2);
          box-shadow:-24px 0 60px rgba(0,0,0,.18);transform:translateX(100%);visibility:hidden;
          transition:transform .3s cubic-bezier(.4,0,.2,1),visibility .3s;}
        .cart-panel.on{transform:translateX(0);visibility:visible;}

        .cart-head{display:flex;align-items:center;justify-content:space-between;gap:12px;
          padding:18px 22px;border-bottom:1px solid var(--border);flex-shrink:0;}
        .cart-title{font-family:var(--font-display);font-size:18px;font-weight:800;letter-spacing:-.02em;color:var(--text);}
        .cart-title span{font-family:var(--font-body);font-size:12px;font-weight:700;color:var(--text-3);margin-left:6px;}
        .cart-x{width:34px;height:34px;flex-shrink:0;display:flex;align-items:center;justify-content:center;
          border-radius:9px;border:1px solid var(--border);background:transparent;color:var(--text-2);cursor:pointer;
          transition:background .15s,color .15s;}
        .cart-x:hover{background:var(--hover);color:var(--text);}

        .cart-body{flex:1;overflow-y:auto;padding:16px 22px;}

        .cart-item{display:flex;gap:14px;padding:14px;border:1px solid var(--border);border-radius:14px;
          background:var(--surface);margin-bottom:12px;transition:border-color .16s;}
        .cart-item:hover{border-color:var(--border-2);}
        .cart-thumb{width:72px;height:72px;flex-shrink:0;border-radius:10px;overflow:hidden;background:var(--img-bg);}
        .cart-thumb img{width:100%;height:100%;object-fit:contain;padding:5px;}
        .cart-info{flex:1;min-width:0;display:flex;flex-direction:column;}
        .cart-name{font-size:13px;font-weight:600;color:var(--text);line-height:1.35;
          display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;}
        .cart-unit{font-size:11.5px;color:var(--text-3);margin-top:2px;}
        .cart-row{display:flex;align-items:center;gap:10px;margin-top:auto;padding-top:10px;}
        .cart-qty{display:inline-flex;align-items:center;border:1px solid var(--border-2);border-radius:9px;
          background:var(--bg-3);overflow:hidden;}
        .cart-qty button{width:30px;height:30px;border:none;background:transparent;color:var(--text);
          font-size:17px;line-height:1;cursor:pointer;display:flex;align-items:center;justify-content:center;
          transition:background .15s,color .15s;}
        .cart-qty button:hover:not(:disabled){background:var(--accent-soft);color:var(--copper);}
        .cart-qty button:disabled{color:var(--text-4);cursor:not-allowed;}
        .cart-qty span{min-width:30px;text-align:center;font-size:13px;font-weight:800;color:var(--text);}
        .cart-line{margin-left:auto;font-size:15px;font-weight:900;letter-spacing:-.02em;color:var(--text);white-space:nowrap;}
        .cart-del{width:30px;height:30px;border:none;background:transparent;color:var(--text-4);cursor:pointer;
          border-radius:8px;display:flex;align-items:center;justify-content:center;transition:color .15s,background .15s;}
        .cart-del:hover{color:var(--red);background:var(--red-soft);}

        .cart-empty{text-align:center;padding:64px 20px;}
        .cart-empty-ico{width:76px;height:76px;margin:0 auto 18px;border-radius:50%;background:var(--accent-soft);
          color:var(--copper);display:flex;align-items:center;justify-content:center;}
        .cart-empty h4{font-size:16px;font-weight:800;color:var(--text);margin-bottom:6px;}
        .cart-empty p{font-size:13px;color:var(--text-3);margin-bottom:22px;line-height:1.6;}

        .cart-foot{flex-shrink:0;padding:18px 22px calc(18px + env(safe-area-inset-bottom));
          border-top:1px solid var(--border);background:var(--menu-bg);}
        .cart-ticket{background:var(--bg);border:1px solid var(--border);border-radius:14px;padding:14px 16px 12px;margin-bottom:14px;}
        .cart-line-row{display:flex;justify-content:space-between;align-items:center;font-size:13px;color:var(--text-2);margin-bottom:8px;}
        .cart-total{display:flex;justify-content:space-between;align-items:baseline;padding-top:10px;
          border-top:1px dashed var(--border-2);}
        .cart-total b{font-size:13px;font-weight:700;color:var(--text);}
        .cart-total i{font-style:normal;font-size:22px;font-weight:900;letter-spacing:-.03em;color:var(--text);}
        .cart-pagar{width:100%;display:flex;align-items:center;justify-content:center;gap:9px;border:none;
          border-radius:12px;padding:17px;font-size:15px;font-weight:800;letter-spacing:0;cursor:pointer;
          background:var(--gold);color:var(--on-gold);
          transition:transform .16s,filter .16s;}
        .cart-pagar:hover{filter:brightness(1.07);transform:translateY(-2px);}
        .cart-pagar:active{transform:translateY(0);}
        .cart-cta-note{margin-top:10px;text-align:center;font-size:12px;color:var(--text-3);line-height:1.4;}
        .cart-links{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-top:14px;}
        .cart-seguir{background:none;border:none;padding:0;font-size:12.5px;font-weight:700;color:var(--text-2);
          cursor:pointer;transition:color .15s;}
        .cart-seguir:hover{color:var(--copper);}
        .cart-vaciar{background:none;border:none;padding:0;font-size:12.5px;font-weight:600;color:var(--text-4);cursor:pointer;transition:color .15s;}
        .cart-vaciar:hover{color:var(--red);}
        .cart-seguro{display:flex;align-items:center;justify-content:center;gap:7px;margin-top:14px;
          font-size:11.5px;font-weight:600;color:var(--text-3);}
        .cart-seguro svg{color:var(--green);}
      `}</style>

      <button
        className="cart-btn"
        onClick={() => setAbierto(true)}
        aria-label={`Abrir carrito${cantidad > 0 ? ` (${cantidad} productos)` : ""}`}
      >
        <svg {...svg} width="18" height="18">
          <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
          <line x1="3" y1="6" x2="21" y2="6" />
          <path d="M16 10a4 4 0 0 1-8 0" />
        </svg>
        {cantidad > 0 && <span className="cart-count">{cantidad}</span>}
      </button>

      <div className={`cart-ov${abierto ? " on" : ""}`} onClick={() => setAbierto(false)} />

      <aside className={`cart-panel${abierto ? " on" : ""}`} aria-hidden={!abierto} aria-label="Carrito de compras">
        <div className="cart-head">
          <div className="cart-title">
            Tu carrito
            {cantidad > 0 && <span>{cantidad} {cantidad === 1 ? "producto" : "productos"}</span>}
          </div>
          <button className="cart-x" onClick={() => setAbierto(false)} aria-label="Cerrar carrito">
            <svg {...svg} width="17" height="17" strokeWidth={2}><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
          </button>
        </div>

        <div className="cart-body">
          {items.length === 0 ? (
            <div className="cart-empty">
              <div className="cart-empty-ico">
                <svg {...svg} width="32" height="32">
                  <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                </svg>
              </div>
              <h4>Tu carrito está vacío</h4>
              <p>Sumá productos y aprovechá el envío gratis<br />en los productos seleccionados.</p>
              <a href="/buscar" onClick={() => setAbierto(false)} className="cart-pagar" style={{ textDecoration: "none" }}>
                Ver productos
              </a>
            </div>
          ) : (
            items.map(item => (
              <div key={item.id} className="cart-item">
                <div className="cart-thumb"><img src={item.imagen} alt={item.nombre} /></div>
                <div className="cart-info">
                  <div className="cart-name">{item.nombre}</div>
                  <div className="cart-unit">{formatPrecio(item.precioNum)} c/u</div>
                  <div className="cart-row">
                    <div className="cart-qty">
                      <button
                        onClick={() => cambiarCantidad(item.id, item.cantidad - 1)}
                        disabled={item.cantidad <= 1}
                        aria-label="Quitar una unidad"
                      >−</button>
                      <span>{item.cantidad}</span>
                      <button onClick={() => cambiarCantidad(item.id, item.cantidad + 1)} aria-label="Agregar una unidad">+</button>
                    </div>
                    <button className="cart-del" onClick={() => quitar(item.id)} aria-label={`Quitar ${item.nombre}`}>
                      <svg {...svg} width="16" height="16"><path d="M3 6h18" /><path d="M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /></svg>
                    </button>
                    <span className="cart-line">{formatPrecio(item.precioNum * item.cantidad)}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {items.length > 0 && (
          <div className="cart-foot">
            <div className="cart-ticket">
              <div className="cart-line-row">
                <span>Subtotal</span>
                <span style={{ fontWeight: 700, color: "var(--text)" }}>{formatPrecio(total())}</span>
              </div>
              <div className="cart-line-row">
                <span>Envío</span>
                <span style={{ fontWeight: 600 }}>Se calcula después</span>
              </div>
              <div className="cart-total">
                <b>Total</b>
                <i>{formatPrecio(total())}</i>
              </div>
            </div>

            <button className="cart-pagar" onClick={handlePagar}>
              Completar pedido
              <svg {...svg} width="16" height="16" strokeWidth={2}><path d="M5 12h13" /><path d="m12 5 7 7-7 7" /></svg>
            </button>
            <p className="cart-cta-note">Después cargás tus datos, elegís el envío y pagás.</p>

            <div className="cart-links">
              <button className="cart-seguir" onClick={() => setAbierto(false)}>← Seguir comprando</button>
              <button className="cart-vaciar" onClick={vaciar}>Vaciar carrito</button>
            </div>

            <div className="cart-seguro">
              <svg {...svg} width="14" height="14"><rect x="3" y="11" width="18" height="10" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
              Pago protegido con MercadoPago
            </div>
          </div>
        )}
      </aside>
    </>
  );
}
