import { writeFileSync } from 'fs';
import type { StockRecord, BondRecord, REITsRecord, InputData, CalendarEvent, ExportConfig } from './types';
import { formatSummary, formatDescription, serializeJSON, recordToEvent, getUID } from './utils';

function validateIssuanceDate(record: StockRecord | BondRecord | REITsRecord, code: string): void {
  if (!record.issuanceDate) {
    throw new Error(`发行日缺失：${code}`);
  }
}

function checkDuplicateUID(events: CalendarEvent[]): void {
  const uids = events.map(e => getUID(e.code, e.market));
  const seen = new Set<string>();
  for (const uid of uids) {
    if (seen.has(uid)) {
      throw new Error(`UID 重复：${uid}`);
    }
    seen.add(uid);
  }
}

function createICS(events: CalendarEvent[]): string {
  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//A-Share IPO Calendar//EN',
  ];
  
  for (const event of events) {
    const [year, month, day] = event.issuanceDate.split('-').map(Number);
    const dtStart = `${year}${String(month).padStart(2, '0')}${String(day).padStart(2, '0')}T093000`;
    const dtEnd = `${year}${String(month).padStart(2, '0')}${String(day).padStart(2, '0')}T100000`;
    const uid = getUID(event.code, event.market);
    const summary = formatSummary(event.name, event.code, event.market, event.instrumentType);
    const descObj = formatDescription(event as unknown as StockRecord);
    const description = descObj.split('\n').join('\\n');
    
    lines.push(
      'BEGIN:VEVENT',
      `UID:${uid}`,
      `DTSTART:${dtStart}`,
      `DTEND:${dtEnd}`,
      `SUMMARY:${summary}`,
      `DESCRIPTION:${description}`,
      'END:VEVENT'
    );
  }
  
  lines.push('END:VCALENDAR');
  return lines.join('\r\n');
}

function exportICS(events: CalendarEvent[], filename: string): void {
  checkDuplicateUID(events);
  const ics = createICS(events);
  writeFileSync(filename, ics);
}

function exportJSON(events: CalendarEvent[], filename: string): void {
  const json = serializeJSON(events, 2);
  writeFileSync(filename, json);
}

function processRecords<T extends StockRecord | BondRecord | REITsRecord>(
  records: T[],
  category: 'stocks' | 'bonds' | 'reits'
): CalendarEvent[] {
  for (const r of records) {
    validateIssuanceDate(r, r.code);
  }
  return records.map(r => recordToEvent(r, category));
}

export async function generateCalendar(
  data: InputData,
  config: ExportConfig,
  outputDir: string
): Promise<void> {
  const stocks = processRecords(data.stocks, 'stocks');
  const bonds = processRecords(data.bonds, 'bonds');
  const reits = processRecords(data.reits, 'reits');
  
  const fullDir = outputDir || config.outputDir || '.';
  
  exportICS(stocks, `${fullDir}/zh_CN.stocks.ics`);
  exportICS(bonds, `${fullDir}/zh_CN.bonds.ics`);
  exportICS(reits, `${fullDir}/zh_CN.reits.ics`);
  
  exportJSON(stocks, `${fullDir}/zh_CN.stocks.json`);
  exportJSON(bonds, `${fullDir}/zh_CN.bonds.json`);
  exportJSON(reits, `${fullDir}/zh_CN.reits.json`);
  
  console.log('Export complete: 6 files generated');
}

if (import.meta.main) {
  const sampleStocks: StockRecord[] = [
    { name: '测试股份', code: '001312', issuanceDate: '2026-04-15', issuancePrice: 10.5, publicationDate: '2026-04-10', listingDate: '2026-04-20' }
  ];
  const sampleBonds: BondRecord[] = [];
  const sampleREITs: REITsRecord[] = [];
  
  generateCalendar(
    { stocks: sampleStocks, bonds: sampleBonds, reits: sampleREITs },
    { outputDir: '.', jsonIndent: 2 },
    '.'
  );
}