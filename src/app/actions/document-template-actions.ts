"use server";

import { requirePermission } from "@/lib/auth-guard";
import type { DocumentTemplateCategory } from "@/lib/document-template-format";
import { PERMISSIONS } from "@/lib/rbac";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { DocumentTemplateRow } from "@/lib/supabase/database.types";

type ActionResult<T> = {
  success: boolean;
  error?: string;
  data?: T;
};

export type SaveDocumentTemplateInput = {
  id?: string;
  name: string;
  category: DocumentTemplateCategory | string;
  bodyHtml: string;
  status?: DocumentTemplateRow["status"];
};

export async function listDocumentTemplatesAction(options?: {
  activeOnly?: boolean;
}): Promise<ActionResult<{ templates: DocumentTemplateRow[] }>> {
  await requirePermission(PERMISSIONS.DOCUMENT_TEMPLATES_VIEW);

  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return { success: false, error: "Supabase não configurado." };
  }

  let query = supabase
    .from("document_templates")
    .select("*")
    .order("category")
    .order("name");

  if (options?.activeOnly) {
    query = query.eq("status", "active");
  }

  const { data, error } = await query;

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, data: { templates: data ?? [] } };
}

export async function getDocumentTemplateAction(
  templateId: string
): Promise<ActionResult<{ template: DocumentTemplateRow }>> {
  await requirePermission(PERMISSIONS.DOCUMENT_TEMPLATES_VIEW);

  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return { success: false, error: "Supabase não configurado." };
  }

  const { data, error } = await supabase
    .from("document_templates")
    .select("*")
    .eq("id", templateId)
    .maybeSingle();

  if (error) {
    return { success: false, error: error.message };
  }

  if (!data) {
    return { success: false, error: "Modelo não encontrado." };
  }

  return { success: true, data: { template: data } };
}

export async function saveDocumentTemplateAction(
  input: SaveDocumentTemplateInput
): Promise<ActionResult<{ template: DocumentTemplateRow }>> {
  await requirePermission(PERMISSIONS.DOCUMENT_TEMPLATES_MANAGE);

  const name = input.name.trim();
  const category = input.category.trim();
  const bodyHtml = input.bodyHtml.trim();

  if (!name) {
    return { success: false, error: "Informe o nome do modelo." };
  }

  if (!category) {
    return { success: false, error: "Selecione uma categoria." };
  }

  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return { success: false, error: "Supabase não configurado." };
  }

  const payload = {
    name,
    category,
    body_html: bodyHtml,
    status: input.status ?? "active",
    updated_at: new Date().toISOString(),
  };

  if (input.id) {
    const { data, error } = await supabase
      .from("document_templates")
      .update(payload)
      .eq("id", input.id)
      .select("*")
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: { template: data } };
  }

  const { data, error } = await supabase
    .from("document_templates")
    .insert(payload)
    .select("*")
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, data: { template: data } };
}

export async function toggleDocumentTemplateStatusAction(
  templateId: string
): Promise<ActionResult<{ template: DocumentTemplateRow }>> {
  await requirePermission(PERMISSIONS.DOCUMENT_TEMPLATES_MANAGE);

  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return { success: false, error: "Supabase não configurado." };
  }

  const { data: current, error: fetchError } = await supabase
    .from("document_templates")
    .select("status")
    .eq("id", templateId)
    .maybeSingle();

  if (fetchError) {
    return { success: false, error: fetchError.message };
  }

  if (!current) {
    return { success: false, error: "Modelo não encontrado." };
  }

  const nextStatus = current.status === "active" ? "inactive" : "active";

  const { data, error } = await supabase
    .from("document_templates")
    .update({
      status: nextStatus,
      updated_at: new Date().toISOString(),
    })
    .eq("id", templateId)
    .select("*")
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, data: { template: data } };
}

export async function deleteDocumentTemplateAction(
  templateId: string
): Promise<ActionResult<undefined>> {
  await requirePermission(PERMISSIONS.DOCUMENT_TEMPLATES_MANAGE);

  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return { success: false, error: "Supabase não configurado." };
  }

  const { error } = await supabase
    .from("document_templates")
    .delete()
    .eq("id", templateId);

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}
