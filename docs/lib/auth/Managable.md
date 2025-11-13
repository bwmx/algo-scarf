# [Managable contract](../../../src/lib/auth/Managable.algo.ts)

## Description

An abstract contract that implements simple management functionality and behaviors. This is simple and therefore unsuitable for more complex applications that require role based access.

## State

A new global state `Account` variable `manager` (accessable in contracts that extend `Managable`) with the key `manager`. This will always be set initially to the contract creator account during creation.

This will always equal the current manager of the contract unless the manager has been intentionally deleted with `deleteManager()` (to revoke all access permanently), then the `manager` variable with equal the algorand zero address (`Global.zeroAddress`) to show there is no owner.

## Functions

### updateManager(newManager)

A `public` callable ABI method that allows the current `manager` to change the manager to another account `newManager` must be a valid algorand account and cannot be the zero address.

```typescript
public updateManager(newManager: Account): void
```

### deleteManager()

A `public` callable ABI method that allows the current `manager` to revoke their access. This cannot be undone.

```typescript
public deleteManager(): void
```

### onlyManager()

A `protected` function that calls `assert()` to check if the `Txn.sender` is the `manager`. If they are not the manager the error `ERROR_ONLY_MANAGER` will be thrown. This should be used as a guard for manager only functionality.

```typescript
protected onlyManager(): void
```

## Events

### ManagerUpdated

This event is emitted when the manager has been updated. This will also happen upon creation when the default manager is set to the creator, the `previousManager` will equal the algorand zero address in this instance. `newManager` will always equal the new manager, if it equals the zero address this means the manager access has been revoked by calling `deleteManager()`.

```typescript
export class ManagerUpdated extends arc4.Struct<{
  previousManager: arc4.Address
  newManager: arc4.Address
}> {}
```

## Errors

When `onlyManager()` is called by a non-manager this error is thrown.

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

## Usage

```typescript
import * as AlgoScarf from 'algo-scarf'

export class MockManagable extends AlgoScarf.Managable {
  constructor() {
    super()
  }

  public testOnlyManager(): void {
    this.onlyManager()
  }
}
```
