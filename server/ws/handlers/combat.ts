import { ServerMsg } from '#shared/protocol.js';
import type { WebSocket, WebSocketServer } from 'ws';
import { COLLISION_DAMAGE } from '../../constants.js';
import { broadcastGame } from '../broadcast.js';
import { lobbies } from '../lobbyStore.js';
import { handleDeath } from './gameState.js';

export function handleBullet(_wss: WebSocketServer, ws: WebSocket, data: Record<string, unknown>): void {
    const lobby = ws.lobbyId ? lobbies[ws.lobbyId] : undefined;
    if (lobby?.gameStarted) {
        broadcastGame(
            lobby,
            {
                type: ServerMsg.BULLET,
                bulletId: data.bulletId,
                x: data.x,
                y: data.y,
                vx: data.vx,
                vy: data.vy,
                damage: typeof data.damage === 'number' ? data.damage : 35,
                ownerId: ws.id,
                ownerTeam: ws.team,
            },
            ws,
        );
    }
}

export function handleBulletRemove(_wss: WebSocketServer, ws: WebSocket, data: Record<string, unknown>): void {
    const lobby = ws.lobbyId ? lobbies[ws.lobbyId] : undefined;
    if (lobby?.gameStarted) {
        broadcastGame(lobby, { type: ServerMsg.BULLET_REMOVE, bulletId: data.bulletId });
    }
}

export function handleDealDamage(_wss: WebSocketServer, ws: WebSocket, data: Record<string, unknown>): void {
    const lobby = ws.lobbyId ? lobbies[ws.lobbyId] : undefined;
    if (lobby?.gameStarted) {
        const shooter = lobby.players.find((p) => p.id === ws.id);
        const target = lobby.players.find((p) => p.id === data.targetId);
        if (shooter && target && shooter.team !== target.team && target.readyState === 1) {
            const damage = typeof data.damage === 'number' ? data.damage : 0;
            const currentHp = target.lastPos?.hp ?? target.hp ?? 0;
            const nextHp = Math.max(0, currentHp - damage);
            if (target.lastPos) target.lastPos.hp = nextHp;
            if (target.isBot) target.hp = nextHp;
            target.send(
                JSON.stringify({
                    type: ServerMsg.BULLET_HIT,
                    damage,
                    hitX: data.hitX,
                    hitY: data.hitY,
                    attackerId: ws.id,
                    targetId: target.id,
                    bulletId: data.bulletId,
                }),
            );
            if (target.isBot && currentHp > 0 && nextHp <= 0) {
                handleDeath(_wss, target, {});
            }
        }
        broadcastGame(lobby, {
            type: ServerMsg.BULLET_HIT_VISUAL,
            hitX: data.hitX,
            hitY: data.hitY,
            targetId: data.targetId,
        });
    }
}

export function handleCollisionDamage(_wss: WebSocketServer, ws: WebSocket, data: Record<string, unknown>): void {
    if (!data.otherId) return;
    const lobby = ws.lobbyId ? lobbies[ws.lobbyId] : undefined;
    if (lobby?.gameStarted) {
        if (ws.readyState === 1) {
            ws.send(JSON.stringify({ type: ServerMsg.COLLISION_HIT, damage: COLLISION_DAMAGE }));
        }
        const other = lobby.players.find((p) => p.id === data.otherId);
        if (other && other.readyState === 1) {
            other.send(JSON.stringify({ type: ServerMsg.COLLISION_HIT, damage: COLLISION_DAMAGE }));
        }
    }
}
