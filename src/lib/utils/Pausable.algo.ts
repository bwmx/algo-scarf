// generate pausable contract code here

import { arc4, assert, Contract, emit, GlobalState, Txn } from '@algorandfoundation/algorand-typescript'

/**
 * Errors
 */
export const ERROR_MUST_NOT_BE_PAUSED = 'Pausable: must not be paused'
export const ERROR_MUST_BE_PAUSED = 'Pausable: must be paused'

/**
 * Event emitted when the contract is paused
 */
export class Paused extends arc4.Struct<{
  caller: arc4.Address
}> {}

/**
 * Event emitted when the contract is unpaused
 */
export class Unpaused extends arc4.Struct<{
  caller: arc4.Address
}> {}

export abstract class Pausable extends Contract {
  paused = GlobalState<boolean>({ key: 'paused' })

  constructor() {
    super()
    // set global state to unpaused upon creation
    this.paused.value = false
  }

  /**
   * Ensure the contract is not paused
   * @remarks This method is used to ensure that certain actions in parent contracts can only be performed when not paused
   */
  protected whenNotPaused(): void {
    assert(!this.paused.value, ERROR_MUST_NOT_BE_PAUSED)
  }

  /**
   * Ensure the contract is paused
   * @remarks This method is used to ensure that certain actions in parent contracts can only be performed when paused
   */
  protected whenPaused(): void {
    assert(this.paused.value, ERROR_MUST_BE_PAUSED)
  }

  /**
   * Pause the contract
   */
  protected _pause(): void {
    this.whenNotPaused()
    this.paused.value = true
    emit(new Paused({ caller: new arc4.Address(Txn.sender) }))
  }

  /**
   * Unpause the contract
   */
  protected _unpause(): void {
    this.whenPaused()
    this.paused.value = false
    emit(new Unpaused({ caller: new arc4.Address(Txn.sender) }))
  }
}
