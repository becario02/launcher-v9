import { NextResponse } from "next/server";
import { callApiGateway } from "@/utils/serverApi";

export async function POST(req) {
  const body = await req.json();
  const language = req.headers.get("accept-language")?.split(",")[0] || "es-MX";
  const authorization = req.headers.get("authorization");

  const data = await callApiGateway({
    endpoint: "/mslauncher/api/v1/SyncCompanyModules",
    method: "POST",
    body,
    headers: {
      "Content-Type": "application/json",
      "Authorization": authorization,
      "Accept-Language": language,
    },
  });

  return NextResponse.json(data);
}
