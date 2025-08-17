// Device Detection and Optimization Utility

export interface DeviceInfo {
  type: 'phone' | 'tablet' | 'desktop';
  platform: 'ios' | 'android' | 'web';
  model?: string;
  hasNotch: boolean;
  hasDynamicIsland: boolean;
  hasPunchHole: boolean;
  hasHomeIndicator: boolean;
  screenWidth: number;
  screenHeight: number;
  pixelRatio: number;
  orientation: 'portrait' | 'landscape';
  safeAreas: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };
}

export class DeviceDetector {
  private static instance: DeviceDetector;
  private deviceInfo: DeviceInfo;

  private constructor() {
    this.deviceInfo = this.detectDevice();
    this.applyOptimizations();
  }

  public static getInstance(): DeviceDetector {
    if (!DeviceDetector.instance) {
      DeviceDetector.instance = new DeviceDetector();
    }
    return DeviceDetector.instance;
  }

  public getDeviceInfo(): DeviceInfo {
    return this.deviceInfo;
  }

  private detectDevice(): DeviceInfo {
    const userAgent = navigator.userAgent.toLowerCase();
    const isIOS = /iphone|ipad|ipod/.test(userAgent);
    const isAndroid = /android/.test(userAgent);
    const isTablet = /tablet|ipad/.test(userAgent) || 
                     (isAndroid && /mobile|phone/.test(userAgent) === false);

    // Detect screen dimensions
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    const pixelRatio = window.devicePixelRatio || 1;

    // Detect orientation
    const orientation = screenHeight > screenWidth ? 'portrait' : 'landscape';

    // Detect device type
    let type: 'phone' | 'tablet' | 'desktop' = 'desktop';
    if (isIOS || isAndroid) {
      type = isTablet ? 'tablet' : 'phone';
    }

    // Detect platform
    let platform: 'ios' | 'android' | 'web' = 'web';
    if (isIOS) platform = 'ios';
    else if (isAndroid) platform = 'android';

    // Detect device model for iOS
    let model: string | undefined;
    if (isIOS) {
      model = this.detectIPhoneModel(screenWidth, screenHeight);
    }

    // Detect device characteristics
    const hasNotch = this.detectNotch();
    const hasDynamicIsland = this.detectDynamicIsland();
    const hasPunchHole = this.detectPunchHole();
    const hasHomeIndicator = this.detectHomeIndicator();

    // Get safe area insets
    const safeAreas = this.getSafeAreas();

    return {
      type,
      platform,
      model,
      hasNotch,
      hasDynamicIsland,
      hasPunchHole,
      hasHomeIndicator,
      screenWidth,
      screenHeight,
      pixelRatio,
      orientation,
      safeAreas
    };
  }

  private detectIPhoneModel(width: number, height: number): string {
    // iPhone models based on screen dimensions
    if (width === 375 && height === 667) return 'iPhone SE (1st/2nd gen)';
    if (width === 375 && height === 812) return 'iPhone X/XS/11 Pro';
    if (width === 414 && height === 896) return 'iPhone XR/11';
    if (width === 390 && height === 844) return 'iPhone 12/13/14';
    if (width === 428 && height === 926) return 'iPhone 12/13/14 Pro Max';
    if (width === 393 && height === 852) return 'iPhone 14/15 Pro';
    if (width === 430 && height === 932) return 'iPhone 14/15 Pro Max';
    return 'iPhone (Unknown)';
  }

  private detectNotch(): boolean {
    // Detect devices with notches
    const userAgent = navigator.userAgent.toLowerCase();
    const isIPhoneX = /iphone/.test(userAgent) && 
                      (window.screen.height === 812 || 
                       window.screen.height === 896 ||
                       window.screen.height === 844 ||
                       window.screen.height === 926);
    
    return isIPhoneX;
  }

  private detectDynamicIsland(): boolean {
    // iPhone 14 Pro and 15 Pro have Dynamic Island
    const userAgent = navigator.userAgent.toLowerCase();
    const isIPhone14Pro = /iphone/.test(userAgent) && 
                          (window.screen.height === 852 ||
                           window.screen.height === 932);
    
    return isIPhone14Pro;
  }

  private detectPunchHole(): boolean {
    // Detect Android devices with punch-hole cameras
    const userAgent = navigator.userAgent.toLowerCase();
    const isAndroid = /android/.test(userAgent);
    const hasPunchHole = isAndroid && (
      /samsung/.test(userAgent) ||
      /huawei/.test(userAgent) ||
      /xiaomi/.test(userAgent) ||
      /oneplus/.test(userAgent)
    );
    
    return hasPunchHole;
  }

  private detectHomeIndicator(): boolean {
    // Devices without home button have home indicator
    const userAgent = navigator.userAgent.toLowerCase();
    const isIPhoneXPlus = /iphone/.test(userAgent) && 
                          (window.screen.height >= 812);
    const isAndroidModern = /android/.test(userAgent) && 
                            (window.screen.height >= 800);
    
    return isIPhoneXPlus || isAndroidModern;
  }

  private getSafeAreas() {
    // Get safe area insets using CSS environment variables
    const style = getComputedStyle(document.documentElement);
    const top = parseInt(style.getPropertyValue('--safe-area-top') || '0');
    const bottom = parseInt(style.getPropertyValue('--safe-area-bottom') || '0');
    const left = parseInt(style.getPropertyValue('--safe-area-left') || '0');
    const right = parseInt(style.getPropertyValue('--safe-area-right') || '0');

    return { top, bottom, left, right };
  }

