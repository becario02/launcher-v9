import { NextResponse } from "next/server";
import { callApiGateway } from "@/utils/serverApi";

export async function GET(req) {
  const { searchParams } = new URL(req.url);

  const page = searchParams.get("page") || 1;
  const pageSize = searchParams.get("pageSize") || 10;
  const title = searchParams.get("title") || null;
  const status = searchParams.get("status") || null;

  const params = {
    page,
    pageSize,
    ...(title && { title }),
    ...(status && { status }),
  };

  const data = await callApiGateway({
    endpoint: "/mslauncher/api/v1/videos",
    method: "GET",
    params,
  });

  return NextResponse.json(data);
}

export async function POST(req) {
  const body = await req.json();

  const data = await callApiGateway({
    endpoint: "/mslauncher/api/v1/videos",
    method: "POST",
    body,
    headers: {
      "Content-Type": "application/json",
    },
  });

  return NextResponse.json(data);
}

export async function PUT(req) {
  const body = await req.json();

  const data = await callApiGateway({
    endpoint: "/mslauncher/api/v1/videos",
    method: "PUT",
    body,
    headers: {
      "Content-Type": "application/json",
    },
  });

  return NextResponse.json(data);
}

export async function DELETE(req) {
  const { searchParams } = new URL(req.url);
  const idVideo = searchParams.get("idVideo");

  const data = await callApiGateway({
    endpoint: `/mslauncher/api/v1/video/${idVideo}`,
    method: "DELETE",
  });

  return NextResponse.json(data);
}