import { getTactonAccessToken } from "@/utils/api/get_auth_token";
import { deleteItemFromCache } from "./in_mem_cache";
import { TACTON_TOKEN } from "@/constants/api/constants/tacton_access_token";

interface RequestOptions {
  body?: string | null;
  headers?: Record<string, string>;
  authRequired?: boolean;
}

export async function tactonApiRequest(
  method: string,
  url: string,
  options: RequestOptions = {},
) {
  const { body = null, headers = {}, authRequired = true } = options;

  const fetchHeaders: Record<string, string> = { ...headers };

  if (authRequired)
    fetchHeaders["Authorization"] = `Bearer ${await getTactonAccessToken()}`;

  const fetchOptions: RequestInit = {
    method,
    headers: fetchHeaders,
  };

  if (body) fetchOptions.body = body;

  try {
    let response = await fetch(url, fetchOptions);
    if (response.status === 403) {
      deleteItemFromCache(TACTON_TOKEN);

      fetchHeaders["Authorization"] = `Bearer ${await getTactonAccessToken()}`;

      fetchOptions.headers = fetchHeaders;

      response = await fetch(url, fetchOptions);
    }

    if (response.status !== 200) {
      const errorText = await response.text();
      throw new Error(errorText);
    }

    return response;
  } catch (error) {
    console.error("Tacton API Request Error:", error);
    throw error;
  }
}
