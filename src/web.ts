// Веб внутри приложения: WebView из react-native-webview входит в SDK, поэтому мини-приложение берёт
// его отсюда и не ставит пакет само. Версия та же, что у лаунчера. Страницы открываются в окне
// приложения; ссылки во внешний браузер — через host.links.
export { WebView } from 'react-native-webview';
export type {
  WebViewMessageEvent,
  WebViewErrorEvent,
  WebViewNavigation,
} from 'react-native-webview/lib/WebViewTypes';
