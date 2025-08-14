// app/api/advanpac/customer-stamps/get-stamps/[customerId]/route.js
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
      endpoint: `/msadvan_pac/api/v1/customer_stamps/get_stamps/${customerId}`,
      method: "GET",
      headers: { 
        "Accept-Language": language,
        "Content-Type": "application/json"
      },
    });

    // Manejar diferentes tipos de respuesta de AdvanPAC
    if (typeof data === 'number') {
      // Respuesta exitosa: número directo
      return NextResponse.json({
        statusCode: "200",
        message: "Timbres obtenidos exitosamente",
        data: data
      });
    } else if (data && typeof data === 'object' && data.statusCode) {
      // Respuesta con error de AdvanPAC
      return NextResponse.json(data, { 
        status: data.statusCode === "201" ? 200 : 400 
      });
    } else {
      // Respuesta inesperada
      return NextResponse.json({
        statusCode: "500",
        message: "Formato de respuesta inesperado",
        data: null
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Error getting customer stamps:', error);
    return NextResponse.json({
      statusCode: "500",
      message: "Error interno del servidor",
      data: null
    }, { status: 500 });
  }
}