import type { PediAgeBreakdown } from "@/lib/pedi/types";

/**
 * Calcula a idade exata em meses completos na data de referência.
 * Considera o dia do mês (se ainda não chegou o aniversário do mês, regride 1 mês).
 */
export function calculateExactAgeInMonths(
  birthDate: string,
  referenceDate: string
): number {
  return calculateExactAgeBreakdown(birthDate, referenceDate).totalMonths;
}

/**
 * Idade em anos, meses e dias (como no relatório TO / Excel do cliente).
 */
export function calculateExactAgeBreakdown(
  birthDate: string,
  referenceDate: string
): PediAgeBreakdown {
  const birth = parseDateOnly(birthDate);
  const reference = parseDateOnly(referenceDate);

  if (!birth || !reference) {
    throw new Error("Datas inválidas para cálculo de idade.");
  }

  if (reference.getTime() < birth.getTime()) {
    throw new Error("A data da avaliação não pode ser anterior ao nascimento.");
  }

  let years = reference.getFullYear() - birth.getFullYear();
  let months = reference.getMonth() - birth.getMonth();
  let days = reference.getDate() - birth.getDate();

  if (days < 0) {
    months -= 1;
    const daysInPreviousMonth = new Date(
      reference.getFullYear(),
      reference.getMonth(),
      0
    ).getDate();
    days += daysInPreviousMonth;
  }

  if (months < 0) {
    years -= 1;
    months += 12;
  }

  const totalMonths = years * 12 + months;

  return {
    years,
    months,
    days,
    totalMonths: Math.max(0, totalMonths),
  };
}

export function formatPediAgeLabel(age: PediAgeBreakdown): string {
  const yearLabel = age.years === 1 ? "1 ano" : `${age.years} anos`;
  const monthLabel = age.months === 1 ? "1 mês" : `${age.months} meses`;
  const dayLabel = age.days === 1 ? "1 dia" : `${age.days} dias`;
  return `${yearLabel}, ${monthLabel} e ${dayLabel}`;
}

function parseDateOnly(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (!match) {
    return null;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(year, month - 1, day);

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }

  return date;
}
