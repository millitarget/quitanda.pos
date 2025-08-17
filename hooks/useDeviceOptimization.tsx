import { useEffect, useState, useRef } from 'react';
import { deviceDetector, DeviceInfo } from '../utils/deviceDetection';

export interface UseDeviceOptimizationReturn {
  deviceInfo: DeviceInfo;
  applyHeaderOptimizations: (element: HTMLElement | null) => void;
  applyContentOptimizations: (element: HTMLElement | null) => void;
  applyFloatingOptimizations: (element: HTMLElement | null) => void;
  applyModalOptimizations: (element: HTMLElement | null) => void;
  applyButtonOptimizations: (element: HTMLElement | null) => void;
  applyNavigationOptimizations: (element: HTMLElement | null) => void;
  applyBottomSheetOptimizations: (element: HTMLElement | null) => void;
  getDeviceSpacing: () => { padding: number; margin: number; gap: number };
  isDynamicIsland: boolean;
  isNotch: boolean;
  isPunchHole: boolean;
  isHomeIndicator: boolean;
  isIOS: boolean;
  isAndroid: boolean;
  isPhone: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isLandscape: boolean;
  isPortrait: boolean;
}

export const useDeviceOptimization = (): UseDeviceOptimizationReturn => {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>(deviceDetector.getDeviceInfo());
  const [isDynamicIsland, setIsDynamicIsland] = useState(deviceDetector.getDeviceInfo().hasDynamicIsland);
  const [isNotch, setIsNotch] = useState(deviceDetector.getDeviceInfo().hasNotch);
  const [isPunchHole, setIsPunchHole] = useState(deviceDetector.getDeviceInfo().hasPunchHole);
  const [isHomeIndicator, setIsHomeIndicator] = useState(deviceDetector.getDeviceInfo().hasHomeIndicator);
  const [isIOS, setIsIOS] = useState(deviceDetector.getDeviceInfo().platform === 'ios');
  const [isAndroid, setIsAndroid] = useState(deviceDetector.getDeviceInfo().platform === 'android');
  const [isPhone, setIsPhone] = useState(deviceDetector.getDeviceInfo().type === 'phone');
  const [isTablet, setIsTablet] = useState(deviceDetector.getDeviceInfo().type === 'tablet');
  const [isDesktop, setIsDesktop] = useState(deviceDetector.getDeviceInfo().type === 'desktop');
  const [isLandscape, setIsLandscape] = useState(deviceDetector.getDeviceInfo().orientation === 'landscape');
  const [isPortrait, setIsPortrait] = useState(deviceDetector.getDeviceInfo().orientation === 'portrait');

  const updateDeviceInfo = () => {
    const info = deviceDetector.getDeviceInfo();
    setDeviceInfo(info);
    setIsDynamicIsland(info.hasDynamicIsland);
    setIsNotch(info.hasNotch);
    setIsPunchHole(info.hasPunchHole);
    setIsHomeIndicator(info.hasHomeIndicator);
    setIsIOS(info.platform === 'ios');
    setIsAndroid(info.platform === 'android');
    setIsPhone(info.type === 'phone');
    setIsTablet(info.type === 'tablet');
    setIsDesktop(info.type === 'desktop');
    setIsLandscape(info.orientation === 'landscape');
    setIsPortrait(info.orientation === 'portrait');
  };

  useEffect(() => {
    // Update device info on mount
    updateDeviceInfo();

    // Listen for orientation and resize changes
    const handleOrientationChange = () => {
      setTimeout(updateDeviceInfo, 100);
    };

    const handleResize = () => {
      setTimeout(updateDeviceInfo, 100);
    };

    window.addEventListener('orientationchange', handleOrientationChange);
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('orientationchange', handleOrientationChange);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const applyHeaderOptimizations = (element: HTMLElement | null) => {
    if (element) {
      deviceDetector.applyHeaderOptimizations(element);
    }
  };

  const applyContentOptimizations = (element: HTMLElement | null) => {
    if (element) {
      deviceDetector.applyContentOptimizations(element);
    }
  };

  const applyFloatingOptimizations = (element: HTMLElement | null) => {
    if (element) {
      deviceDetector.applyFloatingOptimizations(element);
    }
  };

  const applyModalOptimizations = (element: HTMLElement | null) => {
    if (element) {
      deviceDetector.applyModalOptimizations(element);
    }
  };

  const applyButtonOptimizations = (element: HTMLElement | null) => {
    if (element) {
      deviceDetector.applyButtonOptimizations(element);
    }
  };

  const applyNavigationOptimizations = (element: HTMLElement | null) => {
    if (element) {
      deviceDetector.applyNavigationOptimizations(element);
    }
  };

  const applyBottomSheetOptimizations = (element: HTMLElement | null) => {
    if (element) {
      deviceDetector.applyBottomSheetOptimizations(element);
    }
  };

  const getDeviceSpacing = () => {
    return deviceDetector.getDeviceSpacing();
  };

  return {
    deviceInfo,
    applyHeaderOptimizations,
    applyContentOptimizations,
    applyFloatingOptimizations,
    applyModalOptimizations,
    applyButtonOptimizations,
    applyNavigationOptimizations,
    applyBottomSheetOptimizations,
    getDeviceSpacing,
    isDynamicIsland,
    isNotch,
    isPunchHole,
    isHomeIndicator,
    isIOS,
    isAndroid,
    isPhone,
    isTablet,
    isDesktop,
    isLandscape,
    isPortrait,
  };
};

// Hook for applying optimizations to a specific element
export const useElementOptimization = (
  optimizationType: 'header' | 'content' | 'floating' | 'modal' | 'button' | 'navigation' | 'bottomSheet'
) => {
  const elementRef = useRef<HTMLElement>(null);
  const { applyHeaderOptimizations, applyContentOptimizations, applyFloatingOptimizations, applyModalOptimizations, applyButtonOptimizations, applyNavigationOptimizations, applyBottomSheetOptimizations } = useDeviceOptimization();

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    switch (optimizationType) {
      case 'header':
        applyHeaderOptimizations(element);
        break;
      case 'content':
        applyContentOptimizations(element);
        break;
      case 'floating':
        applyFloatingOptimizations(element);
        break;
      case 'modal':
        applyModalOptimizations(element);
        break;
      case 'button':
        applyButtonOptimizations(element);
        break;
      case 'navigation':
        applyNavigationOptimizations(element);
        break;
      case 'bottomSheet':
        applyBottomSheetOptimizations(element);
        break;
    }
  }, [optimizationType, applyHeaderOptimizations, applyContentOptimizations, applyFloatingOptimizations, applyModalOptimizations, applyButtonOptimizations, applyNavigationOptimizations, applyBottomSheetOptimizations]);

  return elementRef;
};

