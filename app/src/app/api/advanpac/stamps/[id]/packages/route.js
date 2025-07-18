// app/api/advanpac/stamps/[id]/packages/route.js
import { NextResponse } from "next/server";
import { callApiGateway } from "@/utils/advanpacApi";

export async function GET(req, { params }) {
  try {
    const { id } = params;
    const language = req.headers.get("accept-language")?.split(",")[0] || "es-MX";

    const data = await callApiGateway({
      endpoint: `/msadvan_pac/api/v1/advan_stamps/get_packages/${id}`,
      method: "GET",
      headers: { "Accept-Language": language },
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching stamp packages:', error);
    return NextResponse.json({
      statusCode: "500",
      message: "Error interno del servidor",
      data: null
    }, { status: 500 });
  }
}