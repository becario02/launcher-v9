import { NextResponse } from "next/server";
import { callApiGateway } from "@/utils/serverApi";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");
  const language = req.headers.get("accept-language")?.split(",")[0] || "es";

  const data = await callApiGateway({
    endpoint: `/mslauncher/api/v1/notifications/user/${userId}/unread/count`,
    method: "GET",
    headers: {
      "Accept-Language": language,
    },
  });

  return NextResponse.json(data);
}
