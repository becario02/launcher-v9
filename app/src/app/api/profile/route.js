import { NextResponse } from "next/server";
import { callApiGateway } from "@/utils/serverApi";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");

  const data = await callApiGateway({
    endpoint: `/mslauncher/api/v1/profile?userId=${userId}`,
    method: "GET",
  });

  return NextResponse.json(data);
}