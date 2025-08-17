import React from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';

export const MobileLayoutTest: React.FC = () => {
  return (
    <div className="mobile-safe-area">
      {/* Header Test */}
      <div className="bg-card border-b p-4 sticky top-0 z-50">
        <h1 className="mobile-text-xl tablet-text-2xl font-bold text-center">
          Mobile Layout Test
        </h1>
        <p className="mobile-text-sm tablet-text-base text-center text-muted-foreground mt-2">
          Test responsive design across different device sizes
        </p>
      </div>

      {/* Content Test */}
      <div className="main-content p-4">
        {/* Grid Layout Test */}
        <Card className="mobile-card mb-6">
          <CardHeader>
            <CardTitle className="mobile-text-lg tablet-text-xl">
              Grid Layout Test
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mobile-grid tablet-grid desktop-grid gap-4">
              <div className="bg-blue-100 p-4 rounded-lg text-center">
                <h3 className="mobile-text-base tablet-text-lg font-semibold">Item 1</h3>
                <p className="mobile-text-sm tablet-text-base">Mobile: 1 col, Tablet: 2 cols, Desktop: 4 cols</p>
              </div>
              <div className="bg-green-100 p-4 rounded-lg text-center">
                <h3 className="mobile-text-base tablet-text-lg font-semibold">Item 2</h3>
                <p className="mobile-text-sm tablet-text-base">Responsive grid layout</p>
              </div>
              <div className="bg-yellow-100 p-4 rounded-lg text-center">
                <h3 className="mobile-text-base tablet-text-lg font-semibold">Item 3</h3>
                <p className="mobile-text-sm tablet-text-base">Adapts to screen size</p>
              </div>
              <div className="bg-red-100 p-4 rounded-lg text-center">
                <h3 className="mobile-text-base tablet-text-lg font-semibold">Item 4</h3>
                <p className="mobile-text-sm tablet-text-base">Desktop only visible</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Button Size Test */}
        <Card className="mobile-card mb-6">
          <CardHeader>
            <CardTitle className="mobile-text-lg tablet-text-xl">
              Button Size Test
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-4">
              <Button className="mobile-btn">Mobile Button</Button>
              <Button className="touch-target">Touch Target</Button>
              <Button size="sm">Small Button</Button>
            </div>
            <p className="mobile-text-sm tablet-text-base text-muted-foreground">
              Mobile buttons should be at least 48px tall for proper touch interaction
            </p>
          </CardContent>
        </Card>

        {/* Typography Test */}
        <Card className="mobile-card mb-6">
          <CardHeader>
            <CardTitle className="mobile-text-lg tablet-text-xl">
              Typography Test
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

        {/* Spacing Test */}
        <Card className="mobile-card mb-6">
          <CardHeader>
            <CardTitle className="mobile-text-lg tablet-text-xl">
              Spacing Test
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="mobile-space-1 bg-gray-100 p-2 rounded">
              <p className="mobile-text-sm">Mobile Space 1 (4px)</p>
            </div>
            <div className="mobile-space-2 bg-gray-200 p-2 rounded">
              <p className="mobile-text-sm">Mobile Space 2 (8px)</p>
            </div>
            <div className="mobile-space-3 bg-gray-300 p-2 rounded">
              <p className="mobile-text-sm">Mobile Space 3 (12px)</p>
            </div>
            <div className="mobile-space-4 bg-gray-400 p-2 rounded">
              <p className="mobile-text-sm">Mobile Space 4 (16px)</p>
            </div>
            <div className="mobile-space-5 bg-gray-500 p-2 rounded text-white">
              <p className="mobile-text-sm">Mobile Space 5 (20px)</p>
            </div>
          </CardContent>
        </Card>

        {/* Safe Area Test */}
        <Card className="mobile-card mb-6">
          <CardHeader>
            <CardTitle className="mobile-text-lg tablet-text-xl">
              Safe Area Test
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-blue-50 p-4 rounded-lg border-2 border-blue-200">
              <p className="mobile-text-base tablet-text-lg text-center">
                This area should respect device safe areas (notches, home indicators)
              </p>
              <div className="mt-4 text-center">
                <Badge variant="outline" className="mobile-text-sm tablet-text-base">
                  Safe Area Applied
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Scroll Test */}
        <Card className="mobile-card mb-6">
          <CardHeader>
            <CardTitle className="mobile-text-lg tablet-text-xl">
              Scroll Test
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="mobile-text-base tablet-text-lg">
                This content should be scrollable on mobile devices
              </p>
              {Array.from({ length: 20 }, (_, i) => (
                <div key={i} className="bg-gray-100 p-3 rounded">
                  <p className="mobile-text-sm tablet-text-base">
                    Scroll item {i + 1} - Test scrolling functionality
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Device Info */}
        <Card className="mobile-card">
          <CardHeader>
            <CardTitle className="mobile-text-lg tablet-text-xl">
              Device Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 mobile-text-sm tablet-text-base">
              <p><strong>Viewport Width:</strong> {window.innerWidth}px</p>
              <p><strong>Viewport Height:</strong> {window.innerHeight}px</p>
              <p><strong>Device Pixel Ratio:</strong> {window.devicePixelRatio}</p>
              <p><strong>User Agent:</strong> {navigator.userAgent.substring(0, 50)}...</p>
              <p><strong>PWA Mode:</strong> {window.matchMedia('(display-mode: standalone)').matches ? 'Yes' : 'No'}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
