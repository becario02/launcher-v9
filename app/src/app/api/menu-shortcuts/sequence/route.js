import { NextResponse } from "next/server";
import { callApiGateway } from "@/utils/serverApi";

export async function PUT(req) {
  const body = await req.json();

  const data = await callApiGateway({
    endpoint: "/mslauncher/api/v1/UpdateSequenceMenuShortCuts",
    method: "PUT",
    body,
    headers: {
      "Content-Type": "application/json",
    },
  });

  return NextResponse.json(data);
}
