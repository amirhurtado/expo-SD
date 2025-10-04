// app/api/process-image/route.ts
import { supabase } from "@/lib/supabaseClient";

export async function POST(request: Request) {
  try {
    // ✅ Recibimos URL pública y opciones
    const { publicUrl, options, watermarkText } = await request.json();
    if (!publicUrl || !options) {
      return new Response(JSON.stringify({ error: "Faltan parámetros." }), { status: 400 });
    }

    const CLOUD_NAME = "dgkpgsuz8";
    const transformations: string[] = [];

    // --- Categoría: Color ---
    switch (options.color) {
      case "grayscale":
        transformations.push("e_grayscale");
        break;
      case "sepia":
        transformations.push("e_sepia");
        break;
      case "cartoonify":
        transformations.push("e_cartoonify");
        break;
      default:
        break;
    }

    // --- Categoría: Marca de Agua ---
    if (options.watermark) {
      const textToApply = watermarkText || "Default Text";
      const encodedText = encodeURIComponent(textToApply);
      transformations.push(
        `l_text:Arial_24:${encodedText},co_white,g_south_east,x_10,y_10`
      );
    }

    // --- Categoría: Forma ---
    if (options.shape === "circle") {
      transformations.push("r_max"); // 🔥 Aplica recorte circular
    }

    // --- Construcción de la URL final ---
    const transformationString = transformations.join("/");
    const finalTransformation = transformationString || "f_png";
    const processedUrl = `https://res.cloudinary.com/${CLOUD_NAME}/image/fetch/${finalTransformation}/${publicUrl}`;

    // --- Guardar en la BD (Supabase) ---
    await supabase.from("processed_images").insert({
      original_url: publicUrl,
      processed_url: processedUrl,
    });

    return new Response(JSON.stringify({ processedUrl }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });

  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Error desconocido";
    console.error(err);
    return new Response(JSON.stringify({ error: errorMessage }), { status: 500 });
  }
}
