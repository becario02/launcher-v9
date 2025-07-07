// app/api/companies/dashboard/route.js
import { NextResponse } from "next/server";
import { callApiGateway } from "@/utils/serverApi";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    
    const page = searchParams.get("page") || "1";
    const pageSize = searchParams.get("pageSize") || "10";
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";
    
    const language = req.headers.get("accept-language")?.split(",")[0] || "es-MX";

    // Construir parámetros para la API
    const params = {
      Page: page,
      PageSize: pageSize
    };

    // Agregar parámetros opcionales solo si tienen valor
    if (search.trim()) {
      params.Search = search;
    }
    
    if (status && status !== 'all') {
      params.Status = status;
    }

    const data = await callApiGateway({
      endpoint: "/mslauncher/api/v1/companies/dashboard",
      method: "GET",
      params,
      headers: { "Accept-Language": language },
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching companies dashboard:', error);
    return NextResponse.json({
      statusCode: "500",
      message: "Error interno del servidor",
      data: null
    }, { status: 500 });
  }
}