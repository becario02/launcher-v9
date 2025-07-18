// app/api/advanpac/pacs/[id]/activate/route.js
import { NextResponse } from "next/server";
import { callApiGateway } from "@/utils/advanpacApi";

export async function POST(req, { params }) {
  try {
    const { id } = params;
    const language = req.headers.get("accept-language")?.split(",")[0] || "es-MX";

    const data = await callApiGateway({
      endpoint: `/msadvan_pac/api/v1/provider/active/${id}`,
      method: "POST",
      body: "", // Body vacío como requiere el endpoint
      headers: { "Accept-Language": language },
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error activating PAC:', error);
    return NextResponse.json({
      statusCode: "500",
      message: "Error interno del servidor",
      data: null
    }, { status: 500 });
  }
}