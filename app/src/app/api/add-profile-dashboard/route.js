import { NextResponse } from "next/server";
import { callApiGateway } from "@/utils/serverApi";

export async function POST(req) {
  const body = await req.json();

  const data = await callApiGateway({
    endpoint: "/mslauncher/api/v1/addProfileDashboard",
    method: "POST",
    body,
    headers: { "Content-Type": "application/json" },
  });

  return NextResponse.json(data);
}
