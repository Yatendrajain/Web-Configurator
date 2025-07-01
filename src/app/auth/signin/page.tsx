"use client";
import { useEffect } from "react";
import { signIn } from "next-auth/react";

export default function SignInPage() {
  useEffect(() => {
    signIn("azure-ad");
  }, []);

  return <div>Redirecting to your organization’s sign-in…</div>;
}
