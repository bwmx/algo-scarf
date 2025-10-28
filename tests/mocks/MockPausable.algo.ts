import { Pausable } from '../../src/index.algo'

export class MockPausable extends Pausable {
  constructor() {
    super()
  }

  public testPause(): void {
    this._pause()
  }

  public testUnpause(): void {
    this._unpause()
  }

  public testOnlyWhenNotPaused(): void {
    this.whenNotPaused()
  }

  public testOnlyWhenPaused(): void {
    this.whenPaused()
  }
}
