const BASE64 =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

const encodeBase64 = (value: string): string => {
  if ([...value].some(character => character.charCodeAt(0) > 0x7f)) {
    throw new Error('TUGEN SDK: SVG-иконка должна содержать только ASCII');
  }
  let encoded = '';
  for (let i = 0; i < value.length; i += 3) {
    const a = value.charCodeAt(i);
    const b = value.charCodeAt(i + 1);
    const c = value.charCodeAt(i + 2);
    const triplet = a * 65536 + (b || 0) * 256 + (c || 0);
    encoded += BASE64[Math.floor(triplet / 262144) % 64];
    encoded += BASE64[Math.floor(triplet / 4096) % 64];
    encoded +=
      i + 1 < value.length ? BASE64[Math.floor(triplet / 64) % 64] : '=';
    encoded += i + 2 < value.length ? BASE64[triplet % 64] : '=';
  }
  return encoded;
};

/** Источник для нативного растеризатора SVG лаунчера. SVG должен быть ASCII. */
export const svgIconUri = (
  svg: string,
  size: number,
  color = '#FCFFFF',
): string => {
  if (!Number.isFinite(size) || Math.round(size) < 1) {
    throw new Error('TUGEN SDK: размер SVG-иконки должен быть больше нуля');
  }
  if (!/^#[\da-fA-F]{6}$/.test(color)) {
    throw new Error('TUGEN SDK: цвет SVG-иконки должен быть в формате #RRGGBB');
  }
  const colored = svg.replace(/\{\{color\}\}/g, color);
  return `svgicon:${Math.round(size)},${encodeBase64(colored)}`;
};
