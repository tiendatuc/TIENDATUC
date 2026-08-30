import { NextResponse } from "next/server";
import { MercadoPagoConfig, Preference } from "mercadopago";

const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN!,
});

export async function POST(req: Request) {
  try {
    const { items, costoEnvio = 0 } = await req.json();

    const preference = new Preference(client);
    const lineas = items.map((item: any) => ({
      id: String(item.id),
      title: item.nombre,
      quantity: item.cantidad,
      unit_price: item.precioNum,
      currency_id: "ARS",
    }));
    if (Number(costoEnvio) > 0) {
      lineas.push({
        id: "envio",
        title: "Envío",
        quantity: 1,
        unit_price: Number(costoEnvio),
        currency_id: "ARS",
      });
    }
    const result = await preference.create({
      body: {
        items: lineas,
        payment_methods: {
          installments: 6,
          excluded_payment_types: [],
        },
        back_urls: {
          success: "https://tiendatuc.store/gracias",
          failure: "https://tiendatuc.store",
          pending: "https://tiendatuc.store",
        },
        auto_return: "approved",
      },
    });

    return NextResponse.json({ url: result.init_point, id: result.id });
  } catch (error) {
    return NextResponse.json({ error: "Error al crear preferencia" }, { status: 500 });
  }
}
