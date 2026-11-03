// トップページ（/）にアクセスしたら、ダッシュボードへ移動する
import { redirect } from "next/navigation";

export default function Home() {
  redirect("/dashboard");
}
