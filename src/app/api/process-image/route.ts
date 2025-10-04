// app/api/process-image/route.ts

export async function POST(request: Request) {
  try {
    // ¡CAMBIO! Recibimos también el watermarkText
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
      // ¡CAMBIO CLAVE! Usamos el texto del usuario y lo codificamos para la URL
      // Usamos un texto por defecto si el usuario no envía nada
      const textToApply = watermarkText || "Default Text";
      // Codificamos caracteres especiales (espacios, comas, etc.) para que la URL sea válida
      const encodedText = encodeURIComponent(textToApply);
      
      transformations.push(`l_text:Arial_24:${encodedText},co_white,g_south_east,x_10,y_10`);
    }

    const transformationString = transformations.join("/");
    const finalTransformation = transformationString || "f_png";
    const processedUrl = `https://res.cloudinary.com/${CLOUD_NAME}/image/fetch/${finalTransformation}/${publicUrl}`;

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