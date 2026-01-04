import "./TwoPlayerVictoryScreen.css";

export function TwoPlayerVictoryScreen({ 
  score,
  result, // "player1", "player2", ou "tie"
  onMainMenu
}) {
  const isPlayer1Win = result === "player1";
  const isPlayer2Win = result === "player2";
  const isTie = result === "tie";

  return (
    <div className="two-player-container">
      <div className="two-player-box">
        {isTie ? (
          <>
            <h1 className="two-player-title">🤝 EMPATE! 🤝</h1>
            <p className="two-player-subtitle">
              Ambos os jogadores tinham tempo igual!
            </p>
          </>
        ) : isPlayer1Win ? (
          <>
            <h1 className="two-player-title">🏆 JOGADOR 1 VENCEU! 🏆</h1>
            <p className="two-player-subtitle">
              Parabéns, Jogador 1!
            </p>
          </>
        ) : (
          <>
            <h1 className="two-player-title">🏆 JOGADOR 2 VENCEU! 🏆</h1>
            <p className="two-player-subtitle">
              Parabéns, Jogador 2!
            </p>
          </>
        )}

        <div className="two-player-stats">
          <div className="stat-item">
            <span className="stat-label">⭐ Pontuação Total:</span>
            <span className="stat-value">{score}</span>
          </div>
        </div>

        <div className="two-player-buttons">
          <button 
            className="btn btn-main-menu"
            onClick={onMainMenu}
          >
            🏠 Menu Principal
          </button>
        </div>
      </div>
    </div>
  );
}