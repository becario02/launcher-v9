// app/api/companies/advanpac/customer/add/route.js
import { NextResponse } from "next/server";
import { callApiGateway } from "@/utils/serverApi";

export async function POST(req) {
  try {
    const body = await req.json();
    const language = req.headers.get("accept-language")?.split(",")[0] || "es-MX";

    const data = await callApiGateway({
      endpoint: "/mslauncher/api/v1/companies/advanpac/customer/add",
      method: "POST",
      body,
      headers: { 
        "Accept-Language": language,
        "Content-Type": "application/json"
      },
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error adding customer to advanpac:', error);
    return NextResponse.json({
      statusCode: "500",
      message: "Error interno del servidor",
      data: null
    }, { status: 500 });
  }
}