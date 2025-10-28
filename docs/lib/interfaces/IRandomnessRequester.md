# [IRandomnessRequester interface](../../../src/lib/interfaces/IRandomnessRequester.algo.ts)

## Description

An `interface` definition that should be implemented by other contracts (using `implements`) wishing to interact with the callback request based randomness beacon found here: [http://github.com/bwmx/randomness-beacon]

## Usage

```typescript
export class ExampleRequester extends Contract implements IRandomnessRequester {
  // beacon app
  beaconApp = GlobalState<Application>({ key: 'beaconApp' })

  @abimethod({ onCreate: 'require' })
  createApplication(beaconApp: Application): void {
    this.beaconApp.value = beaconApp
  }

  public testCreateRequest(): void {
    // call RandomnessBeacon.createRequest() here...
  }

  /**
   * This method must be implemented in ExampleRequester because it implements IRandomnessRequester
   * Ensures callers follow best compatible practices
   */
  public fulfillRandomness(
    requestId: arc4.UintN64,
    requesterAddress: arc4.Address,
    output: arc4.StaticBytes<64>,
  ): void {
    // do something
  }
}
```
