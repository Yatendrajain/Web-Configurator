"use client";

import { useEffect } from "react";
import { useSession, signIn } from "next-auth/react";

export default function AzureAuthGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();

  useEffect(() => {
    console.log("auth check running...");

    if (status === "loading") return;
    if (!session || !session.user?.email) {
      console.log("No session, redirecting...");
      signIn("azure-ad", { callbackUrl: "/" });
    } else {
      console.log("User authenticated:", session.user.email);
    }
  }, [session, status]);

  if (status === "loading") return <p>Loading auth...</p>;

  return <>{session && session?.user ? children : <></>}</>;
}
