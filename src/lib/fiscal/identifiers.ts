// Validação de identificadores fiscais franceses (SIREN, SIRET, N° TVA intracomunitário).

export function digitsOnly(value: string | null | undefined): string {
  return (value ?? '').replace(/\s/g, '');
}

/** Algoritmo de Luhn sobre uma string só de dígitos. */
export function luhnValid(digits: string): boolean {
  if (!/^\d+$/.test(digits)) return false;
  let sum = 0;
  let double = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let d = Number(digits[i]);
    if (double) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
    double = !double;
  }
  return sum % 10 === 0;
}

export function isValidSiren(value: string | null | undefined): boolean {
  const v = digitsOnly(value);
  return /^\d{9}$/.test(v) && luhnValid(v);
}

/**
 * SIRET = SIREN (9) + NIC (5). Luhn aplica-se ao SIRET completo, com a exceção
 * conhecida dos estabelecimentos da La Poste (SIREN 356000000), cuja soma dos
 * dígitos deve ser múltiplo de 5.
 */
export function isValidSiret(value: string | null | undefined): boolean {
  const v = digitsOnly(value);
  if (!/^\d{14}$/.test(v)) return false;
  if (v.startsWith('356000000')) {
    return v.split('').reduce((s, d) => s + Number(d), 0) % 5 === 0;
  }
  return luhnValid(v);
}

export function sirenFromSiret(siret: string | null | undefined): string | null {
  const v = digitsOnly(siret);
  return /^\d{14}$/.test(v) ? v.slice(0, 9) : null;
}

/** Chave do N° TVA francês: (12 + 3 × (SIREN mod 97)) mod 97. */
export function frenchVatKey(siren: string): number {
  return (12 + 3 * (Number(siren) % 97)) % 97;
}

export function normalizeVatNumber(value: string | null | undefined): string {
  return (value ?? '').replace(/[\s.]/g, '').toUpperCase();
}

/**
 * Valida um N° TVA francês (FR + 2 dígitos de chave + SIREN).
 * Se `expectedSiren` for dado, o SIREN do N° TVA tem de coincidir.
 * Chaves alfabéticas (casos raros) são aceites apenas no formato, sem cálculo.
 */
export function isValidFrenchVat(value: string | null | undefined, expectedSiren?: string | null): boolean {
  const v = normalizeVatNumber(value);
  const m = /^FR([0-9A-Z]{2})(\d{9})$/.exec(v);
  if (!m) return false;
  const [, key, siren] = m;
  if (expectedSiren && siren !== digitsOnly(expectedSiren)) return false;
  if (!isValidSiren(siren)) return false;
  if (/^\d{2}$/.test(key)) return Number(key) === frenchVatKey(siren);
  return true;
}
