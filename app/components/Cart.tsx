"use client";
import { useState, useEffect } from "react";
import { useCart } from "../store/cartStore";

export default function Cart() {
  const [abierto, setAbierto] = useState(false);
  const { items, agregar, quitar, cambiarCantidad, vaciar, total, cantidadTotal } = useCart();

  useEffect(() => {
    useCart.persist.rehydrate();
  }, []);

  const formatPrecio = (n: number) => "$" + n.toLocaleString("es-AR", { minimumFractionDigits: 0 });

  const handlePagar = () => {
    setAbierto(false);
    window.location.href = "/checkout";
  };

  return (
    <>
      <style>{`
        @keyframes checkPop { 0%{transform:scale(0)} 60%{transform:scale(1.2)} 100%{transform:scale(1)} }
      `}</style>

      {/* Botón carrito */}
      <button onClick={() => setAbierto(true)} style={{
        position:"relative", background:"transparent",
        border:"1px solid rgba(232,228,224,0.2)",
        borderRadius:6, padding:"8px 14px",
        color:"#E8E4E0", cursor:"pointer",
        display:"flex", alignItems:"center", gap:8,
        fontSize:12, fontWeight:600,
      }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
          <line x1="3" y1="6" x2="21" y2="6"/>
          <path d="M16 10a4 4 0 01-8 0"/>
        </svg>
        {cantidadTotal() > 0 && (
          <span style={{
            position:"absolute", top:-6, right:-6,
            background:"#D4845A", color:"#0F0F0F",
            fontSize:10, fontWeight:800,
            width:18, height:18, borderRadius:"50%",
            display:"flex", alignItems:"center", justifyContent:"center",
          }}>{cantidadTotal()}</span>
        )}
      </button>

      {/* Overlay */}
      {abierto && (
        <div onClick={() => setAbierto(false)} style={{
          position:"fixed", inset:0,
          background:"rgba(0,0,0,0.7)", zIndex:200,
        }} />
      )}

      {/* Panel */}
      <div style={{
        position:"fixed", top:0, right:0,
        width:"min(420px, 100vw)", height:"100vh",
        background:"#141414",
        borderLeft:"1px solid rgba(232,228,224,0.07)",
        zIndex:201, display:"flex", flexDirection:"column",
        transform:abierto ? "translateX(0)" : "translateX(100%)",
        transition:"transform 0.3s ease",
      }}>
        {/* Header */}
        <div style={{
          padding:"20px 24px",
          borderBottom:"1px solid rgba(232,228,224,0.07)",
          display:"flex", justifyContent:"space-between", alignItems:"center",
        }}>
          <div style={{ fontFamily:"'Syne',sans-serif", fontSize:18, fontWeight:700 }}>
            Carrito {cantidadTotal() > 0 && `(${cantidadTotal()})`}
          </div>
          <button onClick={() => setAbierto(false)} style={{
            background:"transparent", border:"none",
            color:"#E8E4E0", fontSize:22, cursor:"pointer",
          }}>✕</button>
        </div>

        {/* Items */}
        <div style={{ flex:1, overflowY:"auto", padding:"16px 24px" }}>
          {items.length === 0 ? (
            <div style={{ textAlign:"center", padding:"60px 0", color:"rgba(232,228,224,0.3)", fontSize:14 }}>
              <div style={{ fontSize:48, marginBottom:16 }}>🛒</div>
              Tu carrito está vacío
            </div>
          ) : (
            items.map(item => (
              <div key={item.id} style={{
                display:"flex", gap:14, marginBottom:20,
                paddingBottom:20, borderBottom:"1px solid rgba(232,228,224,0.06)",
              }}>
                <img src={item.imagen} alt={item.nombre} style={{
                  width:72, height:72, objectFit:"cover",
                  borderRadius:6, flexShrink:0, background:"#1A1A1A",
                }} />
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:12, color:"rgba(232,228,224,0.6)", marginBottom:6 }}>{item.nombre}</div>
                  <div style={{ fontSize:16, fontWeight:700, marginBottom:10 }}>{formatPrecio(item.precioNum * item.cantidad)}</div>
                  <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                    <button onClick={() => cambiarCantidad(item.id, item.cantidad - 1)} style={{
                      width:28, height:28, background:"#222",
                      border:"1px solid rgba(232,228,224,0.1)",
                      color:"#E8E4E0", borderRadius:4, cursor:"pointer", fontSize:16,
                    }}>−</button>
                    <span style={{ fontSize:14, fontWeight:600 }}>{item.cantidad}</span>
                    <button onClick={() => cambiarCantidad(item.id, item.cantidad + 1)} style={{
                      width:28, height:28, background:"#222",
                      border:"1px solid rgba(232,228,224,0.1)",
                      color:"#E8E4E0", borderRadius:4, cursor:"pointer", fontSize:16,
                    }}>+</button>
                    <button onClick={() => quitar(item.id)} style={{
                      marginLeft:"auto", background:"transparent",
                      border:"none", color:"rgba(232,228,224,0.3)",
                      cursor:"pointer", fontSize:18,
                    }}>🗑</button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div style={{ padding:"20px 24px", borderTop:"1px solid rgba(232,228,224,0.07)" }}>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:16, fontSize:18, fontWeight:700 }}>
              <span>Total</span>
              <span style={{ color:"#D4845A" }}>{formatPrecio(total())}</span>
            </div>
            <button onClick={handlePagar} style={{
              width:"100%", background:"#D4845A",
              color:"#0F0F0F", border:"none", borderRadius:6,
              padding:"15px", fontSize:11, fontWeight:700,
              letterSpacing:1.5, textTransform:"uppercase",
              cursor:"pointer", marginBottom:10,
            }}>
              Comprar Ahora →
            </button>
            <button onClick={vaciar} style={{
              width:"100%", background:"transparent",
              border:"1px solid rgba(232,228,224,0.1)",
              color:"rgba(232,228,224,0.4)", borderRadius:6,
              padding:"11px", fontSize:11, cursor:"pointer",
            }}>
              Vaciar carrito
            </button>
          </div>
        )}
      </div>
    </>
  );
}
