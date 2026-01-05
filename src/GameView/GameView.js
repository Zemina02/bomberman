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


import { TimeUpScreen } from "../TimeUp/TimeUpScreen.js";
import { TwoPlayerVictoryScreen } from "../TwoPlayers/TwoPlayerVictoryScreen.js";

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
  const [playerResetKey, setPlayerResetKey] = useState(0);
  const players = usePlayer(map, numPlayers, playerResetKey);
  const [enemy, setEnemy] = useEnemy(map, players, bombs);
  // CORRIGIDO: Adiciona resetHealth ao destructuring
  const { healths, takeDamage, isGameOver, flashEffect, lastDamagedPlayer, deadPlayers, resetHealth } = useHealth(numPlayers, 3);
  
  const [explosions, setExplosions] = useState([]);
  const playersRef = useRef(players);
  const lastEnemyDamageRef = useRef({});
  const resetTrackerRef = useRef({});
  const twoPlayerGameOverRef = useRef(false); //  NOVO: Track para 2 jogadores

  const difficulty = DIFFICULTY_SETTINGS[mapid];
  const scoreManager = useScore(mapid, difficulty.timeLimit);
  const { particles, createExplosion } = useParticles();
  const [showVictory, setShowVictory] = useState(false);
  const [levelComplete, setLevelComplete] = useState(false);
  const [gameState, setGameState] = useState("playing");
  const [blockVictory, setBlockVictory] = useState(false);
  
  useEffect(() => {
  SoundManager.bgm();
  return () => {
    SoundManager.stopBGM();
  };
  }, [mapid]); 
  
  useEffect(() => {
    playersRef.current = players;
  }, [players]);

  // NOVO: Quando mapid muda (próximo nível), reseta o gameState e tudo
  useEffect(() => {
    setGameState("playing");
    setShowVictory(false);
    setLevelComplete(false);
    resetHealth();
    setPlayerResetKey(prev => prev + 1);
    resetTrackerRef.current = {};
    twoPlayerGameOverRef.current = false; // Reset também
  }, [mapid, resetHealth]);

  // NOVO: Game Over em MODO 2 JOGADORES - Quando um jogador morre
  useEffect(() => {
    if (numPlayers === 2 && gameState === "playing") {
      setGameState("gameover")
      // Verifica se algum jogador morreu (deadPlayers tem conteúdo)
      if (deadPlayers.length > 0 && !twoPlayerGameOverRef.current) {
        // Um jogador morreu!
        twoPlayerGameOverRef.current = true;
        
        // Determina qual jogador sobreviveu
        const survivor = healths.find((p) => !p.isDead);
        
        if (survivor) {
          console.log(`🏆 Jogador ${survivor.id + 1} ganhou!`);
          // Passa o vencedor para main.js
          onGameOver(scoreManager.score, null, `player${survivor.id + 1}`);
        } else {
          // Ambos mortos ao mesmo tempo (improvável)
          onGameOver(scoreManager.score, null, "tie");
        }
      }
    }
  }, [numPlayers, gameState, deadPlayers, healths, onGameOver, scoreManager.score]);

  // Game Over em MODO 1 JOGADOR - Quando o jogador morre
  useEffect(() => {
    if (numPlayers === 1 && isGameOver && onGameOver) {
      setGameState("gameover")
      console.log("🎮 Game Over acionado! (1 jogador)");
      onGameOver(scoreManager.score);
    }
  }, [isGameOver, onGameOver, numPlayers, scoreManager.score]);

  useEffect(() => {
    if (isGameOver || showVictory || gameState !== "playing") return;

    const timer = setInterval(() => {
      scoreManager.incrementTime();
    }, 1000);

    return () => clearInterval(timer);
  }, [isGameOver, showVictory, gameState]);

  // Verificar se tempo acabou
  useEffect(() => {
    if (scoreManager.isTimeUp && gameState === "playing") {
      // Tempo esgotou
      if (numPlayers === 1) {
        // 1 jogador: mostrar Time Up
        setGameState("timeup");
      } else {
        // 2 jogadores: mostrar resultado
        setGameState("twoplayer");
      }
    }
  }, [scoreManager.isTimeUp, gameState, numPlayers]);

  // COLISÃO: Inimigo toca jogador
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

  // VITÓRIA COM DELAY
  useEffect(() => {
    if (!enemy && players.length > 0 && !levelComplete && gameState === "playing" && !blockVictory) {
      const hasAlivePlayers = healths.some(h => !h.isDead);
      
      if (hasAlivePlayers) {
        console.log("🎉 VITÓRIA! Aguardando para mostrar ecrã...");
        
        setTimeout(() => {
          setLevelComplete(true);
          setShowVictory(true);
          setGameState("victory");
        }, 800);
      }
    }
  }, [enemy, players, levelComplete, healths, gameState, blockVictory]);

  // ENTRADA: Colocar bombas
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
      resetTrackerRef.current = {};
    });
  }, [mapid]);

  // RESET DO MAPA - COM TRACKING PARA EVITAR DUPLICADOS
  useEffect(() => {
    if (gameState === "playing" && levelComplete === false && map.length > 0) {
      if (resetTrackerRef.current[mapid]) {
        return;
      }

      ReadMaps(mapid).then((newMap) => {
        console.log("Resetando mapa, players e inimigo...");
        
        setBlockVictory(true);
        setExplosions([]);
        setBombs([]);
        setMap(newMap);
        setEnemy(null);
        
        resetTrackerRef.current[mapid] = true;
        
        setTimeout(() => {
          setBlockVictory(false);
        }, 1000);
      });
    }
  }, [gameState, mapid]);

  // ECRÃ DE TEMPO ESGOTADO (1 jogador)
  if (gameState === "timeup" && numPlayers === 1) {
    return (
      <div className="stage">
        <TimeUpScreen
          score={scoreManager.score}
          onRetry={() => {
            console.log("🔄 Tentando novamente...");
            setGameState("playing");
            setShowVictory(false);
            setLevelComplete(false);
            scoreManager.resetForNewLevel(mapid, difficulty.timeLimit);
            resetTrackerRef.current[mapid] = false;
            resetHealth();
            setPlayerResetKey(prev => prev + 1);
          }}
          onMainMenu={() => {
            onGameOver(scoreManager.score);
          }}
        />
      </div>
    );
  }

  // ECRÃ PARA 2 JOGADORES (Empate/Vitória)
  if (gameState === "twoplayer" && numPlayers === 2) {
    let result = "tie";
    
    if (scoreManager.enemiesKilled > 0) {
      result = "tie";
    }
    
    return (
      <div className="stage">
        <TwoPlayerVictoryScreen
          score={scoreManager.score}
          result={result}
          onMainMenu={() => {
            onGameOver(scoreManager.score);
          }}
        />
      </div>
    );
  }

  // ECRÃ DE VITÓRIA (1 jogador)
  if (showVictory && levelComplete && numPlayers === 1 && gameState === "victory") {
    return (
      <div className="stage">
        <VictoryScreen
          level={scoreManager.level}
          score={scoreManager.score}
          timeRemaining={scoreManager.timeRemaining}
          enemiesKilled={scoreManager.enemiesKilled}
          onNextLevel={() => {
            console.log(`Próximo nível: ${scoreManager.level + 1}`);
            onGameOver(scoreManager.score, scoreManager.level + 1);
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
      <div className={`hud ${flashEffect ? 'flash-damage' : ''}`}>
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
                color: lastDamagedPlayer === p.id ? '#ff4444' : '#ffd700'
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
          {/* Partículas */}
          {particles.map((p) => (
            <Particle key={p.id} x={p.x} y={p.y} id={p.id} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default GameView;
