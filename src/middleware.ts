import { NextRequest, NextResponse } from "next/server";

const PUBLIC_PATHS = ["/", "/login"];
const STATIC_EXT_REGEX = /\.(png|jpg|jpeg|svg|css|js|ico|json|txt|webp|woff2?)$/i;

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Permitir caminhos públicos, APIs e assets estáticos
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    PUBLIC_PATHS.includes(pathname) ||
    STATIC_EXT_REGEX.test(pathname)
  ) {
    return NextResponse.next();
  }

  // Para todas as demais rotas, exigir token
  const token = req.cookies.get("session")?.value;

  //console.log("MIDDLEWARE COOKIE:", token);

  if (!token) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
}