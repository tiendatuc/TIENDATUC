import { NextResponse } from "next/server";

const BREVO_API_KEY = "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";
const FROM_EMAIL = "noreply@tiendatuc.store";
const FROM_NAME = "TiendaTuc";

async function enviarEmail({ to, toName, subject, html }: { to: string; toName: string; subject: string; html: string }) {
  const res = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: { "api-key": BREVO_API_KEY, "Content-Type": "application/json" },
    body: JSON.stringify({
      sender: { name: FROM_NAME, email: FROM_EMAIL },
      to: [{ email: to, name: toName }],
      subject,
      htmlContent: html,
    }),
  });
  return res.ok;
}

function emailBienvenida(nombre: string): string {
  return `<!DOCTYPE html>
<html lang="es">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Bienvenido a TiendaTuc</title></head>
<body style="margin:0;padding:0;background-color:#f5f5f5;font-family:Arial,Helvetica,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#f5f5f5">
<tr><td align="center" style="padding:32px 16px;">
<table width="520" cellpadding="0" cellspacing="0" border="0" style="max-width:520px;width:100%;">

  <tr><td align="center" style="padding-bottom:24px;">
    <p style="margin:0;font-size:18px;font-weight:900;letter-spacing:8px;color:#111111;font-family:Arial,sans-serif;">TIENDATUC</p>
  </td></tr>

  <tr><td bgcolor="#ffffff" style="border-radius:12px;padding:36px 28px;" align="center">
    <p style="font-size:40px;margin:0 0 14px;">👋</p>
    <h2 style="color:#111111;font-size:20px;font-weight:700;margin:0 0 8px;font-family:Arial,sans-serif;">Bienvenido, ${nombre}</h2>
    <p style="color:#777777;font-size:14px;margin:0 0 24px;line-height:1.6;">Tu cuenta en TiendaTuc ya está lista</p>

    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-top:1px solid #eeeeee;padding-top:20px;">
      <tr><td style="padding-bottom:12px;">
        <table cellpadding="0" cellspacing="0" border="0"><tr>
          <td width="28" valign="middle" style="background-color:#d4845a;border-radius:50%;text-align:center;width:24px;height:24px;">
            <p style="margin:0;color:#ffffff;font-size:12px;font-weight:700;line-height:24px;">✓</p>
          </td>
          <td style="padding-left:10px;"><p style="margin:0;color:#444444;font-size:14px;font-family:Arial,sans-serif;">Ver el historial de tus pedidos</p></td>
        </tr></table>
      </td></tr>
      <tr><td style="padding-bottom:12px;">
        <table cellpadding="0" cellspacing="0" border="0"><tr>
          <td width="28" valign="middle" style="background-color:#d4845a;border-radius:50%;text-align:center;width:24px;height:24px;">
            <p style="margin:0;color:#ffffff;font-size:12px;font-weight:700;line-height:24px;">✓</p>
          </td>
          <td style="padding-left:10px;"><p style="margin:0;color:#444444;font-size:14px;font-family:Arial,sans-serif;">Guardar tu dirección de envío</p></td>
        </tr></table>
      </td></tr>
      <tr><td style="padding-bottom:24px;">
        <table cellpadding="0" cellspacing="0" border="0"><tr>
          <td width="28" valign="middle" style="background-color:#d4845a;border-radius:50%;text-align:center;width:24px;height:24px;">
            <p style="margin:0;color:#ffffff;font-size:12px;font-weight:700;line-height:24px;">✓</p>
          </td>
          <td style="padding-left:10px;"><p style="margin:0;color:#444444;font-size:14px;font-family:Arial,sans-serif;">Dejar reseñas de tus compras</p></td>
        </tr></table>
      </td></tr>
    </table>

    <table cellpadding="0" cellspacing="0" border="0"><tr><td align="center">
      <a href="https://tiendatuc.store" style="display:inline-block;background-color:#d4845a;color:#ffffff;font-size:12px;font-weight:700;letter-spacing:2px;text-transform:uppercase;padding:14px 36px;border-radius:8px;text-decoration:none;font-family:Arial,sans-serif;">Ver productos</a>
    </td></tr></table>
  </td></tr>

  <tr><td align="center" style="padding-top:20px;">
    <p style="color:#aaaaaa;font-size:11px;margin:0;font-family:Arial,sans-serif;">TiendaTuc · Tucumán, Argentina · <a href="https://tiendatuc.store" style="color:#aaaaaa;text-decoration:none;">tiendatuc.store</a></p>
  </td></tr>

</table>
</td></tr>
</table>
</body></html>`;
}

