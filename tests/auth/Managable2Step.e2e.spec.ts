import { Config } from '@algorandfoundation/algokit-utils'
import { registerDebugEventHandlers } from '@algorandfoundation/algokit-utils-debug'
import { algorandFixture } from '@algorandfoundation/algokit-utils/testing'
import { Address } from 'algosdk'

import { beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { ERROR_ONLY_MANAGER, ERROR_ONLY_PENDING_MANAGER } from '../../src/index.algo.d'
import { MockManagable2StepFactory } from '../mocks/artifacts/MockManagable2StepClient'
import { getEventFromLog } from '../test-utils'

describe('Managable2Step contract', () => {
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
    const factory = localnet.algorand.client.getTypedAppFactory(MockManagable2StepFactory, {
      defaultSender: account,
    })

    const { appClient } = await factory.deploy({
      onUpdate: 'append',
      onSchemaBreak: 'append',
    })

    return { client: appClient }
  }

  it('initial manager is deployer and pendingManager is undefined', async () => {
    const { testAccount } = localnet.context
    const { client } = await deploy(testAccount)

    const { manager, pendingManager } = await client.state.global.getAll()

    expect(manager).toEqual(testAccount.toString())
    expect(pendingManager).toBeUndefined()
  })

  it('should propose new manager', async () => {
    // Test proposing a new manager
    const { testAccount, generateAccount } = localnet.context
    const { client } = await deploy(testAccount)

    const newManager = await generateAccount({ initialFunds: (1).algos() })

    // Propose a new manager
    const r = await client.send.updateManager({ args: { newManager: newManager.toString() } })

    // get pending manager from global state
    const pendingManager = await client.state.global.pendingManager()
    // should match proposed new manager
    expect(pendingManager).toEqual(newManager.toString())

    // should have 1 log, fron the ManagerRequested event
    expect(r.confirmation.logs).toBeDefined()
    expect(r.confirmation.logs?.length).toBe(1)

    // check event emitted
    const event = getEventFromLog<{ previousManager: string; newManager: string }>(
      'ManagerRequested(address,address)',
      r.confirmation.logs![0],
      ['previousManager', 'newManager'],
    )

    // should match what we expect
    expect(event.previousManager).toEqual(testAccount.toString())
    expect(event.newManager).toEqual(newManager.toString())
  })

  it('should accept manager proposal', async () => {
    // Test accepting the manager proposal
    const { testAccount, generateAccount } = localnet.context
    const { client } = await deploy(testAccount)

    const newManager = await generateAccount({ initialFunds: (1).algos() })

    // Propose a new manager
    await client.send.updateManager({ args: { newManager: newManager.toString() } })

    // have the newManager accept it
    const retAccept = await client.send.acceptManager({
      sender: newManager,
      args: [],
    })

    // check global state now matches the newManager
    const { manager, pendingManager } = await client.state.global.getAll()
    // should match as expected
    expect(manager).toEqual(newManager.toString())
    expect(pendingManager).toBeUndefined()

    // get ManagerUpdated event from logs
    const event = getEventFromLog<{ previousManager: string; newManager: string }>(
      'ManagerUpdated(address,address)',
      retAccept.confirmation.logs![0],
      ['previousManager', 'newManager'],
    )

    // should match what we expect
    expect(event.previousManager).toEqual(testAccount.toString())
    expect(event.newManager).toEqual(newManager.toString())
  })

  it('should reject unauthorized manager proposal', async () => {
    // Test rejecting proposal from non-manager
    const { testAccount, generateAccount } = localnet.context
    const { client } = await deploy(testAccount)

    const anotherAccount = await generateAccount({ initialFunds: (1).algos() })

    // should throw when calling updateManager from anotherAccount (not current manager)
    await expect(
      client.send.updateManager({
        sender: anotherAccount,
        args: { newManager: anotherAccount.toString() },
        suppressLog: true,
      }),
    ).rejects.toThrowError(ERROR_ONLY_MANAGER)
  })

  it('should reject acceptance from non-proposed manager', async () => {
    // Test rejecting acceptance from wrong account
    const { testAccount, generateAccount } = localnet.context
    const { client } = await deploy(testAccount)

    const anotherAccount = await generateAccount({ initialFunds: (1).algos() })

    // Propose a new manager
    await client.send.updateManager({ args: { newManager: anotherAccount.toString() } })

    // create another account that is not the proposed manager
    const unapprovedAccount = await generateAccount({ initialFunds: (1).algos() })

    // should throw when calling acceptManager from unapprovedAccount
    await expect(
      client.send.acceptManager({
        sender: unapprovedAccount,
        args: [],
        suppressLog: true,
      }),
    ).rejects.toThrowError(ERROR_ONLY_PENDING_MANAGER)
  })
})
