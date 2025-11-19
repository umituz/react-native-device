/**
 * Device Capability Service
 *
 * Single Responsibility: Check device capabilities and features
 * Follows SOLID principles - only handles capability checks
 */

import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { DeviceInfoService } from './DeviceInfoService';
import { safeAccess } from '../utils/nativeModuleUtils';

/**
 * Service for checking device capabilities
 */
export class DeviceCapabilityService {
  /**
   * Check if device supports specific features
   */
  static async getDeviceCapabilities(): Promise<{
    isDevice: boolean;
    isTablet: boolean;
    hasNotch: boolean;
    totalMemoryGB: number | null;
  }> {
    const info = await DeviceInfoService.getDeviceInfo();

    return {
      isDevice: info.isDevice,
      isTablet: info.deviceType === Device.DeviceType.TABLET,
      hasNotch: await this.hasNotch(),
      totalMemoryGB: info.totalMemory
        ? info.totalMemory / (1024 * 1024 * 1024)
        : null,
    };
  }

  /**
   * Check if device has notch/dynamic island
   */
  static async hasNotch(): Promise<boolean> {
    try {
      if (Platform.OS !== 'ios') {
        return false;
      }

      const modelName = safeAccess(() => Device.modelName?.toLowerCase() || '', '');

      // iPhone X and newer (with notch or dynamic island)
      return (
        modelName.includes('iphone x') ||
        modelName.includes('iphone 1') || // 11, 12, 13, 14, 15
        modelName.includes('pro')
      );
    } catch {
      return false;
    }
  }
}

