export function formatARS(amount: number): string {
  if (isNaN(amount) || amount === null || amount === undefined) return '$ 0';
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount).replace('ARS', '$');
}

export function formatUSD(amount: number): string {
  if (isNaN(amount) || amount === null || amount === undefined) return 'USD 0.00';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(dateString: string | Date): string {
  if (!dateString) return '';
  const d = new Date(dateString);
  const months = [
    'ene', 'feb', 'mar', 'abr', 'may', 'jun',
    'jul', 'ago', 'sep', 'oct', 'nov', 'dic'
  ];
  const day = d.getDate().toString().padStart(2, '0');
  const month = months[d.getMonth()];
  const year = d.getFullYear();
  return `${day} de ${month} de ${year}`;
}
