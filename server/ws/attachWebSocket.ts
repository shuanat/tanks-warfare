import type { WebSocketServer } from 'ws';
import { broadcastLobbyList, broadcastLobbyState, sendLobbyList } from './broadcast.js';
import { lobbies } from './lobbyStore.js';
import { handleGameMessage } from './messageHandler.js';

export function attachWebSocketServer(wss: WebSocketServer): void {
    wss.on('connection', (ws) => {
        ws.id = null;
        ws.lobbyId = null;
        ws.nickname = '';
        ws.team = 0;
        ws.ready = false;
        ws.color = '#4CAF50';
        ws.isInGame = false;
        ws.lastPos = { x: 0, y: 0, hp: 100 };
        ws.spawnTime = 0;

        sendLobbyList(ws);

        ws.on('message', (message) => {
            handleGameMessage(wss, ws, message);
        });

        ws.on('close', () => {
            const lobby = ws.lobbyId ? lobbies[ws.lobbyId] : undefined;
            if (lobby) {
                lobby.players = lobby.players.filter((p) => p !== ws);
                if (lobby.players.length === 0) {
                    delete lobbies[ws.lobbyId!];
                } else {
                    broadcastLobbyState(lobby);
                }
                broadcastLobbyList(wss);
            }
        });
    });
}
