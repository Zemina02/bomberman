import { WALKABLE_TILES, DESTRUCTIBLE_TILE, DIR_OFFSET } from "../constants";
import { SoundManager } from "../Sound/SoundManager";

/**
 * Coloca uma bomba à frente do player
 */
export function placeBomb({ map, bombs, setBombs, player, explodeBomb }) {
  const offset = DIR_OFFSET[player.direction];
  if (!offset) return;

  const x = player.pos.x + offset.x;
  const y = player.pos.y + offset.y;

  const tile = map[y]?.[x];

  if (!WALKABLE_TILES.includes(tile)) return;
  if (bombs.some((b) => b.x === x && b.y === y)) return;

  const id = crypto.randomUUID();

  setBombs((prev) => [...prev, { x, y, id, ownerId: player.id }]);

  setTimeout(() => explodeBomb({ x, y, id }), 1000);
}

/**
 * Explode a bomba e altera o mapa
 */
export function explodeBomb({
  x,
  y,
  id,
  setMap,
  setBombs,
  playersRef,
  takeDamage,
  setExplosions,
  enemy, 
  setEnemy,
  scoreManager, 
  createExplosion, 
}) {

  const players = playersRef.current;
  
  if (!players) return;

  SoundManager.explosion();
  createExplosion(x, y);

  const directions = [
    { x: 0, y: 0 }, // Centro (onde a bomba está)
    { x: 1, y: 0 }, // Direita
    { x: -1, y: 0 }, // Esquerda
    { x: 0, y: 1 }, // Baixo
    { x: 0, y: -1 }, // Cima
  ];

  const explosionTiles = directions.map((d) => ({
    x: x + d.x,
    y: y + d.y,
    id: crypto.randomUUID(),
  }));

  //  DANO A TODOS OS JOGADORES ATINGIDOS
  players.forEach((p) => {
    const hit = explosionTiles.some((e) => e.x === p.pos.x && e.y === p.pos.y);

    if (hit) {
      takeDamage(p.id);
    }
  });

  //  DANO AO INIMIGO (APENAS SE ESTIVER EXATAMENTE NO RAIO)
  if (enemy) {
    const enemyHit = explosionTiles.some((e) => e.x === enemy.x && e.y === enemy.y);

    if (enemyHit) {
      console.log("💣 Inimigo atingido pela explosão!");
      scoreManager.killEnemy(); // +100 pontos
      setEnemy(null); // ✅ Elimina o inimigo
    }
  }

  // Mostrar explosão
  setExplosions((prev) => [...prev, ...explosionTiles]);

  // Atualizar mapa
  setMap((prevMap) => {
    const newMap = prevMap.map((row) => [...row]);

    explosionTiles.forEach(({ x, y }) => {
      if (newMap[y]?.[x] === DESTRUCTIBLE_TILE) {
        newMap[y][x] = "🟥";
        scoreManager.destroyBox(); // +10 pontos  
      }
    });

    return newMap;
  });

  // Remover explosão após 300ms
  setTimeout(() => {
    setExplosions((prev) =>
      prev.filter((e) => !explosionTiles.some((et) => et.id === e.id))
    );
  }, 300);

  // Remover bomba
  setBombs((prev) => prev.filter((b) => b.id !== id));
}