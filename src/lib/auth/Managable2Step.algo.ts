import { Account, arc4, assert, emit, Global, GlobalState, Txn } from '@algorandfoundation/algorand-typescript'
import { ERROR_MUST_DIFFER, ERROR_NO_ZERO_ADDRESS, Managable } from './Managable.algo'

/**
 * Errors
 */
export const ERROR_ONLY_PENDING_MANAGER = 'Managable: only pending manager allowed'

/**
 * Event emitted when the manager is requested to be updated
 */
export class ManagerRequested extends arc4.Struct<{
  previousManager: arc4.Address
  newManager: arc4.Address
}> {}

export abstract class Managable2Step extends Managable {
  pendingManager = GlobalState<Account>({ key: 'pendingManager' })

  constructor() {
    super()
  }

  /**
   * Request an update to the manager of this contract
   * @param newManager The new manager account address (in native Account format)
   */
  override updateManager(newManager: Account): void {
    // only current manager can initiate manager update
    this.onlyManager()

    // new manager must differ from current manager
    assert(newManager !== this.manager.value, ERROR_MUST_DIFFER)

    // new manager cannot be zero address
    assert(newManager !== Global.zeroAddress, ERROR_NO_ZERO_ADDRESS)

    // set pending manager
    this.pendingManager.value = newManager

    // emit event for pending manager update
    emit(
      new ManagerRequested({
        previousManager: new arc4.Address(this.manager.value),
        newManager: new arc4.Address(newManager),
      }),
    )
  }

  /**
   * Accept the role of manager
   * @remarks This method is used by the pending manager to accept the role of manager
   */
  public acceptManager(): void {
    assert(this.pendingManager.value === Txn.sender, ERROR_ONLY_PENDING_MANAGER)

    // call parent method to update manager
    super._updateManager(this.pendingManager.value)

    // clear pending manager from global state
    this.pendingManager.delete()
  }
}
