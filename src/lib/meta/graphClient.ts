const GRAPH_API_VERSION = "v21.0";
const GRAPH_API_BASE = `https://graph.facebook.com/${GRAPH_API_VERSION}`;

interface GraphErrorBody {
  error?: {
    message?: string;
    code?: number;
    error_subcode?: number;
    is_transient?: boolean;
  };
}

/**
 * Carries Meta's structured error fields (code/error_subcode/is_transient)
 * instead of just a stringified body, so callers can react to a specific
 * known error (e.g. "media not ready for publishing") without re-parsing
 * the message text themselves.
 */
export class GraphApiError extends Error {
  code?: number;
  errorSubcode?: number;
  isTransient?: boolean;

  constructor(
    status: number,
    rawBody: string,
    parsed?: GraphErrorBody["error"],
  ) {
    super(`Meta Graph API request failed (${status}): ${rawBody}`);
    this.name = "GraphApiError";
    this.code = parsed?.code;
    this.errorSubcode = parsed?.error_subcode;
    this.isTransient = parsed?.is_transient;
  }
}

async function parseGraphResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const body = await response.text();
    let parsedError: GraphErrorBody["error"];
    try {
      parsedError = (JSON.parse(body) as GraphErrorBody).error;
    } catch {
      // Body wasn't JSON -- GraphApiError falls back to just the raw text.
    }
    throw new GraphApiError(response.status, body, parsedError);
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
