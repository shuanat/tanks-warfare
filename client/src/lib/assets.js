const totalAssets = 9;
let assetsLoadedCount = 0;

function checkAssetsLoaded(assets) {
  assetsLoadedCount++;
  if (assetsLoadedCount >= totalAssets) {
    assets.loaded = true;
    console.log('✅ Все ассеты загружены');
  }
}

function createAssets() {
  const assets = {
    images: {
      grassBase: new Image(),
      grassOverlay: new Image(),
      perlinMask: new Image(),
      tankBase: new Image(),
      tankTurret: new Image(),
    },
    sounds: {
      shoot: new Audio(),
      hit: new Audio(),
      explosion: new Audio(),
      brickHit: new Audio(),
    },
    loaded: false,
  };

  assets.images.grassBase.src = '/assets/images/grass_base.png';
  assets.images.grassOverlay.src = '/assets/images/grass_overlay.png';
  assets.images.perlinMask.src = '/assets/images/perlin_mask.png';
  assets.images.tankBase.src = '/assets/images/tank_base_green.png';
  assets.images.tankTurret.src = '/assets/images/tank_turret_green.png';
  assets.sounds.shoot.src = '/assets/sounds/shoot.mp3';
  assets.sounds.hit.src = '/assets/sounds/hit.mp3';
  assets.sounds.explosion.src = '/assets/sounds/explosion.mp3';
  assets.sounds.brickHit.src = '/assets/sounds/brick_hit.mp3';

  Object.values(assets.images).forEach((img) => {
    img.onload = () => checkAssetsLoaded(assets);
    img.onerror = () => {
      console.warn('Не загрузилось изображение:', img.src);
      checkAssetsLoaded(assets);
    };
  });

  Object.values(assets.sounds).forEach((audio) => {
    audio.addEventListener('canplaythrough', () => checkAssetsLoaded(assets));
    audio.addEventListener('error', () => {
      console.warn('Не загрузился звук:', audio.src);
      checkAssetsLoaded(assets);
    });
    audio.preload = 'auto';
    audio.load();
  });

  return assets;
}

export const assets = createAssets();
