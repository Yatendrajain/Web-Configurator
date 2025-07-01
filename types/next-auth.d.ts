import { DefaultSession, DefaultJWT } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & {
      /** Adding Access Token Property in Default User Type for Type checking */
      accessToken?: string;
      /** optionally roles or other claims */
      roles?: string[];
    };
  }

  interface JWT extends DefaultJWT {
    accessToken?: string;
    roles?: string[];
  }
}
