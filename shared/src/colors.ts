/** Допустимые цвета танка (лобби / валидация на сервере и палитра на клиенте). */

export const PLAYER_TANK_COLORS = Object.freeze([
    '#4CAF50',
    '#f44336',
    '#2196F3',
    '#FF9800',
    '#9C27B0',
    '#00BCD4',
    '#FFEB3B',
    '#E91E63',
    '#3F51B5',
    '#009688',
    '#FF5722',
    '#673AB7',
    '#8BC34A',
    '#795548',
    '#607D8B',
] as const);

export type PlayerTankColor = (typeof PLAYER_TANK_COLORS)[number];
