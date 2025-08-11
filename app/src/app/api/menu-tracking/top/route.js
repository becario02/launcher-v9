import { NextResponse } from "next/server";
import { callApiGateway } from "@/utils/serverApi";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    // Validate type parameter
    if (!type || !['menu', 'option'].includes(type)) {
      return NextResponse.json({
        statusCode: "400",
        message: "Parámetro 'type' es requerido y debe ser 'menu' u 'option'"
      }, { status: 400 });
    }

    const data = await callApiGateway({
      endpoint: `/mslauncher/api/v1/menu-tracking/top?type=${type}`,
      method: "GET"
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching top menus/options:', error);
    return NextResponse.json({
      statusCode: "500",
      message: "Error interno del servidor",
      data: null
    }, { status: 500 });
  }
}