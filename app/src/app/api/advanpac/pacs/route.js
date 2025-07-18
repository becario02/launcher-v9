// app/api/advanpac/pacs/route.js
import { NextResponse } from "next/server";
import { callApiGateway } from "@/utils/advanpacApi";

export async function GET(req) {
  try {
    const language = req.headers.get("accept-language")?.split(",")[0] || "es-MX";

    const data = await callApiGateway({
      endpoint: "/msadvan_pac/api/v1/pacprovider",
      method: "GET",
      headers: { "Accept-Language": language },
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching PACs:', error);
    return NextResponse.json({
      statusCode: "500",
      message: "Error interno del servidor",
      data: null
    }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    const body = await req.json();
    const language = req.headers.get("accept-language")?.split(",")[0] || "es-MX";

    const data = await callApiGateway({
      endpoint: "/msadvan_pac/api/v1/pacprovider",
      method: "PUT",
      body,
      headers: { 
        "Accept-Language": language,
        "Content-Type": "application/json"
      },
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error updating PAC:', error);
    return NextResponse.json({
      statusCode: "500",
      message: "Error interno del servidor",
      data: null
    }, { status: 500 });
  }
}