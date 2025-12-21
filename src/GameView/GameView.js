import { useEffect, useState } from "react";



async function ReadMaps() 
{
   const response = await fetch("/nivel_facil.txt");
  const text = await response.text();

  return text
    .split("\n")
    .map(line => line.replace(/\r/g, "").trim())
    .filter(line => line.length > 0);
}

const tileMap = {
  "🟦": "wall",
  "⬜": "floor",
  "🟥": "box",
  "⬛": "player"
};

//Fazer o render do mapa em vez de estar no return do GameView
function RenderMap({map})
{
    return (
 <section className="maploc">
     {map.map((row, y) =>
  Array.from(row).map((cell, x) => (
    <div key={`${x}-${y}`} className={`tile ${tileMap[cell]}`} />
  ))
)}
 </section> 
    );
}

function GameView() 
{
  const [map, setMap] = useState([]);

  useEffect(() => {ReadMaps().then(setMap);}, []);

  return (
    <div className="stage">
        <img className="fundo" src="/fundo.png" />
        <div className="game-view">
            <div>
            <RenderMap map={map}/>
            </div>
        </div>
    </div>
  );
}

export default GameView
