// app/api/dashboards/reload-time/route.js
import { NextResponse } from "next/server";
import { callApiGateway } from "@/utils/serverApi";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const idCompany = request.cookies.get('idCompany')?.value;
    const idDashboard = searchParams.get('idDashboard');

    if (!idCompany || !idDashboard) {
      return NextResponse.json({
        statusCode: "400",
        message: "Company ID and Dashboard ID are required",
        data: null
      }, { status: 400 });
    }

    const data = await callApiGateway({
      endpoint: `/mslauncher/api/v1/dashboards/reload-time?idCompany=${idCompany}&idDashboard=${idDashboard}`,
      method: "GET",
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching reload time:', error);
    return NextResponse.json({
      statusCode: "500",
      message: "Error interno del servidor",
      data: null
    }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const idCompany = request.cookies.get('idCompany')?.value;
    
    if (!idCompany || !body.idDashboard || !body.reloadTime) {
      return NextResponse.json({
        statusCode: "400",
        message: "Company ID, Dashboard ID and reload time are required",
        data: null
      }, { status: 400 });
    }

    const data = await callApiGateway({
      endpoint: `/mslauncher/api/v1/dashboards/reload-time`,
      method: "POST",
      body: {
        idCompany: parseInt(idCompany),
        idDashboard: body.idDashboard,
        reloadTime: body.reloadTime
      }
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error updating reload time:', error);
    return NextResponse.json({
      statusCode: "500",
      message: "Error interno del servidor",
      data: null
    }, { status: 500 });
  }
}