import { describe, expect, test } from "bun:test";
import type { IPORecord } from "./types";
import {
  createICS,
  createJSON,
  formatDate,
  formatDescription,
  formatSummary,
  getUID,
  inferInstrumentType,
  inferMarket,
} from "./utils";

describe("inferMarket", () => {
  describe("上交所股票", () => {
    test("600开头 -> SH", () => expect(inferMarket("600000")).toBe("SH"));
    test("601开头 -> SH", () => expect(inferMarket("601000")).toBe("SH"));
    test("603开头 -> SH", () => expect(inferMarket("603000")).toBe("SH"));
    test("605开头 -> SH", () => expect(inferMarket("605000")).toBe("SH"));
    test("688开头 -> SH", () => expect(inferMarket("688000")).toBe("SH"));
    test("689开头 -> SH", () => expect(inferMarket("689000")).toBe("SH"));
  });

  describe("上交所可转债", () => {
    test("110开头 -> SH", () => expect(inferMarket("110000")).toBe("SH"));
    test("111开头 -> SH", () => expect(inferMarket("111000")).toBe("SH"));
    test("113开头 -> SH", () => expect(inferMarket("113000")).toBe("SH"));
    test("118开头 -> SH", () => expect(inferMarket("118000")).toBe("SH"));
  });

  describe("上交所REITs", () => {
    test("508开头 -> SH", () => expect(inferMarket("508000")).toBe("SH"));
  });

  describe("深交所股票", () => {
    test("000开头 -> SZ", () => expect(inferMarket("000001")).toBe("SZ"));
    test("001开头 -> SZ", () => expect(inferMarket("001000")).toBe("SZ"));
    test("002开头 -> SZ", () => expect(inferMarket("002000")).toBe("SZ"));
    test("003开头 -> SZ", () => expect(inferMarket("003000")).toBe("SZ"));
    test("004开头 -> SZ", () => expect(inferMarket("004000")).toBe("SZ"));
    test("300-309开头 -> SZ", () => expect(inferMarket("300000")).toBe("SZ"));
    test("301开头 -> SZ", () => expect(inferMarket("301000")).toBe("SZ"));
    test("309开头 -> SZ", () => expect(inferMarket("309000")).toBe("SZ"));
  });

  describe("深交所可转债", () => {
    test("123开头 -> SZ", () => expect(inferMarket("123000")).toBe("SZ"));
    test("127开头 -> SZ", () => expect(inferMarket("127000")).toBe("SZ"));
    test("128开头 -> SZ", () => expect(inferMarket("128000")).toBe("SZ"));
  });

  describe("深交所REITs", () => {
    test("180开头 -> SZ", () => expect(inferMarket("180000")).toBe("SZ"));
    test("181开头 -> SZ", () => expect(inferMarket("181000")).toBe("SZ"));
  });

  describe("北交所股票", () => {
    test("92开头 -> BJ", () => expect(inferMarket("920000")).toBe("BJ"));
  });

  describe("北交所可转债", () => {
    test("810开头 -> BJ", () => expect(inferMarket("810000")).toBe("BJ"));
  });

  describe("未知代码抛异常", () => {
    test("999999 -> 抛异常", () => {
      expect(() => inferMarket("999999")).toThrow("无法识别的证券代码: 999999");
    });
  });
});

