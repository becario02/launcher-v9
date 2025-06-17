import { NextResponse } from "next/server";
import { callApiGateway } from "@/utils/serverApi";

export async function POST(req) {
  const body = await req.json();
  const language = req.headers.get("accept-language")?.split(",")[0] || "es";
  const contentType = req.headers.get("content-type") || "application/json";

  const data = await callApiGateway({
    endpoint: "/mslauncher/api/v1/login",
    method: "POST",
    body,
    headers: {
      "Accept-Language": language,
      "Content-Type": contentType
    },
  });

  return NextResponse.json(data);
}
