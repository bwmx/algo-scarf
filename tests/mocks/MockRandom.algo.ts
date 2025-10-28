import { Contract, uint64 } from '@algorandfoundation/algorand-typescript'
import { Random } from '../../src/index.algo'

/**
 * A Mock contract that uses the methods in the `RNG` library
 */
export class MockRandom extends Contract {
  public testXorShift64(seed: uint64): uint64 {
    return Random.xorShiftUint64(seed)
  }
}
