import { NextResponse } from "next/server";
import { callApiGateway } from "@/utils/serverApi";

export async function GET(req) {
  const { searchParams } = new URL(req.url);

  const userId = searchParams.get("userId");
  const page = searchParams.get("page") || 1;
  const pageSize = searchParams.get("pageSize") || 4;
  const isRead = searchParams.get("isRead") || false;

  const language = req.headers.get("accept-language")?.split(",")[0] || "es-MX";

  const data = await callApiGateway({
    endpoint: `/mslauncher/api/v1/notifications/user/${userId}`,
    method: "GET",
    params: { page, pageSize, isRead },
    headers: { "Accept-Language": language },
  });

  return NextResponse.json(data);
}
