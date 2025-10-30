/**
 * Merkle Proof Utilities
 */

import { assert, BigUint, bytes, op, uint64 } from '@algorandfoundation/algorand-typescript'

/**
 * Errors
 */
export const ERROR_UNSUPPORTED_HASH_METHOD = 'MerkleProof: Unsupported hash method'

/**
 * Types
 */
export type MerkleHashMethod = 'sha256' | 'keccak256'

type bytes32 = bytes<32>

/**
 * Hash a pair using sha256
 * @returns sha256 hash of the sorted pair
 */
function _hashPairSha256(a: bytes32, b: bytes32): bytes32 {
  return BigUint(a) < BigUint(b) ? op.sha256(op.concat(a, b)) : op.sha256(op.concat(b, a))
}

/**
 * Hash a pair using keccak256
 * @returns keccak256 hash of the sorted pair
 */
function _hashPairKeccak256(a: bytes32, b: bytes32): bytes32 {
  return BigUint(a) < BigUint(b) ? op.keccak256(op.concat(a, b)) : op.keccak256(op.concat(b, a))
}

/**
 * Verify a Merkle Proof
 * @param proofs - Merkle Proofs
 * @param root - Root hash
 * @param leaf - Leaf to check
 * @param hashMethod - Hash method to use ('sha256' or 'keccak256')
 * @returns true if the leaf is contained within the merkle tree, false otherwise
 * @throws error if unsupported hash method is provided
 */
export function verify(proof: bytes32[], root: bytes32, leaf: bytes32, hashMethod: MerkleHashMethod): boolean {
  // halt execution and throw error if unsupported hash method
  assert(hashMethod === 'sha256' || hashMethod === 'keccak256', ERROR_UNSUPPORTED_HASH_METHOD)

  let computedHash = leaf

  for (let i: uint64 = 0; i < proof.length; i++) {
    if (hashMethod === 'sha256') {
      computedHash = _hashPairSha256(computedHash, proof[i])
    } else {
      computedHash = _hashPairKeccak256(computedHash, proof[i])
    }
  }

  return computedHash === root
}
