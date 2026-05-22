import { NextResponse } from "next/server";
// The client file uses server cookies under the hood for Route Handlers
import { createClient } from "@/utils/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  // code exchange is only required if the user logs in via an email confirmation link
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // return the user to an error page or main page if code exchange fails
  return NextResponse.redirect(`${origin}/login?error=auth-failed`);
}
