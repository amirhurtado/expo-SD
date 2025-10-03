import type { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "@/lib/supabaseClient";
import sharp from "sharp";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { filePath } = req.body;
    if (!filePath) {
      return res.status(400).json({ error: "Falta la ruta del archivo (filePath)." });
    }

    // Descargar imagen
    const { data: downloadData, error: downloadError } = await supabase.storage
      .from("images")
      .download(filePath);

    if (downloadError) {
      console.error("Error al descargar la imagen:", downloadError);
      return res.status(500).json({ error: "No se pudo descargar la imagen original." });
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
      return res.status(500).json({ error: "No se pudo subir la imagen procesada." });
    }

    const { data: { publicUrl } } = supabase.storage
      .from("images")
      .getPublicUrl(newFilePath);

    return res.status(200).json({ processedUrl: publicUrl });
  } catch (err) {
    console.error("Error inesperado:", err);
    return res.status(500).json({ error: "Ocurrió un error en el servidor." });
  }
}
