import { NextResponse } from "next/server";
import { callApiGateway } from "@/utils/serverApi";

export async function GET(req) {
  const language = req.headers.get("accept-language")?.split(",")[0] || "es-MX";

  const data = await callApiGateway({
    endpoint: "/mslauncher/api/v1/GetAllConexionesErp",
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Accept-Language": language,
    },
  });

  return NextResponse.json(data);
}
