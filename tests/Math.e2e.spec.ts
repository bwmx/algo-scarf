import { Config } from '@algorandfoundation/algokit-utils'
import { registerDebugEventHandlers } from '@algorandfoundation/algokit-utils-debug'
import { algorandFixture } from '@algorandfoundation/algokit-utils/testing'
import { Address } from 'algosdk'
import { beforeAll, beforeEach, describe, expect, test } from 'vitest'
import { MockMathFactory } from './mocks/artifacts/MockMathClient'

describe('Math library', () => {
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
    const factory = localnet.algorand.client.getTypedAppFactory(MockMathFactory, {
      defaultSender: account,
    })

    const { appClient } = await factory.deploy({
      onUpdate: 'append',
      onSchemaBreak: 'append',
    })

    return { client: appClient }
  }

  test('minUint64() works', async () => {
    const { testAccount } = localnet.context
    const { client } = await deploy(testAccount)

    const r = await client.send.testMinUint64({ args: { a: 0, b: 1337 } })
    // should be 0, the smallest of the numbers
    expect(r.return).toBe(0n)
  })

  test('maxUint64() works', async () => {
    const { testAccount } = localnet.context
    const { client } = await deploy(testAccount)

    const r = await client.send.testMaxUint64({ args: { a: 0, b: 1337 } })
    // should be 0, the smallest of the numbers
    expect(r.return).toBe(1337n)
  })
})
