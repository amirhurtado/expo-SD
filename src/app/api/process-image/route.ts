import { supabase } from "@/lib/supabaseClient";
import sharp from "sharp";

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const { filePath } = await request.json();
    if (!filePath) {
      return new Response(JSON.stringify({ error: "Falta la ruta del archivo (filePath)." }), {
        status: 400,
      });
    }

    // Descargar imagen
    const { data: downloadData, error: downloadError } = await supabase
      .storage
      .from("images")
      .download(filePath);

    if (downloadError) {
      console.error("Error al descargar la imagen:", downloadError);
      return new Response(JSON.stringify({ error: "No se pudo descargar la imagen original." }), {
        status: 500,
      });
    }

    const imageBuffer = Buffer.from(await downloadData.arrayBuffer());

    // Procesar con sharp
    const processedImageBuffer = await sharp(imageBuffer)
      .grayscale()
      .png()
      .toBuffer();

    // Subir procesada
    const newFilePath = `processed/${Date.now()}-processed.png`;

    const { error: uploadError } = await supabase.storage
      .from("images")
      .upload(newFilePath, processedImageBuffer, {
        contentType: "image/png",
      });

    if (uploadError) {
      console.error("Error al subir procesada:", uploadError);
      return new Response(JSON.stringify({ error: "No se pudo subir la imagen procesada." }), {
        status: 500,
      });
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("images").getPublicUrl(newFilePath);

    return new Response(JSON.stringify({ processedUrl: publicUrl }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Error inesperado:", err);
    return new Response(JSON.stringify({ error: "Ocurrió un error en el servidor." }), {
      status: 500,
    });
  }
}
