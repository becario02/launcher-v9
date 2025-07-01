// app/api/dashboards/company/[companyId]/user/[userId]/route.js
import { NextResponse } from "next/server";
import { callApiGateway } from "@/utils/serverApi";

export async function GET(request, { params }) {
  try {
    const { companyId, userId } = params;

    if (!companyId || !userId) {
      return NextResponse.json({
        statusCode: "400",
        message: "Company ID and User ID are required",
        data: null
      }, { status: 400 });
    }

    const data = await callApiGateway({
      endpoint: `/mslauncher/api/v1/dashboards/company/${companyId}/user/${userId}`,
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