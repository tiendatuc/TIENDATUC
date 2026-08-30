export default function Gracias() {
  return (
    <div style={{
      minHeight: "80vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      textAlign: "center",
      padding: "48px 24px",
      background: "var(--bg)",
    }}>
      <div style={{
        maxWidth: 440,
        background: "var(--bg-2)",
        border: "1px solid var(--border)",
        borderRadius: 20,
        padding: "40px 32px",
        boxShadow: "var(--card-shadow)",
      }}>
        <div style={{
          width: 64,
          height: 64,
          borderRadius: 18,
          background: "var(--green-soft)",
          color: "var(--green)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 28,
          fontWeight: 800,
          margin: "0 auto 22px",
        }}>✓</div>
        <div style={{
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: "var(--copper)",
          marginBottom: 8,
        }}>Pedido confirmado</div>
        <h1 style={{
          fontFamily: "var(--font-display)",
          fontSize: 28,
          fontWeight: 800,
          letterSpacing: "-0.03em",
          color: "var(--text)",
          marginBottom: 12,
        }}>¡Gracias por tu compra!</h1>
        <p style={{
          fontSize: 15,
          color: "var(--text-2)",
          lineHeight: 1.7,
          marginBottom: 28,
        }}>
          El pago salió bien. En un rato te escribimos por WhatsApp para coordinar el envío.
        </p>
        <a href="/" className="btn-gold" style={{
          display: "inline-flex",
          textDecoration: "none",
          letterSpacing: 0,
        }}>
          Volver a la tienda
        </a>
      </div>
    </div>
  );
}
