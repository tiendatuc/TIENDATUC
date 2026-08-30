export default function Devoluciones() {
  return (
    <div style={{ background:"var(--bg)", minHeight:"100vh", padding:"60px 20px 80px" }}>
      <div style={{ maxWidth:760, margin:"0 auto" }}>
        <div className="t-label" style={{ marginBottom:10 }}>Legal</div>
        <h1 style={{ marginBottom:8 }}>Política de Devoluciones</h1>
        <p className="t-sm" style={{ marginBottom:40 }}>Última actualización: junio de 2026</p>

        <div style={{ background:"var(--green-soft)", border:"1px solid color-mix(in srgb, var(--green) 25%, transparent)", borderRadius:12, padding:"20px 24px", marginBottom:40 }}>
          <p className="t-sm" style={{ color:"var(--green)", fontWeight:600, marginBottom:4 }}>✓ Devoluciones sin complicaciones</p>
          <p className="t-sm">Si tu producto llega con algún defecto o no es lo que esperabas, lo resolvemos. Contactanos por WhatsApp y te guiamos en el proceso.</p>
        </div>

        {[
          {
            titulo: "1. Plazo de devolución",
            texto: `Aceptamos devoluciones dentro de los 30 días corridos desde la fecha de recepción del producto, siempre que se cumplan las condiciones detalladas en esta política.`
          },
          {
            titulo: "2. Condiciones para devolución",
            texto: `Para que una devolución sea válida, el producto debe:\n\n• Estar en su estado original, sin uso o con uso mínimo\n• Contar con todos sus accesorios y embalaje original\n• No presentar daños físicos causados por el cliente\n• Incluir el comprobante de compra`
          },
          {
            titulo: "3. Motivos aceptados",
            texto: `Aceptamos devoluciones por los siguientes motivos:\n\n• Producto defectuoso o con falla de fábrica\n• Producto distinto al pedido\n• Producto dañado durante el transporte\n• El producto no funciona correctamente desde el primer uso`
          },
          {
            titulo: "4. Cómo iniciar una devolución",
            texto: `Para solicitar una devolución:\n\n1. Contactanos por WhatsApp al +54 9 381 544-0596\n2. Indicá tu nombre, número de pedido y motivo de la devolución\n3. Adjuntá fotos o video del problema\n4. Te respondemos en menos de 24hs hábiles con los pasos a seguir`
          },
          {
            titulo: "5. Proceso de reembolso",
            texto: `Una vez aprobada la devolución:\n\n• El reembolso se realiza por el mismo medio de pago utilizado en la compra\n• A través de MercadoPago el reembolso se acredita en un plazo de 3 a 15 días hábiles según el banco\n• En casos de cambio de producto, coordinamos el envío del nuevo producto sin costo adicional`
          },
          {
            titulo: "6. Costos de envío en devoluciones",
            texto: `Si la devolución se debe a un defecto del producto o error de nuestra parte, cubrimos el costo del envío de devolución.\n\nSi el motivo es un arrepentimiento de compra (el producto funciona correctamente), el costo del envío de devolución corre por cuenta del cliente.`
          },
          {
            titulo: "7. Productos no admitidos para devolución",
            texto: `No se aceptan devoluciones de:\n\n• Productos con daños causados por mal uso o accidentes\n• Productos con garantía vencida\n• Productos sin embalaje original cuando el motivo no es un defecto`
          },
          {
            titulo: "8. Garantía extendida",
            texto: `Todos nuestros productos tienen 6 meses de garantía contra defectos de fabricación. Si el producto falla dentro de este período por causas no imputables al cliente, lo reparamos, reemplazamos o reembolsamos sin costo.`
          },
          {
            titulo: "9. Contacto",
            texto: `Para cualquier consulta sobre devoluciones:\n\n• WhatsApp: +54 9 381 544-0596 (lunes a sábado de 9 a 21hs)\n• Email: tiendatuc13@gmail.com\n• Tiempo de respuesta: menos de 24hs hábiles`
          },
        ].map(({ titulo, texto }) => (
          <div key={titulo} style={{ marginBottom:36 }}>
            <h3 style={{ marginBottom:12, color:"var(--text)" }}>{titulo}</h3>
            {texto.split("\n").map((line, i) => (
              <p key={i} className="t-sm" style={{ marginBottom: line === "" ? 8 : 6, lineHeight:1.8 }}>{line}</p>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
