import { useEffect, useState } from "react";
import { usePlayer } from "../Player/Player.js"; // Importa a lógica
import Player from "../Player/Player.js";
export const TILE_SIZE = 32;


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
        Array.from(row).map((cell, x) => (
          <div key={`${x}-${y}`} className={`tile ${tileMap[cell]}`} />
        ))
      )}
    </>
  );
}

// function GameView({mapid}) {
//   const [map, setMap] = useState([]);
//   const playerPos = usePlayer(map); // Utilizamos o nosso hook customizado

//   useEffect(() => {ReadMaps(mapid).then(setMap);}, [mapid]);

//   return (
//     <div className="stage">
//         <img className="fundo" src="/fundo.png" />
//         <div className="game-view">
//             <div>
//             <RenderMap map={map}/>
//             {map.length > 0 && <Player pos={playerPos} />}
//             </div>
//         </div>
//     </div>
//   );
// }

function GameView({ mapid }) {
  const [map, setMap] = useState([]);
  const playerPos = usePlayer(map); // Isto já deteta a posição do ⬛

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
            gridTemplateColumns: `repeat(${map.length}, ${TILE_SIZE}px)`,
            gridTemplateRows: `repeat(${map.length}, ${TILE_SIZE}px)`,
          }}
        >
          <RenderMap map={map} />
        </section>
        <div className="entities">
          <Player pos={playerPos} />
        </div>
      </div>
    </div>
  );
}

export default GameView;
