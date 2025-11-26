import { Managable2Step } from '../../src/index.algo'

export class MockManagable2Step extends Managable2Step {
  constructor() {
    super()
  }

  public testOnlyManager(): void {
    this.onlyManager()
  }
}
