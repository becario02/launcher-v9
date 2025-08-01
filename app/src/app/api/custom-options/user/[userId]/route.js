import { NextResponse } from "next/server";
import { callApiGateway } from "@/utils/serverApi";

export async function GET(request, { params }) {
  try {
    const { userId } = params;

    if (!userId) {
      return NextResponse.json({
        statusCode: "400",
        message: "User ID is required",
        data: null
      }, { status: 400 });
    }

    const data = await callApiGateway({
      endpoint: `/mslauncher/api/v1/menu-tracking/user/${userId}/custom-options`,
      method: "GET",
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching custom options:', error);
    return NextResponse.json({
      statusCode: "500",
      message: "Error interno del servidor",
      data: null
    }, { status: 500 });
  }
}