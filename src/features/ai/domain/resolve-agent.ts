import type { AiAgentId } from "@/features/ai/domain/types";

const ROUTE_AGENT_MAP: Array<{ prefix: string; agentId: AiAgentId }> = [
  { prefix: "/dashboard/pacientes", agentId: "patients" },
  { prefix: "/prontuario", agentId: "patients" },
  { prefix: "/paciente", agentId: "patients" },
  { prefix: "/dashboard/evolucao", agentId: "clinical-evolution" },
  { prefix: "/evolucao", agentId: "clinical-evolution" },
  { prefix: "/agenda", agentId: "agenda" },
  { prefix: "/dashboard/busca-agenda", agentId: "agenda" },
  { prefix: "/painel-chamada", agentId: "agenda" },
  { prefix: "/dashboard/avaliacoes", agentId: "assessments" },
  { prefix: "/dashboard/modelos", agentId: "document-templates" },
  { prefix: "/dashboard/relatorios", agentId: "reports" },
  { prefix: "/dashboard/profissionais", agentId: "team" },
  { prefix: "/dashboard", agentId: "global" },
];

export function resolveAgentFromPathname(pathname: string): AiAgentId | null {
  const normalized =
    pathname.length > 1 && pathname.endsWith("/")
      ? pathname.slice(0, -1)
      : pathname;

  const match = ROUTE_AGENT_MAP.find(
    (entry) =>
      normalized === entry.prefix || normalized.startsWith(`${entry.prefix}/`)
  );

  return match?.agentId ?? null;
}

export function isGlobalAgentRoute(pathname: string) {
  return resolveAgentFromPathname(pathname) === "global";
}
