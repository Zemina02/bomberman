import { useEffect, useState } from "react";
import { usePlayer } from "../Player/Player.js"; // Importa a lógica
import Player from "../Player/Player.js";
import { placeBomb, explodeBomb } from "../Bombs/Bombs";
import { TILE_SIZE } from "../constants";

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
  "⬛": "floor", // O jogador começa numa célula de chão
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

function GameView({ mapid }) {
  const [map, setMap] = useState([]);
  const [bombs, setBombs] = useState([]);
  const { pos: playerPos, direction } = usePlayer(map);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === "Space") {
        placeBomb({
          map,
          bombs,
          setBombs,
          playerPos,
          direction,
          explodeBomb: (x, y, id) =>
            explodeBomb({ x, y, id, setMap, setBombs }),
        });
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [map, bombs, playerPos, direction]);

  useEffect(() => {
    ReadMaps(mapid).then(setMap);
  }, [mapid]);

  return (
    <div className="stage">
      <img className="fundo" src="/fundo.png" />
      <div className="game-view">
        {/* O Player e o RenderMap partilham o mesmo contentor de grid */}
        <section
          className="maploc"
          style={{
            gridTemplateColumns: `repeat(${map[0]?.length || 0}, ${TILE_SIZE}px)`,
            gridTemplateRows: `repeat(${map.length}, ${TILE_SIZE}px)`,    
          }}
        >
          <RenderMap map={map} />
        </section>
        <div className="entities">
          <Player pos={playerPos} />
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
        </div>
      </div>
    </div>
  );
}

export default GameView;
