import { NextResponse } from "next/server";
import { callApiGateway } from "@/utils/serverApi";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const idIntegrator = searchParams.get("idIntegrator");
  const accept = req.headers.get("accept") || "application/json";

  const data = await callApiGateway({
    endpoint: `/mslauncher/api/v1/integrator/${idIntegrator}`,
    method: "GET",
    headers: { Accept: accept },
  });

  return NextResponse.json(data);
}
