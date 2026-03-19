import 'ws';

declare module 'ws' {
    interface WebSocket {
        id: string | null;
        lobbyId: string | null;
        nickname: string;
        team: number;
        ready: boolean;
        color: string;
        isInGame: boolean;
        lastPos: { x: number; y: number; hp: number; team?: number };
        spawnTime: number;
    }
}

export {};
