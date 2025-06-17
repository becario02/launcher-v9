import { NextResponse } from "next/server";
import { callApiGateway } from "@/utils/serverApi";

export async function GET() {
  const data = await callApiGateway({
    endpoint: "/mslauncher/api/v1/GetCustomAndDashboard",
    method: "GET",
  });

  return NextResponse.json(data);
}
