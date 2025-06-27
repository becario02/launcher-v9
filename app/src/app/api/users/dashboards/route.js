// app/api/users/dashboards/route.js
import { NextResponse } from "next/server";
import { callApiGateway } from "@/utils/serverApi";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({
        statusCode: "400",
        message: "User ID is required",
        data: null
      }, { status: 400 });
    }

    const data = await callApiGateway({
      endpoint: `/mslauncher/api/v1/user/${userId}/dashboards`,
      method: "GET",
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching user dashboards:', error);
    return NextResponse.json({
      statusCode: "500",
      message: "Error interno del servidor",
      data: null
    }, { status: 500 });
  }
}