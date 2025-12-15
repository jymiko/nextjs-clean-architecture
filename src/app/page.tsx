import { redirect } from "next/navigation";
import { getServerAuth } from "@/lib/auth/server-auth";

export default async function Home() {
  const auth = await getServerAuth();
  
  if (!auth) {
    redirect("/login");
  }
  
  redirect("/dashboard");
}
