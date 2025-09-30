import { useState, useEffect } from 'react';
import { Geolocation } from '@capacitor/geolocation';

interface GeolocationData {
  latitude: number;
  longitude: number;
  address?: string;
}

interface UseGeolocationResult {
  location: GeolocationData | null;
  isLoading: boolean;
  error: string | null;
  getCurrentLocation: () => Promise<void>;
  reverseGeocode: (lat: number, lng: number) => Promise<string>;
}

export const useGeolocation = (): UseGeolocationResult => {
  const [location, setLocation] = useState<GeolocationData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reverseGeocode = async (lat: number, lng: number): Promise<string> => {
    try {
      const response = await fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`
      );
      const data = await response.json();
      return data.locality ? `${data.locality}, ${data.countryName}` : `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    } catch (error) {
      console.error('Reverse geocoding failed:', error);
      return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    }
  };

  const getCurrentLocation = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Check permissions first
      const permission = await Geolocation.checkPermissions();
      
      if (permission.location !== 'granted') {
        const requestPermission = await Geolocation.requestPermissions();
        if (requestPermission.location !== 'granted') {
          throw new Error('Location permission not granted');
        }
      }

      // Get current position
      const position = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 10000,
      });

      const { latitude, longitude } = position.coords;
      const address = await reverseGeocode(latitude, longitude);

      setLocation({
        latitude,
        longitude,
        address,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get location';
      setError(errorMessage);
      console.error('Geolocation error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Automatically get location on mount
    getCurrentLocation();
  }, []);

  return {
    location,
    isLoading,
    error,
    getCurrentLocation,
    reverseGeocode,
  };
};