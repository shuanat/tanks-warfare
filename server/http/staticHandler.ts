import fs from 'fs';
import type { IncomingMessage, ServerResponse } from 'http';
import path from 'path';
import { config } from '../config.js';

const contentTypes: Record<string, string> = {
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.mp3': 'audio/mpeg',
    '.html': 'text/html; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.woff2': 'font/woff2',
};

export function handleHttpRequest(req: IncomingMessage, res: ServerResponse): void {
    const urlPath = req.url?.split('?')[0] || '/';

    if (urlPath.startsWith('/assets/')) {
        const filePath = path.join(config.staticRoot, urlPath);
        serveFile(res, filePath);
        return;
    }

    if (urlPath === '/' || urlPath === '/index.html') {
        const indexPath = path.join(config.staticRoot, 'index.html');
        serveFile(res, indexPath);
        return;
    }

    res.writeHead(404);
    res.end('Not found');
}

function serveFile(res: ServerResponse, filePath: string): void {
    fs.readFile(filePath, (err, data) => {
        if (err) {
            res.writeHead(404);
            res.end('File not found');
            return;
        }
        const ext = path.extname(filePath);
        res.writeHead(200, { 'Content-Type': contentTypes[ext] || 'application/octet-stream' });
        res.end(data);
    });
}
