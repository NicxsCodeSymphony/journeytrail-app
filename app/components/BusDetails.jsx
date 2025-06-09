import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, Modal, Platform, SafeAreaView, StatusBar, ScrollView } from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import WebView from 'react-native-webview';
import getLocationDetails from '../utils/getCurrentPosition';

const calculateDistance = (lat1, lon1, lat2, lon2) => {
    if (!lat1 || !lon1 || !lat2 || !lon2) return null;
    
    const R = 6371;
    const dLat = (lat2 - lat1) * (Math.PI/180);
    const dLon = (lon2 - lon1) * (Math.PI/180);
    const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * (Math.PI/180)) * Math.cos(lat2 * (Math.PI/180)) * 
        Math.sin(dLon/2) * Math.sin(dLon/2); 
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    return R * c;
};

const BusDetailsModal = ({ visible, onClose, selectedBus }) => {
    console.log(selectedBus)
    const [currentLocation, setCurrentLocation] = useState(null);

    useEffect(() => {
        const fetchCurrentLocation = async () => {
            try {
                const position = await getLocationDetails(selectedBus?.from_latitude, selectedBus?.from_longitude);
                setCurrentLocation(position);
            } catch (error) {
                
            }
        };

        fetchCurrentLocation();
    }, [selectedBus]);

    const calculateEstimatedArrivalTime = (fromLat, fromLon, toLat, toLon, averageSpeed = 40) => {
        const distance = calculateDistance(fromLat, fromLon, toLat, toLon);
        
        if (!distance || distance <= 0) return 'At location';
        
        const timeInHours = distance / averageSpeed;
        const timeInMinutes = Math.round(timeInHours * 60);

        if (timeInMinutes >= 60) {
            // Convert to decimal hours format
            const decimalHours = (timeInMinutes / 60).toFixed(1);
            return `${decimalHours} hrs`;
        } else if (timeInMinutes > 1) {
            return `${timeInMinutes} mins`;
        } else {
            return `${timeInMinutes} min`;
        }
    };

    const mapHTML = `
        <!DOCTYPE html>
        <html>
            <head>
                <link rel="stylesheet" href="https://unpkg.com/leaflet@1.7.1/dist/leaflet.css" />
                <script src="https://unpkg.com/leaflet@1.7.1/dist/leaflet.js"></script>
                <style>
                    #map { height: 100vh; width: 100vw; }
                    body { margin: 0; padding: 0; }
                </style>
            </head>
            <body>
                <div id="map"></div>
                <script>
                    const map = L.map('map', { zoomControl: false }).setView([${selectedBus?.from_latitude || 0}, ${selectedBus?.from_longitude || 0}], 13);
                    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                        attribution: 'OpenStreetMap contributors'
                    }).addTo(map);

                    const fromMarker = L.marker([${selectedBus?.from_latitude || 0}, ${selectedBus?.from_longitude || 0}], {
                        icon: L.divIcon({
                            className: 'custom-marker',
                            html: '<div style="background-color: #4CAF50; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white;"></div>'
                        })
                    }).addTo(map).bindPopup('${selectedBus?.from_route || "Start"}');

                    const toMarker = L.marker([${selectedBus?.to_latitude || 0}, ${selectedBus?.to_longitude || 0}], {
                        icon: L.divIcon({
                            className: 'custom-marker',
                            html: '<div style="background-color: #F44336; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white;"></div>'
                        })
                    }).addTo(map).bindPopup('${selectedBus?.to_route || "Destination"}');

                    const routeLine = L.polyline([
                        [${selectedBus?.from_latitude || 0}, ${selectedBus?.from_longitude || 0}],
                        [${selectedBus?.to_latitude || 0}, ${selectedBus?.to_longitude || 0}]
                    ], {
                        color: '#2196F3',
                        weight: 4,
                        opacity: 0.8,
                        dashArray: '10, 10'
                    }).addTo(map);

                    map.fitBounds(routeLine.getBounds(), { padding: [50, 50] });

                    ${currentLocation ? `
                        const currentMarker = L.marker([${currentLocation.latitude}, ${currentLocation.longitude}], {
                            icon: L.divIcon({
                                className: 'custom-marker',
                                html: '<div style="background-color: #FF5722; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white;"></div>'
                            })
                        }).addTo(map).bindPopup('Current Location');
                    ` : ''}
                </script>
            </body>
        </html>
    `;

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
        >
            <SafeAreaView className="h-screen w-[100vw] bg-white z-0">
                <StatusBar barStyle="light-content" />
                <View className="h-[45%] w-full relative">
                    <WebView
                        source={{ html: mapHTML }}
                        scrollEnabled={false} 
                        pointerEvents="none" 
                        nestedScrollEnabled={false} 
                        androidLayerType="hardware"
                    />
                    <TouchableOpacity 
                        onPress={onClose}
                        style={{
                            position: "absolute",
                            top: 20,
                            left: 20,
                            backgroundColor: "white",
                            padding: 10,
                            borderRadius: 50,
                            elevation: 5,
                            shadowColor: "#000",
                            shadowOffset: { width: 0, height: 2 },
                            shadowOpacity: 0.25,
                            shadowRadius: 3.84,
                            zIndex: 1000,
                        }}
                    >
                        <Icon name="arrow-back" size={24} color="#2D3748" />
                    </TouchableOpacity>
                </View>
                <ScrollView className="flex-1">
                    <View className="bg-white px-6 pt-6 rounded-t-3xl -mt-6 shadow-lg">
                        {selectedBus && (
                            <>
                                <View className="flex-row justify-between items-center mb-6 pt-10">
                                    <View>
                                        <Text className="text-2xl font-bold text-gray-800">Bus {selectedBus?.bus_code}</Text>
                                        <Text className="text-gray-500 mt-1">{selectedBus?.bus_type}</Text>
                                    </View>
                                    <View className="bg-green-100 px-4 py-2 rounded-full">
                                        <Text className="text-green-800 font-medium">{selectedBus?.status}</Text>
                                    </View>
                                </View>
                                <View className="bg-gray-50 rounded-2xl p-4 mb-6">
                                    <View className="flex-row items-center mb-4">
                                        <Icon name="timeline" size={24} color="#4A5568" />
                                        <Text className="text-lg font-semibold ml-2 text-gray-800">Route Information</Text>
                                    </View>
                                    <View className="flex-row items-center justify-between">
                                        <View className="flex-1">
                                            <Text className="text-gray-500 mb-1">From</Text>
                                            <Text className="font-medium text-gray-800">{selectedBus.from_route}</Text>
                                        </View>
                                        <Icon name="arrow-forward" size={20} color="#4A5568" style={{ marginHorizontal: 12 }} />
                                        <View className="flex-1">
                                            <Text className="text-gray-500 mb-1">To</Text>
                                            <Text className="font-medium text-gray-800">{selectedBus.to_route}</Text>
                                        </View>
                                    </View>
                                </View>
                                <View className="bg-gray-50 rounded-2xl p-4 mb-6">
                                    <View className="flex-row items-center mb-4">
                                        <Icon name="location-on" size={24} color="#4A5568" />
                                        <Text className="text-lg font-semibold ml-2 text-gray-800">Next Stop</Text>
                                    </View>
                                    <Text className="font-medium text-gray-800">{selectedBus.to_route}</Text>
                                </View>
                                <View className="flex-row flex-wrap justify-between mb-4">
                                    <View className="w-[30%] bg-gray-50 p-4 rounded-xl mb-4">
                                        <Icon name="people" size={24} color="#4A5568" className="mb-2" />
                                        <Text className="text-gray-500 mb-1">Seats</Text>
                                        <Text className="text-xl font-bold text-gray-800">
                                            {selectedBus?.capacity - selectedBus.passenger_count}/{selectedBus.capacity}
                                        </Text>
                                    </View>
                                    <View className="w-[30%] bg-gray-50 p-4 rounded-xl mb-4">
                                        <Icon name="straighten" size={24} color="#4A5568" className="mb-2" />
                                        <Text className="text-gray-500 mb-1">Distance</Text>
                                        <Text className="text-xl font-bold text-gray-800">
                                            {Math.round(calculateDistance(
                                                selectedBus.from_latitude,
                                                selectedBus.from_longitude,
                                                selectedBus.to_latitude,
                                                selectedBus.to_longitude
                                            ))} km
                                        </Text>
                                    </View>
                                    <View className="w-[30%] bg-gray-50 p-4 rounded-xl mb-4">
                                        <Icon name="access-time" size={24} color="#4A5568" className="mb-2" />
                                        <Text className="text-gray-500 mb-1">ETA</Text>
                                        <Text className="text-xl font-bold text-gray-800">
                                            {calculateEstimatedArrivalTime(
                                                selectedBus.from_latitude,
                                                selectedBus.from_longitude,
                                                selectedBus.to_latitude,
                                                selectedBus.to_longitude
                                            )}
                                        </Text>
                                    </View>
                                </View>
                            </>
                        )}
                    </View>
                </ScrollView>
            </SafeAreaView>
        </Modal>
    );
};

export default BusDetailsModal;