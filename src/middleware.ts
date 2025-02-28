import axios from "axios";
import { NextRequest, NextResponse } from "next/server";

interface VerifyResponse {
  isValid: boolean;
}

export async function middleware(req: NextRequest) {
  const token = req.cookies.get("token")?.value;

  if (req.nextUrl.pathname.startsWith("/main")) {
    if (!token) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    const verifyUrl = process.env.NEXT_PUBLIC_VERIFY_TOKEN_URL;
    try {
      const response = await axios.post(
        verifyUrl!,
        {},
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const verifyData = response.data as VerifyResponse;
      if (!response.status || !verifyData.isValid) {
        const res = NextResponse.redirect(new URL("/login", req.url));
        res.cookies.delete("token");
        return res;
      }
    } catch (error) {
      console.error("Erro ao verificar token no middleware:", error);
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/main/:path*",
};