import { NextResponse } from "next/server";
import { callApiGateway } from "@/utils/serverApi";

export async function GET(req, { params }) {
  try {
    const { id } = params;

    const data = await callApiGateway({
      endpoint: `/mslauncher/api/v1/documents/${id}/file`,
      method: "GET",
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error in documents/[id]/file API route:", error);
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