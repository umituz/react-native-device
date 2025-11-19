/**
 * String Utilities
 *
 * Pure utility functions for string manipulation
 * No dependencies, no side effects
 */

/**
 * Clean model name by removing special characters
 * @param model - Device model name
 * @returns Cleaned model name with only alphanumeric characters
 */
export function cleanModelName(model: string | null | undefined): string {
  if (!model) {
    return 'Device';
  }
  return model.replace(/[^a-zA-Z0-9]/g, '');
}

/**
 * Extract ID part from device ID
 * @param deviceId - Full device ID
 * @param length - Length of ID part to extract (default: 6)
 * @returns Last N characters of device ID in uppercase
 */
export function extractIdPart(deviceId: string | null, length: number = 6): string {
  if (!deviceId) {
    return generateRandomId(length);
  }
  return deviceId.substring(Math.max(0, deviceId.length - length)).toUpperCase();
}

/**
 * Generate random alphanumeric ID
 * @param length - Length of ID to generate (default: 6)
 * @returns Random ID in uppercase
 */
export function generateRandomId(length: number = 6): string {
  return Math.random().toString(36).substring(2, 2 + length).toUpperCase();
}

/**
 * Get platform prefix for device ID
 * @param platform - Platform OS
 * @returns Platform prefix string
 */
export function getPlatformPrefix(platform: string): string {
  switch (platform) {
    case 'ios':
      return 'iOS';
    case 'android':
      return 'Android';
    default:
      return 'Device';
  }
}

