import { getItemFromCache, setItemInCache } from "@/app/lib/in_mem_cache";
import { tactonApiRequest } from "@/app/lib/tacton_client";
import { TACTON_TOKEN } from "@/constants/api/constants/tacton_access_token";
import { REQUEST_METHODS } from "@/constants/common/enums/request_methods";

export const getTactonAccessToken = async () => {
  try {
    let accessToken: string | null | undefined = getItemFromCache(TACTON_TOKEN);
    if (accessToken) return accessToken;

    const res = await tactonApiRequest(
      REQUEST_METHODS.POST,
      `${process.env.TACTON_BASE_URL}/oauth2/token`,
      {
        body: getFormData().toString(),
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        authRequired: false,
      },
    );

    const parsedJSON = await res.json();
    accessToken = parsedJSON.access_token as string;

    setItemInCache(TACTON_TOKEN, accessToken);

    return accessToken;
  } catch (error) {
    console.error(error);
    //todo: if tacton is down or think of different scenarios
  }
};

const getFormData = () => {
  return new URLSearchParams({
    grant_type: process.env.TACTON_GRANT_TYPE!,
    client_id: process.env.TACTON_CLIENT_ID!,
    client_secret: process.env.TACTON_CLIENT_SECRET!,
    refresh_token: process.env.TACTON_REFRESH_TOKEN!,
  });
};
