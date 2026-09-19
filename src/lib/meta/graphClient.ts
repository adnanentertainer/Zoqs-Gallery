const GRAPH_API_VERSION = "v21.0";
const GRAPH_API_BASE = `https://graph.facebook.com/${GRAPH_API_VERSION}`;

async function parseGraphResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const body = await response.text();
    throw new Error(
      `Meta Graph API request failed (${response.status}): ${body}`,
    );
  }
  return response.json() as Promise<T>;
}

export async function graphApiGet<T>(
  path: string,
  accessToken: string,
): Promise<T> {
  const separator = path.includes("?") ? "&" : "?";
  const response = await fetch(
    `${GRAPH_API_BASE}/${path}${separator}access_token=${encodeURIComponent(accessToken)}`,
  );
  return parseGraphResponse<T>(response);
}

export async function graphApiPost<T>(
  path: string,
  accessToken: string,
  body: Record<string, string>,
): Promise<T> {
  const params = new URLSearchParams({ ...body, access_token: accessToken });
  const response = await fetch(`${GRAPH_API_BASE}/${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params,
  });
  return parseGraphResponse<T>(response);
}