  private applyOptimizations(): void {
    const root = document.documentElement;
    const body = document.body;

    // Apply base device classes
    root.classList.add(`device-${this.deviceInfo.type}`);
    root.classList.add(`platform-${this.deviceInfo.platform}`);

    // Apply iOS-specific optimizations
    if (this.deviceInfo.platform === 'ios') {
      body.classList.add('ios-optimized');
      
      if (this.deviceInfo.hasDynamicIsland) {
        body.classList.add('dynamic-island-optimized');
        body.classList.add('dynamic-island-safe');
      } else if (this.deviceInfo.hasNotch) {
        body.classList.add('notch-safe');
      }
      
      if (this.deviceInfo.hasHomeIndicator) {
        body.classList.add('home-indicator-safe');
      }
    }

    // Apply Android-specific optimizations
    if (this.deviceInfo.platform === 'android') {
      body.classList.add('android-optimized');
      
      if (this.deviceInfo.hasPunchHole) {
        body.classList.add('punch-hole-header');
      }
    }

    // Apply screen size optimizations
    if (this.deviceInfo.screenWidth <= 375) {
      body.classList.add('small-screen-optimized');
      body.classList.add('small-screen-spacing');
      body.classList.add('small-screen-grid');
      body.classList.add('small-screen-text');
    } else if (this.deviceInfo.screenWidth <= 414) {
      body.classList.add('medium-screen-optimized');
      body.classList.add('medium-screen-spacing');
      body.classList.add('medium-screen-grid');
      body.classList.add('medium-screen-text');
    } else {
      body.classList.add('large-screen-optimized');
      body.classList.add('large-screen-spacing');
      body.classList.add('large-phone-grid');
      body.classList.add('large-screen-text');
    }

    // Apply orientation optimizations
    if (this.deviceInfo.orientation === 'landscape') {
      if (this.deviceInfo.screenHeight <= 500) {
        body.classList.add('landscape-phone-optimized');
      } else {
        body.classList.add('landscape-tablet-optimized');
      }
    }

    // Apply high DPI optimizations
    if (this.deviceInfo.pixelRatio >= 3) {
      body.classList.add('ultra-hd-optimized');
    }

    // Apply foldable optimizations
    if (this.deviceInfo.screenWidth >= 600 && this.deviceInfo.screenWidth <= 800) {
      body.classList.add('foldable-optimized');
    }

    // Apply ultra-wide optimizations
    if (this.deviceInfo.screenWidth >= 600 && this.deviceInfo.screenHeight <= 800) {
      body.classList.add('ultra-wide-optimized');
    }

    // Set CSS custom properties for safe areas
    root.style.setProperty('--safe-area-top', `${this.deviceInfo.safeAreas.top}px`);
    root.style.setProperty('--safe-area-bottom', `${this.deviceInfo.safeAreas.bottom}px`);
    root.style.setProperty('--safe-area-left', `${this.deviceInfo.safeAreas.left}px`);
    root.style.setProperty('--safe-area-right', `${this.deviceInfo.safeAreas.right}px`);
  }

  // Public methods for manual class application
  public applyHeaderOptimizations(element: HTMLElement): void {
    if (this.deviceInfo.hasDynamicIsland) {
      element.classList.add('dynamic-island-header');
    } else if (this.deviceInfo.hasNotch) {
      element.classList.add('notch-header');
    } else if (this.deviceInfo.hasPunchHole) {
      element.classList.add('punch-hole-header');
    }
    
    element.classList.add('device-header');
  }

  public applyContentOptimizations(element: HTMLElement): void {
    element.classList.add('device-content');
  }

  public applyFloatingOptimizations(element: HTMLElement): void {
    element.classList.add('floating-element');
  }

  public applyModalOptimizations(element: HTMLElement): void {
    element.classList.add('device-modal');
  }

  public applyButtonOptimizations(element: HTMLElement): void {
    element.classList.add('device-button');
    
    if (this.deviceInfo.hasDynamicIsland) {
      element.classList.add('dynamic-island-button');
    }
  }

  public applyNavigationOptimizations(element: HTMLElement): void {
    element.classList.add('device-nav');
  }

  public applyBottomSheetOptimizations(element: HTMLElement): void {
    element.classList.add('bottom-sheet');
  }

  // Method to reapply optimizations after orientation change
  public handleOrientationChange(): void {
    this.deviceInfo.orientation = window.innerHeight > window.innerWidth ? 'portrait' : 'landscape';
    this.applyOptimizations();
  }

  // Method to get device-specific spacing values
  public getDeviceSpacing(): { padding: number; margin: number; gap: number } {
    if (this.deviceInfo.screenWidth <= 375) {
      return { padding: 12, margin: 12, gap: 8 };
    } else if (this.deviceInfo.screenWidth <= 414) {
      return { padding: 16, margin: 16, gap: 12 };
    } else {
      return { padding: 20, margin: 20, gap: 16 };
    }
  }
}

// Export singleton instance
export const deviceDetector = DeviceDetector.getInstance();

// Auto-initialize on page load
if (typeof window !== 'undefined') {
  window.addEventListener('load', () => {
    deviceDetector;
  });
  
  window.addEventListener('orientationchange', () => {
    setTimeout(() => {
      deviceDetector.handleOrientationChange();
    }, 100);
  });
  
  window.addEventListener('resize', () => {
    setTimeout(() => {
      deviceDetector.handleOrientationChange();
    }, 100);
  });
}