function emailConfirmacion(nombre: string, pedidoId: string, items: any[], total: number, direccion: string, tipoEnvio: string): string {
  const itemsRows = items.map(item => `
    <tr>
      <td style="padding:10px 0;border-bottom:1px solid #eeeeee;font-size:14px;color:#333333;font-family:Arial,sans-serif;">${item.nombre} <span style="color:#999999;">× ${item.cantidad}</span></td>
      <td style="padding:10px 0;border-bottom:1px solid #eeeeee;font-size:14px;color:#333333;font-weight:700;text-align:right;font-family:Arial,sans-serif;">$${(item.precioNum * item.cantidad).toLocaleString("es-AR")}</td>
    </tr>`).join("");

  return `<!DOCTYPE html>
<html lang="es">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Pedido confirmado</title></head>
<body style="margin:0;padding:0;background-color:#f5f5f5;font-family:Arial,Helvetica,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#f5f5f5">
<tr><td align="center" style="padding:32px 16px;">
<table width="520" cellpadding="0" cellspacing="0" border="0" style="max-width:520px;width:100%;">

  <tr><td align="center" style="padding-bottom:24px;">
    <p style="margin:0;font-size:18px;font-weight:900;letter-spacing:8px;color:#111111;font-family:Arial,sans-serif;">TIENDATUC</p>
  </td></tr>

  <tr><td bgcolor="#ffffff" style="border-radius:12px;padding:36px 28px;">
    <table width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr><td align="center" style="padding-bottom:20px;">
        <div style="width:52px;height:52px;background-color:#4caf8a;border-radius:50%;text-align:center;margin:0 auto 14px;">
          <p style="margin:0;color:#ffffff;font-size:22px;line-height:52px;">✓</p>
        </div>
        <h2 style="color:#111111;font-size:20px;font-weight:700;margin:0 0 6px;font-family:Arial,sans-serif;">Pedido confirmado</h2>
        <p style="color:#777777;font-size:14px;margin:0;line-height:1.6;">Gracias ${nombre}, ya procesamos tu compra</p>
      </td></tr>

      <tr><td style="background-color:#f0faf6;border-radius:8px;padding:10px 16px;text-align:center;margin-bottom:20px;">
        <p style="margin:0;color:#4caf8a;font-size:12px;font-weight:700;font-family:Arial,sans-serif;">N° DE PEDIDO: ${pedidoId}</p>
      </td></tr>

      <tr><td style="padding-top:20px;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0">
          ${itemsRows}
          <tr>
            <td style="padding:12px 0 4px;color:#999999;font-size:13px;font-family:Arial,sans-serif;">Envío</td>
            <td style="padding:12px 0 4px;text-align:right;color:#4caf8a;font-size:13px;font-weight:700;font-family:Arial,sans-serif;">Gratis</td>
          </tr>
          <tr>
            <td style="padding:10px 0;border-top:2px solid #eeeeee;color:#111111;font-size:16px;font-weight:700;font-family:Arial,sans-serif;">Total</td>
            <td style="padding:10px 0;border-top:2px solid #eeeeee;text-align:right;color:#111111;font-size:18px;font-weight:900;font-family:Arial,sans-serif;">$${total.toLocaleString("es-AR")}</td>
          </tr>
        </table>
      </td></tr>

      <tr><td style="padding-top:20px;border-top:1px solid #eeeeee;margin-top:20px;">
        <p style="color:#999999;font-size:11px;text-transform:uppercase;letter-spacing:1px;margin:0 0 4px;font-family:Arial,sans-serif;">Entrega</p>
        <p style="color:#333333;font-size:14px;margin:0 0 2px;font-weight:600;font-family:Arial,sans-serif;">${tipoEnvio === "sucursal" ? "Retiro en sucursal Urbano Express" : "Envío a domicilio"}</p>
        <p style="color:#777777;font-size:13px;margin:0;font-family:Arial,sans-serif;">${direccion}</p>
      </td></tr>

      <tr><td style="background-color:#fff8f5;border-radius:8px;padding:14px 16px;margin-top:20px;">
        <p style="color:#444444;font-size:14px;margin:0;line-height:1.7;font-family:Arial,sans-serif;">📦 Tu pedido se despacha en <strong>24-48hs hábiles</strong>. Te enviamos el número de seguimiento por WhatsApp cuando salga.</p>
      </td></tr>

      <tr><td align="center" style="padding-top:24px;">
        <a href="https://wa.me/5493815440596" style="display:inline-block;background-color:#25D366;color:#ffffff;font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase;padding:13px 28px;border-radius:8px;text-decoration:none;font-family:Arial,sans-serif;">Consultar por WhatsApp</a>
      </td></tr>
    </table>
  </td></tr>

  <tr><td align="center" style="padding-top:20px;">
    <p style="color:#aaaaaa;font-size:11px;margin:0;font-family:Arial,sans-serif;">TiendaTuc · Tucumán, Argentina · <a href="https://tiendatuc.store" style="color:#aaaaaa;text-decoration:none;">tiendatuc.store</a></p>
  </td></tr>

</table>
</td></tr>
</table>
</body></html>`;
}

