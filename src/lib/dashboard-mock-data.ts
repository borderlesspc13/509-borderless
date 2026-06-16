export type AppointmentStatus =
  | "confirmado"
  | "agendado"
  | "em_espera"
  | "cancelado";

export type PaymentStatus = "pendente" | "pago" | "cancelado";

export type DailyAppointment = {
  id: string;
  date: string;
  time: string;
  endTime: string;
  patient: string;
  professional: string;
  status: AppointmentStatus;
  sessionAmount?: number | null;
  paymentStatus?: PaymentStatus;
  paymentLinkUrl?: string | null;
  professionalUserId?: string | null;
  patientId?: string | null;
};

export const monthlyAppointments: DailyAppointment[] = [
  {
    id: "1",
    date: "2026-06-05",
    time: "08:00",
    endTime: "09:00",
    patient: "Lucas Mendes",
    professional: "Carlos Lima",
    status: "confirmado",
  },
  {
    id: "2",
    date: "2026-06-05",
    time: "09:30",
    endTime: "10:30",
    patient: "Sofia Ribeiro",
    professional: "Ana Silva",
    status: "em_espera",
  },
  {
    id: "3",
    date: "2026-06-05",
    time: "10:45",
    endTime: "11:45",
    patient: "Miguel Torres",
    professional: "Juliana Costa",
    status: "agendado",
  },
  {
    id: "4",
    date: "2026-06-05",
    time: "13:00",
    endTime: "14:00",
    patient: "Helena Duarte",
    professional: "Carlos Lima",
    status: "confirmado",
  },
  {
    id: "5",
    date: "2026-06-05",
    time: "14:30",
    endTime: "15:30",
    patient: "Pedro Almeida",
    professional: "Ana Silva",
    status: "agendado",
  },
  {
    id: "6",
    date: "2026-06-05",
    time: "16:00",
    endTime: "17:00",
    patient: "Isabela Nunes",
    professional: "Juliana Costa",
    status: "em_espera",
  },
  {
    id: "7",
    date: "2026-06-03",
    time: "10:00",
    endTime: "11:00",
    patient: "Rafael Costa",
    professional: "Ana Silva",
    status: "confirmado",
  },
  {
    id: "8",
    date: "2026-06-03",
    time: "14:00",
    endTime: "15:00",
    patient: "Beatriz Lima",
    professional: "Carlos Lima",
    status: "agendado",
  },
  {
    id: "9",
    date: "2026-06-09",
    time: "08:30",
    endTime: "09:30",
    patient: "Gabriel Souza",
    professional: "Juliana Costa",
    status: "confirmado",
  },
  {
    id: "10",
    date: "2026-06-09",
    time: "11:00",
    endTime: "12:00",
    patient: "Laura Martins",
    professional: "Ana Silva",
    status: "em_espera",
  },
  {
    id: "11",
    date: "2026-06-09",
    time: "15:00",
    endTime: "16:00",
    patient: "Thiago Pires",
    professional: "Carlos Lima",
    status: "agendado",
  },
  {
    id: "12",
    date: "2026-06-12",
    time: "09:00",
    endTime: "10:00",
    patient: "Camila Rocha",
    professional: "Ana Silva",
    status: "confirmado",
  },
  {
    id: "13",
    date: "2026-06-16",
    time: "13:30",
    endTime: "14:30",
    patient: "Enzo Barbosa",
    professional: "Juliana Costa",
    status: "agendado",
  },
  {
    id: "14",
    date: "2026-06-16",
    time: "16:00",
    endTime: "17:00",
    patient: "Valentina Dias",
    professional: "Carlos Lima",
    status: "em_espera",
  },
  {
    id: "15",
    date: "2026-06-20",
    time: "08:00",
    endTime: "09:00",
    patient: "Arthur Gomes",
    professional: "Ana Silva",
    status: "confirmado",
  },
  {
    id: "16",
    date: "2026-06-24",
    time: "10:30",
    endTime: "11:30",
    patient: "Manuela Freitas",
    professional: "Carlos Lima",
    status: "agendado",
  },
  {
    id: "17",
    date: "2026-06-24",
    time: "14:00",
    endTime: "15:00",
    patient: "Davi Cardoso",
    professional: "Juliana Costa",
    status: "confirmado",
  },
  {
    id: "18",
    date: "2026-06-28",
    time: "09:30",
    endTime: "10:30",
    patient: "Alice Moura",
    professional: "Ana Silva",
    status: "em_espera",
  },
  {
    id: "19",
    date: "2026-06-08",
    time: "08:00",
    endTime: "09:00",
    patient: "Fernanda Oliveira",
    professional: "Ana Silva",
    status: "agendado",
  },
  {
    id: "20",
    date: "2026-06-08",
    time: "10:00",
    endTime: "11:00",
    patient: "Fernanda Oliveira",
    professional: "Carlos Lima",
    status: "agendado",
  },
  {
    id: "21",
    date: "2026-06-08",
    time: "14:30",
    endTime: "15:30",
    patient: "Fernanda Oliveira",
    professional: "Juliana Costa",
    status: "confirmado",
  },
  {
    id: "22",
    date: "2026-06-08",
    time: "09:30",
    endTime: "10:30",
    patient: "Ricardo Santos",
    professional: "Ana Silva",
    status: "em_espera",
  },
  {
    id: "23",
    date: "2026-06-08",
    time: "11:30",
    endTime: "12:30",
    patient: "Patrícia Gomes",
    professional: "Carlos Lima",
    status: "agendado",
  },
];

export function getAppointmentsByDate(date: string) {
  return monthlyAppointments
    .filter((appointment) => appointment.date === date)
    .sort((a, b) => a.time.localeCompare(b.time));
}

export function hasAppointmentsOnDate(date: string) {
  return monthlyAppointments.some((appointment) => appointment.date === date);
}
