import { useEffect, useState, useRef } from "react";
import { usePlayer } from "../Player/Player.js";
import Player from "../Player/Player.js";
import { useEnemy } from "../Enemy/Enemy.js";
import Enemy from "../Enemy/Enemy.js";
import { placeBomb, explodeBomb } from "../Bombs/Bombs.js";
import { TILE_SIZE } from "../constants.js";
import { useHealth } from "../Damage/Health.js";

import { SoundManager } from "../Sound/SoundManager";
import { useScore} from "../Score/ScoreManager.js";
import {useParticles, Particle} from "../Particles/ParticleSystem.js";
import { DIFFICULTY_SETTINGS } from "../LevelManager/LevelManager.js";
import { VictoryScreen } from "../Victory/VictoryScreen.js";



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
  const [enemy, setEnemy] = useEnemy(map, players, bombs);
  const { healths, takeDamage, isGameOver } = useHealth(numPlayers, 3);
  const [explosions, setExplosions] = useState([]);
  const playersRef = useRef(players);
  const lastEnemyDamageRef = useRef({});

  const difficulty = DIFFICULTY_SETTINGS[mapid];
  const scoreManager = useScore(mapid, difficulty.timeLimit);
  const { particles, createExplosion } = useParticles();
  const [showVictory, setShowVictory] = useState(false);
  const [levelComplete, setLevelComplete] = useState(false);  

  useEffect(() => {
  SoundManager.bgm();
  
  return () => {
    // Parar música se tiver método (opcional)
  };
}, []); 

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

  useEffect(() => {
    if (isGameOver || showVictory ) return;

    const timer = setInterval(() => {
      scoreManager.incrementTime();
    }, 1000);

    return () => clearInterval(timer);
  }, [isGameOver, showVictory]);



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

  useEffect(() => {
    // Se não há inimigo e ainda há jogadores vivos
    if (!enemy && players.length > 0 && !levelComplete) {
      const hasAlivePlayers = healths.some(h => !h.isDead);
      
      if (hasAlivePlayers) {
        console.log("🎉 VITÓRIA! Nível completo!");
        setLevelComplete(true);
        setShowVictory(true);
      }
    }
  }, [enemy, players, levelComplete, healths]);

  // ✅ ENTRADA: Colocar bombas
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (isGameOver) return;

      if (e.code === "Space" && players[0]) {
        const player = players[0];

        SoundManager.bomb();

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
              enemy,
              setEnemy,
              scoreManager,
              createExplosion,
            }),
        });
      }

      if (e.code === "ShiftLeft" && numPlayers > 1 && players[1]) {
        const player = players[1];

        SoundManager.bomb();

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
              enemy,
              setEnemy,
              scoreManager,
              createExplosion,
            }),
        });
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [map, bombs, players, numPlayers, isGameOver, takeDamage]);

  useEffect(() => {
    ReadMaps(mapid).then((newMap) => {
      setMap(newMap);
      scoreManager.resetForNewLevel(mapid, difficulty.timeLimit);
    });
  }, [mapid]);

  if (showVictory && levelComplete) {
    return (
      <div className="stage">
        <VictoryScreen
          level={scoreManager.level}
          score={scoreManager.score}
          timeRemaining={scoreManager.timeRemaining}
          enemiesKilled={scoreManager.enemiesKilled}
          onNextLevel={() => {
            setShowVictory(false);
            setLevelComplete(false);
            // Component vai rerender com novo mapid
          }}
          onMainMenu={() => {
            onGameOver(scoreManager.score);
          }}
        />
      </div>
    );  
  }

  return (
    <div className="stage">
      <img className="fundo" src="/fundo.png" alt="fundo" />
      <div className={`hud ${scoreManager.flashEffect ? 'flash-damage' : ''}`}>
        {/* Informações de Jogo */}
        <div style={{ 
          marginBottom: "15px", 
          borderBottom: "1px solid #ffd700", 
          paddingBottom: "10px",
          fontSize: "14px"
        }}>
          <div>🎮 Nível: {scoreManager.level}</div>
          <div>⭐ Pontos: {scoreManager.score}</div>
          <div style={{
            color: scoreManager.timeRemaining <= 10 ? '#ff4444' : '#ffd700',
            fontWeight: scoreManager.timeRemaining <= 10 ? 'bold' : 'normal'
          }}>
            ⏱️ Tempo: {scoreManager.timeRemaining}s
          </div>
          <div>👾 Inimigos: {scoreManager.enemiesKilled}</div>  
        </div>

        {/* Vidas dos Jogadores */}
        <div>
          {healths.map((p) => (
            <div 
              key={p.id}
              style={{
                opacity: p.isDead ? 0.5 : 1,
                color: scoreManager.lastDamagedPlayer === p.id ? '#ff4444' : '#ffd700'
              }}
            >
              Jogador {p.id + 1}: ❤️ {p.health}
            </div>
          ))}
        </div>

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
          {/* ✅ ADICIONAR: Partículas */}
          {particles.map((p) => (
            <Particle key={p.id} x={p.x} y={p.y} id={p.id} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default GameView;