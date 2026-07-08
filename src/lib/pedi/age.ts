/**
 * Calcula a idade exata em meses completos na data de referência.
 * Considera o dia do mês (se ainda não chegou o aniversário do mês, regride 1 mês).
 */
export function calculateExactAgeInMonths(
  birthDate: string,
  referenceDate: string
): number {
  const birth = parseDateOnly(birthDate);
  const reference = parseDateOnly(referenceDate);

  if (!birth || !reference) {
    throw new Error("Datas inválidas para cálculo de idade.");
  }

  if (reference.getTime() < birth.getTime()) {
    throw new Error("A data da avaliação não pode ser anterior ao nascimento.");
  }

  let months =
    (reference.getFullYear() - birth.getFullYear()) * 12 +
    (reference.getMonth() - birth.getMonth());

  if (reference.getDate() < birth.getDate()) {
    months -= 1;
  }

  return Math.max(0, months);
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
