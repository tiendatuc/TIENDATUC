export default function Terminos() {
  return (
    <div style={{ background:"var(--bg)", minHeight:"100vh", padding:"60px 20px 80px" }}>
      <div style={{ maxWidth:760, margin:"0 auto" }}>
        <div className="t-label" style={{ marginBottom:10 }}>Legal</div>
        <h1 style={{ marginBottom:8 }}>Términos y Condiciones</h1>
        <p className="t-sm" style={{ marginBottom:40 }}>Última actualización: junio de 2026</p>

        {[
          {
            titulo: "1. Aceptación de los términos",
            texto: `Al acceder y utilizar tiendatuc.store, aceptás estos términos y condiciones en su totalidad. Si no estás de acuerdo con alguna parte de estos términos, no debés utilizar nuestro sitio.`
          },
          {
            titulo: "2. Descripción del servicio",
            texto: `TiendaTuc es una tienda online que comercializa productos de tecnología y hogar en la República Argentina. Operamos como revendedores y utilizamos proveedores de logística para el despacho de los productos.`
          },
          {
            titulo: "3. Precios y pagos",
            texto: `Todos los precios publicados en el sitio están expresados en pesos argentinos (ARS) e incluyen IVA. Nos reservamos el derecho de modificar los precios sin previo aviso.\n\nLos pagos se procesan a través de MercadoPago, aceptando tarjetas de crédito, débito y otros medios disponibles en la plataforma. La transacción queda confirmada una vez aprobado el pago por MercadoPago.`
          },
          {
            titulo: "4. Envíos",
            texto: `Realizamos envíos a todo el país a través de Urbano Express (interior del país) y Fixy (CABA y GBA).\n\n• El tiempo estimado de entrega es de 3 a 10 días hábiles según la provincia de destino\n• El envío es gratuito en todos los pedidos\n• Una vez despachado el pedido, te informamos el número de seguimiento por WhatsApp\n• No nos responsabilizamos por demoras ocasionadas por los servicios de transporte`
          },
          {
            titulo: "5. Disponibilidad de productos",
            texto: `El stock indicado en el sitio es orientativo. En caso de que un producto no esté disponible luego de realizada la compra, te contactaremos para ofrecerte una alternativa o realizar el reembolso completo.`
          },
          {
            titulo: "6. Garantía",
            texto: `Todos nuestros productos cuentan con garantía de 6 meses contra defectos de fabricación. La garantía no cubre daños ocasionados por mal uso, golpes, líquidos o modificaciones no autorizadas.\n\nPara hacer válida la garantía, contactanos por WhatsApp con foto o video del defecto dentro del período de garantía.`
          },
          {
            titulo: "7. Limitación de responsabilidad",
            texto: `TiendaTuc no se responsabiliza por daños indirectos, incidentales o consecuentes derivados del uso o imposibilidad de uso de nuestros productos. Nuestra responsabilidad máxima se limita al valor del producto adquirido.`
          },
          {
            titulo: "8. Propiedad intelectual",
            texto: `Todo el contenido del sitio (textos, imágenes, logos, diseños) es propiedad de TiendaTuc o de sus respectivos titulares. Queda prohibida su reproducción sin autorización expresa.`
          },
          {
            titulo: "9. Ley aplicable",
            texto: `Estos términos se rigen por las leyes de la República Argentina. Cualquier controversia será sometida a los tribunales competentes de la provincia de Tucumán.`
          },
          {
            titulo: "10. Contacto",
            texto: `Para consultas sobre estos términos:\n\n• WhatsApp: +54 9 381 544-0596\n• Email: tiendatuc13@gmail.com\n• Sitio web: tiendatuc.store`
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
