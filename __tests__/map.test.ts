import { SDK_VERSION } from '../src/game';
import { MAP_FORMAT, parseMapManifest } from '../src/map';

const valid = {
  format: MAP_FORMAT,
  sdk: SDK_VERSION,
  entry: 'bundle.js',
  game: { id: 'demo', name: 'Демо', version: '1.0.0', icon: 'Cube' },
};

const parse = (data: unknown) => parseMapManifest(JSON.stringify(data));

describe('parseMapManifest', () => {
  it('принимает корректный манифест пакета', () => {
    const result = parse(valid);
    expect(result).toEqual({ ok: true, manifest: valid });
  });

  it('принимает entry во вложенной папке', () => {
    expect(parse({ ...valid, entry: 'dist/bundle.js' }).ok).toBe(true);
  });

  it('отклоняет не JSON и не объект', () => {
    expect(parseMapManifest('{ format: 1')).toEqual({
      ok: false,
      error: 'manifest.json — не JSON',
    });
    expect(parseMapManifest('[1]').ok).toBe(false);
    expect(parseMapManifest('null').ok).toBe(false);
  });

  it('отклоняет чужой format и неверную версию SDK', () => {
    expect(parse({ ...valid, format: 2 }).ok).toBe(false);
    expect(parse({ ...valid, format: '1' }).ok).toBe(false);
    expect(parse({ ...valid, sdk: '0.3' }).ok).toBe(false);
    expect(parse({ ...valid, sdk: 3 }).ok).toBe(false);
  });

  it('отклоняет entry, который выводит за пределы пакета или не .js', () => {
    for (const entry of [
      '../bundle.js',
      'a/../../bundle.js',
      '/bundle.js',
      'C:/bundle.js',
      'dist\\bundle.js',
      'dist//bundle.js',
      'bundle.ts',
      '',
      42,
    ]) {
      expect(parse({ ...valid, entry }).ok).toBe(false);
    }
  });

  it('проверяет манифест игры так же, как defineGame', () => {
    const bad = (game: unknown) => parse({ ...valid, game });
    expect(bad({ ...valid.game, id: 'Моя игра' })).toEqual({
      ok: false,
      error: 'неверный id игры «Моя игра»',
    });
    expect(bad({ ...valid.game, icon: 'cube' }).ok).toBe(false);
    expect(bad({ ...valid.game, presentation: 'popup' }).ok).toBe(false);
    expect(bad({ ...valid.game, name: 1 }).ok).toBe(false);
    expect(
      bad({
        ...valid.game,
        sections: [{ id: 'a', title: { en: 'A' }, icon: 'House' }],
      }).ok,
    ).toBe(false);
    expect(bad(undefined).ok).toBe(false);
    expect(bad('demo').ok).toBe(false);
  });
});
