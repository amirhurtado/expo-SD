import { supabase } from "@/lib/supabaseClient";

export async function POST(request: Request) {
  try {
    const { publicUrl, options, watermarkText } = await request.json();
    if (!publicUrl || !options) {
      return new Response(
        JSON.stringify({ error: "Faltan parámetros: publicUrl u options." }),
        { status: 400 }
      );
    }

    const CLOUD_NAME = "dgkpgsuz8";
    const transformations = [];

    if (options.grayscale) {
      transformations.push("e_grayscale");
    }

    if (options.watermark) {
      const textToApply = watermarkText || "Default Text";
      const encodedText = encodeURIComponent(textToApply);
      transformations.push(`l_text:Arial_24:${encodedText},co_white,g_south_east,x_10,y_10`);
    }

    const transformationString = transformations.join("/");
    const finalTransformation = transformationString || "f_png";
    const processedUrl = `https://res.cloudinary.com/${CLOUD_NAME}/image/fetch/${finalTransformation}/${publicUrl}`;

    // --- ¡NUEVA LÓGICA AÑADIDA AQUÍ! ---
    // Después de generar la URL procesada, la guardamos en la base de datos.
    const { error: dbError } = await supabase
      .from('processed_images')
      .insert({ 
        original_url: publicUrl, 
        processed_url: processedUrl 
      });

    // Si hay un error en la BD, lo mostramos en la consola del servidor,
    // pero no detenemos la respuesta al usuario.
    if (dbError) {
      console.error("Error saving to database:", dbError);
    }
    // --- FIN DE LA NUEVA LÓGICA ---

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