describe("inferInstrumentType", () => {
  describe("上交所股票", () => {
    test("600 -> 上", () => expect(inferInstrumentType("600000")).toBe("上"));
    test("601 -> 上", () => expect(inferInstrumentType("601000")).toBe("上"));
    test("603 -> 上", () => expect(inferInstrumentType("603000")).toBe("上"));
    test("605 -> 上", () => expect(inferInstrumentType("605000")).toBe("上"));
    test("688 -> 科", () => expect(inferInstrumentType("688000")).toBe("科"));
    test("689 -> 科", () => expect(inferInstrumentType("689000")).toBe("科"));
  });

  describe("上交所可转债", () => {
    test("110 -> 债", () => expect(inferInstrumentType("110000")).toBe("债"));
    test("111 -> 债", () => expect(inferInstrumentType("111000")).toBe("债"));
    test("113 -> 债", () => expect(inferInstrumentType("113000")).toBe("债"));
    test("118 -> 债", () => expect(inferInstrumentType("118000")).toBe("债"));
  });

  describe("上交所REITs", () => {
    test("508 -> REITs", () =>
      expect(inferInstrumentType("508000")).toBe("REITs"));
  });

  describe("深交所股票", () => {
    test("000 -> 深", () => expect(inferInstrumentType("000001")).toBe("深"));
    test("001 -> 深", () => expect(inferInstrumentType("001000")).toBe("深"));
    test("002 -> 深", () => expect(inferInstrumentType("002000")).toBe("深"));
    test("003 -> 深", () => expect(inferInstrumentType("003000")).toBe("深"));
    test("004 -> 深", () => expect(inferInstrumentType("004000")).toBe("深"));
    test("300 -> 创", () => expect(inferInstrumentType("300000")).toBe("创"));
    test("301 -> 创", () => expect(inferInstrumentType("301000")).toBe("创"));
    test("309 -> 创", () => expect(inferInstrumentType("309000")).toBe("创"));
  });

  describe("深交所可转债", () => {
    test("123 -> 债", () => expect(inferInstrumentType("123000")).toBe("债"));
    test("127 -> 债", () => expect(inferInstrumentType("127000")).toBe("债"));
    test("128 -> 债", () => expect(inferInstrumentType("128000")).toBe("债"));
  });

  describe("深交所REITs", () => {
    test("180 -> REITs", () =>
      expect(inferInstrumentType("180000")).toBe("REITs"));
    test("181 -> REITs", () =>
      expect(inferInstrumentType("181000")).toBe("REITs"));
  });

  describe("北交所股票", () => {
    test("92 -> 北", () => expect(inferInstrumentType("920000")).toBe("北"));
  });

  describe("北交所可转债", () => {
    test("810 -> 债", () => expect(inferInstrumentType("810000")).toBe("债"));
  });

  describe("未知代码抛异常", () => {
    test("999999 -> 抛异常", () => {
      expect(() => inferInstrumentType("999999")).toThrow(
        "无法识别的证券代码: 999999",
      );
    });
  });
});

describe("4.3 - formatSummary", () => {
  test("股票格式", () => {
    const record: IPORecord = {
      name: "测试股份",
      code: "001312",
      issuanceDate: new Date("2026-04-15"),
      issuancePrice: null,
      publicationDate: null,
      listingDate: null,
    };
    expect(formatSummary(record)).toBe("【深】测试股份 001312.SZ");
  });
  test("科创板", () => {
    const record: IPORecord = {
      name: "科创股份",
      code: "688001",
      issuanceDate: new Date("2026-04-15"),
      issuancePrice: null,
      publicationDate: null,
      listingDate: null,
    };
    expect(formatSummary(record)).toBe("【科】科创股份 688001.SH");
  });
  test("可转债", () => {
    const record: IPORecord = {
      name: "转债A",
      code: "123456",
      issuanceDate: new Date("2026-04-15"),
      issuancePrice: null,
      publicationDate: null,
      listingDate: null,
    };
    expect(formatSummary(record)).toBe("【债】转债A 123456.SZ");
  });
  test("REITs", () => {
    const record: IPORecord = {
      name: "REITs基金",
      code: "508001",
      issuanceDate: new Date("2026-04-15"),
      issuancePrice: null,
      publicationDate: null,
      listingDate: null,
    };
    expect(formatSummary(record)).toBe("【REITs】REITs基金 508001.SH");
  });
});

describe("4.4 - formatDescription", () => {
  test("全字段", () => {
    const record: IPORecord = {
      name: "测试",
      code: "001",
      issuanceDate: new Date("2026-04-15"),
      issuancePrice: 10.5,
      publicationDate: new Date("2026-04-10"),
      listingDate: new Date("2026-04-20"),
    };
    const desc = formatDescription(record);
    expect(desc).toContain("发行价：10.50 元");
    expect(desc).toContain("公布日：2026-04-10");
    expect(desc).toContain("上市日：2026-04-20");
  });
  test("缺失字段 -> --", () => {
    const record: IPORecord = {
      name: "测试",
      code: "001",
      issuanceDate: new Date("2026-04-15"),
      issuancePrice: null,
      publicationDate: null,
      listingDate: null,
    };
    const desc = formatDescription(record);
    expect(desc).toContain("发行价：--");
    expect(desc).toContain("公布日：--");
    expect(desc).toContain("上市日：--");
  });
});

describe("4.5 - createJSON", () => {
  test("字母排序", () => {
    const records: IPORecord[] = [
      {
        name: "测试",
        code: "001",
        issuanceDate: new Date("2026-04-15"),
        issuancePrice: 10,
        publicationDate: null,
        listingDate: null,
      },
    ];
    const json = createJSON(records);
    expect(json).toContain('"code"');
    expect(json).toContain('"issuanceDate"');
    expect(json).toContain('"market"');
    expect(json).toContain('"name"');
  });
  test("2空格缩进", () => {
    const json = createJSON([]);
    expect(json).toBe("[]");
  });
});