function emailCarritoAbandonado(nombre: string, items: any[]): string {
  const itemsRows = items.slice(0, 3).map(item => `
    <tr>
      <td style="padding:12px 0;border-bottom:1px solid #eeeeee;">
        <table cellpadding="0" cellspacing="0" border="0"><tr>
          <td><img src="${item.imagen}" width="52" height="52" style="border-radius:8px;object-fit:cover;display:block;" /></td>
          <td style="padding-left:12px;">
            <p style="margin:0 0 3px;color:#333333;font-size:13px;font-weight:600;font-family:Arial,sans-serif;">${item.nombre}</p>
            <p style="margin:0;color:#d4845a;font-size:14px;font-weight:700;font-family:Arial,sans-serif;">${item.precio}</p>
          </td>
        </tr></table>
      </td>
    </tr>`).join("");

  return `<!DOCTYPE html>
<html lang="es">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Olvidaste algo</title></head>
<body style="margin:0;padding:0;background-color:#f5f5f5;font-family:Arial,Helvetica,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#f5f5f5">
<tr><td align="center" style="padding:32px 16px;">
<table width="520" cellpadding="0" cellspacing="0" border="0" style="max-width:520px;width:100%;">

  <tr><td align="center" style="padding-bottom:24px;">
    <p style="margin:0;font-size:18px;font-weight:900;letter-spacing:8px;color:#111111;font-family:Arial,sans-serif;">TIENDATUC</p>
  </td></tr>

  <tr><td bgcolor="#ffffff" style="border-radius:12px;padding:36px 28px;">
    <table width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr><td align="center" style="padding-bottom:20px;">
        <p style="font-size:40px;margin:0 0 12px;">🛒</p>
        <h2 style="color:#111111;font-size:20px;font-weight:700;margin:0 0 8px;font-family:Arial,sans-serif;">${nombre}, olvidaste algo</h2>
        <p style="color:#777777;font-size:14px;margin:0;line-height:1.6;">Todavía tenés productos esperándote</p>
      </td></tr>

      <tr><td>
        <table width="100%" cellpadding="0" cellspacing="0" border="0">
          ${itemsRows}
        </table>
      </td></tr>

      <tr><td style="background-color:#fff8f5;border-radius:8px;padding:12px 16px;text-align:center;margin:16px 0;">
        <p style="color:#d4845a;font-size:13px;margin:0;font-weight:600;font-family:Arial,sans-serif;">Envio gratis a todo el pais · Stock limitado</p>
      </td></tr>

      <tr><td align="center" style="padding-top:20px;">
        <a href="https://tiendatuc.store" style="display:inline-block;background-color:#d4845a;color:#ffffff;font-size:12px;font-weight:700;letter-spacing:2px;text-transform:uppercase;padding:14px 36px;border-radius:8px;text-decoration:none;font-family:Arial,sans-serif;">Completar mi compra</a>
      </td></tr>
    </table>
  </td></tr>

  <tr><td align="center" style="padding-top:20px;">
    <p style="color:#aaaaaa;font-size:11px;margin:0;font-family:Arial,sans-serif;">TiendaTuc · Tucumán, Argentina · <a href="https://tiendatuc.store" style="color:#aaaaaa;text-decoration:none;">tiendatuc.store</a></p>
  </td></tr>

</table>
</td></tr>
</table>
</body></html>`;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { tipo, ...data } = body;
    let subject = "", html = "";

    if (tipo === "bienvenida") {
      subject = "Bienvenido a TiendaTuc";
      html = emailBienvenida(data.nombre);
    } else if (tipo === "confirmacion") {
      subject = "Tu pedido fue confirmado - TiendaTuc";
      html = emailConfirmacion(data.nombre, data.pedidoId, data.items, data.total, data.direccion, data.tipoEnvio);
    } else if (tipo === "carrito_abandonado") {
      subject = `${data.nombre}, olvidaste algo en tu carrito`;
      html = emailCarritoAbandonado(data.nombre, data.items);
    } else {
      return NextResponse.json({ error: "Tipo inválido" }, { status: 400 });
    }

    const ok = await enviarEmail({ to: data.email, toName: data.nombre, subject, html });
    return NextResponse.json({ ok });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}