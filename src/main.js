import { useState, useEffect } from "react";
import GameView from "./GameView/GameView";
import { TwoPlayerVictoryScreen } from "./TwoPlayers/TwoPlayerVictoryScreen.js";
import "./App.css";

function Main() {
  const [gameState, setGameState] = useState("menu");
  const [selectedMap, setSelectedMap] = useState(1);
  const [numPlayers, setNumPlayers] = useState(1);
  const [winner, setWinner] = useState(null); // ✅ NOVO: Track do vencedor 2 jogadores

  // ✅ Game Over - Pressionar Enter para voltar ao menu
  useEffect(() => {
    if (gameState !== "gameOver") return;

    const handleKeyDown = (e) => {
      if (e.code === "Enter") {
        console.log("Voltando ao menu...");
        setGameState("menu");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [gameState]);

  // ===== MENU INICIAL =====
  if (gameState === "menu") {
    return (
      <div className="menu-container">
        <div className="menu">
          <h1>🎮 BOMBALOKA 🎮</h1>
          
          <div className="menu-section">
            <h2>Selecione o Nível:</h2>
            <div className="button-group">
              <button 
                className={selectedMap === 1 ? "active" : ""}
                onClick={() => setSelectedMap(1)}
              >
                Nível 1
              </button>
              <button 
                className={selectedMap === 2 ? "active" : ""}
                onClick={() => setSelectedMap(2)}
              >
                Nível 2
              </button>
              <button 
                className={selectedMap === 3 ? "active" : ""}
                onClick={() => setSelectedMap(3)}
              >
                Nível 3
              </button>
            </div>
          </div>

          <div className="menu-section">
            <h2>Número de Jogadores:</h2>
            <div className="button-group">
              <button 
                className={numPlayers === 1 ? "active" : ""}
                onClick={() => setNumPlayers(1)}
              >
                1 Jogador
              </button>
              <button 
                className={numPlayers === 2 ? "active" : ""}
                onClick={() => setNumPlayers(2)}
              >
                2 Jogadores
              </button>
            </div>
          </div>

          <button 
            className="start-button"
            onClick={() => setGameState("playing")}
          >
            COMEÇAR JOGO
          </button>
        </div>
      </div>
    );
  }

  // ===== 2 JOGADORES - VITÓRIA =====
  // ✅ NOVO: Ecrã especial para vitória em 2 jogadores
  if (gameState === "twoplayer-victory" && winner) {
    return (
      <div className="stage">
        <TwoPlayerVictoryScreen
          score={0}  // Não há score em modo 2 jogadores
          result={winner}  // "player1" ou "player2"
          onMainMenu={() => {
            setGameState("menu");
            setWinner(null);
          }}
        />
      </div>
    );
  }

  // ===== JOGO EM ANDAMENTO =====
  if (gameState === "playing") {
    return (
      <GameView
        mapid={selectedMap}
        numPlayers={numPlayers}
        onGameOver={(score, nextMapId, playerWinner) => {
          // ✅ NOVO: Se é 2 jogadores e tem vencedor
          if (playerWinner && (playerWinner === "player1" || playerWinner === "player2")) {
            console.log(`🏆 ${playerWinner} venceu!`);
            setWinner(playerWinner);
            setGameState("twoplayer-victory");
          } 
          // Próximo nível
          else if (nextMapId && nextMapId <= 3) {
            console.log(`Passando para nível ${nextMapId}...`);
            setSelectedMap(nextMapId);
          } 
          // Game Over (1 jogador perdeu todas as vidas)
          else {
            console.log("Voltando ao menu...");
            setGameState("gameOver");
          }
        }}
      />
    );
  }

  // ===== GAME OVER =====
  if (gameState === "gameOver") {
    return (
      <div className="gameover-container">
        <div className="gameover">
          <h1>💀 GAME OVER 💀</h1>
          <p>Perdeste todas as vidas!</p>
          <p className="hint">Pressiona ENTER para voltar ao menu</p>
        </div>
      </div>
    );
  }
}

export default Main;