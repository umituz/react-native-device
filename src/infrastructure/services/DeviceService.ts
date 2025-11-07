/**
 * Device Domain - Device Service
 *
 * Service for device and application information.
 * Provides abstraction layer for expo-device and expo-application.
 *
 * @domain device
 * @layer infrastructure/services
 */

import * as Device from 'expo-device';
import * as Application from 'expo-application';
import { Platform } from 'react-native';
import type { DeviceInfo, ApplicationInfo, SystemInfo } from '../../domain/entities/Device';

/**
 * Device information service
 */
export class DeviceService {
  /**
   * Get device information
   */
  static async getDeviceInfo(): Promise<DeviceInfo> {
    try {
      const totalMemory = await Device.getMaxMemoryAsync();

      return {
        // Device identification
        brand: Device.brand,
        manufacturer: Device.manufacturer,
        modelName: Device.modelName,
        modelId: Device.modelId,
        deviceName: Device.deviceName,
        deviceYearClass: Device.deviceYearClass,

        // Device type
        deviceType: Device.deviceType,
        isDevice: Device.isDevice,

        // OS information
        osName: Device.osName,
        osVersion: Device.osVersion,
        osBuildId: Device.osBuildId,
        platformApiLevel: Device.platformApiLevel,

        // Memory
        totalMemory,

        // Platform
        platform: Platform.OS as 'ios' | 'android' | 'web',
      };
    } catch (error) {
      // Return minimal info on error
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

  /**
   * Get application information
   */
  static async getApplicationInfo(): Promise<ApplicationInfo> {
    try {
      const [installTime, lastUpdateTime] = await Promise.all([
        Application.getInstallationTimeAsync(),
        Application.getLastUpdateTimeAsync(),
      ]);

      return {
        // App identification
        applicationName: Application.applicationName || 'Unknown',
        applicationId: Application.applicationId || 'Unknown',
        nativeApplicationVersion: Application.nativeApplicationVersion,
        nativeBuildVersion: Application.nativeBuildVersion,

        // Installation
        installTime,
        lastUpdateTime,

        // Platform-specific
        androidId: Platform.OS === 'android' ? await Application.getAndroidId() : null,
        iosIdForVendor: Platform.OS === 'ios' ? await Application.getIosIdForVendorAsync() : null,
      };
    } catch (error) {
      // Return minimal info on error
      return {
        applicationName: 'Unknown',
        applicationId: 'Unknown',
        nativeApplicationVersion: null,
        nativeBuildVersion: null,
        installTime: null,
        lastUpdateTime: null,
        androidId: null,
        iosIdForVendor: null,
      };
    }
  }

  /**
   * Get complete system information (device + app)
   */
  static async getSystemInfo(): Promise<SystemInfo> {
    const [device, application] = await Promise.all([
      DeviceService.getDeviceInfo(),
      DeviceService.getApplicationInfo(),
    ]);

    return {
      device,
      application,
      timestamp: Date.now(),
    };
  }

  /**
   * Get device unique identifier (platform-specific)
   *
   * WARNING: Use with caution - user privacy considerations!
   * Android: androidId (can be reset)
   * iOS: iosIdForVendor (changes on reinstall)
   */
  static async getDeviceId(): Promise<string | null> {
    try {
      if (Platform.OS === 'android') {
        return Application.getAndroidId();
      }

      if (Platform.OS === 'ios') {
        return await Application.getIosIdForVendorAsync();
      }

      return null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Check if device supports specific features
   */
  static async getDeviceCapabilities(): Promise<{
    isDevice: boolean;
    isTablet: boolean;
    hasNotch: boolean;
    totalMemoryGB: number | null;
  }> {
    const info = await DeviceService.getDeviceInfo();

    return {
      isDevice: info.isDevice,
      isTablet: info.deviceType === Device.DeviceType.TABLET,
      hasNotch: await DeviceService.hasNotch(),
      totalMemoryGB: info.totalMemory ? info.totalMemory / (1024 * 1024 * 1024) : null,
    };
  }

  /**
   * Check if device has notch/dynamic island
   */
  static async hasNotch(): Promise<boolean> {
    try {
      // iOS only - check model names known to have notch
      if (Platform.OS === 'ios') {
        const modelName = Device.modelName?.toLowerCase() || '';

        // iPhone X and newer (with notch or dynamic island)
        const hasNotch = modelName.includes('iphone x') ||
                        modelName.includes('iphone 1') || // 11, 12, 13, 14, 15
                        modelName.includes('pro');

        return hasNotch;
      }

      return false;
    } catch (error) {
      return false;
    }
  }
}
