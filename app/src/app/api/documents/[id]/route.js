import { NextResponse } from "next/server";
import { callApiGateway } from "@/utils/serverApi";

export async function DELETE(req, { params }) {
  try {
    const { id } = params;

    const data = await callApiGateway({
      endpoint: `/mslauncher/api/v1/documents/${id}`,
      method: "DELETE",
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error in documents/[id] DELETE API route:", error);
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

// Agregar PUT para actualizar documento
export async function PUT(req, { params }) {
  try {
    const { id } = params;
    const body = await req.json();

    const data = await callApiGateway({
      endpoint: `/mslauncher/api/v1/documents`,
      method: "PUT",
      body,
      headers: {
        "Content-Type": "application/json",
      },
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error in documents/[id] PUT API route:", error);
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