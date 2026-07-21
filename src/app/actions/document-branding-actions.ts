"use server";

import { requireServerUserSession } from "@/lib/auth-server";
import {
  DEFAULT_DOCUMENT_BRANDING,
  mapClinicRowToDocumentBranding,
  type ClinicDocumentBrandingRow,
  type DocumentBranding,
} from "@/lib/document-branding";
import { isFamilyOnlyRole } from "@/lib/rbac";
import { createServerSupabaseClient } from "@/lib/supabase/server";

type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

/**
 * Dados institucionais para cabeçalho de PDFs/documentos.
 * Disponível a qualquer usuário autenticado (exceto perfil família).
 */
export async function getDocumentBrandingAction(): Promise<
  ActionResult<DocumentBranding>
> {
  const session = await requireServerUserSession();

  if (isFamilyOnlyRole(session.profile)) {
    return { success: false, error: "Sem permissão para gerar documentos clínicos." };
  }

  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return { success: true, data: DEFAULT_DOCUMENT_BRANDING };
  }

  const { data, error } = await supabase.rpc("get_clinic_document_branding");

  if (error) {
    console.warn("[document-branding]", error.message);
    return { success: true, data: DEFAULT_DOCUMENT_BRANDING };
  }

  const row = Array.isArray(data) ? data[0] : data;

  if (!row) {
    return { success: true, data: DEFAULT_DOCUMENT_BRANDING };
  }

  return {
    success: true,
    data: mapClinicRowToDocumentBranding(row as ClinicDocumentBrandingRow),
  };
}
