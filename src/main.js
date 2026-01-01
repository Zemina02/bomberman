import { useState, useEffect } from "react";
import GameView from "./GameView/GameView";
import "./App.css";

function Main() {
  const [gameState, setGameState] = useState("menu"); // "menu", "playing" ou "gameOver"
  const [selectedMap, setSelectedMap] = useState(1);
  const [numPlayers, setNumPlayers] = useState(1);

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
          <h1>🎮 BOMBERMAN 🎮</h1>
          
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

  // ===== JOGO EM ANDAMENTO =====
  if (gameState === "playing") {
    return (
      <GameView
        mapid={selectedMap}
        numPlayers={numPlayers}
        onGameOver={() => setGameState("gameOver")}
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