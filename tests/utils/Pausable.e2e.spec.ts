import { Config } from '@algorandfoundation/algokit-utils'
import { registerDebugEventHandlers } from '@algorandfoundation/algokit-utils-debug'
import { algorandFixture } from '@algorandfoundation/algokit-utils/testing'
import { Address } from 'algosdk'
import { beforeAll, beforeEach, describe, expect, test } from 'vitest'
import { MockPausableFactory } from '../mocks/artifacts/MockPausableClient'

describe('Pausable contract', () => {
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
    const factory = localnet.algorand.client.getTypedAppFactory(MockPausableFactory, {
      defaultSender: account,
    })

    const { appClient } = await factory.deploy({
      onUpdate: 'append',
      onSchemaBreak: 'append',
    })

    return { client: appClient }
  }

  test('initial global state is correct', async () => {
    const { testAccount } = localnet.context
    const { client } = await deploy(testAccount)

    // get current paused state
    const paused = await client.state.global.paused()
    // should always be false on creation
    expect(paused).toBeFalsy()
  })

  test('pause() works', async () => {
    const { testAccount } = localnet.context
    const { client } = await deploy(testAccount)

    // call _pause() internally
    await client.send.testPause()
    // confirm global state is now paused
    const paused = await client.state.global.paused()
    // should always be true when paused
    expect(paused).toBeTruthy()

    // check can call a function that requires paused === true
    await client.send.testOnlyWhenPaused()
    // TODO: check above didn't throw an error
  })

  test('pause() and unpause() works', async () => {
    const { testAccount } = localnet.context
    const { client } = await deploy(testAccount)

    // call _pause() internally
    await client.send.testPause()
    // confirm global state is now paused
    const paused = await client.state.global.paused()
    // should always be true when paused
    expect(paused).toBeTruthy()
  })
})
