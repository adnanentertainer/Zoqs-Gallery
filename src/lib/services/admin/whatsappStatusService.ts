import { getSupabaseServerClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import { buildWhatsAppStatusCaption } from "@/lib/meta/captionBuilder";
import type { WhatsAppStatusQueueItem } from "@/types/socialMedia";

/**
 * Queues a "post this to WhatsApp Status" reminder for a brand-new active
 * product. Purely additive and never throws into the caller (createProduct)
 * — same resilience contract as publishProductToSocialMedia/
 * enqueuePriceChangeRepost, which this mirrors. There is no official API
 * for WhatsApp Status, so unlike those two this queue is never processed by
 * a cron job — only by an admin working through /admin/whatsapp-status.
 */
export async function enqueueNewProductWhatsAppStatus(
  productId: string,
): Promise<void> {
  try {
    await requireAdmin();
    const supabase = await getSupabaseServerClient();
    const { error } = await supabase
      .from("product_whatsapp_status_queue")
      .insert({ product_id: productId, reason: "new_product" });

    // 23505 = unique_violation: a "new product" item for this product is
    // already pending, which is fine — nothing new to show the admin.
    if (error && error.code !== "23505") {
      console.error(
        "[whatsappStatusService.enqueueNewProductWhatsAppStatus] failed:",
        error,
      );
    }
  } catch (error) {
    console.error(
      "[whatsappStatusService.enqueueNewProductWhatsAppStatus] failed:",
      error,
    );
  }
}

/** Same as above, for a price change on an already-active product. */
export async function enqueuePriceChangeWhatsAppStatus(
  productId: string,
  previousPrice: number,
): Promise<void> {
  try {
    await requireAdmin();
    const supabase = await getSupabaseServerClient();
    const { error } = await supabase.from("product_whatsapp_status_queue").insert({
      product_id: productId,
      reason: "price_change",
      previous_price: previousPrice,
    });

    if (error && error.code !== "23505") {
      console.error(
        "[whatsappStatusService.enqueuePriceChangeWhatsAppStatus] failed:",
        error,
      );
    }
  } catch (error) {
    console.error(
      "[whatsappStatusService.enqueuePriceChangeWhatsAppStatus] failed:",
      error,
    );
  }
}

interface PendingQueueRow {
  id: string;
  product_id: string;
  reason: "new_product" | "price_change";
  previous_price: number | null;
  created_at: string;
  products: {
    name: string;
    slug: string;
    price: number;
    stock: number;
    force_unavailable: boolean;
    is_active: boolean;
    product_images: { image_url: string; display_order: number }[];
  } | null;
}

/**
 * Everything currently waiting for the admin to post to WhatsApp Status.
 * The caption is built fresh from the product's CURRENT price every time
 * this is called (not a value snapshotted when queued), so a product that
 * changed price twice before the admin got to it still shows the right
 * number — the only snapshotted value is previous_price, which only exists
 * to render "was X, now Y" for a price_change item.
 *
 * Skips any item whose product is no longer purchasable (deactivated, out
 * of stock, or marked force_unavailable) — same guard
 * publishProductToSocialMediaCore applies before auto-posting to
 * Facebook/Instagram, so this never recommends promoting something a
 * shopper couldn't actually buy. The row itself is left pending rather than
 * deleted, so it reappears here on its own if the product becomes
 * purchasable again.
 */
export async function listPendingWhatsAppStatusItems(): Promise<
  WhatsAppStatusQueueItem[]
> {
  await requireAdmin();
  const supabase = await getSupabaseServerClient();

  const { data, error } = await supabase
    .from("product_whatsapp_status_queue")
    .select(
      "id, product_id, reason, previous_price, created_at, products(name, slug, price, stock, force_unavailable, is_active, product_images(image_url, display_order))",
    )
    .eq("status", "pending")
    .order("created_at", { ascending: true });

  if (error) {
    console.error(
      "[whatsappStatusService.listPendingWhatsAppStatusItems] failed:",
      error,
    );
    throw new Error("Unable to load the WhatsApp Status queue right now.");
  }

  const rows = (data ?? []) as unknown as PendingQueueRow[];

  return rows.flatMap((row): WhatsAppStatusQueueItem[] => {
    const product = row.products;
    if (
      !product ||
      !product.is_active ||
      product.force_unavailable ||
      product.stock <= 0
    ) {
      return [];
    }

    const image = [...product.product_images].sort(
      (a, b) => a.display_order - b.display_order,
    )[0];

    return [
      {
        id: row.id,
        productId: row.product_id,
        productName: product.name,
        productSlug: product.slug,
        imageUrl: image?.image_url ?? null,
        reason: row.reason,
        caption: buildWhatsAppStatusCaption({
          name: product.name,
          price: product.price,
          reason: row.reason,
          previousPrice: row.previous_price,
        }),
        createdAt: row.created_at,
      },
    ];
  });
}

async function resolveWhatsAppStatusItem(
  id: string,
  status: "posted" | "dismissed",
): Promise<{ error?: string }> {
  await requireAdmin();
  const supabase = await getSupabaseServerClient();

  const { error } = await supabase
    .from("product_whatsapp_status_queue")
    .update({ status, resolved_at: new Date().toISOString() })
    .eq("id", id);

  if (error) {
    console.error(
      `[whatsappStatusService.resolveWhatsAppStatusItem:${status}] failed:`,
      error,
    );
    return { error: "Unable to update this item right now." };
  }
  return {};
}

/** Admin confirms they actually posted this to WhatsApp Status. */
export async function markWhatsAppStatusPosted(
  id: string,
): Promise<{ error?: string }> {
  return resolveWhatsAppStatusItem(id, "posted");
}

/** Admin clears this item without posting it. */
export async function dismissWhatsAppStatusItem(
  id: string,
): Promise<{ error?: string }> {
  return resolveWhatsAppStatusItem(id, "dismissed");
}
