# Algo Scarf Library

## Abstract Contracts

These contracts are designed to be extended by other contracts only, they should not be deployed standalone. Common, predictable and consistent functionality is provided as expected. This should allow for more rapid development of TypeScript smart contracts on AVM.

### [Managable](lib/auth/Managable.md)

Simple management of deployed applications.

### [Managable2Step](lib/auth/Managable2Step.md)

An extended version of `Managable` that implements management transfer in a 2-step process.

### [Pausable](lib/utils/Pausable.md)

Easily managed pausable functionality.

## Interfaces

### [IRandomnessRequester](lib/interfaces/IRandomnessRequester.md)

An `interface` to force implementation of required `fulfillRandomness()` callback when interacting with a [Randomness Beacon](https://github.com/bwmx/randomness-beacon) implementation.

## Utils

A set of grouped utility functions commonly used within algorand smart contracts.

### [Math](lib/Math.md)

Math related functions and utilities.

### [Random](lib/Random.md)

Some utility functions for pseudorandom number generators.

### [MerkleProof](lib/crypto/MerkleProof.md)

Utilities to verify merkle proofs on-chain.
