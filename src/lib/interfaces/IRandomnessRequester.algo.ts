import { arc4 } from '@algorandfoundation/algorand-typescript'

export type FulfillRandomnessFunction = (
  /* request id as reference */
  requestId: arc4.UintN64,
  /* the caller/initiator of the request */
  requesterAddress: arc4.Address,
  /* vrf output */
  output: arc4.StaticBytes<64>,
) => void

/**
 * Required implementation to interact with https://github.com/bwmx/randomness-beacon
 * Must implement the `fulfillRandomness` function
 */
export interface IRandomnessRequester {
  /**
   * The function to invoke when closing out of this application
   */
  fulfillRandomness: FulfillRandomnessFunction
}
