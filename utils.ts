import type { Market, InstrumentType, StockRecord, BondRecord, REITsRecord, CalendarEvent } from './types';

export function inferMarket(code: string): Market {
  if (code.startsWith('8') || code.startsWith('4')) return 'BJ';
  if (code.startsWith('6') || code.startsWith('688')) return 'SH';
  return 'SZ';
}

export function inferInstrumentType(code: string, category: string): InstrumentType {
  if (category === 'bonds') return '债';
  if (category === 'reits') return 'REITs';
  if (code.startsWith('688')) return '科';
  if (code.startsWith('300')) return '创';
  if (code.startsWith('8') || code.startsWith('4')) return '北';
  if (code.startsWith('6')) return '上';
  if (code.startsWith('000') || code.startsWith('001')) return '深';
  return '深';
}

export function formatSummary(name: string, code: string, market: Market, instrumentType: InstrumentType): string {
  return `【${instrumentType}】${name} ${code}.${market}`;
}

export function formatDescription(record: StockRecord | BondRecord | REITsRecord): string {
  const price = record.issuancePrice !== undefined ? `${record.issuancePrice} 元` : '--';
  const pubDate = record.publicationDate || '--';
  const listDate = record.listingDate || '--';
  return `发行价：${price}\n公布日：${pubDate}\n上市日：${listDate}`;
}

export function serializeJSON(events: CalendarEvent[], indent: number = 2): string {
  const sorted = events.map(e => {
    const obj: Record<string, unknown> = {};
    const keys = Object.keys(e).sort();
    for (const k of keys) {
      obj[k] = e[k as keyof CalendarEvent];
    }
    return obj;
  });
  return JSON.stringify(sorted, null, indent);
}

export function recordToEvent(record: StockRecord | BondRecord | REITsRecord, category: string): CalendarEvent {
  return {
    name: record.name,
    code: record.code,
    market: inferMarket(record.code),
    instrumentType: inferInstrumentType(record.code, category),
    issuanceDate: record.issuanceDate,
    issuancePrice: record.issuancePrice ?? null,
    publicationDate: record.publicationDate ?? null,
    listingDate: record.listingDate ?? null,
  };
}

export function getUID(code: string, market: Market): string {
  return `${code}.${market}`;
}