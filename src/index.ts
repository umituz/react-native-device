/**
 * Device Domain - Barrel Export
 *
 * Provides device and application information using expo-device and expo-application.
 * Optional domain - disabled by default (opt-in for debug/analytics/support).
 *
 * @domain device
 * @enabled false (Apps that need device info - Opt-in)
 *
 * ARCHITECTURE:
 * - Domain Layer: Entities (device types, utilities)
 * - Infrastructure Layer: Services (DeviceService)
 * - Presentation Layer: Hooks (useDeviceInfo, useDeviceCapabilities, useDeviceId)
 *
 * DEPENDENCIES:
 * - expo-device (device information)
 * - expo-application (app information)
 *
 * FEATURES:
 * - Device information (brand, model, OS, memory)
 * - Application information (version, build, install time)
 * - Device capabilities (tablet, notch, memory)
 * - Device unique identifier (with privacy warnings)
 * - Device tier classification (low/mid/high)
 * - Minimum requirements check
 *
 * USAGE:
 *
 * Basic Device Info:
 * ```typescript
 * import { useDeviceInfo } from '@umituz/react-native-device';
 *
 * const { deviceInfo, appInfo, isLoading } = useDeviceInfo();
 *
 * if (isLoading) return <LoadingSpinner />;
 *
 * return (
 *   <View>
 *     <Text>Device: {deviceInfo?.modelName}</Text>
 *     <Text>OS: {deviceInfo?.osName} {deviceInfo?.osVersion}</Text>
 *     <Text>App: {appInfo?.applicationName}</Text>
 *     <Text>Version: {appInfo?.nativeApplicationVersion}</Text>
 *   </View>
 * );
 * ```
 *
 * Device Capabilities:
 * ```typescript
 * import { useDeviceCapabilities } from '@umituz/react-native-device';
 *
 * const { isTablet, hasNotch, totalMemoryGB } = useDeviceCapabilities();
 *
 * // Conditional UI
 * {isTablet && <TabletLayout />}
 * {hasNotch && <NotchSpacer height={44} />}
 *
 * // Performance optimization
 * {totalMemoryGB && totalMemoryGB < 2 && (
 *   <Text>Low memory - reduced quality</Text>
 * )}
 * ```
 *
 * Device Utilities:
 * ```typescript
 * import { DeviceUtils } from '@umituz/react-native-device';
 * import { useDeviceInfo } from '@umituz/react-native-device';
 *
 * const { deviceInfo } = useDeviceInfo();
 *
 * if (!deviceInfo) return null;
 *
 * // Display names
 * const deviceName = DeviceUtils.getDeviceDisplayName(deviceInfo);
 * const osString = DeviceUtils.getOSDisplayString(deviceInfo);
 *
 * // Device tier (for performance scaling)
 * const tier = DeviceUtils.getDeviceTier(deviceInfo);
 * const enableHeavyEffects = tier === 'high';
 *
 * // Minimum requirements check
 * const { meets, reasons } = DeviceUtils.meetsMinimumRequirements(deviceInfo, 2); // 2GB RAM
 * if (!meets) {
 *   return <Text>Device not supported: {reasons.join(', ')}</Text>;
 * }
 * ```
 *
 * Support/Debug Screen:
 * ```typescript
 * import { useDeviceInfo, DeviceUtils } from '@domains/device';
 *
 * const SupportScreen = () => {
 *   const { systemInfo, isLoading } = useDeviceInfo();
 *
 *   if (isLoading || !systemInfo) return <LoadingSpinner />;
 *
 *   const { device, application } = systemInfo;
 *
 *   return (
 *     <ScrollView>
 *       <Text>Device Information</Text>
 *       <Text>Model: {device.modelName}</Text>
 *       <Text>OS: {DeviceUtils.getOSDisplayString(device)}</Text>
 *       <Text>Memory: {DeviceUtils.formatMemorySize(device.totalMemory)}</Text>
 *       <Text>Year: {device.deviceYearClass}</Text>
 *
 *       <Text>Application Information</Text>
 *       <Text>Name: {application.applicationName}</Text>
 *       <Text>Version: {DeviceUtils.getAppVersionString(application)}</Text>
 *       <Text>Install: {application.installTime?.toLocaleDateString()}</Text>
 *       <Text>Updated: {application.lastUpdateTime?.toLocaleDateString()}</Text>
 *     </ScrollView>
 *   );
 * };
 * ```
 *
 * Analytics Integration (Privacy Warning!):
 * ```typescript
 * import { useDeviceId, useDeviceInfo } from '@umituz/react-native-device';
 *
 * const AnalyticsProvider = ({ children }) => {
 *   const { deviceId } = useDeviceId();
 *   const { deviceInfo } = useDeviceInfo();
 *
 *   useEffect(() => {
 *     if (deviceId && deviceInfo) {
 *       // Set device properties for analytics
 *       analytics.setDeviceProperties({
 *         deviceId,
 *         model: deviceInfo.modelName,
 *         os: deviceInfo.osName,
 *         osVersion: deviceInfo.osVersion,
 *       });
 *     }
 *   }, [deviceId, deviceInfo]);
 *
 *   return children;
 * };
 * ```
 *
 * Performance Scaling:
 * ```typescript
 * import { useDeviceInfo, DeviceUtils } from '@domains/device';
 *
 * const ImageGallery = () => {
 *   const { deviceInfo } = useDeviceInfo();
 *
 *   if (!deviceInfo) return <LoadingSpinner />;
 *
 *   // Scale quality based on device tier
 *   const tier = DeviceUtils.getDeviceTier(deviceInfo);
 *   const imageQuality = tier === 'high' ? 1.0 : tier === 'mid' ? 0.7 : 0.5;
 *   const maxImages = tier === 'high' ? 100 : tier === 'mid' ? 50 : 20;
 *
 *   return <Gallery quality={imageQuality} maxItems={maxImages} />;
 * };
 * ```
 *
 * Direct Service Usage (Rare):
 * ```typescript
 * import { DeviceService } from '@umituz/react-native-device';
 *
 * // Get device info once
 * const deviceInfo = await DeviceService.getDeviceInfo();
 * const appInfo = await DeviceService.getApplicationInfo();
 * const systemInfo = await DeviceService.getSystemInfo();
 *
 * // Check capabilities
 * const capabilities = await DeviceService.getDeviceCapabilities();
 * if (capabilities.isTablet) {
 *   // Tablet-specific logic
 * }
 * ```
 *
 * BENEFITS:
 * - Complete device and app information
 * - Device capability detection (tablet, notch, memory)
 * - Device tier classification for performance scaling
 * - Support screen data (model, OS, version)
 * - Analytics device properties (with privacy warnings)
 * - Minimum requirements validation
 * - Type-safe device information
 *
 * USE CASES:
 * - Support/debug screens
 * - Analytics device properties
 * - Performance scaling (low/mid/high tier)
 * - Minimum requirements check
 * - Tablet-specific layouts
 * - Notch-aware UI spacing
 * - Crash reporting device context
 *
 * PRIVACY WARNINGS:
 * - useDeviceId() returns persistent identifier (user privacy concern)
 * - Always get user consent before using device ID for analytics
 * - Android: androidId can be reset by user
 * - iOS: iosIdForVendor changes on app reinstall
 * - Never use device ID without user consent and privacy policy
 *
 * @see https://docs.expo.dev/versions/latest/sdk/device/
 * @see https://docs.expo.dev/versions/latest/sdk/application/
 */

// ============================================================================
// DOMAIN LAYER - ENTITIES
// ============================================================================

export type {
  DeviceInfo,
  ApplicationInfo,
  SystemInfo,
  DeviceType,
} from './domain/entities/Device';

export {
  DEVICE_CONSTANTS,
  DeviceUtils,
} from './domain/entities/Device';

// ============================================================================
// INFRASTRUCTURE LAYER - SERVICES
// ============================================================================

export { DeviceService } from './infrastructure/services/DeviceService';

// ============================================================================
// PRESENTATION LAYER - HOOKS
// ============================================================================

export {
  useDeviceInfo,
  useDeviceCapabilities,
  useDeviceId,
} from './presentation/hooks/useDeviceInfo';
