// /api/process-image/route.ts

// NO SE NECESITA NINGUNA LIBRERÍA DE IMÁGENES

export async function POST(request: Request) {
  try {
    // 1. Recibimos la URL pública de la imagen que ya está en Supabase
    const { publicUrl } = await request.json();
    if (!publicUrl) {
      return new Response(
        JSON.stringify({ error: "Falta la URL pública (publicUrl)." }),
        {
          status: 400,
        }
      );
    }

    const CLOUD_NAME = "dgkpgsuz8";

    // 3. Construimos la nueva URL de Cloudinary para la transformación
    //    e_grayscale -> aplica el efecto de escala de grises
    //    f_png -> fuerza el formato de salida a PNG
    const transformation = "e_grayscale/f_png";

    // La URL final usa el método 'fetch' de Cloudinary para tomar la imagen de Supabase
    const processedUrl = `https://res.cloudinary.com/${CLOUD_NAME}/image/fetch/${transformation}/${publicUrl}`;

    // 4. Devolvemos la URL de Cloudinary
    return new Response(JSON.stringify({ processedUrl }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error("Error:", err.message, err.stack);
    } else {
      console.error("Error desconocido:", err);
    }

    return new Response(
      JSON.stringify({ error: "Ocurrió un error en el servidor." }),
      { status: 500 }
    );
  }
}
