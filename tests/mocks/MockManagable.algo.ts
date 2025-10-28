import { Managable } from '../../src/index.algo'

export class MockManagable extends Managable {
  constructor() {
    super()
  }

  public testOnlyManager(): void {
    this.onlyManager()
  }
}
