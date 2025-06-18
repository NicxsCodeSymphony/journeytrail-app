import React, { useState } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator, ScrollView, Modal, Alert } from "react-native";
import { useRouter } from "expo-router";
import Icon from "react-native-vector-icons/MaterialIcons";
import { getData } from "../utils/getData";
import { saveData } from "../utils/sqlite";
import LocationPicker from "./components/LocationPicker";

const CalculatorPage = () => {
    const router = useRouter();
    const { data: busFareData, isLoading: isFareLoading } = getData(`busFare`);
    
    const [startLocation, setStartLocation] = useState(null);
    const [endLocation, setEndLocation] = useState(null);
    const [selectedBusType, setSelectedBusType] = useState(null);
    const [selectedPassengerType, setSelectedPassengerType] = useState('regular');
    const [showStartPicker, setShowStartPicker] = useState(false);
    const [showEndPicker, setShowEndPicker] = useState(false);
    const [showPassengerTypePicker, setShowPassengerTypePicker] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const passengerTypes = [
        { id: 'regular', label: 'Regular', discount: 0, icon: 'person' },
        { id: 'student', label: 'Student', discount: 5, icon: 'school' },
        { id: 'pwd', label: 'PWD', discount: 5, icon: 'accessible' },
        { id: 'senior', label: 'Senior Citizen', discount: 5, icon: 'elderly' }
    ];

    // Calculate distance between two coordinates (Haversine formula)
    const calculateDistance = (lat1, lon1, lat2, lon2) => {
        if (!lat1 || !lon1 || !lat2 || !lon2) return null;
        
        const R = 6371; // Earth's radius in kilometers
        const dLat = (lat2 - lat1) * (Math.PI/180);
        const dLon = (lon2 - lon1) * (Math.PI/180);
        const a = 
            Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * (Math.PI/180)) * Math.cos(lat2 * (Math.PI/180)) * 
            Math.sin(dLon/2) * Math.sin(dLon/2); 
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
        return R * c;
    };

    // Calculate fare based on distance, bus type, and passenger type
    const calculateFare = () => {
        if (!startLocation || !endLocation || !selectedBusType) return null;
        
        const distance = calculateDistance(
            parseFloat(startLocation.latitude),
            parseFloat(startLocation.longitude),
            parseFloat(endLocation.latitude),
            parseFloat(endLocation.longitude)
        );
        
        if (!distance) return null;
        
        const fareRate = selectedBusType.fare || selectedBusType.airconFare || 0;
        const passengerType = passengerTypes.find(type => type.id === selectedPassengerType);
        
        // Calculate base fare
        const baseFare = distance * fareRate;
        
        // Apply discount if applicable
        const discountAmount = (baseFare * passengerType.discount) / 100;
        const totalFare = baseFare - discountAmount;
        
        return {
            distance: distance,
            fareRate: fareRate,
            baseFare: baseFare,
            passengerType: passengerType,
            discountAmount: discountAmount,
            totalFare: totalFare
        };
    };

    const fareCalculation = calculateFare();

    // Save trip data function
    const saveTripData = async () => {
        if (!fareCalculation) {
            Alert.alert(
                "Incomplete Information",
                "Please complete all selections (start location, end location, bus type) before saving.",
                [{ text: "OK" }]
            );
            return;
        }

        setIsSaving(true);
        
        try {
            const tripData = {
                startLocation: {
                    place: startLocation.place,
                    province: startLocation.province,
                    latitude: startLocation.latitude,
                    longitude: startLocation.longitude
                },
                endLocation: {
                    place: endLocation.place,
                    province: endLocation.province,
                    latitude: endLocation.latitude,
                    longitude: endLocation.longitude
                },
                busType: {
                    type: selectedBusType.bus_type,
                    fare: selectedBusType.fare || selectedBusType.airconFare
                },
                passengerType: {
                    type: selectedPassengerType,
                    label: fareCalculation.passengerType.label,
                    discount: fareCalculation.passengerType.discount
                },
                calculation: {
                    distance: fareCalculation.distance,
                    fareRate: fareCalculation.fareRate,
                    baseFare: fareCalculation.baseFare,
                    discountAmount: fareCalculation.discountAmount,
                    totalFare: fareCalculation.totalFare
                },
                savedAt: new Date().toISOString(),
                savedDate: new Date().toLocaleDateString(),
                savedTime: new Date().toLocaleTimeString()
            };

            const success = await saveData('saved_trips', tripData);
            
            if (success) {
                Alert.alert(
                    "Trip Saved Successfully! 🎉",
                    `Your trip from ${startLocation.place} to ${endLocation.place} has been saved.`,
                    [{ text: "OK" }]
                );
            } else {
                Alert.alert(
                    "Save Failed",
                    "Failed to save your trip. Please try again.",
                    [{ text: "OK" }]
                );
            }
        } catch (error) {
            console.error("Error saving trip:", error);
            Alert.alert(
                "Save Failed",
                "An error occurred while saving your trip. Please try again.",
                [{ text: "OK" }]
            );
        } finally {
            setIsSaving(false);
        }
    };

    const renderFareCard = (fareItem, index) => {
        if (!fareItem || !fareItem.bus_type) return null;
        
        const isRegular = fareItem.bus_type === "Regular";
        const fare = fareItem.fare || fareItem.airconFare || 0;
        const isSelected = selectedBusType && 
            selectedBusType.bus_type === fareItem.bus_type;
        
        return (
            <TouchableOpacity 
                key={index}
                className={`w-20 h-20 mx-2 mb-4 p-2 rounded-xl shadow-md ${
                    isSelected 
                        ? 'bg-[#D15D73] border-2 border-[#D15D73]' 
                        : isRegular 
                            ? 'bg-[#F6887C]' 
                            : 'bg-teal-600'
                }`}
                onPress={() => setSelectedBusType(fareItem)}
                activeOpacity={0.7}
            >
                <View className="flex items-center justify-center h-full">
                    <Icon 
                        name={isRegular ? "directions-bus" : "ac-unit"} 
                        size={16} 
                        color="white" 
                    />
                    <Text 
                        className="text-sm font-bold text-white mt-1" 
                        style={{ fontFamily: 'Poppins_700Bold' }}
                    >
                        ₱{fare}
                    </Text>
                    {isSelected && (
                        <View className="absolute -top-1 -right-1">
                            <Icon name="check-circle" size={16} color="white" />
                        </View>
                    )}
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <View className="flex-1 bg-gray-50">
            {/* Header with back button */}
            <View className="pt-14 px-7 pb-6 bg-white">
                <TouchableOpacity 
                    onPress={() => router.back()}
                    className="flex-row items-center mb-4"
                >
                    <Icon name="arrow-back" size={24} color="#D15D73" />
                    <Text className="ml-2 text-lg text-[#D15D73]" style={{ fontFamily: 'Montserrat_600SemiBold' }}>
                        Back
                    </Text>
                </TouchableOpacity>
                
                <View className="flex-row items-center justify-between">
                    <View className="flex-1">
                        <Text className="text-3xl text-[#D15D73]" style={{ fontFamily: 'Montserrat_700Bold' }}>
                            Fare Calculator
                        </Text>
                        <Text className="text-sm text-gray-600 mt-1" style={{ fontFamily: 'Montserrat_400Regular' }}>
                            Current bus fare rates
                        </Text>
                    </View>
                    <TouchableOpacity
                        className="bg-teal-600 p-3 rounded-xl flex-row items-center"
                        onPress={() => router.push('/saved-trips')}
                        activeOpacity={0.8}
                    >
                        <Icon name="history" size={20} color="white" />
                        <Text className="text-white ml-2 text-sm" style={{ fontFamily: 'Montserrat_600SemiBold' }}>
                            Saved Trips
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                {/* Location Input Section */}
                <View className="px-7 py-4">
                    <View className="flex-row items-center mb-4">
                        <Icon name="route" size={20} color="#D15D73" />
                        <Text className="text-lg ml-2 text-gray-800" style={{ fontFamily: 'Montserrat_700Bold' }}>
                            Plan Your Trip
                        </Text>
                    </View>
                    
                    {/* Start Location Input */}
                    <View className="mb-4">
                        <Text className="text-sm text-gray-600 mb-2" style={{ fontFamily: 'Montserrat_500Medium' }}>
                            Start Location
                        </Text>
                        <TouchableOpacity
                            className="bg-white border border-gray-200 rounded-xl p-4 flex-row items-center shadow-sm"
                            onPress={() => setShowStartPicker(true)}
                        >
                            <Icon name="my-location" size={20} color="#D15D73" />
                            <View className="flex-1 ml-3">
                                <Text 
                                    className={`${startLocation ? 'text-gray-800' : 'text-gray-400'}`}
                                    style={{ fontFamily: 'Montserrat_400Regular' }}
                                >
                                    {startLocation ? startLocation.place : "Select starting point"}
                                </Text>
                                {startLocation && (
                                    <Text 
                                        className="text-xs text-gray-500 mt-1"
                                        style={{ fontFamily: 'Montserrat_400Regular' }}
                                    >
                                        {startLocation.province}
                                    </Text>
                                )}
                            </View>
                            <Icon name="keyboard-arrow-right" size={20} color="#ccc" />
                        </TouchableOpacity>
                    </View>
                    
                    {/* End Location Input */}
                    <View className="mb-4">
                        <Text className="text-sm text-gray-600 mb-2" style={{ fontFamily: 'Montserrat_500Medium' }}>
                            End Location
                        </Text>
                        <TouchableOpacity
                            className="bg-white border border-gray-200 rounded-xl p-4 flex-row items-center shadow-sm"
                            onPress={() => setShowEndPicker(true)}
                        >
                            <Icon name="place" size={20} color="#D15D73" />
                            <View className="flex-1 ml-3">
                                <Text 
                                    className={`${endLocation ? 'text-gray-800' : 'text-gray-400'}`}
                                    style={{ fontFamily: 'Montserrat_400Regular' }}
                                >
                                    {endLocation ? endLocation.place : "Select destination"}
                                </Text>
                                {endLocation && (
                                    <Text 
                                        className="text-xs text-gray-500 mt-1"
                                        style={{ fontFamily: 'Montserrat_400Regular' }}
                                    >
                                        {endLocation.province}
                                    </Text>
                                )}
                            </View>
                            <Icon name="keyboard-arrow-right" size={20} color="#ccc" />
                        </TouchableOpacity>
                    </View>
                    
                    {/* Bus Type Selection Input */}
                    <View className="mb-4">
                        <Text className="text-sm text-gray-600 mb-2" style={{ fontFamily: 'Montserrat_500Medium' }}>
                            Bus Type
                        </Text>
                        <TouchableOpacity
                            className="bg-white border border-gray-200 rounded-xl p-4 flex-row items-center shadow-sm"
                            disabled={true}
                        >
                            <Icon name="directions-bus" size={20} color="#D15D73" />
                            <View className="flex-1 ml-3">
                                <Text 
                                    className={`${selectedBusType ? 'text-gray-800' : 'text-gray-400'}`}
                                    style={{ fontFamily: 'Montserrat_400Regular' }}
                                >
                                    {selectedBusType ? `${selectedBusType.bus_type} Bus` : "Select bus type below"}
                                </Text>
                                {selectedBusType && (
                                                                         <Text 
                                         className="text-xs text-gray-500 mt-1"
                                         style={{ fontFamily: 'Montserrat_400Regular' }}
                                     >
                                         ₱{selectedBusType.fare || selectedBusType.airconFare} per km
                                     </Text>
                                )}
                            </View>
                            <Icon name="info" size={20} color="#ccc" />
                        </TouchableOpacity>
                    </View>

                    {/* Passenger Type Selection Input */}
                    <View className="mb-4">
                        <Text className="text-sm text-gray-600 mb-2" style={{ fontFamily: 'Montserrat_500Medium' }}>
                            Passenger Type
                        </Text>
                        <TouchableOpacity
                            className="bg-white border border-gray-200 rounded-xl p-4 flex-row items-center shadow-sm"
                            onPress={() => setShowPassengerTypePicker(true)}
                        >
                            <Icon 
                                name={passengerTypes.find(type => type.id === selectedPassengerType)?.icon || 'person'} 
                                size={20} 
                                color="#D15D73" 
                            />
                            <View className="flex-1 ml-3">
                                <Text 
                                    className="text-gray-800"
                                    style={{ fontFamily: 'Montserrat_400Regular' }}
                                >
                                    {passengerTypes.find(type => type.id === selectedPassengerType)?.label || 'Regular'}
                                </Text>
                                {selectedPassengerType !== 'regular' && (
                                    <Text 
                                        className="text-xs text-green-600 mt-1"
                                        style={{ fontFamily: 'Montserrat_400Regular' }}
                                    >
                                        5% discount applied
                                    </Text>
                                )}
                            </View>
                            <Icon name="keyboard-arrow-right" size={20} color="#ccc" />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Bus Fare Section */}
                <View className="px-7 py-4">
                    <View className="flex-row items-center mb-3">
                        <Icon name="local-atm" size={20} color="#D15D73" />
                        <Text className="text-lg ml-2 text-gray-800" style={{ fontFamily: 'Montserrat_700Bold' }}>
                            Current Fare Rates
                        </Text>
                    </View>
                    
                    {isFareLoading ? (
                        <View className="flex-row justify-center py-4">
                            <ActivityIndicator size="small" color="#D15D73" />
                        </View>
                    ) : busFareData && busFareData.length > 0 ? (
                        <View className="flex-row items-center">
                            {busFareData.map((fareItem, index) => renderFareCard(fareItem, index))}
                        </View>
                    ) : (
                        <View className="flex items-center justify-center py-4">
                            <Icon name="error-outline" size={24} color="#ccc" />
                            <Text className="text-gray-500 mt-1 text-sm" style={{ fontFamily: 'Montserrat_500Medium' }}>
                                No fare data available
                            </Text>
                        </View>
                    )}
                </View>

                {/* Calculation Results Section */}
                {fareCalculation && (
                    <View className="px-7 py-4">
                        <View className="flex-row items-center mb-4">
                            <Icon name="calculate" size={20} color="#D15D73" />
                            <Text className="text-lg ml-2 text-gray-800" style={{ fontFamily: 'Montserrat_700Bold' }}>
                                Trip Calculation
                            </Text>
                        </View>
                        
                        <View className="bg-white rounded-2xl p-4 shadow-sm">
                            {/* Route Summary */}
                            <View className="flex-row items-center mb-4">
                                <View className="flex-1">
                                    <View className="flex-row items-center">
                                        <Icon name="my-location" size={16} color="#D15D73" />
                                        <Text className="ml-2 text-sm text-gray-600" style={{ fontFamily: 'Montserrat_500Medium' }}>
                                            {startLocation.place}
                                        </Text>
                                    </View>
                                    <View className="flex-row items-center mt-1">
                                        <Icon name="arrow-downward" size={16} color="#ccc" />
                                        <Text className="ml-2 text-xs text-gray-400" style={{ fontFamily: 'Montserrat_400Regular' }}>
                                            {fareCalculation.distance.toFixed(1)} km
                                        </Text>
                                    </View>
                                    <View className="flex-row items-center mt-1">
                                        <Icon name="place" size={16} color="#D15D73" />
                                        <Text className="ml-2 text-sm text-gray-600" style={{ fontFamily: 'Montserrat_500Medium' }}>
                                            {endLocation.place}
                                        </Text>
                                    </View>
                                </View>
                                
                                <View className="items-center">
                                    <View className="bg-[#D15D73] px-3 py-2 rounded-lg">
                                        <Text className="text-white text-lg font-bold" style={{ fontFamily: 'Poppins_700Bold' }}>
                                            ₱{fareCalculation.totalFare.toFixed(2)}
                                        </Text>
                                    </View>
                                    <Text className="text-xs text-gray-500 mt-1" style={{ fontFamily: 'Montserrat_400Regular' }}>
                                        {selectedBusType.bus_type} Bus
                                    </Text>
                                </View>
                            </View>
                            
                            {/* Fare Breakdown */}
                            <View className="border-t border-gray-100 pt-4">
                                <Text className="text-sm text-gray-600 mb-3" style={{ fontFamily: 'Montserrat_600SemiBold' }}>
                                    Fare Calculation
                                </Text>
                                
                                <View className="flex-row justify-between mb-2">
                                    <Text className="text-sm text-gray-600" style={{ fontFamily: 'Montserrat_400Regular' }}>
                                        Distance
                                    </Text>
                                    <Text className="text-sm text-gray-800" style={{ fontFamily: 'Montserrat_500Medium' }}>
                                        {fareCalculation.distance.toFixed(2)} km
                                    </Text>
                                </View>
                                
                                <View className="flex-row justify-between mb-2">
                                    <Text className="text-sm text-gray-600" style={{ fontFamily: 'Montserrat_400Regular' }}>
                                        Rate ({selectedBusType.bus_type} Bus)
                                    </Text>
                                    <Text className="text-sm text-gray-800" style={{ fontFamily: 'Montserrat_500Medium' }}>
                                        ₱{fareCalculation.fareRate.toFixed(2)} per km
                                    </Text>
                                </View>
                                
                                <View className="flex-row justify-between mb-2">
                                    <Text className="text-sm text-gray-600" style={{ fontFamily: 'Montserrat_400Regular' }}>
                                        Base Calculation
                                    </Text>
                                    <Text className="text-sm text-gray-800" style={{ fontFamily: 'Montserrat_500Medium' }}>
                                        {fareCalculation.distance.toFixed(2)} × ₱{fareCalculation.fareRate.toFixed(2)}
                                    </Text>
                                </View>

                                <View className="flex-row justify-between mb-2">
                                    <Text className="text-sm text-gray-600" style={{ fontFamily: 'Montserrat_400Regular' }}>
                                        Subtotal
                                    </Text>
                                    <Text className="text-sm text-gray-800" style={{ fontFamily: 'Montserrat_500Medium' }}>
                                        ₱{fareCalculation.baseFare.toFixed(2)}
                                    </Text>
                                </View>

                                <View className="flex-row justify-between mb-2">
                                    <Text className="text-sm text-gray-600" style={{ fontFamily: 'Montserrat_400Regular' }}>
                                        Passenger Type
                                    </Text>
                                    <Text className="text-sm text-gray-800" style={{ fontFamily: 'Montserrat_500Medium' }}>
                                        {fareCalculation.passengerType.label}
                                    </Text>
                                </View>

                                {fareCalculation.discountAmount > 0 && (
                                    <View className="flex-row justify-between mb-3">
                                        <Text className="text-sm text-green-600" style={{ fontFamily: 'Montserrat_400Regular' }}>
                                            Discount ({fareCalculation.passengerType.discount}%)
                                        </Text>
                                        <Text className="text-sm text-green-600" style={{ fontFamily: 'Montserrat_500Medium' }}>
                                            -₱{fareCalculation.discountAmount.toFixed(2)}
                                        </Text>
                                    </View>
                                )}
                                
                                <View className="border-t border-gray-200 pt-2 flex-row justify-between">
                                    <Text className="text-base text-gray-800" style={{ fontFamily: 'Montserrat_700Bold' }}>
                                        Total Fare
                                    </Text>
                                    <Text className="text-base text-[#D15D73]" style={{ fontFamily: 'Poppins_700Bold' }}>
                                        ₱{fareCalculation.totalFare.toFixed(2)}
                                    </Text>
                                </View>
                            </View>
                            
                            {/* Save Trip Button */}
                            <TouchableOpacity
                                className="bg-[#D15D73] rounded-xl p-4 mt-4 flex-row items-center justify-center"
                                onPress={saveTripData}
                                disabled={isSaving}
                                activeOpacity={0.8}
                            >
                                {isSaving ? (
                                    <ActivityIndicator size="small" color="white" />
                                ) : (
                                    <Icon name="save" size={24} color="white" />
                                )}
                                <Text 
                                    className="text-white text-lg ml-3" 
                                    style={{ fontFamily: 'Montserrat_600SemiBold' }}
                                >
                                    {isSaving ? "Saving..." : "Save This Trip"}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}

                {/* Additional Info Section */}
                

                {/* Calculator Feature Placeholder */}
                <View className="px-7 py-4 mb-6">
                    <View className="bg-gradient-to-r from-[#D15D73] to-[#F6887C] rounded-2xl p-6">
                        <View className="flex items-center">
                            <Icon name="calculate" size={48} color="white" />
                            <Text className="text-xl text-white text-center mt-3" style={{ fontFamily: 'Montserrat_700Bold' }}>
                                Fare Calculator
                            </Text>
                            <Text className="text-white text-center mt-2 opacity-90" style={{ fontFamily: 'Montserrat_400Regular' }}>
                                Coming Soon - Calculate your trip fare based on distance and bus type
                            </Text>
                        </View>
                    </View>
                </View>
            </ScrollView>

            {/* Passenger Type Picker Modal */}
            <Modal
                visible={showPassengerTypePicker}
                animationType="slide"
                presentationStyle="pageSheet"
                transparent={true}
            >
                <View className="flex-1 justify-end bg-black bg-opacity-50">
                    <View className="bg-white rounded-t-3xl p-6 max-h-96">
                        <View className="flex-row items-center justify-between mb-6">
                            <Text className="text-xl text-gray-800" style={{ fontFamily: 'Montserrat_700Bold' }}>
                                Select Passenger Type
                            </Text>
                            <TouchableOpacity 
                                onPress={() => setShowPassengerTypePicker(false)}
                                className="w-8 h-8 items-center justify-center"
                            >
                                <Icon name="close" size={24} color="#666" />
                            </TouchableOpacity>
                        </View>
                        
                        {passengerTypes.map((type) => (
                            <TouchableOpacity
                                key={type.id}
                                className={`flex-row items-center p-4 rounded-xl mb-3 ${
                                    selectedPassengerType === type.id 
                                        ? 'bg-[#D15D73] border border-[#D15D73]' 
                                        : 'bg-gray-50 border border-gray-200'
                                }`}
                                onPress={() => {
                                    setSelectedPassengerType(type.id);
                                    setShowPassengerTypePicker(false);
                                }}
                                activeOpacity={0.7}
                            >
                                <View className={`w-12 h-12 rounded-full items-center justify-center ${
                                    selectedPassengerType === type.id ? 'bg-white' : 'bg-[#D15D73]'
                                }`}>
                                    <Icon 
                                        name={type.icon} 
                                        size={24} 
                                        color={selectedPassengerType === type.id ? '#D15D73' : 'white'} 
                                    />
                                </View>
                                <View className="flex-1 ml-4">
                                    <Text 
                                        className={`text-lg ${
                                            selectedPassengerType === type.id ? 'text-white' : 'text-gray-800'
                                        }`}
                                        style={{ fontFamily: 'Montserrat_600SemiBold' }}
                                    >
                                        {type.label}
                                    </Text>
                                    <Text 
                                        className={`text-sm ${
                                            selectedPassengerType === type.id ? 'text-white opacity-90' : 'text-gray-500'
                                        }`}
                                        style={{ fontFamily: 'Montserrat_400Regular' }}
                                    >
                                        {type.discount > 0 ? `${type.discount}% discount` : 'Regular fare'}
                                    </Text>
                                </View>
                                {selectedPassengerType === type.id && (
                                    <Icon name="check-circle" size={24} color="white" />
                                )}
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            </Modal>

            {/* Location Picker Modals */}
            <LocationPicker
                visible={showStartPicker}
                onClose={() => setShowStartPicker(false)}
                onSelectLocation={(location) => setStartLocation(location)}
                title="Select Start Location"
                selectedLocation={startLocation}
            />

            <LocationPicker
                visible={showEndPicker}
                onClose={() => setShowEndPicker(false)}
                onSelectLocation={(location) => setEndLocation(location)}
                title="Select Destination"
                selectedLocation={endLocation}
            />
        </View>
    );
};

export default CalculatorPage; 