/**
 * Клавиатура и указатель для боя (фаза 3.5); тач — отдельный модуль позже.
 */
export const gameKeys = {};

/**
 * @param {HTMLCanvasElement} canvas
 */
export function attachGameInput(canvas) {
    window.addEventListener('keydown', (e) => {
        gameKeys[e.code] = true;
    });
    window.addEventListener('keyup', (e) => {
        gameKeys[e.code] = false;
    });
    canvas.addEventListener('mousemove', (e) => {
        const r = canvas.getBoundingClientRect();
        gameKeys['MouseX'] = e.clientX - r.left;
        gameKeys['MouseY'] = e.clientY - r.top;
    });
    canvas.addEventListener('mousedown', () => {
        gameKeys['MouseLeft'] = true;
    });
    canvas.addEventListener('mouseup', () => {
        gameKeys['MouseLeft'] = false;
    });
}
