// =====================================================================
// proxy.ts：ページを表示する「前」に毎回動く処理
//
// ここでやっていること
//   1. ログイン状態（Cookie）の期限が近ければ、自動で更新する
//   2. ログインしていない人が、ログインが必要なページを開いたら /login へ移動
//   3. ログイン済みの人が /login や /signup を開いたら /dashboard へ移動
//
// ※ ここは「入口の案内係」。本当のデータの保護は Supabase の RLS が行う。
// =====================================================================
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// ログインしていなくても開けるページ
const PUBLIC_PATHS = ["/login", "/signup", "/auth"];

// ログイン済みの人には見せなくてよいページ
const GUEST_ONLY_PATHS = ["/login", "/signup"];

function startsWithAny(pathname: string, paths: string[]) {
  return paths.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );
}

export async function proxy(request: NextRequest) {
  // 何もしなければ、そのままページを表示する
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        // ログイン状態が更新されたら、新しい Cookie をブラウザに返す
        setAll(cookiesToSet, headers) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
          // ログイン情報がキャッシュされないようにするための指示
          Object.entries(headers ?? {}).forEach(([key, value]) =>
            response.headers.set(key, value),
          );
        },
      },
    },
  );

  // ログイン状態を確認する（必要ならここで自動更新される）
  const { data } = await supabase.auth.getClaims();
  const isLoggedIn = Boolean(data?.claims);

  const { pathname } = request.nextUrl;

  // 2. 未ログイン かつ ログインが必要なページ → /login へ
  if (!isLoggedIn && !startsWithAny(pathname, PUBLIC_PATHS)) {
    return redirectWithCookies(request, response, "/login");
  }

  // 3. ログイン済み かつ /login・/signup → /dashboard へ
  if (isLoggedIn && startsWithAny(pathname, GUEST_ONLY_PATHS)) {
    return redirectWithCookies(request, response, "/dashboard");
  }

  return response;
}

// 移動するときも、更新された Cookie を忘れずに引き継ぐ
function redirectWithCookies(
  request: NextRequest,
  response: NextResponse,
  path: string,
) {
  const url = request.nextUrl.clone();
  url.pathname = path;
  url.search = "";
  const redirect = NextResponse.redirect(url);
  response.cookies.getAll().forEach((cookie) => redirect.cookies.set(cookie));
  return redirect;
}

// proxy を動かす対象のURL
// 画像やNext.jsの内部ファイルなど、ページ以外は対象外にする（速くするため）
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
