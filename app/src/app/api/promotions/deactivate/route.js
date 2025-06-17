import { NextResponse } from "next/server";
import { callApiGateway } from "@/utils/serverApi";

export async function PUT(req) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  const accept = req.headers.get("accept") || "application/json";

  const data = await callApiGateway({
    endpoint: `/mslauncher/api/v1/promotions/${id}/deactivate`,
    method: "PUT",
    headers: { Accept: accept },
  });

  return NextResponse.json(data);
}
