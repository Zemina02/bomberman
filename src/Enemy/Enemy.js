import { useState, useEffect, useRef } from "react";
import { TILE_SIZE } from "../constants";

export function useEnemy(map, players, bombs = []) {
  const [enemy, setEnemy] = useState(null);
  const [direction, setDirection] = useState("right");
  const decisionCounterRef = useRef(0);
  const moveCounterRef = useRef(0);

  const DECISION_INTERVAL = 60;
  const MOVE_INTERVAL = 60 
  const CHASE_DISTANCE = 4;
  const FLEE_DISTANCE = 5;

  const isWalkable = (x, y) => {
    if (!map || map.length === 0 || !map[0]) return false;
    if (x < 0 || y < 0 || x >= map[0].length || y >= map.length) {
      return false;
    }
    const tile = map[y][x];
    return tile === "🟥" || tile === "⬛";
  };

  const manhattanDistance = (x1, y1, x2, y2) => {
    return Math.abs(x1 - x2) + Math.abs(y1 - y2);
  };

  const findNearestPlayer = (currentEnemy) => {
    if (!currentEnemy || players.length === 0) return null;

    let nearest = null;
    let minDistance = Infinity;

    players.forEach((player) => {
      if (!player.pos) return;

      const distance = manhattanDistance(
        currentEnemy.x,
        currentEnemy.y,
        player.pos.x,
        player.pos.y
      );

      if (distance < minDistance) {
        minDistance = distance;
        nearest = { player, distance };
      }
    });

    return nearest;
  };

  const findDangerousBombs = (currentEnemy) => {
    if (!bombs || bombs.length === 0) return null;

    let dangerous = null;
    let minDistance = Infinity;

    bombs.forEach((bomb) => {
      const distance = manhattanDistance(
        currentEnemy.x,
        currentEnemy.y,
        bomb.x,
        bomb.y
      );

      if (distance < FLEE_DISTANCE && distance < minDistance) {
        minDistance = distance;
        dangerous = { bomb, distance };
      }
    });

    return dangerous;
  };

  const getPossibleMoves = (currentEnemy) => {
    if (!currentEnemy) return [];

    const moves = [
      { dir: "up", x: currentEnemy.x, y: currentEnemy.y - 1 },
      { dir: "down", x: currentEnemy.x, y: currentEnemy.y + 1 },
      { dir: "left", x: currentEnemy.x - 1, y: currentEnemy.y },
      { dir: "right", x: currentEnemy.x + 1, y: currentEnemy.y },
    ];

    return moves.filter((move) => isWalkable(move.x, move.y));
  };

  const decideNextMove = (currentEnemy) => {
    const possibleMoves = getPossibleMoves(currentEnemy);

    if (possibleMoves.length === 0) return;

    const dangerBomb = findDangerousBombs(currentEnemy);
    if (dangerBomb) {
      let bestMove = possibleMoves[0];
      let bestDistance = 0;

      possibleMoves.forEach((move) => {
        const distToBomb = manhattanDistance(
          move.x,
          move.y,
          dangerBomb.bomb.x,
          dangerBomb.bomb.y
        );

        if (distToBomb > bestDistance) {
          bestDistance = distToBomb;
          bestMove = move;
        }
      });

      setDirection(bestMove.dir);
      return;
    }

    const nearest = findNearestPlayer(currentEnemy);
    if (nearest && nearest.distance < CHASE_DISTANCE) {
      let bestMove = possibleMoves[0];
      let bestDistance = Infinity;

      possibleMoves.forEach((move) => {
        const distToPlayer = manhattanDistance(
          move.x,
          move.y,
          nearest.player.pos.x,
          nearest.player.pos.y
        );

        if (distToPlayer < bestDistance) {
          bestDistance = distToPlayer;
          bestMove = move;
        }
      });

      setDirection(bestMove.dir);
      return;
    }

    const randomMove = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
    setDirection(randomMove.dir);
  };

  // Inicializar inimigo
  useEffect(() => {
    if (!map || map.length === 0) return;

    let enemyX = 1;
    let enemyY = 1;
    let found = false;

    outerLoop: for (let y = Math.max(1, map.length - 4); y < map.length; y++) {
      for (let x = Math.max(1, map[0].length - 4); x < map[0].length; x++) {
        if (
          (map[y][x] === "⬛" || map[y][x] === "🟥") &&
          !(y === 1 && x === 1) &&
          !(y === 1 && x === map[0].length - 2)
        ) {
          enemyX = x;
          enemyY = y;
          found = true;
          break outerLoop;
        }
      }
    }

    if (!found) {
      enemyX = Math.max(1, Math.min(map[0].length - 2, 5));
      enemyY = Math.max(1, Math.min(map.length - 2, 5));
    }

    setEnemy({ id: "enemy1", x: enemyX, y: enemyY });
    setDirection("right");
  }, [map]);

  useEffect(() => {
    if (!enemy || !map || map.length === 0) return;

    const gameLoop = setInterval(() => {
      decisionCounterRef.current += 1;
      moveCounterRef.current += 1;  // ✅ NOVO: Sobe contador de movimento

      setEnemy((prevEnemy) => {
        if (!prevEnemy) return prevEnemy;

        // Decisão a cada 60 frames
        if (decisionCounterRef.current >= DECISION_INTERVAL) {
          decideNextMove(prevEnemy);
          decisionCounterRef.current = 0;
        }

        // ✅ NOVO: Movimento apenas a cada MOVE_INTERVAL frames
        if (moveCounterRef.current >= MOVE_INTERVAL) {
          let newX = prevEnemy.x;
          let newY = prevEnemy.y;

          if (direction === "up") newY -= 1;
          else if (direction === "down") newY += 1;
          else if (direction === "left") newX -= 1;
          else if (direction === "right") newX += 1;

          if (isWalkable(newX, newY)) {
            moveCounterRef.current = 0;  // ✅ Reset após mover
            return { ...prevEnemy, x: newX, y: newY };
          } else {
            const possible = getPossibleMoves(prevEnemy);
            if (possible.length > 0) {
              const randomMove = possible[Math.floor(Math.random() * possible.length)];
              setDirection(randomMove.dir);
            }
          }

          moveCounterRef.current = 0;  // ✅ Reset mesmo se não conseguiu mover
        }

        return prevEnemy;
      });
    }, 1000 / 60);

    return () => clearInterval(gameLoop);
  }, [direction, enemy, map, bombs]);

  return enemy;
}

function Enemy({ pos }) {
  return (
    <div
      className="tile player"
      style={{
        left: pos.x * TILE_SIZE,
        top: pos.y * TILE_SIZE,
        backgroundColor: "#FF6B6B",
        borderColor: "#C92A2A",
        boxShadow: "0 0 8px rgba(255, 107, 107, 0.8)",
      }}
      title="👾 Enemy"
    >
      👾
    </div>
  );
}

export default Enemy;