import { NextResponse } from "next/server";
import { callApiGateway } from "@/utils/serverApi";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const accept = req.headers.get("accept") || "application/json";

  // Convierte los searchParams en un objeto plano
  const params = {};
  for (const [key, value] of searchParams.entries()) {
    params[key] = value;
  }

  const data = await callApiGateway({
    endpoint: "/mslauncher/api/v1/promotions",
    method: "GET",
    params,
    headers: { Accept: accept },
  });

  return NextResponse.json(data);
}

export async function POST(req) {
  const body = await req.json();
  const accept = req.headers.get("accept") || "*/*";

  const data = await callApiGateway({
    endpoint: "/mslauncher/api/v1/promotions",
    method: "POST",
    body,
    headers: {
      Accept: accept,
      "Content-Type": "application/json"
    },
  });

  return NextResponse.json(data);
}

export async function PUT(req) {
  const { searchParams } = new URL(req.url);
  const idPromotion = searchParams.get("id");
  const body = await req.json();
  const accept = req.headers.get("accept") || "*/*";

  const data = await callApiGateway({
    endpoint: `/mslauncher/api/v1/promotions/${idPromotion}`,
    method: "PUT",
    body,
    headers: {
      Accept: accept,
      "Content-Type": "application/json"
    },
  });

  return NextResponse.json(data);
}