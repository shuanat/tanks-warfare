# WebSocket: контракт сообщений

Канал: JSON в текстовых фреймах WebSocket. Поле **`type`** — дискриминатор; остальные поля зависят от типа.

Имена `type`: **`shared/src/protocol.ts`** → `shared/dist/protocol.js`. Сервер импортирует `#shared/protocol.js` (alias в корневом `package.json`). Клиент — из `shared/dist` в `messageHandlers.ts`, `simulation.js`, `gameClient.js`, тестах. Проверка: `npm run typecheck`.

---

## Клиент → сервер

| `type`                 | Назначение                   | Основные поля                                      |
| ---------------------- | ---------------------------- | -------------------------------------------------- |
| `create_lobby`         | Создать лобби                | `nickname`, `lobbyName`, `color`                   |
| `join_lobby`           | Войти в лобби                | `lobbyId`, `nickname`, `color`                     |
| `update_player`        | В лобби: ник/цвет            | `nickname?`, `color?`                              |
| `change_team`          | Смена команды                | `team`                                             |
| `toggle_ready`         | Готов / не готов             | —                                                  |
| `start_game`           | Старт матча (хост)           | —                                                  |
| `bullet`               | Выстрел (синхронизация)      | `bulletId`, `x`, `y`, `vx`, `vy`, `damage?`        |
| `bullet_remove`        | Снять пулю                   | `bulletId`                                         |
| `deal_damage`          | Попадание по игроку          | `targetId`, `damage`, `hitX`, `hitY`, `bulletId?`  |
| `state`                | Позиция и статы своего танка | `x`, `y`, `angle`, `turretAngle`, `hp`, `vx`, `vy` |
| `death`                | Смерть своего танка          | —                                                  |
| `restart_match`        | Сброс раунда (хост)          | —                                                  |
| `deploy_mine`          | Мина                         | `x`, `y`                                           |
| `launch_rocket`        | Ракета                       | `tx`, `ty`                                         |
| `collision_damage`     | Столкновение танков          | `otherId`                                          |
| `boost_pickup`         | Подбор бонуса                | `boostId`, `x`, `y`                                |
| `bricks_destroy_batch` | Разрушение кирпичей (клиент) | `list[]` `{x,y}`, `bulletId?`                      |
| `deploy_smoke`         | Дым                          | поля эффекта + `type` сохраняется при ретрансляции |

---

## Сервер → клиент (частые типы)

| `type`                 | Назначение                         |
| ---------------------- | ---------------------------------- |
| `lobby_created`        | Ответ на `create_lobby`            |
| `lobby_joined`         | Ответ на `join_lobby`              |
| `lobby_state`          | Состав лобби                       |
| `lobby_list`           | Список лобби (вне игры)            |
| `error`                | Ошибка (например лобби полно)      |
| `start`                | Начало боя: `map`, `allPlayers`, … |
| `bullet`               | Чужая пуля                         |
| `bullet_remove`        | Удалить пулю                       |
| `bullet_hit`           | Получен урон (адресат)             |
| `bullet_hit_visual`    | Эффект попадания всем              |
| `state`                | Состояние другого игрока           |
| `game_over`            | Конец матча: `winner`              |
| `player_died`          | Смерть игрока                      |
| `restart_match`        | Сброс с `map`                      |
| `deploy_mine`          | Мина на карте                      |
| `launch_rocket`        | Запуск ракеты                      |
| `explosion_event`      | Взрыв ракеты/мины: кирпичи, бусты  |
| `explosion_damage`     | Урон от взрыва                     |
| `collision_hit`        | Урон от столкновения               |
| `boost_pickup`         | Бонус подобран                     |
| `bricks_destroy_batch` | Подтверждённое разрушение          |
| `deploy_smoke`         | Дым (как у клиента + `ownerId`)    |
| `score_update`         | Счёт команд                        |
| `mine_triggered`       | Мина сработала (`mineId`)          |
| `mine_removed`         | Мина снята с карты                 |
| `boost_spawn`          | Появился бонус                     |

Полный перечень полей сверять с `broadcast.js`, `mine.js`, хендлерами в `server/ws/handlers/` и `messageHandlers.ts` на клиенте.

---

## Доверие

Сервер **не** полностью валидирует физику (позиции, урон от пуль и т.д.) — см. модель доверия в [REFACTORING_PLAN.md](./REFACTORING_PLAN.md). Усиление проверок — отдельная задача.
