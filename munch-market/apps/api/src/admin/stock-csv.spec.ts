import { BadRequestException } from '@nestjs/common';
import { parseStockCsv } from './stock-csv';

describe('parseStockCsv', () => {
  it('parses rows and skips the header', () => {
    const rows = parseStockCsv(
      'sku,batchCode,bestBefore,quantity\nSNK-001,L1234A,2027-01-31,24\n\nDRK-004,L99B,2026-12-01,6\n',
    );
    expect(rows).toEqual([
      { line: 2, sku: 'SNK-001', batchCode: 'L1234A', bestBefore: '2027-01-31', quantity: 24 },
      { line: 4, sku: 'DRK-004', batchCode: 'L99B', bestBefore: '2026-12-01', quantity: 6 },
    ]);
  });

  it('accepts files without a header row', () => {
    expect(parseStockCsv('SNK-001,L1,2027-01-31,1')).toHaveLength(1);
  });

  it.each([
    ['missing column', 'SNK-001,L1,2027-01-31'],
    ['bad date', 'SNK-001,L1,31/01/2027,5'],
    ['zero quantity', 'SNK-001,L1,2027-01-31,0'],
    ['fractional quantity', 'SNK-001,L1,2027-01-31,1.5'],
    ['empty file', 'sku,batchCode,bestBefore,quantity\n'],
  ])('rejects %s', (_case, csv) => {
    expect(() => parseStockCsv(csv)).toThrow(BadRequestException);
  });
});
