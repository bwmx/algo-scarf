import { AlgorandClient, Config } from '@algorandfoundation/algokit-utils'
import { registerDebugEventHandlers } from '@algorandfoundation/algokit-utils-debug'
import { algorandFixture } from '@algorandfoundation/algokit-utils/testing'
import { Address } from 'algosdk'
import { beforeAll, beforeEach, describe, expect, test } from 'vitest'
import { MockMerkleProofFactory } from '../mocks/artifacts/MockMerkleProofClient'

import { MerkleTree } from 'merkletreejs'
import crypto from 'node:crypto'

/**
 * Sha256 hash function
 * @param data data to be hashed
 * @returns sha256 hash of the data
 */
const sha256Hash = (data: Buffer) => {
  return crypto.hash('sha256', data)
}

type MerkleTestAccount = {
  address: string
  hash: string
}

const getRandomMerkleTestAccount = (algorand: AlgorandClient): MerkleTestAccount => {
  const acc = algorand.account.random()
  return { address: acc.toString(), hash: sha256Hash(Buffer.from(acc.toString())) }
}

describe('MerkleProof library', () => {
  const localnet = algorandFixture()
  beforeAll(() => {
    Config.configure({
      debug: true,
      // traceAll: true,
    })
    registerDebugEventHandlers()
  })
  beforeEach(localnet.newScope)

  const deploy = async (account: Address) => {
    const factory = localnet.algorand.client.getTypedAppFactory(MockMerkleProofFactory, {
      defaultSender: account,
    })

    const { appClient } = await factory.deploy({
      onUpdate: 'append',
      onSchemaBreak: 'append',
    })

    return { client: appClient }
  }

  test('can verify 1 entry exists in single item tree', async () => {
    const { testAccount } = localnet.context
    const { client } = await deploy(testAccount)
    // create new test pair (dummy account that won't be used and it's hash)
    const testMerkleAccount = getRandomMerkleTestAccount(localnet.algorand)
    // create a merkle tree with the test account
    const tree = new MerkleTree(
      [testMerkleAccount.hash], // all the hashed leaves
      sha256Hash,
      { sortPairs: true },
    )
    // get the root
    const root = tree.getRoot()
    // set the root in contract global state
    await client.send.setMerkleRoot({ args: { merkleRoot: root } })
    // get the merkle proof for the test account
    const proof = tree.getProof(testMerkleAccount.hash)
    // attempt to verify on-chain
    const result = await client.send.testMerkleProofVerify({
      args: { proof: proof.map((p) => p.data), leaf: Buffer.from(testMerkleAccount.hash, 'hex') },
      suppressLog: true,
    })
    // should always be true as the `testAccount.hash` is in the merkle tree
    expect(result.return).toBe(true)
  })

  test('can verify multiple entries exist in multi-item tree', async () => {
    const { testAccount } = localnet.context
    const { client } = await deploy(testAccount)

    // create multiple test accounts
    const testMerkleAccounts: MerkleTestAccount[] = []
    for (let i = 0; i < 10; i++) {
      testMerkleAccounts.push(getRandomMerkleTestAccount(localnet.algorand))
    }
    // create a merkle tree with the test accounts
    const tree = new MerkleTree(
      testMerkleAccounts.map((a) => a.hash), // all the hashed leaves
      sha256Hash,
      { sortPairs: true },
    )
    // get the root
    const root = tree.getRoot()
    // set the root in contract global state
    await client.send.setMerkleRoot({ args: { merkleRoot: root } })
    // verify each account exists on-chain
    for (const testMerkleAccount of testMerkleAccounts) {
      // get the merkle proof for the test account
      const proof = tree.getProof(testMerkleAccount.hash)
      // attempt to verify on-chain
      const result = await client.send.testMerkleProofVerify({
        args: { proof: proof.map((p) => p.data), leaf: Buffer.from(testMerkleAccount.hash, 'hex') },
        suppressLog: true,
      })
      // should always be true as the `testAccount.hash` exists in the merkle tree
      expect(result.return).toBe(true)
    }
  })

  test('fails to verify non-existent entry in multi-item tree', async () => {
    const { testAccount } = localnet.context
    const { client } = await deploy(testAccount)

    // create multiple test accounts
    const testMerkleAccounts: MerkleTestAccount[] = []
    for (let i = 0; i < 10; i++) {
      testMerkleAccounts.push(getRandomMerkleTestAccount(localnet.algorand))
    }
    // create a merkle tree with the test accounts
    const tree = new MerkleTree(
      testMerkleAccounts.map((a) => a.hash), // all the hashed leaves
      sha256Hash,
      { sortPairs: true },
    )
    // get the root
    const root = tree.getRoot()
    // set the root in contract global state
    await client.send.setMerkleRoot({ args: { merkleRoot: root } })
    // create a random test account that is NOT in the tree
    const nonExistentTestAccount = getRandomMerkleTestAccount(localnet.algorand)
    // get the merkle proof for the non-existent test account (should be empty)
    const proof = tree.getProof(nonExistentTestAccount.hash)
    // attempt to verify on-chain
    const result = await client.send.testMerkleProofVerify({
      args: { proof: proof.map((p) => p.data), leaf: Buffer.from(nonExistentTestAccount.hash, 'hex') },
      suppressLog: true,
    })
    // should always be false as the `nonExistentTestAccount.hash` does NOT exist in the merkle tree
    expect(result.return).toBe(false)
  })
})
