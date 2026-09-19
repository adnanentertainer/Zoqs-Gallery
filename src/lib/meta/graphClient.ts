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

/**
 * Facebook's Page endpoints (e.g. /{page-id}/photos) reject a raw System
 * User / Business token with a misleading "publish_actions deprecated"
 * error -- they require a genuine Page-scoped access token instead. This
 * exchanges the System User token for one, the same way Instagram's
 * publishing already works with the System User token directly (Instagram
 * doesn't have this requirement).
 */
export async function getPageAccessToken(
  pageId: string,
  systemUserAccessToken: string,
): Promise<string> {
  const { access_token } = await graphApiGet<{ access_token: string }>(
    `${pageId}?fields=access_token`,
    systemUserAccessToken,
  );
  return access_token;
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
