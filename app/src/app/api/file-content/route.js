import { NextResponse } from "next/server";
import { callApiGateway } from "@/utils/serverApi";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const idFile = searchParams.get("idFile");
  const accept = req.headers.get("accept") || "*/*";

  const data = await callApiGateway({
    endpoint: `/mslauncher/api/v1/integrator/files/${idFile}/content`,
    method: "GET",
    headers: {
      Accept: accept,
    },
  });

  return NextResponse.json(data);
}
