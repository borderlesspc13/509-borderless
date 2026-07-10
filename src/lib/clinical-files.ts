export const CLINICAL_FILES_BUCKET = "clinic-assets";

export const AVATAR_MAX_BYTES = 5 * 1024 * 1024;
export const PATIENT_DOCUMENT_MAX_BYTES = 10 * 1024 * 1024;

export const AVATAR_ALLOWED_MIME_TYPES = [
  "image/png",
  "image/jpeg",
  "image/webp",
] as const;

export const PATIENT_DOCUMENT_ALLOWED_MIME_TYPES = [
  "image/png",
  "image/jpeg",
  "image/webp",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "text/plain",
] as const;

export type AvatarEntityType = "patient" | "professional";

export function getAvatarFileExtension(mimeType: string) {
  switch (mimeType) {
    case "image/png":
      return "png";
    case "image/jpeg":
      return "jpg";
    case "image/webp":
      return "webp";
    default:
      return null;
  }
}

export function sanitizeStorageFileName(fileName: string) {
  return fileName.replaceAll(/[^a-zA-Z0-9._-]/g, "_");
}

export function buildAvatarStoragePath(
  entityType: AvatarEntityType,
  entityId: string,
  extension: string
) {
  return `avatars/${entityType}/${entityId}.${extension}`;
}

export function buildPatientDocumentStoragePath(
  patientId: string,
  fileName: string
) {
  return `patient-documents/${patientId}/${Date.now()}-${sanitizeStorageFileName(fileName)}`;
}

export const PATIENT_DOCUMENT_TYPE_OPTIONS = [
  { value: "laudo", label: "Laudo" },
  { value: "parecer", label: "Parecer" },
  { value: "relatorio", label: "Relatório" },
  { value: "termo", label: "Termo / Consentimento" },
  { value: "avaliacao", label: "Avaliação" },
  { value: "plano", label: "Plano terapêutico" },
  { value: "anexo", label: "Anexo geral" },
] as const;

export function getPatientDocumentTypeLabel(value: string) {
  const match = PATIENT_DOCUMENT_TYPE_OPTIONS.find(
    (option) => option.value === value
  );
  return match?.label ?? value;
}
