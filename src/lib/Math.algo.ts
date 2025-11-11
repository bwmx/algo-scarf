import { err, uint64 } from '@algorandfoundation/algorand-typescript'

/**
 * Wrapper to provide tealscript like functionality
 * TODO: not implemented yet
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function wideRatio(a: uint64[], b: uint64[]): void {
  err('not implemented')
}

/**
 * Get the min of two uint64 values
 * @param a 1st uint64 to check
 * @param b 2nd uint64 to check
 * @returns uint64 the minimum of the 2 values
 */
export function minUint64(a: uint64, b: uint64): uint64 {
  return a < b ? a : b
}

/**
 * Get the max of two uint64 values
 * @param a 1st uint64 to check
 * @param b 2nd uint64 to check
 * @returns uint64 the maximum of the 2 values
 */
export function maxUint64(a: uint64, b: uint64): uint64 {
  return a > b ? a : b
}
