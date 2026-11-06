import { svgIconUri } from '../src/icon-uri';

describe('svgIconUri', () => {
  it('encodes an SVG using the requested size and color', () => {
    expect(svgIconUri('<svg>{{color}}</svg>', 18, '#abcdef')).toBe(
      'svgicon:18,PHN2Zz4jYWJjZGVmPC9zdmc+',
    );
  });

  it('rejects invalid size or color values', () => {
    expect(() => svgIconUri('<svg/>', 0)).toThrow('размер SVG-иконки');
    expect(() => svgIconUri('<svg>é</svg>', 16)).toThrow('только ASCII');
    expect(() => svgIconUri('<svg/>', 16, 'red')).toThrow('цвет SVG-иконки');
  });
});
