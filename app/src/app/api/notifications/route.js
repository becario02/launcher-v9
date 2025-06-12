import { NextResponse } from "next/server";
import { callApiGateway } from "@/lib/serverApi";

export async function GET(req) {
  const { searchParams } = new URL(req.url);

  const params = {};
  for (const [key, value] of searchParams.entries()) {
    params[key] = value;
  }

  const language = req.headers.get("accept-language")?.split(",")[0] || "es-MX";

  const data = await callApiGateway({
    endpoint: "/mslauncher/api/v1/notifications",
    method: "GET",
    params,
    headers: { "Accept-Language": language },
  });

  return NextResponse.json(data);
}

export async function PUT(req) {
  const language = req.headers.get("accept-language")?.split(",")[0] || "es";
  const body = await req.json();

  const data = await callApiGateway({
    endpoint: "/mslauncher/api/v1/notification",
    method: "PUT",
    body,
    headers: {
      "Content-Type": "application/json",
      "Accept-Language": language,
    },
  });

  return NextResponse.json(data);
}

export async function POST(req) {
  const language = req.headers.get("accept-language")?.split(",")[0] || "es";
  const body = await req.json();

  const data = await callApiGateway({
    endpoint: "/mslauncher/api/v1/notification",
    method: "POST",
    body,
    headers: {
      "Content-Type": "application/json",
      "Accept-Language": language,
    },
  });

  return NextResponse.json(data);
}

export async function DELETE(req) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  const language = req.headers.get("accept-language")?.split(",")[0] || "es";

  const data = await callApiGateway({
    endpoint: `/mslauncher/api/v1/notification/${id}`,
    method: "DELETE",
    headers: {
      "Accept-Language": language,
    },
  });

  return NextResponse.json(data);
}