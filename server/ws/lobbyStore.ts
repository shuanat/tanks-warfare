import type { WebSocket } from 'ws';

export type BrickPos = { x: number; y: number };

export type MapData = {
    bricks: BrickPos[];
    biome: number;
    w: number;
    h: number;
};

export type LobbyBoost = { x: number; y: number; type: number; id: string };

export type LobbyRocket = {
    id: string;
    tx: number;
    ty: number;
    ownerId: string;
    ownerTeam: number;
    startTime: number;
    exploded: boolean;
};

export type LobbyMine = {
    mineId: string | number;
    x: number;
    y: number;
    owner: string;
    ownerTeam: number;
    triggered: boolean;
};

export type Lobby = {
    hostId: string;
    name: string;
    players: WebSocket[];
    scores: Record<number, number>;
    mines: LobbyMine[];
    boosts: LobbyBoost[];
    rockets: LobbyRocket[];
    gameStarted: boolean;
    mapData: MapData | null;
};

export const lobbies: Record<string, Lobby> = {};
