/**
 * Random Number Generator helpers
 */

import { uint64 } from '@algorandfoundation/algorand-typescript'

/**
 * XorShift64 RNG
 * @param seed Seed to use before shift
 * @returns Next psuedorandom generated number
 */
export function xorShiftUint64(seed: uint64): uint64 {
  let x: uint64 = seed

  x = x ^ (x << 13)
  x = x ^ (x >> 7)
  x = x ^ (x << 17)

  return x
}
