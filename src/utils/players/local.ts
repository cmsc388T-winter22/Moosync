import { Player } from './player'
export class LocalPlayer extends Player {
  playerInstance: ExtendedHtmlAudioElement

  constructor(playerInstance: ExtendedHtmlAudioElement) {
    super()
    this.playerInstance = playerInstance
    this.playerInstance.load()
  }

  load(src?: string): void {
    if (src) this.playerInstance.src = 'media://' + src
  }

  async play(): Promise<void> {
    return this.playerInstance.play()
  }

  pause(): void {
    return this.playerInstance.pause()
  }

  stop(): void {
    this.playerInstance.srcObject = null
  }

  get currentTime(): number {
    return this.playerInstance.currentTime
  }

  set currentTime(time: number) {
    this.playerInstance.currentTime = time
  }

  get volume(): number {
    return this.playerInstance.volume * 100
  }

  set volume(volume: number) {
    this.playerInstance.volume = volume / 100
  }

  protected listenOnEnded(): void {
    this.playerInstance.onended = () => (this.onEndedCallback ? this.onEndedCallback() : null)
  }

  protected listenOnTimeUpdate(): void {
    this.playerInstance.ontimeupdate = (e) =>
      this.onTimeUpdateCallback ? this.onTimeUpdateCallback((e.currentTarget as HTMLAudioElement).currentTime) : null
  }
}