// Hook for device-specific styling
export const useDeviceStyling = () => {
  const { isDynamicIsland, isNotch, isPunchHole, isHomeIndicator, isIOS, isAndroid, isPhone, isTablet, isDesktop, isLandscape, isPortrait } = useDeviceOptimization();

  const getDeviceClasses = () => {
    const classes = [];

    // Platform classes
    if (isIOS) classes.push('ios-optimized');
    if (isAndroid) classes.push('android-optimized');

    // Device characteristic classes
    if (isDynamicIsland) classes.push('dynamic-island-optimized', 'dynamic-island-safe');
    if (isNotch) classes.push('notch-safe');
    if (isPunchHole) classes.push('punch-hole-header');
    if (isHomeIndicator) classes.push('home-indicator-safe');

    // Device type classes
    if (isPhone) classes.push('device-phone');
    if (isTablet) classes.push('device-tablet');
    if (isDesktop) classes.push('device-desktop');

    // Orientation classes
    if (isLandscape) classes.push('landscape-optimized');
    if (isPortrait) classes.push('portrait-optimized');

    return classes.join(' ');
  };

  const getSafeAreaClasses = () => {
    const classes = [];

    if (isDynamicIsland) classes.push('dynamic-island-safe');
    if (isNotch) classes.push('notch-safe');
    if (isPunchHole) classes.push('punch-hole-header');
    if (isHomeIndicator) classes.push('home-indicator-safe');

    return classes.join(' ');
  };

  return {
    getDeviceClasses,
    getSafeAreaClasses,
    isDynamicIsland,
    isNotch,
    isPunchHole,
    isHomeIndicator,
    isIOS,
    isAndroid,
    isPhone,
    isTablet,
    isDesktop,
    isLandscape,
    isPortrait,
  };
};
