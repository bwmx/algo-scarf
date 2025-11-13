# [MerkleProof library](../../../src/lib/crypto/MerkleProof.algo.ts)

## Description

A small set of functions to allow a merkle tree to be verified on-chain. Modified and heavily inspired from OpenZeppelin see here: https://docs.openzeppelin.com/contracts/5.x/api/utils#MerkleProof

## Functions

### verify(proof, root, leaf, hashMethod)

Verify an item exists in a given merkle tree. `proof` is an array of `bytes32` proofs. `root` must be the root hash of the merkle tree. `leaf` must be the hash of the item to verify exists. `hashMethod` must either be `sha256` or `keccak256`.

Will return true if the item exists and can be verified within the merkle tree, otherwise false.

```typescript
function verify(proof: bytes32[], root: bytes32, leaf: bytes32, hashMethod: MerkleHashMethod): boolean
```

## Errors

If you pass a string other than `sha256` or `keccak256` to the `verify()` function this error will be thrown.

```typescript
export const ERROR_UNSUPPORTED_HASH_METHOD = 'MerkleProof: Unsupported hash method'
```

## Usage

See [MerkleProof.e2e.spec.ts](../../../tests/crypto/MerkleProof.e2e.spec.ts) for an example of using `merkletreejs` to generate a tree, then interact with a smart contract.

```typescript
import { assert, bytes, Contract, GlobalState } from '@algorandfoundation/algorand-typescript'
import * as AlgoScarf * from 'algo-scarf'

/**
 * A Mock contract that uses the methods in the `MerkleProof` library
 */
export class ExampleMerkleProofContract extends Contract {
  /**
   * Merkle Root stored in global state for testing purposes
   */
  merkleRoot = GlobalState<bytes<32>>({ key: 'merkleRoot' })

  /**
   * Set the merkle root in global state, this must be called first
   * @param merkleRoot - the off-chain calculated merkle root
   */
  public setMerkleRoot(merkleRoot: bytes<32>): void {
    this.merkleRoot.value = merkleRoot
  }

  /**
   * Call MerkleProof.verify() internally
   */
  public testMerkleProofVerify(proof: bytes<32>[], leaf: bytes<32>): boolean {
    assert(this.merkleRoot.hasValue, 'Merkle root must be set')

    return AlgoScarf.MerkleProof.verify(proof, this.merkleRoot.value, leaf, 'sha256')
  }
}
```
