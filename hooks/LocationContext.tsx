import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import * as Location from 'expo-location';

interface Coords {
  latitude: number;
  longitude: number;
}

interface LocationData {
  coords: Coords;
  address?: string;
  name?: string;
}

interface LocationContextType {
  location: LocationData | null;
  setLocation: (location: LocationData) => void;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export const LocationProvider = ({ children }: { children: ReactNode }) => {
  const [location, setLocation] = useState<LocationData | null>(null);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.warn('Permission to access location was denied');
        return;
      }

      let loc = await Location.getCurrentPositionAsync({});
      let reverseGeocode = await Location.reverseGeocodeAsync({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      });

      let address = reverseGeocode.length > 0 ? reverseGeocode[0] : undefined;
      let formattedAddress = address
        ? `${address.name ? address.name + ', ' : ''}${address.city ? address.city + ', ' : ''}${address.region ? address.region + ', ' : ''}${address.country ?? ''}`
        : undefined;

      setLocation({
        coords: {
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
        },
        address: formattedAddress ?? undefined,
        name: address?.name ?? undefined,
      });
    })();
  }, []);

  return (
    <LocationContext.Provider value={{ location, setLocation }}>
      {children}
    </LocationContext.Provider>
  );
};

export const useLocationContext = (): LocationContextType => {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useLocationContext must be used within a LocationProvider');
  }
  return context;
};
