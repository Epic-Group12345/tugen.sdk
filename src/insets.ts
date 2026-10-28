// Чистая часть Safe Area — без react-native, чтобы её можно было проверять тестами в Node.

/**
 * Отступы в DIP от краёв области мини-приложения, которые закрыты интерфейсом лаунчера (острова:
 * верхняя плашка и навигация снизу). Под ними можно рисовать фон, но нажимаемое и текст — внутри
 */
export interface SafeAreaInsets {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export type SafeAreaEdge = keyof SafeAreaInsets;

/** Ничего не закрыто: вне лаунчера и в отдельном окне */
export const ZERO_INSETS: SafeAreaInsets = Object.freeze({
  top: 0,
  right: 0,
  bottom: 0,
  left: 0,
});

export const ALL_EDGES: readonly SafeAreaEdge[] = [
  'top',
  'right',
  'bottom',
  'left',
];

export interface SafeAreaPadding {
  paddingTop?: number;
  paddingRight?: number;
  paddingBottom?: number;
  paddingLeft?: number;
}

const PADDING_KEY = {
  top: 'paddingTop',
  right: 'paddingRight',
  bottom: 'paddingBottom',
  left: 'paddingLeft',
} as const;

/** Padding только для перечисленных краёв: остальные не трогаем, чтобы не перебить style */
export function paddingFor(
  insets: SafeAreaInsets,
  edges: readonly SafeAreaEdge[] = ALL_EDGES,
): SafeAreaPadding {
  return Object.fromEntries(
    edges.map(edge => [PADDING_KEY[edge], insets[edge]]),
  ) as SafeAreaPadding;
}
