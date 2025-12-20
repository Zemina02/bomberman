import { useState } from "react";
import GameView from "../GameView/GameView.js";


function Options({ value, onClick}) {
  return (
    <button className="escolhas" onClick={onClick}>
      {value}
    </button>
  );
}


function Maps({onClick , opcao}) {
  if (opcao === 1) {
  return (
    <button className="mapasButton" onClick={onClick}>
      <img src="/nivel_Facil.png" alt="Mapa Fácil" />
    </button>
  );}
  else if (opcao === 2) {
    return (
      <button className="mapasButton" onClick={onClick}>
        <img src="/nivel_Medio.png" alt="Mapa Médio" />
      </button>
    );}
    else if (opcao === 3) {
      return (
        <button className="mapasButton" onClick={onClick}>
          <img src="/nivel_Dificil.png" alt="Mapa Difícil" />
        </button>
      );}
}


export default function Menu() {

  const [isMenuListVisible, setIsMenuListVisible] = useState(true);
  const [isPlayersListVisible, setIsPlayersListVisible] = useState(false);
  const [isMapsVisible, setIsMapsVisible] = useState(false);
  const [isGameVisible, setIsGameVisible] = useState(false);


  function handleClick(action) 
  {
    if (action === "Jogar")
    {
      setIsMenuListVisible(false);
      setIsPlayersListVisible(true);
    }
    else if (action === "Sair")
    {
        alert("A sair do jogo...");
    }
    else if (action === "1 jogadores")
    {
      setIsPlayersListVisible(false);
      setIsMapsVisible(true);
    }
     else if (action === "Voltar")
    {
      if(isMapsVisible)
        {
          setIsMapsVisible(false);
          setIsPlayersListVisible(true);
        }

      else if(isPlayersListVisible)
        {
          setIsPlayersListVisible(false);
          setIsMenuListVisible(true);
        }
    }
    else if (action === "Iniciar")
    {
      setIsMapsVisible(false);
      setIsGameVisible(true);
    }
  }

  return( 
  <>
      {isMenuListVisible && (
        <ul className="caixaescolhas">
            <li><Options value="Jogar" onClick={() => handleClick("Jogar")} /></li>
            <li><Options value="Sair" onClick={() => handleClick("Sair")} /></li>
        </ul>
      )}

      {isPlayersListVisible && (
            <ul className="lista-jogadores">
                <li><Options value="1 jogadores" onClick={() => handleClick("1 jogadores")}/></li>
                <li><Options value="Voltar" onClick={() => handleClick("Voltar")} /></li>
            </ul>
      )}

      {isMapsVisible && (
        <>
            <ul className="MapasRow">
                <b><Maps opcao= {1} onClick={() => handleClick("Iniciar")}/></b>
                <b><Maps opcao= {2} onClick={() => handleClick("Iniciar")}/></b>
                <b><Maps opcao= {3} onClick={() => handleClick("Iniciar")}/></b>
            </ul>
            <ul className="caixaescolhas"><li><Options value="Voltar" onClick={() => handleClick("Voltar")} /></li></ul>
        </>
      )}
      {isGameVisible && (
        <>
            <GameView/>
        </>
      )}
  </>
  );
}

