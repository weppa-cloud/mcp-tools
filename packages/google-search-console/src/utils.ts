export function getDateRanges(timeframe: '7days' | '28days' | '3months') {
  const end = new Date();
  end.setDate(end.getDate() - 1); // Ayer
  
  const current = {
    endDate: end.toISOString().split('T')[0],
    startDate: '',
  };
  
  const previous = {
    endDate: '',
    startDate: '',
  };
  
  switch (timeframe) {
    case '7days':
      current.startDate = new Date(end.getTime() - 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      previous.endDate = new Date(current.startDate).toISOString().split('T')[0];
      previous.startDate = new Date(end.getTime() - 13 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      break;
      
    case '28days':
      current.startDate = new Date(end.getTime() - 27 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      previous.endDate = new Date(current.startDate).toISOString().split('T')[0];
      previous.startDate = new Date(end.getTime() - 55 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      break;
      
    case '3months':
      current.startDate = new Date(end.getTime() - 89 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      previous.endDate = new Date(current.startDate).toISOString().split('T')[0];
      previous.startDate = new Date(end.getTime() - 179 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      break;
  }
  
  return { current, previous };
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function calculateChange(current: number, previous: number, inverse: boolean = false): string {
  if (previous === 0) return current > 0 ? '+100%' : '0%';
  
  let change = ((current - previous) / previous) * 100;
  
  // Para métricas donde menor es mejor (como posición)
  if (inverse) {
    change = -change;
  }
  
  const formatted = change.toFixed(1);
  return change >= 0 ? `+${formatted}%` : `${formatted}%`;
}

export function formatNumber(value: number): string {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  } else if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`;
  }
  return value.toString();
}

export function getTimeAgo(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  
  if (days === 0) return 'hoy';
  if (days === 1) return 'ayer';
  if (days < 7) return `hace ${days} días`;
  if (days < 30) return `hace ${Math.floor(days / 7)} semanas`;
  if (days < 365) return `hace ${Math.floor(days / 30)} meses`;
  return `hace ${Math.floor(days / 365)} años`;
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
}

export function groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
  return array.reduce((groups, item) => {
    const group = String(item[key]);
    if (!groups[group]) groups[group] = [];
    groups[group].push(item);
    return groups;
  }, {} as Record<string, T[]>);
}

export function sortByKey<T>(array: T[], key: keyof T, descending: boolean = false): T[] {
  return [...array].sort((a, b) => {
    const aVal = a[key];
    const bVal = b[key];
    
    if (typeof aVal === 'number' && typeof bVal === 'number') {
      return descending ? bVal - aVal : aVal - bVal;
    }
    
    const aStr = String(aVal);
    const bStr = String(bVal);
    return descending ? bStr.localeCompare(aStr) : aStr.localeCompare(bStr);
  });
}

export function parseQueryString(query: string): Record<string, string> {
  const params = new URLSearchParams(query);
  const result: Record<string, string> = {};
  
  params.forEach((value, key) => {
    result[key] = value;
  });
  
  return result;
}

export function buildQueryString(params: Record<string, string | number | boolean>): string {
  const searchParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.append(key, String(value));
    }
  });
  
  return searchParams.toString();
}

export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

export function extractDomain(url: string): string {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.replace('www.', '');
  } catch {
    return url;
  }
}

export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function retry<T>(
  fn: () => Promise<T>,
  retries: number = 3,
  delay: number = 1000
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    if (retries === 0) throw error;
    await sleep(delay);
    return retry(fn, retries - 1, delay * 2);
  }
}

export function chunk<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export function memoize<T extends (...args: any[]) => any>(
  func: T
): T {
  const cache = new Map();
  
  return ((...args: Parameters<T>) => {
    const key = JSON.stringify(args);
    if (cache.has(key)) {
      return cache.get(key);
    }
    
    const result = func(...args);
    cache.set(key, result);
    return result;
  }) as T;
}