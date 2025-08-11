import { NextResponse } from "next/server";
import { callApiGateway } from "@/utils/serverApi";

export async function GET(request) {
  try {
    const data = await callApiGateway({
      endpoint: `/mslauncher/api/v1/menu-tracking/quick-stats`,
      method: "GET"
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching quick stats:', error);
    return NextResponse.json({
      statusCode: "500",
      message: "Error interno del servidor",
      data: null
    }, { status: 500 });
  }
}