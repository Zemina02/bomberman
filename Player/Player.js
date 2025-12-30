import { useState, useEffect, useCallback, useRef } from "react";
import { TILE_SIZE } from "../constants";
import { SPAWN_TILE } from "../constants";

function getSpawnPoints(map) {
  const spawns = [];

  map.forEach((row, y) => {
    row.forEach((cell, x) => {
      if (cell === SPAWN_TILE) {
        spawns.push({ x, y });
      }
    });
  });
  console.log("Spawns encontrados:", spawns);
  return spawns;
}

export function usePlayer(map, numPlayers) {
  const [players, setPlayers] = useState([]);
  const initializedRef = useRef(false);

  // SPAWN
  useEffect(() => {
    if (!map.length) return;
    if (initializedRef.current) return;

    const spawnPoints = getSpawnPoints(map);

    if (spawnPoints.length < numPlayers) {
      console.error("Não há spawns suficientes no mapa");
      return;
    }

    const initialPlayers = Array.from({ length: numPlayers }, (_, i) => ({
      id: i,
      pos: spawnPoints[i],
      direction: "down",
    }));

    setPlayers(initialPlayers);
    initializedRef.current = true;
  }, [map, numPlayers]);

  // MOVIMENTO
  const movePlayer = useCallback(
    (playerId, dx, dy, dir) => {
      setPlayers((prev) =>
        prev.map((p) => {
          if (p.id !== playerId) return p;

          const nx = p.pos.x + dx;
          const ny = p.pos.y + dy;

          if (["🟥", "⬛", SPAWN_TILE].includes(map[ny]?.[nx])) {
            return {
              ...p,
              pos: { x: nx, y: ny },
              direction: dir,
            };
          }

          return p;
        })
      );
    },
    [map]
  );

  // INPUT
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "ArrowUp") movePlayer(0, 0, -1, "up");
      if (e.key === "ArrowDown") movePlayer(0, 0, 1, "down");
      if (e.key === "ArrowLeft") movePlayer(0, -1, 0, "left");
      if (e.key === "ArrowRight") movePlayer(0, 1, 0, "right");

      if (numPlayers > 1) {
        if (e.key === "w") movePlayer(1, 0, -1, "up");
        if (e.key === "s") movePlayer(1, 0, 1, "down");
        if (e.key === "a") movePlayer(1, -1, 0, "left");
        if (e.key === "d") movePlayer(1, 1, 0, "right");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [movePlayer, numPlayers]);

  return players;
}

export default function Player({ pos }) {
  return (
    <div
      className="tile player"
      style={{
        left: pos.x * TILE_SIZE,
        top: pos.y * TILE_SIZE,
      }}
    />
  );
}