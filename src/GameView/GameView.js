import { useEffect, useState, useRef } from "react";
import { usePlayer } from "../Player/Player.js"; // Importa a lógica
import Player from "../Player/Player.js";
import { placeBomb, explodeBomb } from "../Bombs/Bombs";
import { TILE_SIZE } from "../constants";
import { useHealth } from "../Damage/Health";

//le o mapa de um ficheiro de texto e remove caracteres desnecessarios
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
  "⬛": "spawn", // O jogador começa numa célula de chão
};

//faz a distribuiçao dos tiles do mapa menos o jogador
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

function GameView({ mapid, numPlayers }) {
  const [map, setMap] = useState([]);
  const [bombs, setBombs] = useState([]);
  const players = usePlayer(map, numPlayers);
  const { healths, takeDamage, isGameOver } = useHealth(numPlayers, 3);
  const [explosions, setExplosions] = useState([]);
  const playersRef = useRef(players);

  useEffect(() => {
    playersRef.current = players;  // Atualiza a referência dos jogadores(posição)
  }, [players]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (isGameOver) return;

      // Player 1
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

      // Player 2
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
      <img className="fundo" src="/fundo.png" />
      <div className="hud">
        {healths.map((p) => (
          <div key={p.id}>
            Jogador {p.id + 1}: ❤️ {p.health}
          </div>
        ))}

        {isGameOver && <div className="game-over">Game Over</div>}
      </div>

      <div className="game-view">
        {/* O Player e o RenderMap partilham o mesmo contentor de grid */}
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
            <Player key={p.id} pos={p.pos} />
          ))}
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
