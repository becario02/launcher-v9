import { NextResponse } from "next/server";
import { callApiGateway } from "@/utils/serverApi";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const idAddenda = searchParams.get("idAddenda");
  const accept = req.headers.get("accept") || "application/json";

  const data = await callApiGateway({
    endpoint: `/mslauncher/api/v1/addenda/${idAddenda}/companies`,
    method: "GET",
    headers: { Accept: accept },
  });

  return NextResponse.json(data);
}
