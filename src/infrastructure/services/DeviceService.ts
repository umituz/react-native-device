/**
 * Device Service - Facade/Orchestrator
 *
 * Main entry point for device operations.
 * Delegates to specialized services following Single Responsibility Principle.
 *
 * @domain device
 * @layer infrastructure/services
 */

import type { DeviceInfo, ApplicationInfo, SystemInfo } from '../../domain/entities/Device';
import { DeviceInfoService } from './DeviceInfoService';
import { ApplicationInfoService } from './ApplicationInfoService';
import { DeviceIdService } from './DeviceIdService';
import { DeviceCapabilityService } from './DeviceCapabilityService';
import { UserFriendlyIdService } from './UserFriendlyIdService';

/**
 * Device Service - Facade for all device operations
 *
 * This is a facade that delegates to specialized services.
 * Each service has a single responsibility (SOLID principles).
 */
export class DeviceService {
  /**
   * Get device information
   * Delegates to DeviceInfoService
   */
  static async getDeviceInfo(): Promise<DeviceInfo> {
    return DeviceInfoService.getDeviceInfo();
  }

  /**
   * Get application information
   * Delegates to ApplicationInfoService
   */
  static async getApplicationInfo(): Promise<ApplicationInfo> {
    return ApplicationInfoService.getApplicationInfo();
  }

  /**
   * Get complete system information (device + app)
   * @param options - Optional configuration
   * @param options.userId - Optional user ID to include in system info
   */
  static async getSystemInfo(options?: { userId?: string }): Promise<SystemInfo> {
    const [device, application] = await Promise.all([
      DeviceInfoService.getDeviceInfo(),
      ApplicationInfoService.getApplicationInfo(),
    ]);

    return {
      device,
      application,
      timestamp: Date.now(),
      ...(options?.userId && { userId: options.userId }),
    };
  }

  /**
   * Get device unique identifier (platform-specific)
   * Delegates to DeviceIdService
   */
  static async getDeviceId(): Promise<string | null> {
    return DeviceIdService.getDeviceId();
  }

  /**
   * Get offline user ID with fallback
   * Delegates to DeviceIdService
   */
  static async getOfflineUserId(fallbackId: string = 'offline_user'): Promise<string | null> {
    return DeviceIdService.getOfflineUserId(fallbackId);
  }

  /**
   * Check if device supports specific features
   * Delegates to DeviceCapabilityService
   */
  static async getDeviceCapabilities(): Promise<{
    isDevice: boolean;
    isTablet: boolean;
    hasNotch: boolean;
    totalMemoryGB: number | null;
  }> {
    return DeviceCapabilityService.getDeviceCapabilities();
  }

  /**
   * Check if device has notch/dynamic island
   * Delegates to DeviceCapabilityService
   */
  static async hasNotch(): Promise<boolean> {
    return DeviceCapabilityService.hasNotch();
  }

  /**
   * Get user friendly device ID
   * Delegates to UserFriendlyIdService
   */
  static async getUserFriendlyId(): Promise<string> {
    return UserFriendlyIdService.getUserFriendlyId();
  }
}
