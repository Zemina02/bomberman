import { useState, useEffect, useCallback } from "react";
export const TILE_SIZE = 32;



export function usePlayer(map) {
  const [pos, setPos] = useState({ x: 0, y: 0 });

  // Encontrar posição inicial quando o mapa é carregado
  useEffect(() => {
    if (map.length > 0) {
      for (let y = 0; y < map.length; y++) {
        for (let x = 0; x < map[y].length; x++) {
          if (map[y][x] === "⬛") {
            setPos({ x, y });
            break;
          }
        }
      }
    }
  }, [map]);

  const move = useCallback((dx, dy) => {
    setPos((prev) => {
      const newX = prev.x + dx;
      const newY = prev.y + dy;

      // Lógica de colisão simples com paredes
      const targetTile = map[newY] && map[newY][newX];
      if (targetTile && targetTile !== "🟦" && targetTile !== "⬜") {
        return { x: newX, y: newY };
      }
      return prev;
    });
  }, [map]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "ArrowUp") move(0, -1);
      if (e.key === "ArrowDown") move(0, 1);
      if (e.key === "ArrowLeft") move(-1, 0);
      if (e.key === "ArrowRight") move(1, 0);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [move]);

  return pos;
}

export default function Player({ pos }) {
  return (
    <div
      className="tile player"
      style={{
        left: pos.x * TILE_SIZE,
        top: pos.y * TILE_SIZE
      }}
    />
  );
}