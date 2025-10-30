import { assert, bytes, Contract, GlobalState } from '@algorandfoundation/algorand-typescript'
import { MerkleProof } from '../../src/index.algo'

/**
 * A Mock contract that uses the methods in the `MerkleProof` library
 */
export class MockMerkleProof extends Contract {
  /**
   * Merkle Root stored in global state for testing purposes
   */
  merkleRoot = GlobalState<bytes<32>>({ key: 'merkleRoot' })

  /**
   * Set the merkle root in global state
   * @param merkleRoot - the off-chain calculated merkle root
   */
  public setMerkleRoot(merkleRoot: bytes<32>): void {
    this.merkleRoot.value = merkleRoot
  }

  /**
   * ABI method to expose the underlying functionality
   */
  public testMerkleProofVerify(proof: bytes<32>[], leaf: bytes<32>): boolean {
    assert(this.merkleRoot.hasValue, 'Merkle root must be set')

    return MerkleProof.verify(proof, this.merkleRoot.value, leaf, 'sha256')
  }
}
