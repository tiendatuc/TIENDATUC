export default function Gracias() {
  return (
    <div style={{
      minHeight: "80vh", display: "flex",
      alignItems: "center", justifyContent: "center",
      textAlign: "center", padding: "40px 24px",
      background: "#0F0F0F",
    }}>
      <div>
        <div style={{
          width: 72, height: 72, borderRadius: "50%",
          background: "#4CAF8A",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 32, margin: "0 auto 24px",
        }}>✓</div>
        <h1 style={{
          fontFamily: "'Syne', sans-serif",
          fontSize: 32, fontWeight: 800,
          color: "#E8E4E0", marginBottom: 12,
        }}>¡Gracias por tu compra!</h1>
        <p style={{
          fontSize: 15, color: "rgba(232,228,224,0.5)",
          lineHeight: 1.7, marginBottom: 32,
        }}>
          Tu pago fue procesado correctamente.<br />
          Te contactamos por WhatsApp para coordinar el envío.
        </p>
        <a href="/" style={{
          display: "inline-block",
          background: "#D4845A", color: "#0F0F0F",
          fontSize: 11, fontWeight: 700,
          letterSpacing: 2, textTransform: "uppercase",
          padding: "14px 28px", borderRadius: 3,
          textDecoration: "none",
        }}>Volver a la tienda</a>
      </div>
    </div>
  );
}