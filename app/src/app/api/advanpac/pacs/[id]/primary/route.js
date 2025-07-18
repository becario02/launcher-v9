// app/api/advanpac/pacs/[id]/primary/route.js
import { NextResponse } from "next/server";
import { callApiGateway } from "@/utils/advanpacApi";

export async function PUT(req, { params }) {
  try {
    const { id } = params;
    const language = req.headers.get("accept-language")?.split(",")[0] || "es-MX";

    const data = await callApiGateway({
      endpoint: `/msadvan_pac/api/v1/provider/primary/${id}`,
      method: "PUT",
      body: "", // Body vacío como requiere el endpoint
      headers: { "Accept-Language": language },
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error setting primary PAC:', error);
    return NextResponse.json({
      statusCode: "500",
      message: "Error interno del servidor",
      data: null
    }, { status: 500 });
  }
}