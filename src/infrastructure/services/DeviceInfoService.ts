/**
 * Device Info Service
 *
 * Single Responsibility: Get device information from native modules
 * Follows SOLID principles - only handles device info retrieval
 */

import * as Device from 'expo-device';
import { Platform } from 'react-native';
import type { DeviceInfo } from '../../domain/entities/Device';
import { safeAccess, withTimeout } from '../utils/nativeModuleUtils';

/**
 * Service for retrieving device information
 */
export class DeviceInfoService {
  /**
   * Get device information
   * SAFE: Returns minimal info if native modules are not ready
   */
  static async getDeviceInfo(): Promise<DeviceInfo> {
    try {
      // Try to get memory with timeout
      const totalMemory = await withTimeout(
        () => Device.getMaxMemoryAsync(),
        1000,
      );

      // Safely access Device properties
      const brand = safeAccess(() => Device.brand, null);
      const manufacturer = safeAccess(() => Device.manufacturer, null);
      const modelName = safeAccess(() => Device.modelName, null);
      const modelId = safeAccess(() => Device.modelId, null);
      const deviceName = safeAccess(() => Device.deviceName, null);
      const deviceYearClass = safeAccess(() => Device.deviceYearClass, null);
      const deviceType = safeAccess(() => Device.deviceType, null);
      const isDevice = safeAccess(() => Device.isDevice, false);
      const osName = safeAccess(() => Device.osName, null);
      const osVersion = safeAccess(() => Device.osVersion, null);
      const osBuildId = safeAccess(() => Device.osBuildId, null);
      const platformApiLevel = safeAccess(() => Device.platformApiLevel, null);

      return {
        brand,
        manufacturer,
        modelName,
        modelId,
        deviceName,
        deviceYearClass,
        deviceType,
        isDevice,
        osName,
        osVersion,
        osBuildId,
        platformApiLevel,
        totalMemory,
        platform: Platform.OS as 'ios' | 'android' | 'web',
      };
    } catch {
      // Return minimal info on error
      return this.getMinimalDeviceInfo();
    }
  }

  /**
   * Get minimal device info (fallback)
   */
  private static getMinimalDeviceInfo(): DeviceInfo {
    return {
      brand: null,
      manufacturer: null,
      modelName: null,
      modelId: null,
      deviceName: null,
      deviceYearClass: null,
      deviceType: null,
      isDevice: false,
      osName: null,
      osVersion: null,
      osBuildId: null,
      platformApiLevel: null,
      totalMemory: null,
      platform: Platform.OS as 'ios' | 'android' | 'web',
    };
  }
}

