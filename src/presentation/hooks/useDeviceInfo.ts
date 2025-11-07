/**
 * Device Domain - useDeviceInfo Hook
 *
 * React hook for device and application information.
 * Provides device details with state management.
 *
 * @domain device
 * @layer presentation/hooks
 */

import { useState, useEffect, useCallback } from 'react';
import { DeviceService } from '../../infrastructure/services/DeviceService';
import type { DeviceInfo, ApplicationInfo, SystemInfo } from '../../domain/entities/Device';

/**
 * useDeviceInfo hook for device and application information
 *
 * USAGE:
 * ```typescript
 * const { deviceInfo, appInfo, systemInfo, isLoading, refresh } = useDeviceInfo();
 *
 * // Display device info
 * <Text>Device: {deviceInfo?.modelName}</Text>
 * <Text>OS: {deviceInfo?.osName} {deviceInfo?.osVersion}</Text>
 *
 * // Display app info
 * <Text>App: {appInfo?.applicationName}</Text>
 * <Text>Version: {appInfo?.nativeApplicationVersion}</Text>
 *
 * // Refresh info
 * <AtomicButton onPress={refresh}>Refresh</AtomicButton>
 * ```
 */
export const useDeviceInfo = () => {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo | null>(null);
  const [appInfo, setAppInfo] = useState<ApplicationInfo | null>(null);
  const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Load all device and app information
   */
  const loadInfo = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const system = await DeviceService.getSystemInfo();
      setSystemInfo(system);
      setDeviceInfo(system.device);
      setAppInfo(system.application);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load device info';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Load device info only
   */
  const loadDeviceInfo = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const info = await DeviceService.getDeviceInfo();
      setDeviceInfo(info);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load device info';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Load app info only
   */
  const loadAppInfo = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const info = await DeviceService.getApplicationInfo();
      setAppInfo(info);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load app info';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Refresh all info
   */
  const refresh = useCallback(async () => {
    await loadInfo();
  }, [loadInfo]);

  /**
   * Load info on mount
   */
  useEffect(() => {
    loadInfo();
  }, [loadInfo]);

  return {
    // Data
    deviceInfo,
    appInfo,
    systemInfo,

    // State
    isLoading,
    error,

    // Functions
    refresh,
    loadDeviceInfo,
    loadAppInfo,
  };
};

/**
 * useDeviceCapabilities hook for device feature detection
 *
 * USAGE:
 * ```typescript
 * const { isDevice, isTablet, hasNotch, totalMemoryGB } = useDeviceCapabilities();
 *
 * // Conditional rendering
 * {isTablet && <TabletLayout />}
 * {hasNotch && <NotchSpacer />}
 *
 * // Performance optimization
 * {totalMemoryGB && totalMemoryGB < 2 && <LowMemoryWarning />}
 * ```
 */
export const useDeviceCapabilities = () => {
  const [isDevice, setIsDevice] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [hasNotch, setHasNotch] = useState(false);
  const [totalMemoryGB, setTotalMemoryGB] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadCapabilities = async () => {
      setIsLoading(true);

      try {
        const capabilities = await DeviceService.getDeviceCapabilities();
        setIsDevice(capabilities.isDevice);
        setIsTablet(capabilities.isTablet);
        setHasNotch(capabilities.hasNotch);
        setTotalMemoryGB(capabilities.totalMemoryGB);
      } catch (error) {
        // Silent fail - set defaults
        setIsDevice(false);
        setIsTablet(false);
        setHasNotch(false);
        setTotalMemoryGB(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadCapabilities();
  }, []);

  return {
    isDevice,
    isTablet,
    hasNotch,
    totalMemoryGB,
    isLoading,
  };
};

/**
 * useDeviceId hook for device unique identifier
 *
 * WARNING: Use with caution - user privacy considerations!
 *
 * USAGE:
 * ```typescript
 * const { deviceId, isLoading } = useDeviceId();
 *
 * // Analytics, crash reporting (with user consent)
 * if (deviceId) {
 *   analytics.setUserId(deviceId);
 * }
 * ```
 */
export const useDeviceId = () => {
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadDeviceId = async () => {
      setIsLoading(true);

      try {
        const id = await DeviceService.getDeviceId();
        setDeviceId(id);
      } catch (error) {
        setDeviceId(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadDeviceId();
  }, []);

  return {
    deviceId,
    isLoading,
  };
};
