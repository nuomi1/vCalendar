import dayjs from 'dayjs';
import type { Market, InstrumentType, IPORecord } from './types';

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

export function formatDate(date: Date): string {
  return dayjs(date).format('YYYY-MM-DD');
}

export function formatSummary(name: string, code: string, market: Market, instrumentType: InstrumentType): string {
  return `【${instrumentType}】${name} ${code}.${market}`;
}

export function formatDescription(record: IPORecord): string {
  const price = record.issuancePrice !== undefined ? `${record.issuancePrice} 元` : '--';
  const pubDate = record.publicationDate ? formatDate(record.publicationDate) : '--';
  const listDate = record.listingDate ? formatDate(record.listingDate) : '--';
  return `发行价：${price}\n公布日：${pubDate}\n上市日：${listDate}`;
}

export function serializeJSON(records: IPORecord[], category: string, indent: number = 2): string {
  const sorted = records.map(r => {
    const obj: Record<string, unknown> = {
      name: r.name,
      code: r.code,
      market: inferMarket(r.code),
      instrumentType: inferInstrumentType(r.code, category),
      issuanceDate: formatDate(r.issuanceDate),
      issuancePrice: r.issuancePrice ?? null,
      publicationDate: r.publicationDate ? formatDate(r.publicationDate) : null,
      listingDate: r.listingDate ? formatDate(r.listingDate) : null,
    };
    const keys = Object.keys(obj).sort();
    const sortedObj: Record<string, unknown> = {};
    for (const k of keys) {
      sortedObj[k] = obj[k];
    }
    return sortedObj;
  });
  return JSON.stringify(sorted, null, indent);
}

export function recordToICS(record: IPORecord, category: string): string {
  const dateStr = formatDate(record.issuanceDate);
  const [year, month, day] = dateStr.split('-').map(Number);
  const dtStart = `${year}${String(month).padStart(2, '0')}${String(day).padStart(2, '0')}T093000`;
  const dtEnd = `${year}${String(month).padStart(2, '0')}${String(day).padStart(2, '0')}T100000`;
  const market = inferMarket(record.code);
  const uid = `${record.code}.${market}`;
  const instrumentType = inferInstrumentType(record.code, category);
  const summary = formatSummary(record.name, record.code, market, instrumentType);
  const description = formatDescription(record).split('\n').join('\\n');
  
  return [
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTART:${dtStart}`,
    `DTEND:${dtEnd}`,
    `SUMMARY:${summary}`,
    `DESCRIPTION:${description}`,
    'END:VEVENT'
  ].join('\r\n');
}

export function getUID(code: string, market: Market): string {
  return `${code}.${market}`;
}