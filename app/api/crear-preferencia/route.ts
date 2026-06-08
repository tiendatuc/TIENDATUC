import { NextResponse } from "next/server";
import { MercadoPagoConfig, Preference } from "mercadopago";

const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN!,
});

export async function POST(req: Request) {
  try {
    const { items } = await req.json();

    const preference = new Preference(client);
    const result = await preference.create({
      body: {
        items: items.map((item: any) => ({
          id: String(item.id),
          title: item.nombre,
          quantity: item.cantidad,
          unit_price: item.precioNum,
          currency_id: "ARS",
        })),
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
