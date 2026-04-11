import { createServerClient, type CookieOptions } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: { headers: request.headers },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options })
          response = NextResponse.next({
            request: { headers: request.headers },
          })
          response.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: "", ...options })
          response = NextResponse.next({
            request: { headers: request.headers },
          })
          response.cookies.set({ name, value: "", ...options })
        },
      },
    }
  )

  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Routes protégées : /dashboard/** nécessite une session
  if (!session && request.nextUrl.pathname.startsWith("/dashboard")) {
    const redirectUrl = new URL("/login", request.url)
    return NextResponse.redirect(redirectUrl)
  }

  // Si connecté et sur /login ou /register, rediriger vers dashboard
  if (session && (request.nextUrl.pathname === "/login" || request.nextUrl.pathname === "/register")) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  // Vérification plan expiré — rediriger vers /dashboard/billing
  if (session && request.nextUrl.pathname.startsWith("/dashboard") && request.nextUrl.pathname !== "/dashboard/billing") {
    const { data: user } = await supabase
      .from("users")
      .select("org_id, organizations(plan, plan_expires_at)")
      .eq("id", session.user.id)
      .single()

    if (user?.organizations) {
      const org = user.organizations as { plan: string; plan_expires_at: string | null }
      if (org.plan === "trial" && org.plan_expires_at && new Date(org.plan_expires_at) < new Date()) {
        return NextResponse.redirect(new URL("/dashboard/billing", request.url))
      }
    }
  }

  return response
}

export const config = {
  matcher: ["/dashboard/:path*", "/login", "/register"],
}
