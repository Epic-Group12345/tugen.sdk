import { SDK_VERSION, defineGame } from '../src';

const App = () => null;

describe('defineGame', () => {
  it('добавляет версию SDK', () => {
    const game = defineGame({
      manifest: { id: 'minecraft', name: 'Minecraft', version: '0.1.0' },
      App,
    });
    expect(game.sdk).toBe(SDK_VERSION);
    expect(game.manifest.id).toBe('minecraft');
  });

  it('отклоняет id не из латиницы, цифр и «-»', () => {
    expect(() =>
      defineGame({ manifest: { id: 'Мой мод', name: 'x', version: '1' }, App }),
    ).toThrow();
    expect(() =>
      defineGame({ manifest: { id: '-x', name: 'x', version: '1' }, App }),
    ).toThrow();
  });
});
