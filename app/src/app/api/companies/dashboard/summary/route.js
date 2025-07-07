// app/api/companies/dashboard/summary/route.js
import { NextResponse } from "next/server";
import { callApiGateway } from "@/utils/serverApi";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";
    
    const language = req.headers.get("accept-language")?.split(",")[0] || "es-MX";

    // Construir parámetros para la API
    const params = {};

    // Agregar parámetros opcionales solo si tienen valor
    if (search.trim()) {
      params.search = search;
    }
    
    if (status && status !== 'all') {
      params.status = status;
    }

    const data = await callApiGateway({
      endpoint: "/mslauncher/api/v1/companies/dashboard/summary",
      method: "GET",
      params,
      headers: { "Accept-Language": language },
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching companies summary:', error);
    return NextResponse.json({
      statusCode: "500",
      message: "Error interno del servidor",
      data: null
    }, { status: 500 });
  }
}