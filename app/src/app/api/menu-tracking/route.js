import { NextResponse } from "next/server";
import { callApiGateway } from "@/utils/serverApi";

export async function POST(request) {
  try {
    const body = await request.json();
    
    // Validate required fields
    const { idUser, idMenu, idCustomOption, ipName } = body;
    
    if (idUser === undefined || idMenu === undefined || idCustomOption === undefined || !ipName) {
      return NextResponse.json({
        id: null,
        statusCode: "400",
        message: "Todos los campos son requeridos: idUser, idMenu, idCustomOption, ipName"
      }, { status: 400 });
    }

    const data = await callApiGateway({
      endpoint: `/mslauncher/api/v1/menu-tracking`,
      method: "POST",
      body: {
        idUser,
        idMenu,
        idCustomOption,
        ipName
      }
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error registering menu tracking:', error);
    return NextResponse.json({
      id: null,
      statusCode: "500",
      message: "Error interno del servidor"
    }, { status: 500 });
  }
}