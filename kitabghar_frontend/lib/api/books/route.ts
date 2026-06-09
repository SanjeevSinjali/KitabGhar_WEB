import { NextRequest, NextResponse } from "next/server";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("kitabghar_token")?.value;
    const res = await fetch(`${BASE_URL}/api/books`, {
      headers: { Authorization: token ? `Bearer ${token}` : "" },
    });
    if (!res.ok) return NextResponse.json({ message: "Failed to fetch books" }, { status: res.status });
    return NextResponse.json(await res.json());
  } catch {
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get("kitabghar_token")?.value;
    const body = await request.json();
    const res = await fetch(`${BASE_URL}/api/books`, {
      method: "POST",
      headers: { Authorization: token ? `Bearer ${token}` : "", "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) return NextResponse.json({ message: "Failed to create book" }, { status: res.status });
    return NextResponse.json(await res.json(), { status: 201 });
  } catch {
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}