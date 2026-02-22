import type { NextApiRequest, NextApiResponse } from "next";
import pdfParse from "pdf-parse";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { fileContent } = req.body;

    // Decode base64
    const pdfBuffer = Buffer.from(fileContent.split(",")[1], "base64");

    // Parse PDF with layout preservation
    const pdfData = await pdfParse(pdfBuffer, {
      pagerender: function (pageData: any) {
        return pageData.getTextContent().then(function (textContent: any) {
          let lastY,
            text = "";
          for (let item of textContent.items) {
            if (lastY !== item.transform[5] && lastY !== undefined) {
              text += "\n";
            }
            text += item.str + " ";
            lastY = item.transform[5];
          }
          return text;
        });
      },
    });
    const text = pdfData.text;

    return res.status(200).json({ text });
  } catch (error) {
    console.error("Error processing PDF:", error);
    return res.status(500).json({ error: "Failed to process PDF" });
  }
}
