import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export function formatDateLabel(d: string): string {
  if (!d) return '';
  try {
    return format(new Date(d + 'T12:00:00'), 'dd MMM', { locale: fr });
  } catch {
    return d;
  }
}
