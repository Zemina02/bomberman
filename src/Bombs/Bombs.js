import { WALKABLE_TILES, DESTRUCTIBLE_TILE, DIR_OFFSET } from "../constants";

/**
 * Coloca uma bomba à frente do player
 */
export function placeBomb({
  map,
  bombs,
  setBombs,
  playerPos,
  direction,
  explodeBomb,
}) {
  const offset = DIR_OFFSET[direction];
  if (!offset) return;

  const x = playerPos.x + offset.x;
  const y = playerPos.y + offset.y;

  const tile = map[y]?.[x];

  // só coloca em chão ou spawn
  if (!WALKABLE_TILES.includes(tile)) return;

  // evita duplicados
  if (bombs.some((b) => b.x === x && b.y === y)) return;

  const id = crypto.randomUUID();

  setBombs((prev) => [...prev, { x, y, id }]);

  setTimeout(() => explodeBomb(x, y, id), 1000);
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
  playerPosRef,
  takeDamage,
  setExplosions,
}) {
  const playerPos = playerPosRef.current;
  
  const directions = [
    { x: 0, y: 0 },
    { x: 1, y: 0 },
    { x: -1, y: 0 },
    { x: 0, y: 1 },
    { x: 0, y: -1 },
  ];

  const explosionTiles = directions.map((d) => ({
    x: x + d.x,
    y: y + d.y,
    id: crypto.randomUUID(),
  }));

  //Dano
  const hitPlayer = explosionTiles.some(
    (e) => e.x === playerPos.x && e.y === playerPos.y
  );

  if (hitPlayer) takeDamage(1);

  //Mostrar explosão
  setExplosions((prev) => [...prev, ...explosionTiles]);

  // Atualizar mapa
  setMap((prevMap) => {
    const newMap = prevMap.map((row) => [...row]);

    explosionTiles.forEach(({ x, y }) => {
      if (newMap[y]?.[x] === "⬜") {
        newMap[y][x] = "🟥";
      }
    });

    return newMap;
  });

  // ⏱Remover explosão
  setTimeout(() => {
    setExplosions((prev) =>
      prev.filter((e) => !explosionTiles.some((et) => et.id === e.id))
    );
  }, 300);

  setBombs((prev) => prev.filter((b) => b.id !== id));
}
