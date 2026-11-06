import { useMemo } from 'react';
import { Image, type ImageStyle, type StyleProp } from 'react-native';
import { svgIconUri } from './icon-uri';

export { svgIconUri } from './icon-uri';

export interface SvgIconProps {
  /** SVG-разметка; используйте {{color}} для цвета, переданного через color. */
  svg: string;
  size?: number;
  color?: string;
  style?: StyleProp<ImageStyle>;
}

/** Рисует SVG через нативный растеризатор TUGEN для Windows и macOS. */
export function SvgIcon({
  svg,
  size = 16,
  color = '#FCFFFF',
  style,
}: SvgIconProps) {
  const source = useMemo(
    () => ({ uri: svgIconUri(svg, size, color), width: size, height: size }),
    [color, size, svg],
  );
  return (
    <Image
      source={source}
      resizeMode="contain"
      style={[{ width: size, height: size }, style]}
    />
  );
}
