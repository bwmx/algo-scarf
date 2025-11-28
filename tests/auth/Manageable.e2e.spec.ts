import { Config } from '@algorandfoundation/algokit-utils'
import { registerDebugEventHandlers } from '@algorandfoundation/algokit-utils-debug'
import { algorandFixture } from '@algorandfoundation/algokit-utils/testing'
import { Address, ALGORAND_ZERO_ADDRESS_STRING } from 'algosdk'
import { beforeAll, beforeEach, describe, expect, test } from 'vitest'
import { MockManagableClient, MockManagableFactory } from '../mocks/artifacts/MockManagableClient'
import { getEventFromLog } from '../test-utils'

describe('Managable contract', () => {
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
    const factory = localnet.algorand.client.getTypedAppFactory(MockManagableFactory, {
      defaultSender: account,
    })

    const { appClient } = await factory.deploy({
      onUpdate: 'append',
      onSchemaBreak: 'append',
    })

    return { client: appClient }
  }

  test('initial manager is deployer', async () => {
    const { testAccount } = localnet.context
    const { client } = await deploy(testAccount)

    // TODO: check the event was emitted algo

    // get current manager from global state
    const manager = await client.state.global.manager()
    // the manager should be the testAccount that deployed
    expect(manager).toEqual(testAccount.toString())
  })

  test('updateManager() works', async () => {
    const { testAccount, generateAccount } = localnet.context
    const { client } = await deploy(testAccount)

    // create new account to change manager to
    const anotherAccount = await generateAccount({ initialFunds: (1).algos() })
    // try to update manager from non-manager account
    const { confirmation } = await client.send.updateManager({ args: { newManager: anotherAccount.toString() } })
    // should have emitted event
    expect(confirmation.logs).toBeDefined()
    // get first txns logs, first pos
    const rawLog = confirmation.logs![0]

    const { previousManager, newManager } = getEventFromLog<{ previousManager: string; newManager: string }>(
      'ManagerUpdated(address,address)',
      rawLog,
      ['previousManager', 'newManager'],
    )

    // check that previous manager is testAccount (in event)
    expect(previousManager).toEqual(testAccount.toString())
    // check that new manager is anotherAccount (in event)
    expect(newManager).toEqual(anotherAccount.toString())
    // get current manager from global state
    const afterManager = await client.state.global.manager()
    // the manager after update should be the new account
    expect(afterManager).toEqual(anotherAccount.toString())
  })

  test('deleteManager() works', async () => {
    const { testAccount } = localnet.context
    const { client } = await deploy(testAccount)

    // delete the manager
    const { confirmation } = await client.send.deleteManager()
    // should have emitted event
    expect(confirmation.logs).toBeDefined()
    // get first txns logs, first pos
    const rawLog = confirmation.logs![0]
    // convert raw log to event data
    const { previousManager, newManager } = getEventFromLog<{ previousManager: string; newManager: string }>(
      'ManagerUpdated(address,address)',
      rawLog,
      ['previousManager', 'newManager'],
    )
    // check that previous manager is testAccount (in event)
    expect(previousManager).toEqual(testAccount.toString())
    // check that new manager is anotherAccount (in event)
    expect(newManager).toEqual(ALGORAND_ZERO_ADDRESS_STRING)
    // get current manager from global state
    const manager = await client.state.global.manager()
    // the manager should zero address (therefore no longer managable)
    expect(manager).toEqual(ALGORAND_ZERO_ADDRESS_STRING)
  })

  test('onlyManager() restriction works', async () => {
    const { testAccount, generateAccount, algorand } = localnet.context
    const { client } = await deploy(testAccount)

    // manager should always be able to call this
    await client.send.testOnlyManager()

    // create new account to try to call onlyManager function
    const anotherAccount = await generateAccount({ initialFunds: (1).algos() })

    const nonManagerClient = new MockManagableClient({
      appId: client.appId,
      defaultSigner: anotherAccount.signer,
      defaultSender: anotherAccount.addr,
      algorand: algorand,
    })

    // should throw error when non-manager tries to call
    await expect(nonManagerClient.send.testOnlyManager()).rejects.toThrowError()
  })
})
