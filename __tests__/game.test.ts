import { SDK_VERSION, defineGame, localize } from '../src';

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

describe('разделы', () => {
  it('принимает разделы с разными id', () => {
    const game = defineGame({
      manifest: {
        id: 'minecraft',
        name: 'Minecraft',
        version: '0.1.0',
        sections: [
          { id: 'overview', title: 'Обзор', icon: 'House' },
          {
            id: 'servers',
            title: { ru: 'Серверы', en: 'Servers' },
            icon: 'Server',
          },
        ],
      },
      App,
    });
    expect(game.manifest.sections).toHaveLength(2);
  });

  it('отклоняет повторный или неверный id раздела', () => {
    const manifest = { id: 'x', name: 'x', version: '1' };
    expect(() =>
      defineGame({
        manifest: {
          ...manifest,
          sections: [
            { id: 'a', title: 'A', icon: 'House' },
            { id: 'a', title: 'B', icon: 'House' },
          ],
        },
        App,
      }),
    ).toThrow();
    expect(() =>
      defineGame({
        manifest: {
          ...manifest,
          sections: [{ id: 'Обзор', title: 'A', icon: 'House' }],
        },
        App,
      }),
    ).toThrow();
  });
});

describe('localize', () => {
  it('берёт язык интерфейса, без перевода — русский', () => {
    expect(localize('Обзор', 'en')).toBe('Обзор');
    expect(localize({ ru: 'Серверы', en: 'Servers' }, 'en')).toBe('Servers');
    expect(localize({ ru: 'Серверы' }, 'kk')).toBe('Серверы');
  });
});
