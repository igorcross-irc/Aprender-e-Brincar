// Idade que avança sozinha: o responsável informa só mês e ano de nascimento (opcional,
// guardado apenas no aparelho) e a faixa das brincadeiras acompanha o crescimento.
export const BIRTH_RE = /^(\d{4})-(0[1-9]|1[0-2])$/;

export function parseBirth(value, now = new Date()) {
  const match = BIRTH_RE.exec(String(value || ''));
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const months = ageInMonths({ year, month }, now);
  if (months < 0 || months > 12 * 12) return null; // no futuro ou com mais de 12 anos: não faz sentido
  return { year, month };
}

export function ageInMonths(birth, now = new Date()) {
  return (now.getFullYear() - birth.year) * 12 + (now.getMonth() + 1 - birth.month);
}

// Faixas do app: 6–12 m, 12–18 m, 18–24 m, 2–3, 3–4 e 4–5 anos (acima disso fica na última).
export function ageBandFromMonths(months) {
  if (months < 12) return '6-12m';
  if (months < 18) return '12-18m';
  if (months < 24) return '18-24m';
  if (months < 36) return '2-3y';
  if (months < 48) return '3-4y';
  return '4-5y';
}

export function ageBandFromBirth(value, now = new Date()) {
  const birth = parseBirth(value, now);
  return birth ? ageBandFromMonths(ageInMonths(birth, now)) : '';
}

// "2 anos e 3 meses" para mostrar ao responsável.
export function describeAge(value, now = new Date()) {
  const birth = parseBirth(value, now);
  if (!birth) return '';
  const months = ageInMonths(birth, now);
  const years = Math.floor(months / 12);
  const rest = months % 12;
  const y = years ? `${years} ${years === 1 ? 'ano' : 'anos'}` : '';
  const m = rest ? `${rest} ${rest === 1 ? 'mês' : 'meses'}` : '';
  return [y, m].filter(Boolean).join(' e ') || 'recém-nascido';
}
