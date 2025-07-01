// import { cookies } from 'next/headers';

// uplode master data file api
export async function UploadMasterDataApi(formData: FormData) {
  try {
    const res = await fetch("/api/lookup_entries/diff", {
      method: "POST",
      body: formData,
    });
    const result = await res.json();
    return result;
  } catch (error) {
    return { error: `Unexpected error during upload: ${error}` };
  }
}
