# [Pausable contract](../../../src/lib/utils/Pausable.algo.ts)

## Description

By default `paused` will be `false`. Extending contracts must implement their own `pause()` and `unpause()` methods calling `_pause()` and `_unpause()` internally to managed the `paused` state.

## State

A new global state `boolean` variable `paused` (accessable in contracts that extend `Pausable`) with the key `paused`.

This will always equal the `paused` state of the contract. By default, on creation `paused` will equal `false`.

## Functions

### \_pause()

Will set the `paused` state to `true`.

### \_unpause()

Will set the `paused` state to `false`.

### whenNotPaused()

Guard function, should be used to allow functions to run only when `paused` is `false`. This could be used to allow for normal operations.

### whenPaused()

Guard function, should be used to allow functions to run only when `paused` is `true`. For example when some management operations must take place or cleaning up before deleting.

## Events

### Paused

This event is emitted when the contract has been paused. `caller` will equal who paused the contract.

```typescript
/**
 * Event emitted when the contract is paused
 */
export class Paused extends arc4.Struct<{
  caller: arc4.Address
}> {}
```

### Unpaused

This event is emitted when the contract has been unpaused. `caller` will equal who unpaused the contract.

```typescript
/**
 * Event emitted when the contract is unpaused
 */
export class Unpaused extends arc4.Struct<{
  caller: arc4.Address
}> {}
```

## Errors

When `whenNotPaused()` is called and `paused` is `true` the below error is thrown.

```typescript
export const ERROR_MUST_NOT_BE_PAUSED = 'Pausable: must not be paused'
```

When `whenPaused()` is called and `paused` is `false` the below error is thrown.

```typescript
export const ERROR_MUST_BE_PAUSED = 'Pausable: must be paused'
```

## Usage

```typescript
import { Pausable } from '../../src/index.algo'

export class MockPausable extends Pausable {
  constructor() {
    super()
  }

  public testPause(): void {
    this._pause()
  }

  public testUnpause(): void {
    this._unpause()
  }

  public testOnlyWhenNotPaused(): void {
    this.whenNotPaused()
  }

  public testOnlyWhenPaused(): void {
    this.whenPaused()
  }
}
```
