# Архитектура (enterprise-oriented)

## Принципы

1. **Разделение клиент / сервер** — разные деревья; общие константы протокола и карты — в **`shared/`** (TypeScript → `shared/dist/`, см. `npm run build:shared`).
2. **Конфигурация через окружение** — без хардкода IP в коде клиента для продакшена; для dev — `VITE_WS_URL`.
3. **Сервер: тонкий HTTP + доменные модули** — раздача файлов, маршрутизация WS-сообщений, генерация карты, мины.
4. **Клиент: сборка Vite** — ES modules; симуляция, коллизии, рендер и ввод — отдельные модули под `client/src/game`, `client/src/render`, `client/src/input`.

## Сервер

| Модуль                         | Роль                                                        |
| ------------------------------ | ----------------------------------------------------------- |
| `server/index.ts` → `dist/`    | Сборка `http.Server` + `WebSocketServer`, `listen`          |
| `server/config.ts`             | `dotenv`, пути `STATIC_ROOT`                                |
| `server/http/staticHandler.ts` | `/`, `/index.html`, `/assets/*`                             |
| `server/ws/lobbyStore.ts`      | Состояние лобби (`Lobby`, `lobbies`)                        |
| `server/ws/broadcast.ts`       | Рассылка в лобби / игру                                     |
| `server/ws/messageHandler.ts`  | Вход WS: парсинг JSON → `dispatch.ts`                       |
| `server/ws/dispatch.ts`        | Таблица `ClientMsg.*` → хендлер                             |
| `#shared/protocol.js`          | `ClientMsg` / `ServerMsg` (alias в корневом `package.json`) |
| `server/ws/handlers/*.ts`      | Лобби, состояние боя, бой, мир                              |
| `server/ws/attachWebSocket.ts` | Подключение клиента, `close`                                |
| `server/game/mapGenerator.ts`  | Карта                                                       |
| `server/game/mine.ts`          | Логика мины                                                 |
| `server/logger.ts`             | Лог в stdout: уровень `LOG_LEVEL`, события WS / старт        |

### Эксплуатация (кратко)

- **PM2:** пример [`ecosystem.config.cjs`](../ecosystem.config.cjs) в корне; скрипт — `server/dist/index.js`, переменные — см. [`.env.production.example`](../.env.production.example).
- **Логи:** без ротации в приложении; при необходимости — внешний агент или stdout → journald.

## Клиент

| Модуль                                  | Роль                                                    |
| --------------------------------------- | ------------------------------------------------------- |
| `client/src/main.js`                    | Вход, стили, `mountLobbyUI`                             |
| `client/src/game/gameClient.js`         | Лобби, `loop`, resize, DOM панелей, хуки сообщений      |
| `client/src/game/simulation.js`         | `runSimulation(dt, ctx)` — шаг боя, вызов `send`        |
| `client/src/game/collision.js`          | OBB/SAT, кирпичи, кламп танка/камеры                    |
| `client/src/game/effects.js`            | Частицы, следы, дым, взрывы (мутация `world`)           |
| `client/src/game/colorUtils.js`         | `shadeColor` для градаций корпуса                       |
| `client/src/game/gameState.js`          | `world` / `battle` / `session` / `level`                |
| `client/src/render/drawFrame.js`        | Сборка кадра, камера                                    |
| `client/src/render/world.js`            | Фон, кэш сетки, кирпичи, иконки бустов                  |
| `client/src/render/tank.js`             | Отрисовка танка                                         |
| `client/src/render/effects.js`          | Следы, частицы, мины, пули, ракеты, взрывы              |
| `client/src/render/uiOverlay.js`        | Ники, прицел                                            |
| `client/src/input/keyboard.js`          | Клавиатура + мышь на canvas                             |
| `client/src/network/socket.ts`          | WebSocket connect / send                                |
| `client/src/network/messageHandlers.ts` | Входящие сообщения: `handlers[ServerMsg.*]`             |
| `client/src/ui/lobbyController.js`      | Кнопки лобби без `window.*`                             |
| `client/src/lib/assets.js`              | Загрузка изображений и звуков                           |
| `client/src/lib/audio.js`               | Web Audio, MP3 без лишнего `load()` на клоне            |
| `client/src/config/constants.ts`        | Баланс; размеры карты / цвета танков — из `shared/dist` |

## Общий слой `shared/`

| Путь                     | Роль                                                                                                                               |
| ------------------------ | ---------------------------------------------------------------------------------------------------------------------------------- |
| `shared/src/protocol.ts` | `ClientMsg`, `ServerMsg` — единый источник строк `type`                                                                            |
| `shared/src/map.ts`      | `BRICK_SIZE`, `MAP_*`, `MAX_SCORE`, `MAX_PLAYERS`                                                                                  |
| `shared/src/colors.ts`   | `PLAYER_TANK_COLORS`                                                                                                               |
| `shared/src/payloads.ts` | Контракт payload: union’ы вроде `ClientInboundMessage`, `ServerOutboundGameMessage` (поддерживать вручную при изменении протокола) |

## TypeScript: зачем в этом репозитории и чего ждать не стоит

TS здесь — не самоцель, а способ **уменьшить класс ошибок «данные и протокол»** и упростить сопровождение при росте числа типов WS-сообщений.

**Что даёт на практике**

- **Проверка до рантайма:** `npm run typecheck` (и CI) ловит часть опечаток в дискриминаторе `type`, несоответствий формы объекта и поломок после рефакторинга, когда меняются `shared` и импорты на сервере/клиенте.
- **Общий контракт:** `ClientMsg` / `ServerMsg` в `shared/src/protocol.ts` и описания в `shared/src/payloads.ts` задают **одну точку правды**; IDE подсказывает поля и позволяет перейти к определению.
- **Рефакторинг по цепочке:** смена поля или типа в `shared` или в типизированном модуле видна во всех зависимых местах, а не только там, где сработал поиск по строке.

**Чего TypeScript не заменяет**

- **Доверие к клиенту:** типы исчезают в рантайме; для честности игры и устойчивости сервера по-прежнему нужны проверки входящих данных в хендлерах (см. [CODE_CONVENTIONS](./CODE_CONVENTIONS.md), раздел про сеть).
- **Баланс и «физика»:** ошибки геймдизайна и логики боя TS не найдёт — для этого тесты (`collision`, и т.д.) и ручной прогон.
- **Актуальность `payloads.ts`:** типы — документация в коде; при изменении протокола их нужно **обновлять осознанно**, иначе возникает ложное чувство безопасности.

**Сборка и запуск**

- Клиент и `shared` собираются/проверяются отдельно от сервера; сервер — `server/**/*.ts` → `server/dist/` (`npm run build:server`), в dev удобно `tsx watch` (см. корневой `package.json`). Импорт общего кода с сервера в собранном `dist` — через alias **`#shared/*`** в `package.json`, иначе относительные пути из `server/dist/` «не достают» до `shared/dist/`.

## Следующие шаги рефакторинга

- Тач / виртуальный джойстик (`input/touch.js` и интеграция в `simulation`).
- Миграция оставшихся клиентских модулей на TS; ужесточение типов `data` в серверных хендлерах под `ClientInboundMessage`.
- Prettier — отдельным PR при необходимости.
- Тесты: `mapGenerator`, `sanitizeNick`; расширять по мере выноса логики.
