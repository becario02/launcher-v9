import { NextResponse } from "next/server";
import { callApiGateway } from "@/utils/serverApi";

export async function DELETE(req) {
  const language = req.headers.get("accept-language")?.split(",")[0] || "es-MX";
  const body = await req.json();

  const data = await callApiGateway({
    endpoint: `/mslauncher/api/v1/news/DeleteNewsById`,
    method: "DELETE",
    body,
    headers: {
      "Content-Type": "application/json",
      "Accept-Language": language,
    },
  });

  const status = parseInt(data?.statusCode) || 500;

  return NextResponse.json(data, { status });
}
