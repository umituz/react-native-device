# @umituz/react-native-device

Device and application information for React Native using expo-device and expo-application.

## Installation

```bash
npm install @umituz/react-native-device
```

## Peer Dependencies

- `react` >= 18.2.0
- `react-native` >= 0.74.0
- `expo-device` *
- `expo-application` *

## Features

- ✅ Device information (brand, model, OS, memory)
- ✅ Application information (version, build, install time)
- ✅ Device capabilities (tablet, notch, memory)
- ✅ Device unique identifier (with privacy warnings)
- ✅ Device tier classification (low/mid/high)
- ✅ Minimum requirements check

## Usage

### Basic Device Info

```typescript
import { useDeviceInfo } from '@umituz/react-native-device';

const { deviceInfo, appInfo, isLoading } = useDeviceInfo();

if (isLoading) return <LoadingSpinner />;

return (
  <View>
    <Text>Device: {deviceInfo?.modelName}</Text>
    <Text>OS: {deviceInfo?.osName} {deviceInfo?.osVersion}</Text>
    <Text>App: {appInfo?.applicationName}</Text>
    <Text>Version: {appInfo?.nativeApplicationVersion}</Text>
  </View>
);
```

### Device Capabilities

```typescript
import { useDeviceCapabilities } from '@umituz/react-native-device';

const { isTablet, hasNotch, totalMemoryGB } = useDeviceCapabilities();

// Conditional UI
{isTablet && <TabletLayout />}
{hasNotch && <NotchSpacer height={44} />}

// Performance optimization
{totalMemoryGB && totalMemoryGB < 2 && (
  <Text>Low memory - reduced quality</Text>
)}
```

### Device Utilities

```typescript
import { DeviceUtils, useDeviceInfo } from '@umituz/react-native-device';

const { deviceInfo } = useDeviceInfo();

if (!deviceInfo) return null;

// Display names
const deviceName = DeviceUtils.getDeviceDisplayName(deviceInfo);
const osString = DeviceUtils.getOSDisplayString(deviceInfo);

// Device tier (for performance scaling)
const tier = DeviceUtils.getDeviceTier(deviceInfo);
const enableHeavyEffects = tier === 'high';

// Minimum requirements check
const { meets, reasons } = DeviceUtils.meetsMinimumRequirements(deviceInfo, 2); // 2GB RAM
if (!meets) {
  return <Text>Device not supported: {reasons.join(', ')}</Text>;
}
```

### Direct Service Usage

```typescript
import { DeviceService } from '@umituz/react-native-device';

// Get device info once
const deviceInfo = await DeviceService.getDeviceInfo();
const appInfo = await DeviceService.getApplicationInfo();

// Get system info (device + app)
const systemInfo = await DeviceService.getSystemInfo();

// Get system info with user ID (optional)
const systemInfoWithUser = await DeviceService.getSystemInfo({ 
  userId: 'user123' 
});

// Check capabilities
const capabilities = await DeviceService.getDeviceCapabilities();
if (capabilities.isTablet) {
  // Tablet-specific logic
}
```

## Hooks

- `useDeviceInfo()` - Get device and application information
- `useDeviceCapabilities()` - Get device capabilities (tablet, notch, memory)
- `useDeviceId()` - Get device unique identifier (with privacy warnings)

## Services

- `DeviceService` - Direct service access for device operations

## Utilities

- `DeviceUtils` - Utility functions for device information processing

## Privacy Warnings

- `useDeviceId()` returns persistent identifier (user privacy concern)
- Always get user consent before using device ID for analytics
- Android: androidId can be reset by user
- iOS: iosIdForVendor changes on app reinstall
- Never use device ID without user consent and privacy policy

## License

MIT

