import { Config } from '@algorandfoundation/algokit-utils'
import { registerDebugEventHandlers } from '@algorandfoundation/algokit-utils-debug'
import { algorandFixture } from '@algorandfoundation/algokit-utils/testing'
import { Address } from 'algosdk'
import { beforeAll, beforeEach, describe, expect, test } from 'vitest'
import { MockRandomFactory } from './mocks/artifacts/MockRandomClient'

const INITIAL_XORSHIFT_SEED = 13371337n

describe('Random library', () => {
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
    const factory = localnet.algorand.client.getTypedAppFactory(MockRandomFactory, {
      defaultSender: account,
    })

    const { appClient } = await factory.deploy({
      onUpdate: 'append',
      onSchemaBreak: 'append',
    })

    return { client: appClient }
  }

  test('xorShiftUint64() outputs pseudorandom numbers', async () => {
    const { testAccount } = localnet.context
    const { client } = await deploy(testAccount)

    const amount = 5
    // set initial seed
    let seed = INITIAL_XORSHIFT_SEED
    // generate `amount` random numbers
    for (let i = 0; i < amount; i++) {
      const { return: r } = await client.send.testXorShift64({ args: [seed], suppressLog: true })
      expect(r).toBeDefined()
      console.log(r)
      // update the seed for the next iteration
      seed = r!
    }
  })
})
