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
        isBot: boolean;
        w: number;
        h: number;
        lastPos: { x: number; y: number; hp: number; team?: number };
        lastPosAt: number;
        x: number;
        y: number;
        angle: number;
        turretAngle: number;
        vx: number;
        vy: number;
        hp: number;
        spawnTime: number;
        botDifficulty?: number;
        botBrain?: {
            targetId: string | null;
            wanderAngle: number;
            lastShotAt: number;
            nextDecisionAt: number;
            path: { x: number; y: number }[];
            pathKey: string;
            lastPathAt: number;
            stuckTicks: number;
        };
    }
}

export { };

