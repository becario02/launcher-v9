import { NextResponse } from "next/server";
import { callApiGateway } from "@/utils/serverApi";

export async function POST(req) {
  try {
    // Para uploads de archivos, necesitamos obtener el FormData
    const formData = await req.formData();
    const accept = req.headers.get("accept") || "*/*";
    const authorization = req.headers.get("authorization");

    const data = await callApiGateway({
      endpoint: "/mslauncher/api/v1/integrator/upload",
      method: "POST",
      body: formData, // Pasar FormData directamente
      headers: {
        Accept: accept,
        Authorization: authorization,
        // No incluir Content-Type para FormData - el navegador lo establece automáticamente
      },
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { 
        statusCode: "500", 
        message: "Error interno del servidor",
        error: error.message 
      },
      { status: 500 }
    );
  }
}