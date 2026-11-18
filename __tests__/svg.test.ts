// Реэкспорт react-native-svg: мини-приложение берёт компоненты из SDK и не ставит пакет само
import * as svg from '../src/svg';

describe('react-native-svg в SDK', () => {
  it('отдаёт основные компоненты SVG', () => {
    for (const name of ['Svg', 'G', 'Path', 'Circle', 'Rect', 'Defs', 'LinearGradient', 'Stop']) {
      expect(svg).toHaveProperty(name);
    }
  });
});
