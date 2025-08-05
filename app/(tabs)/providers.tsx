import React, { useState, useEffect } from 'react';
import { Text, View, TextInput, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import tw from "../../tailwind";
import { useRouter } from "expo-router";
import { Ionicons } from '@expo/vector-icons';
import { sampleProviders, Provider } from '../utils/sampleProviders';
import { useLocationContext } from '@/hooks/LocationContext';

const haversineDistance = (coords1: { latitude: number; longitude: number }, coords2: { latitude: number; longitude: number }) => {
  const toRad = (x: number) => (x * Math.PI) / 180;

  const lat1 = coords1.latitude;
  const lon1 = coords1.longitude;
  const lat2 = coords2.latitude;
  const lon2 = coords2.longitude;

  const R = 6371; // Radius of Earth in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;
  return d; // distance in km
};

const Providers = () => {
  const router = useRouter();
  const { location } = useLocationContext();
  const [filteredProviders, setFilteredProviders] = useState<Provider[]>([]);

  useEffect(() => {
    if (location && location.coords) {
      const filtered = sampleProviders.filter(provider => {
        const distance = haversineDistance(location.coords, { latitude: provider.latitude, longitude: provider.longitude });
        console.log(`Distance to provider ${provider.name}: ${distance} km`);
        return distance >= 0 && distance <= 100;
      });
      console.log(`Filtered providers count: ${filtered.length}`);
      setFilteredProviders(filtered);
    } else {
      setFilteredProviders([]);
    }
  }, [location]);

  if (!location) {
    return (
      <View style={tw`flex-1 items-center justify-center`}>
        <Text style={tw`text-gray-500`}>User location not available.</Text>
      </View>
    );
  }

  return (
    <>
      <View style={tw`flex-1 bg-white pt-8`}>
        {/* Header bar with 3-dot icon */}
        <View style={tw`px-4 mb-4 flex-row items-center justify-between`}>
          {/* Search Bar */}
          <View style={tw`flex-row flex-1 items-center border border-gray-200 rounded-lg p-2 bg-gray-50`}>
            <TouchableOpacity style={tw`pr-2`}>
              <Ionicons name="search" size={20} color="#3b82f6" />
            </TouchableOpacity>
            <TextInput 
              placeholder="Search for providers, services..." 
              style={tw`flex-1 text-gray-700`} 
            />
          </View>

          {/* Three-dot icon without functionality */}
          <TouchableOpacity style={tw`ml-2`}>
            <Ionicons name="ellipsis-vertical" size={22} color="#3b82f6" />
          </TouchableOpacity>
        </View>

        {/* Distance chip — optional: remove if not needed */}
        <View style={tw`px-4 mb-4`}>
          <View style={tw`border border-blue-500 self-start rounded-full px-4 py-1`}>
            <Text style={tw`text-blue-500 text-sm`}>Within 90-100 km</Text>
          </View>
        </View>

        {/* Heading */}
        <Text style={tw`px-4 text-black font-medium mb-2`}>Select provider to create request</Text>

        {/* Provider list */}
        <ScrollView style={tw`px-4`}>
          {filteredProviders.length === 0 ? (
            <Text style={tw`text-gray-500`}>No providers found within 90-100 km range.</Text>
          ) : (
            filteredProviders.map(provider => {
              const distance = haversineDistance(location.coords, { latitude: provider.latitude, longitude: provider.longitude });
              return (
                <TouchableOpacity 
                  key={provider.id}
                  style={[tw`flex-row items-center bg-white rounded-lg p-4 mb-2`, styles.providerCard]}
                  onPress={() => router.push("/Spraying")}
                >
                  <View style={tw`h-12 w-12 rounded-full bg-blue-500 items-center justify-center mr-4`}>
                    <Text style={tw`text-white font-bold`}>{provider.name.charAt(0)}</Text>
                  </View>
                  <View>
                    <Text style={tw`font-medium text-black`}>{provider.name}</Text>
                    <Text style={tw`text-xs text-gray-500`}>{distance.toFixed(1)} km Away</Text>
                    <Text style={tw`text-xs text-gray-500`}>{provider.city}, {provider.state.toUpperCase()}</Text>
                  </View>
                </TouchableOpacity>
              );
            })
          )}
        </ScrollView>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  filterIconContainer: {
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  providerCard: {
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
  }
});

export default Providers;
