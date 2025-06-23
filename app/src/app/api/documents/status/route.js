import { NextResponse } from "next/server";
import { callApiGateway } from "@/utils/serverApi";

export async function PATCH(req) {
  try {
    const body = await req.json();

    const data = await callApiGateway({
      endpoint: "/mslauncher/api/v1/documents/status",
      method: "PATCH",
      body,
      headers: {
        "Content-Type": "application/json",
      },
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error in documents/status API route:", error);
    return NextResponse.json(
      { 
        statusCode: "500", 
        message: "Error interno del servidor",
        data: null 
      },
      { status: 500 }
    );
  }
}