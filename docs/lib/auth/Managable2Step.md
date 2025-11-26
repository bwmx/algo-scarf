# [Managable2Step contract](../../../src/lib/auth/Managable2Step.algo.ts)

## Description

An abstract contract that extends [`Managable`](./Managable.md) to implement a two-step transfer process for changing the manager. This pattern requires the new manager to explicitly accept the role before the transfer is completed, preventing accidental transfers to incorrect addresses.

## State

Inherits the `manager` state variable from [`Managable`](./Managable.md).

A new global state `Account` variable `pendingManager` (accessible in contracts that extend `Managable2Step`) with the key `pendingManager`. This will be undefined when there is no pending manager transfer. Once `updateManager()` is called, it will contain the proposed new manager's address until either `acceptManager()` is called (completing the transfer) or `updateManager()` is called again (replacing the pending manager).

## Functions

### updateManager(newManager)

A `public` callable ABI method that allows the current `manager` to propose a new manager. The `newManager` must be a valid algorand account and cannot be the zero address or the current manager.

```typescript
public updateManager(newManager: Account): void
```

Unlike the base `Managable` contract, this does not immediately change the manager. Instead, it sets the `pendingManager` and emits a `ManagerRequested` event. The proposed manager must call `acceptManager()` to complete the transfer.

### acceptManager()

A `public` callable ABI method that allows the `pendingManager` to accept the manager role. This completes the two-step transfer process.

```typescript
public acceptManager(): void
```

### onlyManager()

Inherited from [`Managable`](./Managable.md). A `protected` function that calls `assert()` to check if the `Txn.sender` is the `manager`. If they are not the manager the error `ERROR_ONLY_MANAGER` will be thrown.

## Events

### ManagerRequested

This event is emitted when `updateManager()` is called to propose a new manager. The `previousManager` will equal the current manager and `newManager` will equal the proposed new manager.

```typescript
export class ManagerRequested extends arc4.Struct<{
  previousManager: arc4.Address
  newManager: arc4.Address
}> {}
```

### ManagerUpdated

Inherited from [`Managable`](./Managable.md). This event is emitted when `acceptManager()` is called and the manager transfer is completed. The `previousManager` will equal the old manager and `newManager` will equal the new manager.

```typescript
export class ManagerUpdated extends arc4.Struct<{
  previousManager: arc4.Address
  newManager: arc4.Address
}> {}
```

## Errors

Inherits errors from [`Managable`](./Managable.md):

When `updateManager()` is called by a non-manager this error is thrown.

```typescript
export const ERROR_ONLY_MANAGER = 'Managable: only manager allowed'
```

When `updateManager()` is called and the zero address is passed as the `newManager` parameter.

```typescript
export const ERROR_NO_ZERO_ADDRESS = 'Managable: cannot be the zero address'
```

When `updateManager()` is called and the current `manager` is passed as the `newManager` parameter.

```typescript
export const ERROR_MUST_DIFFER = 'Managable: must differ from current manager'
```

When `acceptManager()` is called by an account that is not the `pendingManager`.

```typescript
export const ERROR_ONLY_PENDING_MANAGER = 'Managable: only pending manager allowed'
```

## Usage

```typescript
import * as AlgoScarf from 'algo-scarf'

export class MockManagable2Step extends AlgoScarf.Managable2Step {
  constructor() {
    super()
  }

  public testOnlyManager(): void {
    this.onlyManager()
  }
}
```
