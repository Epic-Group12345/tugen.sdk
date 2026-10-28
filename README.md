# tugen.sdk

**TUGEN запускает любую игру — достаточно сделать для неё мини-приложение.**

SDK для разработчиков игр в TUGEN. У каждой игры в лаунчере — своё пространство: мини-приложение на
React Native, которое лаунчер открывает в своём окне на месте страницы игры. Через SDK мини-приложение
получает от лаунчера операции системы — файлы своей папки, загрузки, запуск процесса, сеть и своё
хранилище — и ничего сверх этого. Логика игры (что качать, как запускать) — в самом мини-приложении.

Первое мини-приложение — Minecraft ([tugen.minecraft](https://github.com/Epic-Group12345/tugen.minecraft)).

```tsx
import { SafeAreaView, defineGame, useHost } from '@tugen/sdk';
import { Text } from 'react-native';

function App() {
  const host = useHost();
  // SafeAreaView — чтобы текст не ушёл под острова лаунчера (плашку сверху и навигацию снизу)
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Text>Память: {host.system.totalMemoryMb()} МБ</Text>
    </SafeAreaView>
  );
}

export default defineGame({
  manifest: { id: 'my-game', name: 'Моя игра', version: '1.0.0', icon: 'Cube' },
  App,
});
```

Мини-приложение можно собрать в пакет `.map` (zip с бандлом и манифестом, как `.apk`) и поставить в
лаунчер в режиме разработчика — без пересборки лаунчера:

```bash
yarn tugen-map build   # → dist/my-game.map
```

Документация — в [docs/](docs/index.md).

## Работа

```bash
yarn install
yarn typecheck
yarn test
```
