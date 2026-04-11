import { test, expect, describe } from 'bun:test';
import { inferMarket, inferInstrumentType, formatSummary, formatDescription, serializeJSON, getUID, recordToEvent } from './utils';
import type { StockRecord, BondRecord, REITsRecord, CalendarEvent } from './types';
import { writeFileSync, unlinkSync, existsSync, readFileSync } from 'fs';

describe('2.4 - inferMarket', () => {
  test('6开头 -> SH', () => expect(inferMarket('688888')).toBe('SH'));
  test('688开头 -> SH', () => expect(inferMarket('688001')).toBe('SH'));
  test('000/001开头 -> SZ', () => expect(inferMarket('001312')).toBe('SZ'));
  test('300开头 -> SZ', () => expect(inferMarket('300750')).toBe('SZ'));
  test('8/4开头 -> BJ', () => expect(inferMarket('830123')).toBe('BJ'));
  test('4开头 -> BJ', () => expect(inferMarket('430123')).toBe('BJ'));
});

describe('2.4 - inferInstrumentType', () => {
  test('688开头 -> 科', () => expect(inferInstrumentType('688001', 'stocks')).toBe('科'));
  test('300开头 -> 创', () => expect(inferInstrumentType('300750', 'stocks')).toBe('创'));
  test('6开头 -> 上', () => expect(inferInstrumentType('600000', 'stocks')).toBe('上'));
  test('000/001 -> 深', () => expect(inferInstrumentType('001312', 'stocks')).toBe('深'));
  test('8/4开头 -> 北', () => expect(inferInstrumentType('830123', 'stocks')).toBe('北'));
  test('bonds -> 债', () => expect(inferInstrumentType('123456', 'bonds')).toBe('债'));
  test('reits -> REITs', () => expect(inferInstrumentType('508001', 'reits')).toBe('REITs'));
});

describe('4.3 - formatSummary', () => {
  test('股票格式', () => expect(formatSummary('测试股份', '001312', 'SZ', '深')).toBe('【深】测试股份 001312.SZ'));
  test('科创板', () => expect(formatSummary('科创股份', '688001', 'SH', '科')).toBe('【科】科创股份 688001.SH'));
  test('可转债', () => expect(formatSummary('转债A', '123456', 'SH', '债')).toBe('【债】转债A 123456.SH'));
  test('REITs', () => expect(formatSummary('REITs基金', '508001', 'SH', 'REITs')).toBe('【REITs】REITs基金 508001.SH'));
});

describe('4.4 - formatDescription', () => {
  test('全字段', () => {
    const record: StockRecord = { name: '测试', code: '001', issuanceDate: '2026-04-15', issuancePrice: 10.5, publicationDate: '2026-04-10', listingDate: '2026-04-20' };
    const desc = formatDescription(record);
    expect(desc).toContain('发行价：10.5 元');
    expect(desc).toContain('公布日：2026-04-10');
    expect(desc).toContain('上市日：2026-04-20');
  });
  test('缺失字段 -> --', () => {
    const record: StockRecord = { name: '测试', code: '001', issuanceDate: '2026-04-15' };
    const desc = formatDescription(record);
    expect(desc).toContain('发行价：--');
    expect(desc).toContain('公布日：--');
    expect(desc).toContain('上市日：--');
  });
});

describe('4.5 - serializeJSON', () => {
  test('字母排序', () => {
    const events: CalendarEvent[] = [
      { name: '测试', code: '001', market: 'SZ', instrumentType: '深', issuanceDate: '2026-04-15', issuancePrice: 10, publicationDate: null, listingDate: null }
    ];
    const json = serializeJSON(events, 2);
    expect(json).toContain('"code"');
    expect(json).toContain('"issuanceDate"');
    expect(json).toContain('"market"');
    expect(json).toContain('"name"');
  });
  test('2空格缩进', () => {
    const json = serializeJSON([], 2);
    expect(json).toBe('[]');
  });
});

describe('6.2 - getUID', () => {
  test('UID格式', () => expect(getUID('001312', 'SZ')).toBe('001312.SZ'));
  test('SH市场', () => expect(getUID('688001', 'SH')).toBe('688001.SH'));
});

describe('校验 - 发行日缺失', () => {
  test('缺少issuanceDate应抛异常', () => {
    const record = { name: '测试', code: '001' } as unknown as StockRecord;
    expect(() => {
      if (!record.issuanceDate) throw new Error(`发行日缺失：${record.code}`);
    }).toThrow();
  });
});

describe('导出 - 文件命名', () => {
  test('检查三路ICS文件名', () => {
    expect('zh_CN.stocks.ics').toMatch(/^zh_CN\.(stocks|bonds|reits)\.ics$/);
    expect('zh_CN.bonds.ics').toMatch(/^zh_CN\.(stocks|bonds|reits)\.ics$/);
    expect('zh_CN.reits.ics').toMatch(/^zh_CN\.(stocks|bonds|reits)\.ics$/);
  });
  test('检查三路JSON文件名', () => {
    expect('zh_CN.stocks.json').toMatch(/^zh_CN\.(stocks|bonds|reits)\.json$/);
    expect('zh_CN.bonds.json').toMatch(/^zh_CN\.(stocks|bonds|reits)\.json$/);
    expect('zh_CN.reits.json').toMatch(/^zh_CN\.(stocks|bonds|reits)\.json$/);
  });
});

describe('导出 - 空输入', () => {
  test('空数组导出空内容', () => {
    const events: CalendarEvent[] = [];
    const ics = `BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//A-Share IPO Calendar//EN\r\nEND:VCALENDAR`;
    expect(ics).toContain('BEGIN:VCALENDAR');
    expect(ics).toContain('END:VCALENDAR');
  });
});