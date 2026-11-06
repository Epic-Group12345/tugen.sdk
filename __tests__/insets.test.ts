import { ZERO_INSETS, paddingFor } from '../src/insets';

const insets = { top: 48, right: 0, bottom: 72, left: 8 };

describe('paddingFor', () => {
  it('по умолчанию даёт padding на всех четырёх краях', () => {
    expect(paddingFor(insets)).toEqual({
      paddingTop: 48,
      paddingRight: 0,
      paddingBottom: 72,
      paddingLeft: 8,
    });
  });

  it('берёт только перечисленные края, чтобы не перебить остальной style', () => {
    expect(paddingFor(insets, ['top', 'bottom'])).toEqual({
      paddingTop: 48,
      paddingBottom: 72,
    });
    expect(paddingFor(insets, [])).toEqual({});
  });
});

describe('ZERO_INSETS', () => {
  it('все отступы — нули, и значение не испортить: это значение useSafeArea() вне провайдера', () => {
    expect(ZERO_INSETS).toEqual({ top: 0, right: 0, bottom: 0, left: 0 });
    expect(Object.isFrozen(ZERO_INSETS)).toBe(true);
  });
});
