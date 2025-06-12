import { NextResponse } from "next/server";
import { callApiGateway } from "@/utils/serverApi";

export async function POST(req) {
  const body = await req.json();
  const accept = req.headers.get("accept") || "*/*";

  const data = await callApiGateway({
    endpoint: "/mslauncher/api/v1/integrator",
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
  const idIntegrator = searchParams.get("idIntegrator");
  const body = await req.json();
  const accept = req.headers.get("accept") || "*/*";

  const data = await callApiGateway({
    endpoint: `/mslauncher/api/v1/integrator/${idIntegrator}`,
    method: "PUT",
    body,
    headers: {
      Accept: accept,
      "Content-Type": "application/json"
    },
  });

  return NextResponse.json(data);
}

export async function GET(req) {
  const accept = req.headers.get("accept") || "application/json";

  const data = await callApiGateway({
    endpoint: "/mslauncher/api/v1/integrator",
    method: "GET",
    headers: { Accept: accept },
  });

  return NextResponse.json(data);
}