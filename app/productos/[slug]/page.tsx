import { createClient } from "@supabase/supabase-js";
import ProductoClient from "./ProductoClient";

export const dynamic = "force-dynamic";

const supabase = createClient(
  "https://inpvwrwggnemyeyprxpx.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlucHZ3cndnZ25lbXlleXByeHB4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA1Nzc1NzcsImV4cCI6MjA5NjE1MzU3N30.0i0GD4sITjxC2ZRpg5V-zLNT9fliTmMiYSDOdYThqxA"
);

export default async function ProductoPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const { data: producto, error } = await supabase
    .from("productos")
    .select("*")
    .eq("slug", slug)
    .eq("activo", true)
    .single();

  if (!producto || error) return (
    <div style={{ minHeight:"60vh",display:"flex",alignItems:"center",justifyContent:"center",background:"var(--bg)" }}>
      <div style={{ textAlign:"center" }}>
        <div style={{ fontSize:48,marginBottom:16 }}>😕</div>
        <h2 style={{ marginBottom:12 }}>Producto no encontrado</h2>
        <a href="/" style={{ color:"var(--copper)" }}>← Volver al inicio</a>
      </div>
    </div>
  );

  // Normalizar features: el admin guarda {tipo, archivo, titulo, desc}
  // ProductoClient espera {video, titulo, desc} para videos o {icon, titulo, desc} para cards
  const featuresNormalizadas = (producto.features || []).map((f: any) => {
    if (f.tipo === "video") return { video: f.archivo, titulo: f.titulo, desc: f.desc };
    if (f.tipo === "imagen") return { imagen: f.archivo, titulo: f.titulo, desc: f.desc };
    // formato viejo directo
    if (f.video) return f;
    return f;
  });

  const productoNormalizado = {
    id: producto.id,
    nombre: producto.nombre,
    descripcion: producto.descripcion,
    precio: producto.precio,
    precioNum: producto.precio_num,
    precioAnterior: producto.precio_anterior,
    descuento: producto.descuento,
    ahorro: producto.ahorro,
    cuotas: producto.cuotas,
    envioGratis: producto.envio_gratis,
    stock: producto.stock,
    imagenes: producto.imagenes || [],
    features: featuresNormalizadas,
    specs: producto.specs || [],
    comparativa: producto.comparativa || [],
    resenas: producto.resenas || [],
  };

  return <ProductoClient producto={productoNormalizado} />;
}
