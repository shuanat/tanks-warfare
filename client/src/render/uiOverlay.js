/**
 * Никнеймы над танками и прицел (фаза 3.3).
 */

export function drawNickname(ctx, t, isMy, session) {
    const displayName = session.playerData[t.id]?.nick || (isMy ? session.myNickname : 'Враг');
    const isAlly = session.playerData[t.id]?.team === session.myTeam;
    ctx.fillStyle = isMy || isAlly ? '#4CAF50' : '#f44336';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'center';
    ctx.shadowColor = '#000';
    ctx.shadowBlur = 3;
    ctx.fillText(displayName, t.x, t.y - 40);
    ctx.shadowBlur = 0;
}

export function drawAimCrosshair(ctx, tank) {
    const aimX = tank.x + Math.cos(tank.turretAngle) * 200;
    const aimY = tank.y + Math.sin(tank.turretAngle) * 200;
    ctx.strokeStyle = 'rgba(255,0,0,0.5)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(aimX, aimY, 10, 0, Math.PI * 2);
    ctx.moveTo(aimX - 15, aimY);
    ctx.lineTo(aimX + 15, aimY);
    ctx.moveTo(aimX, aimY - 15);
    ctx.lineTo(aimX, aimY + 15);
    ctx.stroke();
}
