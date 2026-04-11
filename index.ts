import type { IPORecord, InputData } from './types';
import { formatSummary, formatDescription, serializeJSON, recordToICS, getUID } from './utils';

function validateIssuanceDate(record: IPORecord, code: string): void {
  if (!record.issuanceDate) {
    throw new Error(`发行日缺失：${code}`);
  }
}

function checkDuplicateUID(records: IPORecord[], category: string): void {
  const uids = records.map(r => getUID(r.code, inferMarket(r.code)));
  const seen = new Set<string>();
  for (const uid of uids) {
    if (seen.has(uid)) {
      throw new Error(`UID 重复：${uid}`);
    }
    seen.add(uid);
  }
}

function inferMarket(code: string): "SH" | "SZ" | "BJ" {
  if (code.startsWith('8') || code.startsWith('4')) return 'BJ';
  if (code.startsWith('6') || code.startsWith('688')) return 'SH';
  return 'SZ';
}

function createICS(records: IPORecord[], category: string): string {
  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//A-Share IPO Calendar//EN',
  ];
  
  for (const record of records) {
    const vevent = recordToICS(record, category);
    lines.push(vevent);
  }
  
  lines.push('END:VCALENDAR');
  return lines.join('\r\n');
}

async function exportICS(records: IPORecord[], filename: string): Promise<void> {
  checkDuplicateUID(records, '');
  const ics = createICS(records, '');
  await Bun.file(filename).write(ics);
}

async function exportJSON(records: IPORecord[], filename: string, category: string): Promise<void> {
  const json = serializeJSON(records, category, 2);
  await Bun.file(filename).write(json);
}

function processRecords(
  records: IPORecord[],
  category: 'stocks' | 'bonds' | 'reits'
): IPORecord[] {
  for (const r of records) {
    validateIssuanceDate(r, r.code);
  }
  return records;
}

export async function generateCalendar(
  data: InputData,
  outputDir: string
): Promise<void> {
  const stocks = processRecords(data.stocks, 'stocks');
  const bonds = processRecords(data.bonds, 'bonds');
  const reits = processRecords(data.reits, 'reits');
  
  const fullDir = outputDir || '.';
  
  await exportICS(stocks, `${fullDir}/zh_CN.stocks.ics`);
  await exportICS(bonds, `${fullDir}/zh_CN.bonds.ics`);
  await exportICS(reits, `${fullDir}/zh_CN.reits.ics`);
  
  await exportJSON(stocks, `${fullDir}/zh_CN.stocks.json`, 'stocks');
  await exportJSON(bonds, `${fullDir}/zh_CN.bonds.json`, 'bonds');
  await exportJSON(reits, `${fullDir}/zh_CN.reits.json`, 'reits');
  
  console.log('Export complete: 6 files generated');
}

if (import.meta.main) {
  const sampleStocks: IPORecord[] = [
    { name: '测试股份', code: '001312', issuanceDate: new Date('2026-04-15'), issuancePrice: 10.5, publicationDate: new Date('2026-04-10'), listingDate: new Date('2026-04-20') }
  ];
  const sampleBonds: IPORecord[] = [];
  const sampleREITs: IPORecord[] = [];
  
  generateCalendar(
    { stocks: sampleStocks, bonds: sampleBonds, reits: sampleREITs },
    '.'
  );
}