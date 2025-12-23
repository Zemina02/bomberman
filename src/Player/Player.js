import { useState, useEffect, useCallback } from "react";
import { TILE_SIZE } from "../constants";

export function usePlayer(map) {
  const [pos, setPos] = useState({ x: 1, y: 1 });
  const [direction, setDirection] = useState("down");

  const move = useCallback(
    (dx, dy, dir) => {
      setDirection(dir);

      setPos((prev) => {
        const newX = prev.x + dx;
        const newY = prev.y + dy;

        const targetTile = map[newY]?.[newX];
        if (["🟥", "⬛"].includes(targetTile)) {
          return { x: newX, y: newY };
        }
        return prev;
      });
    },
    [map]
  );

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "ArrowUp") move(0, -1, "up");
      if (e.key === "ArrowDown") move(0, 1, "down");
      if (e.key === "ArrowLeft") move(-1, 0, "left");
      if (e.key === "ArrowRight") move(1, 0, "right");
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [move]);

  return { pos, direction };
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
