
import { Howl } from 'howler';

export const SoundManager = {
  explosion: () => new Howl({src: ['/explosion.mp3'], volume: 0.5}).play(),
  bomb: () => new Howl({src: ['/bomb.mp3'], volume: 0.4}).play(),
  damage: () => new Howl({src: ['/damage.mp3'], volume: 0.6}).play(),
  bgm: () => new Howl({src: ['/music.mp3'], volume: 0.3, loop: true}).play(),
};