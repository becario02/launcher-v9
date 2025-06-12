import { NextResponse } from "next/server";
import { callApiGateway } from "@/utils/serverApi";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const idUser = searchParams.get("idUser");
  const language = req.headers.get("accept-language")?.split(",")[0] || "es-MX";

  const data = await callApiGateway({
    endpoint: `/mslauncher/api/v1/news/unread?idUser=${idUser}`,
    method: "GET",
    headers: { "Accept-Language": language },
  });

  

  return NextResponse.json(data);
}

export async function PUT(req) {
  const language = req.headers.get("accept-language")?.split(",")[0] || "es-MX";
  const body = await req.json();

  const data = await callApiGateway({
    endpoint: `/mslauncher/api/v1/news/mark-as-read`,
    method: "PUT",
    body,
    headers: {
      "Content-Type": "application/json",
      "Accept-Language": language,
    },
  });

  return NextResponse.json(data);
}