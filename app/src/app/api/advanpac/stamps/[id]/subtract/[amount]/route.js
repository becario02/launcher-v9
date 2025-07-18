// app/api/advanpac/stamps/[id]/subtract/[amount]/route.js
import { NextResponse } from "next/server";
import { callApiGateway } from "@/utils/advanpacApi";

export async function POST(req, { params }) {
  try {
    const { id, amount } = params;
    const language = req.headers.get("accept-language")?.split(",")[0] || "es-MX";

    const data = await callApiGateway({
      endpoint: `/msadvan_pac/api/v1/advan_stamps/substract_stamps/${id}/${amount}`,
      method: "POST",
      body: "", // Body vacío como requiere el endpoint
      headers: { "Accept-Language": language },
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error subtracting stamps:', error);
    return NextResponse.json({
      statusCode: "500",
      message: "Error interno del servidor",
      data: null
    }, { status: 500 });
  }
}