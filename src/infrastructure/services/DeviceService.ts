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
   * 
   * SAFE: Returns minimal info if native modules are not ready
   */
  static async getDeviceInfo(): Promise<DeviceInfo> {
    try {
      // Try to get memory with timeout
      let totalMemory: number | null = null;
      try {
        totalMemory = await Promise.race([
          Device.getMaxMemoryAsync(),
          new Promise<never>((_, reject) => setTimeout(() => reject(new Error('Timeout')), 1000)),
        ]).catch(() => null) as number | null;
      } catch {
        // Ignore memory errors
      }

      // Safely access Device properties (they might throw if native module not ready)
      let brand: string | null = null;
      let manufacturer: string | null = null;
      let modelName: string | null = null;
      let modelId: string | null = null;
      let deviceName: string | null = null;
      let deviceYearClass: number | null = null;
      let deviceType: Device.DeviceType | null = null;
      let isDevice: boolean = false;
      let osName: string | null = null;
      let osVersion: string | null = null;
      let osBuildId: string | null = null;
      let platformApiLevel: number | null = null;

      try {
        brand = Device.brand ?? null;
        manufacturer = Device.manufacturer ?? null;
        modelName = Device.modelName ?? null;
        modelId = Device.modelId ?? null;
        deviceName = Device.deviceName ?? null;
        deviceYearClass = Device.deviceYearClass ?? null;
        deviceType = Device.deviceType ?? null;
        isDevice = Device.isDevice ?? false;
        osName = Device.osName ?? null;
        osVersion = Device.osVersion ?? null;
        osBuildId = Device.osBuildId ?? null;
        platformApiLevel = Device.platformApiLevel ?? null;
      } catch {
        // Native module not ready, use defaults
      }

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
   * Web: null (not supported)
   * 
   * SAFE: Returns null if native modules are not ready
   */
  static async getDeviceId(): Promise<string | null> {
    try {
      if (Platform.OS === 'android') {
        try {
          return await Promise.race([
            Application.getAndroidId(),
            new Promise<never>((_, reject) => setTimeout(() => reject(new Error('Timeout')), 1000)),
          ]).catch(() => null) as string | null;
        } catch {
          return null;
        }
      }

      if (Platform.OS === 'ios') {
        try {
          return await Promise.race([
            Application.getIosIdForVendorAsync(),
            new Promise<never>((_, reject) => setTimeout(() => reject(new Error('Timeout')), 1000)),
          ]).catch(() => null) as string | null;
        } catch {
          return null;
        }
      }

      // Web not supported - return null
      return null;
    } catch (error) {
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
    // Web not supported
    if (Platform.OS === 'web') {
      return null;
    }

    const deviceId = await DeviceService.getDeviceId();
    if (deviceId) {
      return `offline_${deviceId}`;
    }
    return fallbackId;
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
      return `WebUser-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    }

    // Try to get device info with timeout and multiple fallbacks
    try {
      // Add a timeout to prevent hanging if native modules are not ready
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Device info timeout')), 2000);
      });

      const deviceInfoPromise = DeviceService.getDeviceInfo().catch(() => null);
      const deviceIdPromise = DeviceService.getDeviceId().catch(() => null);

      // Race between actual calls and timeout
      const [deviceInfo, deviceId] = await Promise.race([
        Promise.all([deviceInfoPromise, deviceIdPromise]),
        timeoutPromise,
      ]).catch(() => [null, null]) as [any, string | null];

      // If we got device info, use it
      if (deviceInfo && (deviceInfo.modelName || deviceInfo.deviceName)) {
        const model = deviceInfo.modelName || deviceInfo.deviceName || 'Device';
        const cleanModel = model.replace(/[^a-zA-Z0-9]/g, '');

        const idPart = deviceId
          ? deviceId.substring(Math.max(0, deviceId.length - 6)).toUpperCase()
          : Math.random().toString(36).substring(2, 8).toUpperCase();

        return `${cleanModel}-${idPart}`;
      }

      // Fallback: Use platform + random ID
      const platformPrefix = Platform.OS === 'ios' ? 'iOS' : Platform.OS === 'android' ? 'Android' : 'Device';
      return `${platformPrefix}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    } catch (error) {
      // Final fallback: Generate safe random ID
      const platformPrefix = Platform.OS === 'ios' ? 'iOS' : Platform.OS === 'android' ? 'Android' : 'Device';
      return `${platformPrefix}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    }
  }
}
