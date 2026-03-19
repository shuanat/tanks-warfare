/**
 * Кнопки лобби и меню без глобальных window.* (фаза 2.4).
 */
import {
    addBot,
    createLobby,
    joinLobby,
    joinLobbyByCode,
    removeBot,
    setTeam,
    startGame,
    toggleReady,
} from '../game/gameClient.js';

export function mountLobbyUI() {
    document.getElementById('btnCreate')?.addEventListener('click', () => createLobby());
    document.getElementById('btnJoin')?.addEventListener('click', () => joinLobbyByCode());
    document.querySelector('.team-btn.t1')?.addEventListener('click', () => setTeam(1));
    document.querySelector('.team-btn.t2')?.addEventListener('click', () => setTeam(2));
    document.getElementById('btnReady')?.addEventListener('click', () => toggleReady());
    document.getElementById('btnStart')?.addEventListener('click', () => startGame());
    document.getElementById('btnAddBot')?.addEventListener('click', () => addBot());
    document.getElementById('btnRemoveBot')?.addEventListener('click', () => removeBot());

    document.getElementById('lobbyList')?.addEventListener('click', (e) => {
        const btn = e.target.closest('.join-btn');
        if (!btn) return;
        const id = btn.getAttribute('data-lobby-id');
        if (id) joinLobby(id);
    });
}
