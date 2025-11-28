import {
  Account,
  arc4,
  assert,
  Contract,
  emit,
  Global,
  GlobalState,
  Txn,
} from '@algorandfoundation/algorand-typescript'

/**
 * Errors
 */
export const ERROR_ONLY_MANAGER = 'Managable: only manager allowed'
export const ERROR_NO_ZERO_ADDRESS = 'Managable: cannot be the zero address'
export const ERROR_MUST_DIFFER = 'Managable: must differ from current manager'

/**
 * Event emitted when the manager is updated
 */
export class ManagerUpdated extends arc4.Struct<{
  previousManager: arc4.Address
  newManager: arc4.Address
}> {}

export abstract class Managable extends Contract {
  manager = GlobalState<Account>({ key: 'manager' })

  constructor() {
    super()
    // set global state to contract creator upon creation
    this._updateManager(Global.creatorAddress)
  }

  /**
   * Internal implementation of manager update
   * @param newManager the new manager
   * @remarks This method handles the actual update of the manager state and emits the relevant event
   */
  protected _updateManager(newManager: Account): void {
    // emit the ownership transfer event
    emit(
      new ManagerUpdated({
        previousManager: new arc4.Address(this.manager.hasValue ? this.manager.value : Global.zeroAddress),
        newManager: new arc4.Address(newManager),
      }),
    )

    // update manager global state
    this.manager.value = newManager
  }

  /**
   * Only the manager can call this method
   * @remarks This method is used to ensure that only the manager perform certain actions in parent contracts
   */
  protected onlyManager(): void {
    assert(this.manager.value === Txn.sender, ERROR_ONLY_MANAGER)
  }

  /**
   * Update the manager of this contract
   * @param manager The new manager address in arc4 format
   */
  public updateManager(newManager: Account): void {
    // only the current manager can set a new manager
    this.onlyManager()
    // ensure the new manager differs from the current manager (prevent useless app calls)
    assert(newManager !== this.manager.value, ERROR_MUST_DIFFER)
    // ensure the new manager is not the zero address
    assert(newManager !== Global.zeroAddress, ERROR_NO_ZERO_ADDRESS)
    // call internal implementation
    this._updateManager(newManager)
  }

  /**
   * Delete the manager of this contract
   * @remarks This delete's the manager of this contract, disabling all functions that require a manager
   */
  public deleteManager(): void {
    // only the current manager can delete the manager
    this.onlyManager()
    // set the manager to the zero address
    this._updateManager(Global.zeroAddress)
  }
}
