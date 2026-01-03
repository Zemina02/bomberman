import "./VictoryScreen.css";

export function VictoryScreen({ 
  level, 
  score, 
  timeRemaining, 
  enemiesKilled,
  onNextLevel, 
  onMainMenu 
}) {
  const isLastLevel = level >= 3;

  return (
    <div className="victory-container">
      <div className="victory-box">
        <h1 className="victory-title">🎉 VITÓRIA! 🎉</h1>
        
        <p className="victory-subtitle">
          Completaste o Nível {level}!
        </p>

        <div className="victory-stats">
          <div className="stat-item">
            <span className="stat-label">⭐ Pontuação:</span>
            <span className="stat-value">{score}</span>
          </div>
          
          <div className="stat-item">
            <span className="stat-label">👾 Inimigos Eliminados:</span>
            <span className="stat-value">{enemiesKilled}</span>
          </div>
          
          <div className="stat-item">
            <span className="stat-label">⏱️ Tempo Restante:</span>
            <span className="stat-value">{timeRemaining}s</span>
          </div>

          {!isLastLevel && (
            <div className="stat-item">
              <span className="stat-label">🏆 Próximo Nível:</span>
              <span className="stat-value">{level + 1}</span>
            </div>
          )}
        </div>

        <div className="victory-message">
          {isLastLevel ? (
            <p>🏆 Parabéns! Completaste o jogo todo!</p>
          ) : (
            <p>Pronto para o próximo desafio?</p>
          )}
        </div>

        <div className="victory-buttons">
          {!isLastLevel && (
            <button 
              className="btn btn-primary"
              onClick={onNextLevel}
            >
              Próximo Nível →
            </button>
          )}
          
          <button 
            className="btn btn-secondary"
            onClick={onMainMenu}
          >
            {isLastLevel ? "Jogar Novamente" : "Menu Principal"}
          </button>
        </div>

        {isLastLevel && (
          <p className="hint-text">Pressiona ENTER ou clica no botão para ir ao menu</p>
        )}
      </div>
    </div>
  );
}