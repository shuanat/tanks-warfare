import { MAX_SCORE } from '../../constants.js';
import { triggerMine } from '../../game/mine.js';
import { broadcastGame, broadcastScores } from '../broadcast.js';
import { lobbies } from '../lobbyStore.js';
import { ServerMsg } from '#shared/protocol.js';
import type { WebSocket, WebSocketServer } from 'ws';

export function handleState(_wss: WebSocketServer, ws: WebSocket, data: Record<string, unknown>): void {
    const lobby = ws.lobbyId ? lobbies[ws.lobbyId] : undefined;
    if (lobby?.gameStarted) {
        ws.lastPos = {
            x: data.x as number,
            y: data.y as number,
            hp: data.hp as number,
            team: ws.team,
        };

        if (lobby.mines) {
            lobby.mines.forEach((mine) => {
                if (mine.triggered) return;
                const mineOwner = lobby.players.find((p) => p.id === mine.owner);
                if (ws.lastPos && mineOwner && mineOwner.team !== ws.team && ws.lastPos.hp > 0) {
                    if (Math.hypot(ws.lastPos.x - mine.x, ws.lastPos.y - mine.y) < 90) {
                        triggerMine(lobby, mine);
                    }
                }
            });
        }

        broadcastGame(
            lobby,
            {
                type: ServerMsg.STATE,
                id: ws.id,
                team: ws.team,
                color: ws.color,
                x: data.x,
                y: data.y,
                angle: data.angle,
                turretAngle: data.turretAngle,
                hp: data.hp,
                vx: data.vx,
                vy: data.vy,
                spawnImmunityTimer: Math.max(0, 3.0 - (Date.now() - ws.spawnTime) / 1000),
            },
            ws,
        );
    }
}

export function handleRestartMatch(_wss: WebSocketServer, ws: WebSocket, _data: Record<string, unknown>): void {
    const lobby = ws.lobbyId ? lobbies[ws.lobbyId] : undefined;
    if (lobby && ws.id === lobby.hostId) {
        lobby.scores = { 1: 0, 2: 0 };
        lobby.mines = [];
        lobby.boosts = [];
        lobby.rockets = [];
        lobby.players.forEach((p) => {
            p.spawnTime = Date.now();
        });
        broadcastScores(lobby);
        broadcastGame(lobby, { type: ServerMsg.RESTART_MATCH, map: lobby.mapData });
    }
}

export function handleDeath(_wss: WebSocketServer, ws: WebSocket, _data: Record<string, unknown>): void {
    const lobby = ws.lobbyId ? lobbies[ws.lobbyId] : undefined;
    if (lobby?.gameStarted) {
        ws.spawnTime = Date.now() + 2000;
        const enemyTeam = ws.team === 1 ? 2 : 1;
        lobby.scores[enemyTeam]++;
        broadcastScores(lobby);

        if (lobby.scores[1] >= MAX_SCORE && lobby.scores[2] >= MAX_SCORE) {
            broadcastGame(lobby, { type: ServerMsg.GAME_OVER, winner: 0 });
        } else if (lobby.scores[enemyTeam] >= MAX_SCORE) {
            broadcastGame(lobby, { type: ServerMsg.GAME_OVER, winner: enemyTeam });
        } else {
            broadcastGame(lobby, { type: ServerMsg.PLAYER_DIED, playerId: ws.id });
        }
    }
}
