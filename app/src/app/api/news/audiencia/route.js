import { NextResponse } from 'next/server';
import { callApiGateway } from "@/utils/serverApi";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const action = searchParams.get("action");
  const language = req.headers.get("accept-language")?.split(",")[0] || "es-MX";
  
  let endpoint;

  switch (action) {
    case 'obtenerAudiencia':
      endpoint = `/mslauncher/api/v1/allClients/allUsers`;
      break;
    case 'obtenerAplicaciones':
      endpoint = `/mslauncher/api/v1/apps`;
      break;
    default:
      return NextResponse.json(
        { error: 'Acción GET no válida para audiencia' }, 
        { status: 400 }
      );
  }
  
  const result = await callApiGateway({
    endpoint: endpoint,
    method: "GET",
    headers: { "Accept-Language": language }
  });
  
  return NextResponse.json(result);
}

export async function POST(req) {
  const body = await req.json();
  const { action, ...data } = body;
  const language = req.headers.get("accept-language")?.split(",")[0] || "es-MX";
  
  let endpoint;
  let method = "POST";

  switch (action) {
    case 'insertarAudienciaLauncher':
      endpoint = `/mslauncher/api/v1/news/audienceLauncher`;
      break;
    case 'insertarAudiencia':
      endpoint = `/mslauncher/api/v1/news/audienceApps`;
      break;
    case 'obtenerAudienciaLauncher':
      endpoint = `/mslauncher/api/v1/news/getAudienceLauncher`;
      break;
    case 'obtenerAudienciaApps':
      endpoint = `/mslauncher/api/v1/news/getAudienceApps`;
      break;
    default:
      return NextResponse.json(
        { error: 'Acción POST no válida para audiencia' }, 
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