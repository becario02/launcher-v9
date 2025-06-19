import { NextResponse } from "next/server";
import { callApiGateway } from "@/utils/serverApi";

export async function GET() {
  const data = await callApiGateway({
    endpoint: "/mslauncher/api/v1/users",
    method: "GET",
  });

  return NextResponse.json(data);
}

export async function POST(req) {
  const body = await req.json();

  const data = await callApiGateway({
    endpoint: "/mslauncher/api/v1/users/admin",
    method: "POST",
    body,
    headers: { "Content-Type": "application/json" },
  });

  return NextResponse.json(data);
}

export async function PUT(req) {
  const body = await req.json();
  const { idUser, ...rest } = body;

  const data = await callApiGateway({
    endpoint: `/mslauncher/api/v1/users/${idUser}`,
    method: "PUT",
    body: rest,
    headers: { "Content-Type": "application/json" },
  });

  return NextResponse.json(data);
}
