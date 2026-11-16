// app.ts без react-native: index тянет SafeAreaView, а react-native в Node не грузится
import {
  APP_PERMISSIONS,
  SDK_VERSION,
  defineApp,
  localize,
} from '../src/app';

const App = () => null;
const base = { id: 'x', name: 'x', version: '1', kind: 'service' as const };

describe('defineApp', () => {
  it('добавляет версию SDK и сохраняет манифест', () => {
    const app = defineApp({
      manifest: { id: 'friends', name: 'Друзья', version: '1.0.0', kind: 'service' },
      App,
    });
    expect(app.sdk).toBe(SDK_VERSION);
    expect(app.manifest.id).toBe('friends');
  });

  it('требует вид мини-приложения: service или game', () => {
    expect(() =>
      defineApp({ manifest: { ...base, kind: 'tool' as never }, App }),
    ).toThrow(/вид/);
    expect(() =>
      defineApp({ manifest: { ...base, kind: undefined as never }, App }),
    ).toThrow(/вид/);
    expect(
      defineApp({ manifest: { ...base, kind: 'game' }, App }).manifest.kind,
    ).toBe('game');
  });

  it('отклоняет id не из латиницы, цифр и «-»', () => {
    expect(() =>
      defineApp({ manifest: { ...base, id: 'Мой мод' }, App }),
    ).toThrow();
    expect(() => defineApp({ manifest: { ...base, id: '-x' }, App })).toThrow();
  });

  it('принимает иконку в PascalCase и оба вида presentation', () => {
    for (const presentation of ['embedded', 'window'] as const) {
      const app = defineApp({
        manifest: { ...base, icon: 'Cube', presentation },
        App,
      });
      expect(app.manifest.presentation).toBe(presentation);
    }
  });

  it('отклоняет иконку не в PascalCase и неизвестный presentation', () => {
    for (const icon of ['cube', 'Cube-1', '', 'Куб']) {
      expect(() => defineApp({ manifest: { ...base, icon }, App })).toThrow(
        /иконки/,
      );
    }
    expect(() =>
      defineApp({
        manifest: { ...base, presentation: 'fullscreen' as never },
        App,
      }),
    ).toThrow(/presentation/);
  });
});

describe('permissions', () => {
  it('принимает все известные права', () => {
    const app = defineApp({
      manifest: { ...base, permissions: [...APP_PERMISSIONS] },
      App,
    });
    expect(app.manifest.permissions).toEqual(APP_PERMISSIONS);
  });

  it('отклоняет неизвестное право и не-массив', () => {
    expect(() =>
      defineApp({
        manifest: { ...base, permissions: ['root' as never] },
        App,
      }),
    ).toThrow(/право/);
    expect(() =>
      defineApp({ manifest: { ...base, permissions: 'social' as never }, App }),
    ).toThrow(/массив/);
  });
});

describe('разделы', () => {
  it('принимает разделы с разными id', () => {
    const app = defineApp({
      manifest: {
        ...base,
        kind: 'game',
        sections: [
          { id: 'overview', title: 'Обзор', icon: 'House' },
          { id: 'servers', title: { ru: 'Серверы', en: 'Servers' }, icon: 'Server' },
        ],
      },
      App,
    });
    expect(app.manifest.sections).toHaveLength(2);
  });

  it('отклоняет повторный или неверный id раздела', () => {
    expect(() =>
      defineApp({
        manifest: {
          ...base,
          sections: [
            { id: 'a', title: 'A', icon: 'House' },
            { id: 'a', title: 'B', icon: 'House' },
          ],
        },
        App,
      }),
    ).toThrow();
    expect(() =>
      defineApp({
        manifest: { ...base, sections: [{ id: 'Обзор', title: 'A', icon: 'House' }] },
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
