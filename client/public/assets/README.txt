Положите сюда каталоги images/ и sounds/ как на сервере:
  assets/images/grass_base.png
  assets/sounds/shoot.mp3
и т.д.

Содержимое public/ копируется в корень dist при npm run build.

При dev (Vite :5173) запросы /assets/* проксируются на Node (см. client/vite.config.js).
Если папки нет — положите ассеты сюда ИЛИ соберите dist с ассетами и отдавайте их с сервера (STATIC_ROOT).
