import { NextResponse } from "next/server";
import { callApiGateway } from "@/utils/serverApi";

export async function GET(req) {
  const language = req.headers.get("accept-language")?.split(",")[0] || "es-MX";
  
  const data = await callApiGateway({
    endpoint: `/mslauncher/api/v1/getAdminNews`,
    method: "GET",
    headers: { "Accept-Language": language },
  });
  
  return NextResponse.json(data);
}

export async function POST(req) {
  const body = await req.json();
  const language = req.headers.get("accept-language")?.split(",")[0] || "es-MX";
  
  const data = await callApiGateway({
    endpoint: `/mslauncher/api/v1/news`,
    method: "POST",
    headers: { "Accept-Language": language },
    body: body
  });
  
  return NextResponse.json(data);
}

// PUT - Actualizar, activar o desactivar noticia
export async function PUT(req) {
  const body = await req.json();
  const { action, ...data } = body;
  const language = req.headers.get("accept-language")?.split(",")[0] || "es-MX";
  
  let endpoint;
  let method = "PUT";
  
  switch (action) {
    case 'update':
      endpoint = `/mslauncher/api/v1/updateNews`;
      break;
    case 'activate':
      endpoint = `/mslauncher/api/v1/news/activate`;
      break;
    case 'deactivate':
      endpoint = `/mslauncher/api/v1/news/deactivate`;
      break;
    default:
      return NextResponse.json(
        { error: 'Acción no válida. Use: update, activate, o deactivate' }, 
        { status: 400 }
      );
  }
  
  const result = await callApiGateway({
    endpoint: endpoint,
    method: method,
    headers: { "Accept-Language": language },
    body: data
  });
  
  return NextResponse.json(result);
}