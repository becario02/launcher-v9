import { NextResponse } from "next/server";
import { callApiGateway } from "@/utils/serverApi";

export async function PUT(req) {
  try {
    const body = await req.json();
    const { idUser, avatarBase64 } = body;

    if (!idUser || !avatarBase64) {
      return NextResponse.json(
        { statusCode: "400", message: "idUser y avatarBase64 son requeridos" },
        { status: 400 }
      );
    }

    const data = await callApiGateway({
      endpoint: `/mslauncher/api/v1/profile/avatar`,
      method: "PUT",
      body: {
        idUser,
        avatarBase64
      }
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error updating avatar:', error);
    return NextResponse.json(
      { statusCode: "500", message: "Error interno del servidor" },
      { status: 500 }
    );
  }
}