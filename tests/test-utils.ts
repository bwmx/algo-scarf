import { ABIType } from 'algosdk'
import * as crypto from 'crypto'

/**
 * Utility to decode event from raw log
 * @param eventSignature Event signature string
 * @param rawLog Raw log bytes
 * @param keys Keys of the event fields
 * @returns Decoded event T object
 * @throws Error if event signature does not match expected
 * @example
 * ```ts
 * const event = getEventFromLog<{ previousManager: string; newManager: string }>(
 *   'ManagerUpdated(address,address)',
 *   rawLog,
 *   ['previousManager', 'newManager'],
 * )
 * ```
 * @link https://dev.algorand.co/arc-standards/arc-0028/
 */
export const getEventFromLog = <T extends Record<string, any>>(
  eventSignature: string,
  rawLog: Uint8Array,
  keys: (keyof T)[],
): T => {
  // create sha512-256 hash of event signature
  const hash = crypto.createHash('sha512-256').update(eventSignature).digest()

  // check first 4 bytes of rawLog match the hash
  const expectedSignature = hash.subarray(0, 4)
  const actualSignature = rawLog.subarray(0, 4)

  // verify signatures match
  if (expectedSignature.compare(actualSignature) !== 0) {
    throw new Error('Event signature does not match expected signature!')
  }

  // first 4 bytes are the event signature hash
  const rawEventData = rawLog.subarray(4)
  // get ABI data start index (after event name)
  const abiDataStart = eventSignature.indexOf('(')
  // decode raw event
  const decoded = ABIType.from(eventSignature.substring(abiDataStart)).decode(rawEventData) as any[]
  // Map tuple values to named object
  const result = {} as T

  keys.forEach((key, index) => {
    result[key] = decoded[index]
  })

  return result
}
