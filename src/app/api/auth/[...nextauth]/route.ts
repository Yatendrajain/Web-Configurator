import NextAuth from "next-auth";
import AzureADProvider from "next-auth/providers/azure-ad";
import { NextAuthOptions } from "next-auth";

export const authOptions: NextAuthOptions = {
  providers: [
    AzureADProvider({
      clientId: process.env.AZURE_AD_CLIENT_ID!,
      clientSecret: process.env.AZURE_AD_CLIENT_SECRET!,
      tenantId: process.env.AZURE_AD_TENANT_ID!,
      authorization: {
        params: {
          scope: "openid profile email User.Read",
        },
      },
    }),
  ],
  events: {
    async signOut() {
      console.log("User signed out - clearing session");
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, account, profile }) {
      if (
        account &&
        profile &&
        Array.isArray((profile as { roles?: string[] }).roles)
      ) {
        token.roles = (profile as { roles?: string[] }).roles;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.roles = (token.roles as string[]) || [];
      return session;
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
