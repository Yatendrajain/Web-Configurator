import { CustomAPIError } from "./custom_error";

export const incrementNumericString = (input: string): string => {
  if (!/^\d+$/.test(input)) {
    throw new CustomAPIError({
      clientMessage: "Something went wrong!",
      innerError: `Invalid submission version input: ${input}`,
      statusCode: 500,
    });
  }

  const next = parseInt(input, 10) + 1;
  return String(next).padStart(input.length, "0");
};
