import { NextResponse } from "next/server";
import { callApiGateway } from "@/utils/serverApi";

export async function POST(req) {
  const language = req.headers.get("accept-language")?.split(",")[0] || "es-MX";
  const body = await req.json();

  const data = await callApiGateway({
    endpoint: `/mslauncher/api/v1/AddNewCompany`,
    method: "POST",
    body,
    headers: {
      "Content-Type": "application/json",
      "Accept-Language": language,
    },
  });

  return NextResponse.json(data);
}