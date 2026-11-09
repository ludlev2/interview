import { CARRIER_OPTIONS, estimateDelivery } from './delivery';

describe('estimateDelivery', () => {
  const tuesday = new Date('2026-03-10T10:00:00Z');

  it('uses the upper end of the GLS range', () => {
    expect(estimateDelivery('gls', tuesday)).toBe('2026-03-12');
  });

  it('uses the upper end of the Posta range', () => {
    expect(estimateDelivery('posta', tuesday)).toBe('2026-03-15');
  });

  it('charges more for home delivery than for a pickup point', () => {
    expect(CARRIER_OPTIONS.gls.fee).toBeGreaterThan(CARRIER_OPTIONS.posta.fee);
  });
});
