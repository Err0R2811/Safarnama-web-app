import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MapPin, Navigation, AlertCircle } from 'lucide-react';
import { useGeolocation } from '@/hooks/useGeolocation';

interface MapTrackerProps {
  tripId?: string;
}

const MapTracker = ({ tripId }: MapTrackerProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapboxToken, setMapboxToken] = useState('');
  const [showTokenInput, setShowTokenInput] = useState(true);
  const { location, isLoading, error, getCurrentLocation } = useGeolocation();

  useEffect(() => {
    if (!mapContainer.current || !mapboxToken) return;

    // Initialize map
    mapboxgl.accessToken = mapboxToken;
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      zoom: 2,
      center: [77.2090, 28.6139], // Delhi, India as default center
      pitch: 0,
    });

    // Add navigation controls
    map.current.addControl(
      new mapboxgl.NavigationControl({
        visualizePitch: true,
      }),
      'top-right'
    );

    // Add user location if available
    if (location) {
      // Add marker for current location
      new mapboxgl.Marker({ color: '#30E3CA' })
        .setLngLat([location.longitude, location.latitude])
        .setPopup(
          new mapboxgl.Popup({ offset: 25 })
            .setHTML(`<div><strong>Current Location</strong><br/>${location.address || 'Unknown location'}</div>`)
        )
        .addTo(map.current);

      // Center map on user location
      map.current.setCenter([location.longitude, location.latitude]);
      map.current.setZoom(12);
    }

    // Cleanup
    return () => {
      map.current?.remove();
    };
  }, [mapboxToken, location]);

  const handleTokenSubmit = () => {
    if (mapboxToken.trim()) {
      setShowTokenInput(false);
    }
  };

  if (showTokenInput) {
    return (
      <Card className="bg-gradient-card shadow-card">
        <CardHeader>
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            <CardTitle>Map Configuration</CardTitle>
          </div>
          <CardDescription>
            Enter your Mapbox public token to enable map tracking features.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-accent/10 border border-accent/20 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-accent mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-foreground mb-1">Get your Mapbox token:</p>
                <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                  <li>Visit <a href="https://mapbox.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">mapbox.com</a></li>
                  <li>Create an account or sign in</li>
                  <li>Go to your Dashboard → Tokens</li>
                  <li>Copy your public token</li>
                </ol>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="pk.eyJ1Ijoi..."
              value={mapboxToken}
              onChange={(e) => setMapboxToken(e.target.value)}
              className="flex-1"
            />
            <Button onClick={handleTokenSubmit} disabled={!mapboxToken.trim()}>
              Load Map
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Location Status */}
      <Card className="bg-gradient-card shadow-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Navigation className="h-5 w-5 text-primary" />
              <CardTitle>Location Tracking</CardTitle>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={getCurrentLocation}
              disabled={isLoading}
            >
              {isLoading ? 'Getting Location...' : 'Update Location'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 mb-4">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}
          
          {location && (
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Current Location</p>
                <p className="font-medium text-foreground">{location.address || 'Getting address...'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Coordinates</p>
                <p className="font-mono text-sm text-foreground">
                  {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Map Container */}
      <Card className="bg-gradient-card shadow-card">
        <CardHeader>
          <CardTitle>Trip Map</CardTitle>
          <CardDescription>Track your current location and journey</CardDescription>
        </CardHeader>
        <CardContent>
          <div 
            ref={mapContainer} 
            className="w-full h-96 rounded-lg border border-border overflow-hidden"
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default MapTracker;