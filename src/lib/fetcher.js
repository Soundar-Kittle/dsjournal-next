export async function api(
  url,
  { method = "GET", body, headers = {}, queryParams } = {}
) {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const isFormData = body instanceof FormData;

  const queryString =
    queryParams && Object.keys(queryParams).length > 0
      ? `?${new URLSearchParams(queryParams).toString()}`
      : "";

  const res = await fetch(`/api${url}${queryString}`, {
    method,
    headers: {
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: isFormData ? body : body ? JSON.stringify(body) : undefined,
    credentials: "include",
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || errorData.error || `Request failed: ${res.status}`);
  }

  return res.json();
}
