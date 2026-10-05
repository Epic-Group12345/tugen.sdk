# tugen.sdk

SDK для разработчиков игр в TUGEN. У каждой игры в лаунчере — своё пространство: мини-приложение на
React Native, которое лаунчер открывает в своём окне на месте страницы игры. Через SDK мини-приложение
получает от лаунчера файлы своей папки, загрузки и запуск процесса игры — и ничего сверх этого.

Первое мини-приложение — Minecraft ([tugen.minecraft](https://github.com/Epic-Group12345/tugen.minecraft)).

```tsx
import { defineGame, useHost } from '@tugen/sdk';
import { Text } from 'react-native';

function App() {
  const host = useHost();
  return <Text>Память: {host.system.totalMemoryMb()} МБ</Text>;
}

export default defineGame({
  manifest: { id: 'my-game', name: 'Моя игра', version: '1.0.0' },
  App,
});
```

Документация — в [docs/](docs/index.md).

## Работа

```bash
yarn install
yarn typecheck
yarn test
```
