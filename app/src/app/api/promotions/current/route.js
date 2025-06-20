import { NextResponse } from "next/server";
import { callApiGateway } from "@/utils/serverApi";

export async function GET(req) {
  try {
    const accept = req.headers.get("accept") || "*/*";

    const data = await callApiGateway({
      endpoint: "/mslauncher/api/v1/promotions/current",
      method: "GET",
      headers: { Accept: accept },
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error en GET /api/promotion/current:", error);
    return NextResponse.json(
      { error: "Error al obtener la promoción actual" },
      { status: 500 }
    );
  }
}