import { NextResponse } from "next/server";
import { callApiGateway } from "@/utils/serverApi";

export async function GET(req) {
  const accept = req.headers.get("accept") || "application/json";

  const data = await callApiGateway({
    endpoint: "/mslauncher/api/v1/integrator",
    method: "GET",
    params: { includeInactive: "true" },
    headers: { Accept: accept },
  });

  return NextResponse.json(data);
}
