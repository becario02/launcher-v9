import { NextResponse } from "next/server";
import { callApiGateway } from "@/utils/serverApi";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const idUser = searchParams.get("idUser");

  const params = {
    idUser,
  };

  const data = await callApiGateway({
    endpoint: "/mslauncher/api/v1/documents/favorites",
    method: "GET",
    params,
  });

  return NextResponse.json(data);
}

export async function POST(req) {
  const body = await req.json();

  const data = await callApiGateway({
    endpoint: "/mslauncher/api/v1/documents/favorite",
    method: "POST",
    body,
    headers: {
      "Content-Type": "application/json",
    },
  });

  return NextResponse.json(data);
}

export async function DELETE(req) {
  const body = await req.json();

  const data = await callApiGateway({
    endpoint: "/mslauncher/api/v1/documents/favorite",
    method: "DELETE",
    body,
    headers: {
      "Content-Type": "application/json",
    },
  });

  return NextResponse.json(data);
}