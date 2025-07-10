import { NextRequest } from "next/server";
import { validateToken } from "./validate_token";
import { findOrInitUser } from "./find_or_init_user";
import { verifyPermissions } from "./verify_permissions";
import { SessionSchema } from "./models";
import { getFeaturePermissions } from "./get_feat_permissions";

export const applyCustomMiddlewares = async (request: NextRequest) => {
  const { pathname } = new URL(request.url);
  const {
    name,
    sub: azureUserId,
    roles: azureAdRoles,
  } = await validateToken(request);
  const session = await findOrInitUser(azureUserId as string, name as string);
  await verifyPermissions(pathname, azureAdRoles as Array<string>);
  const parsedSession = SessionSchema.parse(session);
  parsedSession.featPermissions = await getFeaturePermissions(
    pathname,
    azureAdRoles as Array<string>,
  );

  return SessionSchema.parse(session);
};
