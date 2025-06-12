import { NextResponse } from "next/server";
import { callApiGateway } from "@/utils/serverApi"

export async function GET(req) {
  const { searchParams } = new URL(req.url);

  const search = searchParams.get("search") || "";
  const language = req.headers.get("accept-language")?.split(",")[0] || "es-MX";

  const data = await callApiGateway({
    endpoint: "/mslauncher/api/v1/companies",
    method: "GET",
    params: { search },
    headers: { "Accept-Language": language },
  });

  return NextResponse.json(data);
}
