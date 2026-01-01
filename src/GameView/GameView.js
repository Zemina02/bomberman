import { useEffect, useState, useRef } from "react";
import { usePlayer } from "../Player/Player.js";
import Player from "../Player/Player.js";
import { useEnemy } from "../Enemy/Enemy.js";
import Enemy from "../Enemy/Enemy.js";
import { placeBomb, explodeBomb } from "../Bombs/Bombs";
import { TILE_SIZE } from "../constants";
import { useHealth } from "../Damage/Health";

async function ReadMaps(map) {
  const response = await fetch("/nivel_" + map + ".txt");
  const text = await response.text();

  return text
    .split("\n")
    .map((line) => Array.from(line.replace(/\r/g, "").trim()));
}

const tileMap = {
  "🟦": "wall",
  "⬜": "box",
  "🟥": "floor",
  "⬛": "spawn",
};

function RenderMap({ map }) {
  return (
    <>
      {map.map((row, y) =>
        row.map((cell, x) => (
          <div key={`${x}-${y}`} className={`tile ${tileMap[cell]}`} />
        ))
      )}
    </>
  );
}

function GameView({ mapid, numPlayers, onGameOver }) {
  const [map, setMap] = useState([]);
  const [bombs, setBombs] = useState([]);
  const players = usePlayer(map, numPlayers);
  const enemy = useEnemy(map, players, bombs);
  const { healths, takeDamage, isGameOver } = useHealth(numPlayers, 3);
  const [explosions, setExplosions] = useState([]);
  const playersRef = useRef(players);
  const lastEnemyDamageRef = useRef({});

  useEffect(() => {
    playersRef.current = players;
  }, [players]);

  // ✅ Game Over - APENAS quando isGameOver for TRUE
  useEffect(() => {
    if (isGameOver && onGameOver) {
      console.log("🎮 Game Over acionado!");
      onGameOver();
    }
  }, [isGameOver, onGameOver]);

  // ✅ COLISÃO: Inimigo toca jogador
  useEffect(() => {
    if (!enemy || !players.length) return;

    players.forEach((player) => {
      if (player.pos.x === enemy.x && player.pos.y === enemy.y) {
        const now = Date.now();
        const lastDamageTime = lastEnemyDamageRef.current[player.id] || 0;

        if (now - lastDamageTime > 1000) {
          takeDamage(player.id);
          lastEnemyDamageRef.current[player.id] = now;
          console.log(`⚠️ Jogador ${player.id + 1} levou dano do inimigo!`);
        }
      }
    });
  }, [enemy, players, takeDamage]);

  // ✅ ENTRADA: Colocar bombas
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (isGameOver) return;

      if (e.code === "Space" && players[0]) {
        const player = players[0];

        placeBomb({
          map,
          bombs,
          setBombs,
          player,
          explodeBomb: ({ x, y, id }) =>
            explodeBomb({
              x,
              y,
              id,
              setMap,
              setBombs,
              playersRef,
              takeDamage,
              setExplosions,
            }),
        });
      }

      if (e.code === "ShiftLeft" && numPlayers > 1 && players[1]) {
        const player = players[1];

        placeBomb({
          map,
          bombs,
          setBombs,
          player,
          explodeBomb: ({ x, y, id }) =>
            explodeBomb({
              x,
              y,
              id,
              setMap,
              setBombs,
              playersRef,
              takeDamage,
              setExplosions,
            }),
        });
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [map, bombs, players, numPlayers, isGameOver, takeDamage]);

  useEffect(() => {
    ReadMaps(mapid).then(setMap);
  }, [mapid]);

  return (
    <div className="stage">
      <img className="fundo" src="/fundo.png" alt="fundo" />
      <div className="hud">
        {healths.map((p) => (
          <div key={p.id}>
            Jogador {p.id + 1}: ❤️ {p.health}
          </div>
        ))}

        {isGameOver && <div className="game-over">Game Over</div>}
      </div>

      <div className="game-view">
        <section
          className="maploc"
          style={{
            gridTemplateColumns: `repeat(${
              map[0]?.length || 0
            }, ${TILE_SIZE}px)`,
            gridTemplateRows: `repeat(${map.length}, ${TILE_SIZE}px)`,
          }}
        >
          <RenderMap map={map} />
        </section>
        <div className="entities">
          {players.map((p) => (
            <Player key={p.id} pos={p.pos} direction={p.direction} />
          ))}

          {enemy && <Enemy pos={enemy} />}

          {bombs.map((b) => (
            <div
              key={b.id}
              className="bomb"
              style={{
                left: b.x * TILE_SIZE,
                top: b.y * TILE_SIZE,
              }}
            />
          ))}

          {explosions.map((e) => (
            <div
              key={e.id}
              className="explosion"
              style={{
                left: e.x * TILE_SIZE,
                top: e.y * TILE_SIZE,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default GameView;