// app/api/advanpac/customer-stamps/get-packages/[customerId]/route.js
import { NextResponse } from "next/server";
import { callApiGateway } from "@/utils/advanpacApi";

export async function GET(req, { params }) {
  try {
    const { customerId } = params;
    const language = req.headers.get("accept-language")?.split(",")[0] || "es-MX";

    // Validar que se proporcione el customerId
    if (!customerId) {
      return NextResponse.json({
        statusCode: "400",
        message: "ID de cliente requerido",
        data: null
      }, { status: 400 });
    }

    const data = await callApiGateway({
      endpoint: `/msadvan_pac/api/v1/customer_stamps/get_packages/${customerId}`,
      method: "GET",
      headers: { 
        "Accept-Language": language,
        "Content-Type": "application/json"
      },
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error getting customer packages:', error);
    return NextResponse.json({
      statusCode: "500",
      message: "Error interno del servidor",
      data: null
    }, { status: 500 });
  }
}