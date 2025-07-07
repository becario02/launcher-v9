// app/api/companies/status/route.js
import { NextResponse } from "next/server";
import { callApiGateway } from "@/utils/serverApi";

export async function PUT(req) {
  try {
    const body = await req.json();
    const language = req.headers.get("accept-language")?.split(",")[0] || "es-MX";

    // Validar datos requeridos
    if (!body.idCompany || !body.status) {
      return NextResponse.json({
        statusCode: "400",
        message: "idCompany y status son requeridos",
        data: null
      }, { status: 400 });
    }

    // Validar que el status sea válido
    if (!['ACTIVE', 'INACTIVE'].includes(body.status)) {
      return NextResponse.json({
        statusCode: "400",
        message: "Status debe ser ACTIVE o INACTIVE",
        data: null
      }, { status: 400 });
    }

    const data = await callApiGateway({
      endpoint: "/mslauncher/api/v1/companies/status",
      method: "PUT",
      body: {
        idCompany: body.idCompany,
        status: body.status
      },
      headers: { "Accept-Language": language },
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error updating company status:', error);
    return NextResponse.json({
      statusCode: "500",
      message: "Error interno del servidor",
      data: null
    }, { status: 500 });
  }
}