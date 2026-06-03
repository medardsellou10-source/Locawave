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

  const path = request.nextUrl.pathname

  // Routes protégées : /dashboard/**, /locataire/**, /prestataire/** nécessitent une session
  if (!session && (path.startsWith("/dashboard") || path.startsWith("/locataire") || path.startsWith("/prestataire"))) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  if (session) {
    // Rôle canonique du compte (owner/tenant/provider/seeker/admin)
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", session.user.id)
      .single()
    const role = profile?.role
    const isTenant = role === "tenant"
    const isProvider = role === "provider"
    const home = isTenant ? "/locataire" : isProvider ? "/prestataire" : "/dashboard"

    // Aiguillage par rôle : chacun reste dans son espace
    if (isTenant && (path.startsWith("/dashboard") || path.startsWith("/prestataire"))) {
      return NextResponse.redirect(new URL("/locataire", request.url))
    }
    if (isProvider && (path.startsWith("/dashboard") || path.startsWith("/locataire"))) {
      return NextResponse.redirect(new URL("/prestataire", request.url))
    }
    if (!isTenant && path.startsWith("/locataire")) {
      return NextResponse.redirect(new URL(home, request.url))
    }
    if (!isProvider && path.startsWith("/prestataire")) {
      return NextResponse.redirect(new URL(home, request.url))
    }

    // Connecté sur /login ou /register → vers son espace selon le rôle
    if (path === "/login" || path === "/register") {
      return NextResponse.redirect(new URL(home, request.url))
    }

    // Vérification plan expiré — uniquement pour les comptes B2B (owner/admin)
    if (!isTenant && !isProvider && path.startsWith("/dashboard") && path !== "/dashboard/billing") {
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
  }

  return response
}

export const config = {
  matcher: ["/dashboard", "/dashboard/:path*", "/locataire", "/locataire/:path*", "/prestataire", "/prestataire/:path*", "/login", "/register"],
}
