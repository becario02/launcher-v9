import { NextResponse } from 'next/server';
import { callApiGateway } from "@/utils/serverApi";

export async function POST(req) {
  const body = await req.json();
  const { action, ...data } = body;
  const language = req.headers.get("accept-language")?.split(",")[0] || "es-MX";

  let endpoint;
  let method = "POST";

  switch (action) {
    case 'sendRecoveryEmail':
      endpoint = `/mslauncher/api/v1/sendRecoveryEmail`;
      break;
    case 'resetPassword':
      endpoint = `/mslauncher/api/v1/resetPassword`;
      break;
    default:
      return NextResponse.json(
        { error: 'Acción POST no válida para recuperación de contraseña' },
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
