import { getSupabaseServerClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import type {
  AdminSupplierDetail,
  AdminSupplierFilters,
  AdminSupplierInput,
  AdminSupplierListItem,
  PaginationResult,
  SupplierOption,
} from "@/types/admin";

/** Lightweight, unpaginated list for populating a supplier <select>. */
export async function listSupplierOptions(): Promise<SupplierOption[]> {
  await requireAdmin();
  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase
    .from("suppliers")
    .select("id, name, status")
    .order("name", { ascending: true });

  if (error) {
    console.error("[supplierService.listSupplierOptions] failed:", error);
    throw new Error("Unable to load suppliers right now.");
  }
  return (data ?? []).map((row) => ({
    id: row.id,
    name: row.name,
    status: row.status as SupplierOption["status"],
  }));
}

export async function listAdminSuppliers(
  filters: AdminSupplierFilters,
): Promise<PaginationResult<AdminSupplierListItem>> {
  await requireAdmin();
  const supabase = await getSupabaseServerClient();

  let query = supabase
    .from("suppliers")
    .select("*", { count: "exact" })
    .order("name", { ascending: true });

  if (filters.search?.trim()) {
    const term = filters.search.trim();
    query = query.or(`name.ilike.%${term}%,contact_person.ilike.%${term}%`);
  }
  if (filters.status) {
    query = query.eq("status", filters.status);
  }

  const from = (filters.page - 1) * filters.pageSize;
  const to = from + filters.pageSize - 1;
  query = query.range(from, to);

  const { data, error, count } = await query;
  if (error) {
    console.error("[supplierService.listAdminSuppliers] failed:", error);
    throw new Error("Unable to load suppliers right now.");
  }

  const supplierIds = (data ?? []).map((row) => row.id);
  const productCounts = new Map<string, number>();
  if (supplierIds.length > 0) {
    const { data: productRows, error: productsError } = await supabase
      .from("products")
      .select("primary_supplier_id")
      .in("primary_supplier_id", supplierIds);
    if (productsError) throw productsError;
    for (const row of productRows ?? []) {
      if (!row.primary_supplier_id) continue;
      productCounts.set(
        row.primary_supplier_id,
        (productCounts.get(row.primary_supplier_id) ?? 0) + 1,
      );
    }
  }

  const items: AdminSupplierListItem[] = (data ?? []).map((row) => ({
    id: row.id,
    name: row.name,
    contactPerson: row.contact_person,
    phone: row.phone,
    email: row.email,
    status: row.status as AdminSupplierListItem["status"],
    productCount: productCounts.get(row.id) ?? 0,
    createdAt: row.created_at,
  }));

  const totalCount = count ?? 0;
  return {
    items,
    page: filters.page,
    pageSize: filters.pageSize,
    totalCount,
    totalPages: Math.max(1, Math.ceil(totalCount / filters.pageSize)),
  };
}

export async function getAdminSupplierById(
  id: string,
): Promise<AdminSupplierDetail | null> {
  await requireAdmin();
  const supabase = await getSupabaseServerClient();

  const { data, error } = await supabase
    .from("suppliers")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("[supplierService.getAdminSupplierById] failed:", error);
    throw new Error("Unable to load this supplier right now.");
  }
  if (!data) return null;

  const { data: products, error: productsError } = await supabase
    .from("products")
    .select("id, name, sku, stock")
    .eq("primary_supplier_id", id)
    .order("name", { ascending: true });
  if (productsError) throw productsError;

  return {
    id: data.id,
    name: data.name,
    contactPerson: data.contact_person ?? "",
    phone: data.phone ?? "",
    email: data.email ?? "",
    address: data.address ?? "",
    notes: data.notes ?? "",
    status: data.status as AdminSupplierDetail["status"],
    products: (products ?? []).map((product) => ({
      id: product.id,
      name: product.name,
      sku: product.sku,
      stock: product.stock,
    })),
  };
}

export async function createSupplier(
  input: AdminSupplierInput,
): Promise<{ id?: string; error?: string }> {
  await requireAdmin();
  const supabase = await getSupabaseServerClient();

  const { data, error } = await supabase
    .from("suppliers")
    .insert({
      name: input.name,
      contact_person: input.contactPerson || null,
      phone: input.phone || null,
      email: input.email || null,
      address: input.address || null,
      notes: input.notes || null,
      status: input.status,
    })
    .select("id")
    .single();

  if (error) {
    console.error("[supplierService.createSupplier] failed:", error);
    return { error: "Unable to create this supplier right now." };
  }
  return { id: data.id };
}

export async function updateSupplier(
  id: string,
  input: AdminSupplierInput,
): Promise<{ error?: string }> {
  await requireAdmin();
  const supabase = await getSupabaseServerClient();

  const { error } = await supabase
    .from("suppliers")
    .update({
      name: input.name,
      contact_person: input.contactPerson || null,
      phone: input.phone || null,
      email: input.email || null,
      address: input.address || null,
      notes: input.notes || null,
      status: input.status,
    })
    .eq("id", id);

  if (error) {
    console.error("[supplierService.updateSupplier] failed:", error);
    return { error: "Unable to update this supplier right now." };
  }
  return {};
}

export async function deleteSupplier(id: string): Promise<{ error?: string }> {
  await requireAdmin();
  const supabase = await getSupabaseServerClient();

  const { count: productCount, error: productsError } = await supabase
    .from("products")
    .select("id", { count: "exact", head: true })
    .eq("primary_supplier_id", id);
  if (productsError) throw productsError;

  if ((productCount ?? 0) > 0) {
    return {
      error:
        "This supplier is still assigned to products. Reassign those products first.",
    };
  }

  const { count: purchaseCount, error: purchasesError } = await supabase
    .from("purchases")
    .select("id", { count: "exact", head: true })
    .eq("supplier_id", id);
  if (purchasesError) throw purchasesError;

  if ((purchaseCount ?? 0) > 0) {
    return {
      error: "This supplier has purchase history and can't be deleted.",
    };
  }

  const { error } = await supabase.from("suppliers").delete().eq("id", id);
  if (error) {
    console.error("[supplierService.deleteSupplier] failed:", error);
    return { error: "Unable to delete this supplier right now." };
  }
  return {};
}
