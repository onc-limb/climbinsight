import { NextResponse } from "next/server";

async function proxyRequest(
  request: Request,
  method: string,
  params: { path: string[] }
) {
  const targetPath = params.path.join("/");

  const apiUrl = new URL(
    targetPath,
    process.env.NEXT_PUBLIC_API_URL
  ).toString();

  const body = method !== "GET" ? await request.text() : undefined;

  const res = await fetch(apiUrl, {
    method,
    headers: request.headers,
    body,
  });

  const data = await res.text();
  return new NextResponse(data, {
    status: res.status,
    headers: res.headers,
  });
}

export async function GET(
  request: Request,
  { params }: { params: { path: string[] } }
) {
  return proxyRequest(request, "GET", params);
}

export async function POST(
  request: Request,
  { params }: { params: { path: string[] } }
) {
  return proxyRequest(request, "POST", params);
}

export async function PUT(
  request: Request,
  { params }: { params: { path: string[] } }
) {
  return proxyRequest(request, "PUT", params);
}

export async function DELETE(
  request: Request,
  { params }: { params: { path: string[] } }
) {
  return proxyRequest(request, "DELETE", params);
}
