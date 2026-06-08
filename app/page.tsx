import { createClient } from "@supabase/supabase-js";
import HomeClient from "./HomeClient";

export const dynamic = "force-dynamic";

const supabase = createClient(
  "https://inpvwrwggnemyeyprxpx.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlucHZ3cndnZ25lbXlleXByeHB4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA1Nzc1NzcsImV4cCI6MjA5NjE1MzU3N30.0i0GD4sITjxC2ZRpg5V-zLNT9fliTmMiYSDOdYThqxA"
);

export default async function Home() {
  const { data: productos } = await supabase
    .from("productos")
    .select("id, slug, nombre, descripcion, precio, precio_num, cuotas, envio_gratis, imagenes")
    .eq("activo", true)
    .order("id");

  const productosNormalizados = (productos || []).map(p => ({
    id: p.id,
    slug: p.slug,
    nombre: p.nombre,
    descripcion: p.descripcion,
    precio: p.precio,
    precioNum: p.precio_num,
    cuotas: p.cuotas,
    envioGratis: p.envio_gratis,
    imagen: p.imagenes?.[0] || "",
  }));

  // Producto hero = el primero (proyector)
  const hero = productosNormalizados[0];
  // Resto = los demás
  const resto = productosNormalizados.slice(1);

  return <HomeClient hero={hero} productos={resto} />;
}
