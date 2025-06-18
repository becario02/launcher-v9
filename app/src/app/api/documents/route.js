import { NextResponse } from "next/server";
import { callApiGateway } from "@/utils/serverApi";

export async function GET(req) {
  const data = await callApiGateway({
    endpoint: "/mslauncher/api/v1/documents",
    method: "GET",
  });

  return NextResponse.json(data);
}