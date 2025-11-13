# [Random library](../../src/lib/Random.algo.ts)

## Description

Some utility functions for pseudorandom number generators.

## Functions

### xorShiftUint64(seed)

Implements a basic implementation of the xorshift64 pseudorandom number generator described here: https://en.wikipedia.org/wiki/Xorshift

```typescript
export function xorShiftUint64(seed: uint64): uint64
```

## Usage

```typescript
import { Contract, uint64 } from '@algorandfoundation/algorand-typescript'
import { Random } from 'algo-scarf'

/**
 * A Mock contract that uses the methods in the `Random` library
 */
export class ExampleRandomContract extends Contract {
  public testXorShift64(seed: uint64): uint64 {
    return Random.xorShiftUint64(seed)
  }
}
```
