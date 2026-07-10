import type {
  AgendaEventRow,
  ClinicalEvolutionRecordRow,
  ConventionalEvolutionRecordRow,
  EvaluationRow,
  HomeActivityRow,
  ParentOrientationRow,
  PatientDocumentRow,
  ProgramRow,
  TherapeuticPlanRow,
} from "@/lib/supabase/database.types";

export type PatientTimelineKind =
  | "attendance"
  | "evolution_aba"
  | "evolution_conventional"
  | "evaluation"
  | "therapeutic_plan"
  | "document"
  | "home_activity"
  | "parent_orientation"
  | "program";

export type PatientTimelineItem = {
  id: string;
  kind: PatientTimelineKind;
  date: string;
  title: string;
  description: string;
  professionalName: string | null;
  href: string | null;
};

type TimelineSources = {
  attendances: AgendaEventRow[];
  evolutions: ClinicalEvolutionRecordRow[];
  conventionalEvolutions: ConventionalEvolutionRecordRow[];
  evaluations: EvaluationRow[];
  therapeuticPlans: TherapeuticPlanRow[];
  documents: PatientDocumentRow[];
  homeActivities: HomeActivityRow[];
  parentOrientations: ParentOrientationRow[];
  programs: ProgramRow[];
};

const kindLabels: Record<PatientTimelineKind, string> = {
  attendance: "Atendimento",
  evolution_aba: "Evolução ABA",
  evolution_conventional: "Evolução convencional",
  evaluation: "Avaliação",
  therapeutic_plan: "Plano terapêutico",
  document: "Documento",
  home_activity: "Atividade para casa",
  parent_orientation: "Orientação à família",
  program: "Programa",
};

export function getTimelineKindLabel(kind: PatientTimelineKind) {
  return kindLabels[kind];
}

export function buildPatientTimeline(
  sources: TimelineSources
): PatientTimelineItem[] {
  const items: PatientTimelineItem[] = [
    ...sources.attendances.map((item) => ({
      id: `attendance-${item.id}`,
      kind: "attendance" as const,
      date: `${item.event_date}T${item.start_time}`,
      title: `Atendimento com ${item.professional_name}`,
      description: `${item.start_time.slice(0, 5)}–${item.end_time.slice(0, 5)} · ${item.status}`,
      professionalName: item.professional_name,
      href: null,
    })),
    ...sources.evolutions.map((item) => ({
      id: `evolution-aba-${item.id}`,
      kind: "evolution_aba" as const,
      date: item.session_date,
      title: `Evolução ABA — ${item.professional_name}`,
      description:
        item.status === "finalized" ? "Finalizada" : "Rascunho",
      professionalName: item.professional_name,
      href: null,
    })),
    ...sources.conventionalEvolutions.map((item) => ({
      id: `evolution-conv-${item.id}`,
      kind: "evolution_conventional" as const,
      date: item.session_date,
      title: `Evolução convencional — ${item.professional_name}`,
      description:
        item.status === "finalized" ? "Finalizada" : "Rascunho",
      professionalName: item.professional_name,
      href: "/dashboard/evolucao-convencional",
    })),
    ...sources.evaluations.map((item) => ({
      id: `evaluation-${item.id}`,
      kind: "evaluation" as const,
      date: item.evaluation_date,
      title: item.title,
      description: [
        item.instrument,
        item.status === "finalized" ? "Finalizada" : "Rascunho",
        item.professional_name,
      ]
        .filter(Boolean)
        .join(" · "),
      professionalName: item.professional_name,
      href: "/dashboard/avaliacoes",
    })),
    ...sources.therapeuticPlans.map((item) => ({
      id: `plan-${item.id}`,
      kind: "therapeutic_plan" as const,
      date: item.start_date,
      title: item.title,
      description: `${item.status} · ${item.professional_name}`,
      professionalName: item.professional_name,
      href: null,
    })),
    ...sources.documents.map((item) => ({
      id: `document-${item.id}`,
      kind: "document" as const,
      date: item.created_at,
      title: item.title,
      description: `${item.document_type} · ${item.uploaded_by}`,
      professionalName: item.uploaded_by,
      href: item.file_url,
    })),
    ...sources.homeActivities.map((item) => ({
      id: `home-${item.id}`,
      kind: "home_activity" as const,
      date: item.created_at,
      title: item.title,
      description: item.created_by_name,
      professionalName: item.created_by_name,
      href: null,
    })),
    ...sources.parentOrientations.map((item) => ({
      id: `orientation-${item.id}`,
      kind: "parent_orientation" as const,
      date: item.created_at,
      title: item.title,
      description: item.author_name,
      professionalName: item.author_name,
      href: "/dashboard/orientacoes-familia",
    })),
    ...sources.programs.map((item) => ({
      id: `program-${item.id}`,
      kind: "program" as const,
      date: item.created_at,
      title: item.name,
      description: [item.specialty, item.skill, item.status]
        .filter(Boolean)
        .join(" · "),
      professionalName: null,
      href: `/dashboard/programas/${item.id}`,
    })),
  ];

  return items.sort((left, right) => right.date.localeCompare(left.date));
}
