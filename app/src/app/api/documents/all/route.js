import { NextResponse } from "next/server";
import { callApiGateway } from "@/utils/serverApi";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    
    // Extraer todos los parámetros de consulta
    const page = searchParams.get("page") || "1";
    const pageSize = searchParams.get("pageSize") || "10";
    const name = searchParams.get("name");
    const status = searchParams.get("status");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    // Construir objeto de parámetros solo con los valores que existen
    const params = {
      page,
      pageSize,
    };

    // Agregar parámetros opcionales solo si existen
    if (name && name.trim()) {
      params.name = name.trim();
    }
    
    if (status && status !== 'all') {
      params.status = status;
    }

    if (startDate) {
      params.startDate = startDate;
    }

    if (endDate) {
      params.endDate = endDate;
    }

    const data = await callApiGateway({
      endpoint: "/mslauncher/api/v1/documents/all",
      method: "GET",
      params,
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error in documents/all API route:", error);
    return NextResponse.json(
      { 
        statusCode: "500", 
        message: "Error interno del servidor",
        data: null 
      },
      { status: 500 }
    );
  }
}

// Agregar POST para crear documentos
export async function POST(req) {
  try {
    const body = await req.json();

    const data = await callApiGateway({
      endpoint: "/mslauncher/api/v1/documents",
      method: "POST",
      body,
      headers: {
        "Content-Type": "application/json",
      },
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error in documents/all POST API route:", error);
    return NextResponse.json(
      { 
        statusCode: "500", 
        message: "Error interno del servidor",
        data: null 
      },
      { status: 500 }
    );
  }
}