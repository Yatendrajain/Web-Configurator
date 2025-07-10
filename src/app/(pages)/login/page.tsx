"use client";
import { useSession, signIn, signOut } from "next-auth/react";

export default function Home() {
  const { data: session, status } = useSession();

  if (status === "loading") return <p>Loading...</p>;
  const handleSignOut = async () => {
    const tenantId = process.env.AZURE_AD_TENANT_ID; // Make sure this is public

    // Sign out from NextAuth first
    await signOut({
      redirect: false,
    });

    // Then redirect to Azure AD logout endpoint
    window.location.href = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/logout?post_logout_redirect_uri=${encodeURIComponent(window.location.origin)}`;
  };
  return (
    <div>
      {session ? (
        <>
          <p>Signed in as {session.user?.email}</p>
          <button onClick={() => handleSignOut()}>Sign out</button>
          {/* <button
          >
            <a
              href={`https://${process.env.AUTH_TENANT_NAME}.b2clogin.com/${process.env.AUTH_TENANT_NAME}.onmicrosoft.com/${process.env.USER_FLOW}/oauth2/v2.0/logout?post_logout_redirect_uri=${process.env.NEXTAUTH_URL}/auth/signout`}
             >
               Sign out
             </a>
          </button> */}
        </>
      ) : (
        <>
          <p>Not signed in</p>
          <button onClick={() => signIn("azure-ad", { callbackUrl: "/" })}>
            Sign in
          </button>
        </>
      )}
    </div>
  );
}
