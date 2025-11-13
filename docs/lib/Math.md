# [Math library](../../src/lib/Math.algo.ts)

## Description

A set of utility functions for math operations to be used by algorand smart contracts. Currently the implementation is very bare and could do with further work.

## Functions

### minUint64(a, b)

Get the min of two `uint64` values.

```typescript
function minUint64(a: uint64, b: uint64): uint64
```

### maxUint64(a, b)

Get the max of two `uint64` values.

```typescript
function maxUint64(a: uint64, b: uint64): uint64
```

## Usage

```typescript
import { Contract, uint64 } from '@algorandfoundation/algorand-typescript'
import { Math } from 'algo-scarf'

/**
 * A Mock contract that uses the methods in the `Math` library
 */
export class ExampleMathContract extends Contract {
  public testMaxUint64(a: uint64, b: uint64): uint64 {
    return Math.maxUint64(a, b)
  }

  public testMinUint64(a: uint64, b: uint64): uint64 {
    return Math.minUint64(a, b)
  }
}
```
