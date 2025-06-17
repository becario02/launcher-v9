import { NextResponse } from "next/server";
import { callApiGateway } from "@/utils/serverApi";

export async function DELETE(req) {
  const body = await req.json();

  const data = await callApiGateway({
    endpoint: "/mslauncher/api/v1/DeleteMenuShortCuts",
    method: "DELETE",
    body,
    headers: {
      "Content-Type": "application/json",
    },
  });

  return NextResponse.json(data);
}
