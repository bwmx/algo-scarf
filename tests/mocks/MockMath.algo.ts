import { Contract, uint64 } from '@algorandfoundation/algorand-typescript'
import { Math } from '../../src/index.algo'

/**
 * A Mock contract that uses the methods in the `Math` library
 */
export class MockMath extends Contract {
  public testMaxUint64(a: uint64, b: uint64): uint64 {
    return Math.maxUint64(a, b)
  }

  public testMinUint64(a: uint64, b: uint64): uint64 {
    return Math.minUint64(a, b)
  }
}
