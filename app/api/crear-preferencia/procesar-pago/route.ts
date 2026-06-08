import { NextRequest, NextResponse } from "next/server";
 
export async function POST(req: NextRequest) {
  try {
    const { formData, pedido } = await req.json();
 
    // Procesar pago con MercadoPago
    const mpRes = await fetch("https://api.mercadopago.com/v1/payments", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer APP_USR-6392464387174733-060203-cc30465749ebc5d4ce4623aee819a3db-3442108555`,
        "X-Idempotency-Key": `${Date.now()}-${Math.random()}`,
      },
      body: JSON.stringify({
        transaction_amount: pedido.total,
        token: formData.token,
        description: pedido.items.map((i: any) => i.nombre).join(", "),
        installments: formData.installments || 1,
        payment_method_id: formData.payment_method_id,
        issuer_id: formData.issuer_id,
        payer: {
          email: pedido.email,
          identification: formData.payer?.identification || { type: "DNI", number: pedido.dni },
        },
      }),
    });
 
    const mpData = await mpRes.json();
 
    if (mpData.status === "approved") {
      const { createClient } = await import("@supabase/supabase-js");
      const supabase = createClient(
        "https://inpvwrwggnemyeyprxpx.supabase.co",
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlucHZ3cndnZ25lbXlleXByeHB4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA1Nzc1NzcsImV4cCI6MjA5NjE1MzU3N30.0i0GD4sITjxC2ZRpg5V-zLNT9fliTmMiYSDOdYThqxA"
      );
 
      // Guardar pedido en Supabase
      const { data: pedidoGuardado } = await supabase.from("pedidos").insert({
        nombre: pedido.nombre,
        email: pedido.email,
        telefono: pedido.telefono,
        dni: pedido.dni,
        tipo_envio: pedido.tipoEnvio,
        direccion: pedido.direccion,
        notas: pedido.notas,
        items: pedido.items,
        total: pedido.total,
        costo_envio: pedido.costoEnvio || 0,
        mp_payment_id: mpData.id,
        estado: "pagado",
      }).select().single();
 
      // Email de confirmación al cliente
      await fetch(`${process.env.NEXT_PUBLIC_URL || "https://tiendatuc.store"}/api/emails`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tipo: "confirmacion",
          email: pedido.email,
          nombre: pedido.nombre,
          pedidoId: pedidoGuardado?.id || mpData.id,
          items: pedido.items,
          total: pedido.total,
          direccion: pedido.direccion,
          tipoEnvio: pedido.tipoEnvio,
        }),
      });
      // Email de notificación al admin
await fetch(`https://tiendatuc.store/api/emails`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    tipo: "bienvenida", // lo usamos temporalmente
    email: "tiendatuc13@gmail.com",
    nombre: `NUEVO PEDIDO — ${pedido.nombre} — $${pedido.total.toLocaleString("es-AR")} — ${pedido.items.map((i: any) => i.nombre).join(", ")}`,
  }),
});
 
      // Notificación WhatsApp
      const msg = `🛒 *NUEVO PEDIDO*\n\n👤 ${pedido.nombre}\n📧 ${pedido.email}\n📱 ${pedido.telefono}\n🪪 DNI: ${pedido.dni}\n\n📦 ${pedido.items.map((i: any) => `${i.nombre} x${i.cantidad}`).join(", ")}\n\n💰 Total: $${pedido.total.toLocaleString("es-AR")}\n🚚 ${pedido.tipoEnvio === "domicilio" ? "Domicilio" : "Sucursal"}: ${pedido.direccion}\n${pedido.notas ? `📝 Notas: ${pedido.notas}` : ""}\n\n✅ Pago aprobado · MP: ${mpData.id}`;
 
      await fetch(`https://api.callmebot.com/whatsapp.php?phone=5493815440596&text=${encodeURIComponent(msg)}&apikey=YOUR_API_KEY`).catch(() => {});
 
      return NextResponse.json({ status: "approved", paymentId: mpData.id });
    }
 
    return NextResponse.json({ status: mpData.status, detail: mpData.status_detail });
  } catch (error) {
    console.error("Error procesando pago:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
 