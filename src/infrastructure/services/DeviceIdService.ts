/**
 * Device ID Service
 *
 * Single Responsibility: Get device unique identifiers
 * Follows SOLID principles - only handles device ID retrieval
 */

import * as Application from 'expo-application';
import { Platform } from 'react-native';
import { withTimeout } from '../utils/nativeModuleUtils';

/**
 * Service for retrieving device unique identifiers
 */
export class DeviceIdService {
  /**
   * Get device unique identifier (platform-specific)
   *
   * WARNING: Use with caution - user privacy considerations!
   * Android: androidId (can be reset)
   * iOS: iosIdForVendor (changes on reinstall)
   * Web: null (not supported)
   *
   * SAFE: Returns null if native modules are not ready
   */
  static async getDeviceId(): Promise<string | null> {
    try {
      if (Platform.OS === 'android') {
        const result = await withTimeout(async () => Application.getAndroidId(), 1000);
        return result || null;
      }

      if (Platform.OS === 'ios') {
        const result = await withTimeout(
          async () => Application.getIosIdForVendorAsync(),
          1000,
        );
        return result || null;
      }

      // Web not supported
      return null;
    } catch {
      return null;
    }
  }

  /**
   * Get offline user ID with fallback (iOS/Android only)
   *
   * For offline apps that need a persistent user ID:
   * 1. Try to get platform-specific device ID (iOS/Android)
   * 2. Fallback to a default offline user ID if device ID not available
   *
   * NOTE: Returns null for web platform (not supported)
   */
  static async getOfflineUserId(fallbackId: string = 'offline_user'): Promise<string | null> {
    if (Platform.OS === 'web') {
      return null;
    }

    const deviceId = await this.getDeviceId();
    if (deviceId) {
      return `offline_${deviceId}`;
    }
    return fallbackId;
  }
}

