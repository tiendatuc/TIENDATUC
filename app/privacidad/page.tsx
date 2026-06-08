export default function Privacidad() {
  return (
    <div style={{ background:"var(--bg)", minHeight:"100vh", padding:"60px 20px 80px" }}>
      <div style={{ maxWidth:760, margin:"0 auto" }}>
        <div className="t-label" style={{ marginBottom:10 }}>Legal</div>
        <h1 style={{ marginBottom:8 }}>Política de Privacidad</h1>
        <p className="t-sm" style={{ marginBottom:40 }}>Última actualización: junio de 2026</p>

        {[
          {
            titulo: "1. Información que recopilamos",
            texto: `Al realizar una compra o registrarte en TiendaTuc (tiendatuc.store), recopilamos la siguiente información personal: nombre y apellido, dirección de correo electrónico, número de teléfono, DNI, dirección de envío y datos de pago procesados de forma segura por MercadoPago.\n\nNo almacenamos datos de tarjetas de crédito o débito en nuestros servidores. Toda la información de pago es procesada directamente por MercadoPago bajo sus propios estándares de seguridad.`
          },
          {
            titulo: "2. Cómo usamos tu información",
            texto: `Utilizamos tus datos personales para:\n\n• Procesar y gestionar tus pedidos\n• Coordinar el envío de tus productos\n• Enviarte confirmaciones de compra y actualizaciones sobre tu pedido\n• Brindarte soporte al cliente\n• Mejorar nuestros servicios\n\nNo vendemos, alquilamos ni compartimos tu información personal con terceros, excepto con los proveedores de logística necesarios para entregar tu pedido.`
          },
          {
            titulo: "3. Cookies",
            texto: `Nuestro sitio utiliza cookies para mejorar tu experiencia de navegación, recordar tus preferencias y analizar el tráfico del sitio. Podés desactivar las cookies desde la configuración de tu navegador, aunque esto puede afectar algunas funcionalidades del sitio.`
          },
          {
            titulo: "4. Seguridad de tu información",
            texto: `Implementamos medidas de seguridad técnicas y organizativas para proteger tu información personal contra accesos no autorizados, alteración, divulgación o destrucción. Todos los datos se transmiten mediante conexión segura (HTTPS).`
          },
          {
            titulo: "5. Tus derechos",
            texto: `Tenés derecho a acceder, rectificar o eliminar tus datos personales en cualquier momento. Para ejercer estos derechos, podés contactarnos por WhatsApp al +54 9 381 544-0596 o por email a tiendatuc13@gmail.com.`
          },
          {
            titulo: "6. Menores de edad",
            texto: `Nuestros servicios no están dirigidos a personas menores de 18 años. No recopilamos intencionalmente información personal de menores.`
          },
          {
            titulo: "7. Cambios en esta política",
            texto: `Podemos actualizar esta política de privacidad periódicamente. Te notificaremos cualquier cambio significativo publicando la nueva política en esta página con la fecha de actualización correspondiente.`
          },
          {
            titulo: "8. Contacto",
            texto: `Si tenés preguntas sobre esta política de privacidad, podés contactarnos:\n\n• WhatsApp: +54 9 381 544-0596\n• Email: tiendatuc13@gmail.com\n• Sitio web: tiendatuc.store`
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
