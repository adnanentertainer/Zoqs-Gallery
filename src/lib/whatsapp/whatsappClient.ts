const GRAPH_API_VERSION = "v21.0";

interface SendTemplateMessageInput {
  to: string;
  templateName: string;
  languageCode?: string;
  bodyParams?: string[];
}

/**
 * Sends a WhatsApp template message via Meta's Cloud API. Template messages
 * (rather than free-form text) are required because this is a
 * business-initiated message -- the admin's phone hasn't necessarily
 * messaged the business number within the last 24 hours, and Cloud API
 * rejects free-form text outside that window.
 */
export async function sendWhatsAppTemplateMessage({
  to,
  templateName,
  languageCode = "en_US",
  bodyParams = [],
}: SendTemplateMessageInput): Promise<void> {
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
  if (!phoneNumberId || !accessToken) {
    throw new Error(
      "WHATSAPP_PHONE_NUMBER_ID or WHATSAPP_ACCESS_TOKEN is not configured.",
    );
  }

  const response = await fetch(
    `https://graph.facebook.com/${GRAPH_API_VERSION}/${phoneNumberId}/messages`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to,
        type: "template",
        template: {
          name: templateName,
          language: { code: languageCode },
          components:
            bodyParams.length > 0
              ? [
                  {
                    type: "body",
                    parameters: bodyParams.map((text) => ({
                      type: "text",
                      text,
                    })),
                  },
                ]
              : undefined,
        },
      }),
    },
  );

  if (!response.ok) {
    const body = await response.text();
    throw new Error(
      `WhatsApp API request failed (${response.status}): ${body}`,
    );
  }
}