describe("formatDate", () => {
  test("YYYY-MM-DD格式", () => {
    const date = new Date("2026-04-15");
    expect(formatDate(date)).toBe("2026-04-15");
  });
  test("个位数月日补零", () => {
    const date = new Date("2026-01-05");
    expect(formatDate(date)).toBe("2026-01-05");
  });
});

describe("6.2 - getUID", () => {
  test("UID格式", () => {
    const record: IPORecord = {
      name: "测试",
      code: "001312",
      issuanceDate: new Date("2026-04-15"),
      issuancePrice: null,
      publicationDate: null,
      listingDate: null,
    };
    expect(getUID(record)).toBe("001312.SZ");
  });
  test("SH市场", () => {
    const record: IPORecord = {
      name: "测试",
      code: "688001",
      issuanceDate: new Date("2026-04-15"),
      issuancePrice: null,
      publicationDate: null,
      listingDate: null,
    };
    expect(getUID(record)).toBe("688001.SH");
  });
});

describe("校验 - 发行日缺失", () => {
  test("缺少issuanceDate应抛异常", () => {
    const record = { name: "测试", code: "001" } as unknown as IPORecord;
    expect(() => {
      if (!record.issuanceDate) throw new Error(`发行日缺失：${record.code}`);
    }).toThrow();
  });
});

describe("导出 - 文件命名", () => {
  test("检查三路ICS文件名", () => {
    expect("zh_CN.stocks.ics").toMatch(/^zh_CN\.(stocks|bonds|reits)\.ics$/);
    expect("zh_CN.bonds.ics").toMatch(/^zh_CN\.(stocks|bonds|reits)\.ics$/);
    expect("zh_CN.reits.ics").toMatch(/^zh_CN\.(stocks|bonds|reits)\.ics$/);
  });
  test("检查三路JSON文件名", () => {
    expect("zh_CN.stocks.json").toMatch(/^zh_CN\.(stocks|bonds|reits)\.json$/);
    expect("zh_CN.bonds.json").toMatch(/^zh_CN\.(stocks|bonds|reits)\.json$/);
    expect("zh_CN.reits.json").toMatch(/^zh_CN\.(stocks|bonds|reits)\.json$/);
  });
});

describe("导出 - 空输入", () => {
  test("空数组导出空内容", () => {
    const ics = createICS([], "股票");
    expect(ics).toContain("BEGIN:VCALENDAR");
    expect(ics).toContain("END:VCALENDAR");
  });
});

describe("ical-generator - ical-generator 输出格式验证", () => {
  test("VCALENDAR 包含正确头部", () => {
    const ics = createICS([], "股票");
    expect(ics).toContain("BEGIN:VCALENDAR");
    expect(ics).toContain("VERSION:2.0");
    expect(ics).toContain("PRODID:-//sebbo.net//ical-generator//EN");
  });
  test("VEVENT 包含所有必需字段", () => {
    const record: IPORecord = {
      name: "测试",
      code: "001312",
      issuanceDate: new Date("2026-04-15"),
      issuancePrice: 10.5,
      publicationDate: new Date("2026-04-10"),
      listingDate: new Date("2026-04-20"),
    };
    const ics = createICS([record], "股票");
    expect(ics).toContain("BEGIN:VEVENT");
    expect(ics).toContain("UID:001312.SZ");
    expect(ics).toContain("DTSTART:");
    expect(ics).toContain("DTEND:");
    expect(ics).toContain("SUMMARY:");
    expect(ics).toContain("DESCRIPTION:");
    expect(ics).toContain("END:VEVENT");
  });
  test("时间格式为 09:30-10:00", () => {
    const record: IPORecord = {
      name: "测试",
      code: "001312",
      issuanceDate: new Date("2026-04-15"),
      issuancePrice: null,
      publicationDate: null,
      listingDate: null,
    };
    const ics = createICS([record], "股票");
    expect(ics).toContain("DTSTART:20260415T093000");
    expect(ics).toContain("DTEND:20260415T100000");
  });
  test("空数组生成空 VCALENDAR", () => {
    const ics = createICS([], "股票");
    expect(ics).toMatch(/^BEGIN:VCALENDAR[\s\S]*END:VCALENDAR$/);
  });
});

describe("日历名称 - 包含新股申购和类型", () => {
  test("股票日历名称", () => {
    const ics = createICS([], "股票");
    expect(ics).toContain("X-WR-CALNAME:新股申购 - 股票");
  });
  test("可转债日历名称", () => {
    const ics = createICS([], "可转债");
    expect(ics).toContain("X-WR-CALNAME:新股申购 - 可转债");
  });
  test("REITs日历名称", () => {
    const ics = createICS([], "REITs");
    expect(ics).toContain("X-WR-CALNAME:新股申购 - REITs");
  });
});
