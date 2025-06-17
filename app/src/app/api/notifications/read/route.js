import { NextResponse } from "next/server";
import { callApiGateway } from "@/utils/serverApi";

export async function POST(req) {
  const { searchParams } = new URL(req.url);
  const notificationId = searchParams.get("notificationId");
  const userId = searchParams.get("userId");
  const language = req.headers.get("accept-language")?.split(",")[0] || "es";

  const data = await callApiGateway({
    endpoint: `/mslauncher/api/v1/notification/${notificationId}/read/${userId}`,
    method: "POST",
    headers: {
      "Accept-Language": language,
    },
    body: {},
  });

  return NextResponse.json(data);
}
