/**
 * User Friendly ID Service
 *
 * Single Responsibility: Generate user-friendly device identifiers
 * Follows SOLID principles - only handles ID generation logic
 */

import { Platform } from 'react-native';
import { DeviceInfoService } from './DeviceInfoService';
import { DeviceIdService } from './DeviceIdService';
import {
  cleanModelName,
  extractIdPart,
  generateRandomId,
  getPlatformPrefix,
} from '../utils/stringUtils';
import { withTimeoutAll } from '../utils/nativeModuleUtils';

/**
 * Service for generating user-friendly device IDs
 */
export class UserFriendlyIdService {
  /**
   * Get user friendly device ID (e.g. "iPhone13-A8F2")
   *
   * Useful for displaying a readable user identifier in profiles.
   * Combines cleaned model name with short device hash.
   *
   * SAFE: This method has multiple fallback layers to prevent native module crashes.
   * If native modules are not ready, it will return a safe fallback ID.
   */
  static async getUserFriendlyId(): Promise<string> {
    // Web platform - no native modules needed
    if (Platform.OS === 'web') {
      return `WebUser-${generateRandomId()}`;
    }

    try {
      // Try to get device info and ID with timeout
      const [deviceInfo, deviceId] = await withTimeoutAll(
        [
          () => DeviceInfoService.getDeviceInfo(),
          () => DeviceIdService.getDeviceId(),
        ],
        2000,
      );

      // If we got device info, use it
      if (deviceInfo && (deviceInfo.modelName || deviceInfo.deviceName)) {
        const model = deviceInfo.modelName || deviceInfo.deviceName || 'Device';
        const cleanModel = cleanModelName(model);
        const idPart = extractIdPart(deviceId, 6);

        return `${cleanModel}-${idPart}`;
      }

      // Fallback: Use platform + random ID
      return this.generateFallbackId();
    } catch {
      // Final fallback: Generate safe random ID
      return this.generateFallbackId();
    }
  }

  /**
   * Generate fallback ID when native modules are not available
   */
  private static generateFallbackId(): string {
    const platformPrefix = getPlatformPrefix(Platform.OS);
    return `${platformPrefix}-${generateRandomId()}`;
  }
}

