
import { Howl } from 'howler';


  const explosao = new Howl({src: ['/explosion.mp3'], volume: 0.5})
  const bomba = new Howl({src: ['/bomb.mp3'], volume: 0.4})
  const dano = new Howl({src: ['/damage.mp3'], volume: 1})
  const musica = new Howl({src: ['/music.mp3'], volume: 0.3, loop: true})

export const SoundManager = {
  explosion: () => explosao.play(),
  bomb: () => bomba.play(),
  damage: () => dano.play(),
  bgm: () => musica.play(),

  stopBGM: () => musica.stop(),
  
};



