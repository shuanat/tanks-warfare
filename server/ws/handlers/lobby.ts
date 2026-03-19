import { MAX_PLAYERS } from '../../constants.js';
import { generateMapData } from '../../game/mapGenerator.js';
import { isValidColor, sanitizeLobbyName, sanitizeNick } from '../../utils/validation.js';
import { broadcastLobbyList, broadcastLobbyState } from '../broadcast.js';
import { lobbies } from '../lobbyStore.js';
import { ServerMsg } from '#shared/protocol.js';
import type { WebSocket, WebSocketServer } from 'ws';

export function handleCreateLobby(wss: WebSocketServer, ws: WebSocket, data: Record<string, unknown>): void {
    const lobbyId = Math.floor(Math.random() * 9000 + 1000).toString();
    ws.nickname = sanitizeNick(data.nickname);
    ws.id = `p_${Math.floor(Math.random() * 10000)}`;
    ws.lobbyId = lobbyId;
    ws.team = 1;
    ws.ready = false;
    ws.color = typeof data.color === 'string' ? data.color : '#4CAF50';
    lobbies[lobbyId] = {
        hostId: ws.id,
        name: sanitizeLobbyName(data.lobbyName),
        players: [ws],
        scores: { 1: 0, 2: 0 },
        mines: [],
        boosts: [],
        rockets: [],
        gameStarted: false,
        mapData: null,
    };
    ws.send(
        JSON.stringify({
            type: ServerMsg.LOBBY_CREATED,
            lobbyId,
            playerId: ws.id,
            team: 1,
            nickname: ws.nickname,
            color: ws.color,
            isHost: true,
        }),
    );
    broadcastLobbyState(lobbies[lobbyId]);
    broadcastLobbyList(wss);
}

export function handleJoinLobby(wss: WebSocketServer, ws: WebSocket, data: Record<string, unknown>): void {
    const lobbyId = typeof data.lobbyId === 'string' ? data.lobbyId : '';
    const lobby = lobbyId ? lobbies[lobbyId] : undefined;
    if (lobby && !lobby.gameStarted && lobby.players.length < MAX_PLAYERS) {
        ws.nickname = sanitizeNick(data.nickname);
        ws.id = `p_${Math.floor(Math.random() * 10000)}`;
        ws.lobbyId = lobbyId;
        ws.team = 2;
        ws.ready = false;
        ws.color = typeof data.color === 'string' ? data.color : '#f44336';
        lobby.players.push(ws);
        ws.send(
            JSON.stringify({
                type: ServerMsg.LOBBY_JOINED,
                lobbyId,
                playerId: ws.id,
                team: 2,
                nickname: ws.nickname,
                color: ws.color,
                isHost: false,
            }),
        );
        broadcastLobbyState(lobby);
        broadcastLobbyList(wss);
    } else {
        ws.send(JSON.stringify({ type: ServerMsg.ERROR, msg: 'Lobby full or not found' }));
    }
}

export function handleUpdatePlayer(_wss: WebSocketServer, ws: WebSocket, data: Record<string, unknown>): void {
    const lobby = ws.lobbyId ? lobbies[ws.lobbyId] : undefined;
    if (lobby && !lobby.gameStarted) {
        if (typeof data.nickname === 'string') ws.nickname = sanitizeNick(data.nickname);
        if (typeof data.color === 'string' && isValidColor(data.color)) ws.color = data.color;
        broadcastLobbyState(lobby);
    }
}

export function handleChangeTeam(_wss: WebSocketServer, ws: WebSocket, data: Record<string, unknown>): void {
    const lobby = ws.lobbyId ? lobbies[ws.lobbyId] : undefined;
    const team = typeof data.team === 'number' ? data.team : 0;
    if (lobby && !lobby.gameStarted) {
        const teamCount = lobby.players.filter((p) => p.team === team).length;
        if (teamCount < 3) {
            ws.team = team;
            broadcastLobbyState(lobby);
        }
    }
}

export function handleToggleReady(_wss: WebSocketServer, ws: WebSocket, _data: Record<string, unknown>): void {
    const lobby = ws.lobbyId ? lobbies[ws.lobbyId] : undefined;
    if (lobby && !lobby.gameStarted) {
        ws.ready = !ws.ready;
        broadcastLobbyState(lobby);
    }
}

export function handleStartGame(_wss: WebSocketServer, ws: WebSocket, _data: Record<string, unknown>): void {
    const lobby = ws.lobbyId ? lobbies[ws.lobbyId] : undefined;
    if (lobby && ws.id === lobby.hostId && !lobby.gameStarted && lobby.players.length >= 1) {
        lobby.gameStarted = true;
        lobby.mapData = generateMapData();
        lobby.players.forEach((p) => {
            p.isInGame = true;
            p.spawnTime = Date.now();
            p.send(
                JSON.stringify({
                    type: ServerMsg.START,
                    team: p.team,
                    playerId: p.id,
                    color: p.color,
                    allPlayers: lobby.players.map((pl) => ({
                        id: pl.id,
                        nick: pl.nickname,
                        team: pl.team,
                        color: pl.color,
                    })),
                    map: lobby.mapData,
                }),
            );
        });
    }
}
