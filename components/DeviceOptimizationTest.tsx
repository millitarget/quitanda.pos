import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { useDeviceOptimization } from '../hooks/useDeviceOptimization';

export const DeviceOptimizationTest: React.FC = () => {
  const {
    deviceInfo,
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
    getDeviceSpacing
  } = useDeviceOptimization();

  const spacing = getDeviceSpacing();

  return (
    <div className="device-content p-4">
      {/* Device Information */}
      <Card className="mobile-card mb-6">
        <CardHeader>
          <CardTitle className="mobile-text-lg tablet-text-xl">
            Device Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="mobile-text-sm font-semibold">Platform:</p>
              <Badge variant={isIOS ? "default" : isAndroid ? "secondary" : "outline"}>
                {deviceInfo.platform.toUpperCase()}
              </Badge>
            </div>
            <div>
              <p className="mobile-text-sm font-semibold">Device Type:</p>
              <Badge variant={isPhone ? "default" : isTablet ? "secondary" : "outline"}>
                {deviceInfo.type}
              </Badge>
            </div>
            <div>
              <p className="mobile-text-sm font-semibold">Model:</p>
              <p className="mobile-text-sm">{deviceInfo.model || 'Unknown'}</p>
            </div>
            <div>
              <p className="mobile-text-sm font-semibold">Orientation:</p>
              <Badge variant={isPortrait ? "default" : "secondary"}>
                {deviceInfo.orientation}
              </Badge>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="mobile-text-sm font-semibold">Screen:</p>
              <p className="mobile-text-sm">{deviceInfo.screenWidth} × {deviceInfo.screenHeight}</p>
            </div>
            <div>
              <p className="mobile-text-sm font-semibold">Pixel Ratio:</p>
              <p className="mobile-text-sm">{deviceInfo.pixelRatio}x</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Device Characteristics */}
      <Card className="mobile-card mb-6">
        <CardHeader>
          <CardTitle className="mobile-text-lg tablet-text-xl">
            Device Characteristics
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${isDynamicIsland ? 'bg-green-500' : 'bg-gray-300'}`}></div>
              <span className="mobile-text-sm">Dynamic Island</span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${isNotch ? 'bg-green-500' : 'bg-gray-300'}`}></div>
              <span className="mobile-text-sm">Notch</span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${isPunchHole ? 'bg-green-500' : 'bg-gray-300'}`}></div>
              <span className="mobile-text-sm">Punch Hole</span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${isHomeIndicator ? 'bg-green-500' : 'bg-gray-300'}`}></div>
              <span className="mobile-text-sm">Home Indicator</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Safe Area Testing */}
      <Card className="mobile-card mb-6">
        <CardHeader>
          <CardTitle className="mobile-text-lg tablet-text-xl">
            Safe Area Testing
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-blue-50 p-4 rounded-lg border-2 border-blue-200">
            <p className="mobile-text-base tablet-text-lg text-center">
              This area respects device safe areas
            </p>
            <div className="mt-4 text-center space-y-2">
              <Badge variant="outline" className="mobile-text-sm tablet-text-base">
                {isDynamicIsland ? 'Dynamic Island Safe' : 
                 isNotch ? 'Notch Safe' : 
                 isPunchHole ? 'Punch Hole Safe' : 
                 'Standard Safe'}
              </Badge>
              {isHomeIndicator && (
                <Badge variant="outline" className="mobile-text-sm tablet-text-base ml-2">
                  Home Indicator Safe
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Device-Specific Spacing */}
      <Card className="mobile-card mb-6">
        <CardHeader>
          <CardTitle className="mobile-text-lg tablet-text-xl">
            Device-Specific Spacing
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="bg-gray-100 p-3 rounded">
              <p className="mobile-text-sm font-semibold">Padding</p>
              <p className="mobile-text-sm">{spacing.padding}px</p>
            </div>
            <div className="bg-gray-200 p-3 rounded">
              <p className="mobile-text-sm font-semibold">Margin</p>
              <p className="mobile-text-sm">{spacing.margin}px</p>
            </div>
            <div className="bg-gray-300 p-3 rounded">
              <p className="mobile-text-sm font-semibold">Gap</p>
              <p className="mobile-text-sm">{spacing.gap}px</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Button Testing */}
      <Card className="mobile-card mb-6">
        <CardHeader>
          <CardTitle className="mobile-text-lg tablet-text-xl">
            Button Optimization Testing
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-4">
            <Button className="mobile-btn">Mobile Button</Button>
            <Button className="touch-target">Touch Target</Button>
            <Button className="device-button">Device Button</Button>
            <Button size="sm">Small Button</Button>
          </div>
          <p className="mobile-text-sm tablet-text-base text-muted-foreground">
            Buttons are optimized for your device: {deviceInfo.platform} {deviceInfo.type}
          </p>
        </CardContent>
      </Card>

      {/* Grid Layout Testing */}
      <Card className="mobile-card mb-6">
        <CardHeader>
          <CardTitle className="mobile-text-lg tablet-text-xl">
            Responsive Grid Testing
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mobile-grid tablet-grid desktop-grid gap-4">
            <div className="bg-blue-100 p-4 rounded-lg text-center">
              <h3 className="mobile-text-base tablet-text-lg font-semibold">Item 1</h3>
              <p className="mobile-text-sm tablet-text-base">Adapts to screen size</p>
            </div>
            <div className="bg-green-100 p-4 rounded-lg text-center">
              <h3 className="mobile-text-base tablet-text-lg font-semibold">Item 2</h3>
              <p className="mobile-text-sm tablet-text-base">Responsive layout</p>
            </div>
            <div className="bg-yellow-100 p-4 rounded-lg text-center">
              <h3 className="mobile-text-base tablet-text-lg font-semibold">Item 3</h3>
              <p className="mobile-text-sm tablet-text-base">Device optimized</p>
            </div>
            <div className="bg-red-100 p-4 rounded-lg text-center">
              <h3 className="mobile-text-sm tablet-text-base font-semibold">Item 4</h3>
              <p className="mobile-text-xs tablet-text-sm">Desktop visible</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Typography Testing */}
      <Card className="mobile-card mb-6">
        <CardHeader>
          <CardTitle className="mobile-text-lg tablet-text-xl">
            Typography Scaling
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <h1 className="mobile-text-2xl tablet-text-2xl font-bold">Heading 1</h1>
          <h2 className="mobile-text-xl tablet-text-xl font-semibold">Heading 2</h2>
          <h3 className="mobile-text-lg tablet-text-lg font-medium">Heading 3</h3>
          <p className="mobile-text-base tablet-text-base">Base text size</p>
          <p className="mobile-text-sm tablet-text-sm">Small text size</p>
          <p className="mobile-text-xs tablet-text-xs">Extra small text</p>
        </CardContent>
      </Card>

      {/* Scroll Testing */}
      <Card className="mobile-card">
        <CardHeader>
          <CardTitle className="mobile-text-lg tablet-text-xl">
            Scroll and Layout Testing
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="mobile-text-base tablet-text-lg">
              This content should be scrollable and properly positioned on your device
            </p>
            {Array.from({ length: 15 }, (_, i) => (
              <div key={i} className="bg-gray-100 p-3 rounded">
                <p className="mobile-text-sm tablet-text-base">
                  Scroll item {i + 1} - Test scrolling and positioning
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
