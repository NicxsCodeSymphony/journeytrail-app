import React, { useState, useEffect, useCallback } from "react";
import { 
    View, 
    Text, 
    TouchableOpacity, 
    ScrollView, 
    RefreshControl, 
    ActivityIndicator,
    Alert,
    Modal
} from "react-native";
import { useRouter } from "expo-router";
import Icon from "react-native-vector-icons/MaterialIcons";
import { fetchData, updateData } from "../utils/sqlite";

const SavedTripsPage = () => {
    const router = useRouter();
    const [savedTrips, setSavedTrips] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [selectedTrip, setSelectedTrip] = useState(null);
    const [showTripModal, setShowTripModal] = useState(false);

    // Fetch saved trips from storage
    const fetchSavedTrips = async () => {
        try {
            const trips = await fetchData('saved_trips');
            if (trips && Array.isArray(trips)) {
                // Sort by most recent first
                const sortedTrips = trips.sort((a, b) => new Date(b.savedAt) - new Date(a.savedAt));
                setSavedTrips(sortedTrips);
            } else {
                setSavedTrips([]);
            }
        } catch (error) {
            console.error("Error fetching saved trips:", error);
            setSavedTrips([]);
        } finally {
            setIsLoading(false);
        }
    };

    // Delete a specific trip
    const deleteTrip = async (tripId) => {
        Alert.alert(
            "Delete Trip",
            "Are you sure you want to delete this saved trip?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            const updatedTrips = savedTrips.filter(trip => trip.ticket_id !== tripId);
                            const success = await updateData('saved_trips', updatedTrips);
                            
                            if (success) {
                                setSavedTrips(updatedTrips);
                                Alert.alert("Success", "Trip deleted successfully!");
                            } else {
                                Alert.alert("Error", "Failed to delete trip. Please try again.");
                            }
                        } catch (error) {
                            console.error("Error deleting trip:", error);
                            Alert.alert("Error", "An error occurred while deleting the trip.");
                        }
                    }
                }
            ]
        );
    };

    // Clear all saved trips
    const clearAllTrips = () => {
        if (savedTrips.length === 0) return;
        
        Alert.alert(
            "Clear All Trips",
            "Are you sure you want to delete all saved trips? This action cannot be undone.",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Clear All",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            const success = await updateData('saved_trips', []);
                            if (success) {
                                setSavedTrips([]);
                                Alert.alert("Success", "All trips cleared successfully!");
                            } else {
                                Alert.alert("Error", "Failed to clear trips. Please try again.");
                            }
                        } catch (error) {
                            console.error("Error clearing trips:", error);
                            Alert.alert("Error", "An error occurred while clearing trips.");
                        }
                    }
                }
            ]
        );
    };

    // Open trip details modal
    const viewTripDetails = (trip) => {
        setSelectedTrip(trip);
        setShowTripModal(true);
    };

    // Refresh trips
    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await fetchSavedTrips();
        setRefreshing(false);
    }, []);

    useEffect(() => {
        fetchSavedTrips();
    }, []);

    const renderTripCard = (trip, index) => {
        return (
            <TouchableOpacity
                key={trip.ticket_id || index}
                className="bg-white rounded-2xl p-4 mb-4 mx-4 shadow-sm border border-gray-100"
                onPress={() => viewTripDetails(trip)}
                activeOpacity={0.7}
            >
                {/* Trip Header */}
                <View className="flex-row items-center justify-between mb-3">
                    <View className="flex-row items-center">
                        <View className="bg-[#D15D73] w-8 h-8 rounded-full items-center justify-center">
                            <Text className="text-white text-sm font-bold" style={{ fontFamily: 'Poppins_700Bold' }}>
                                {trip.ticket_id || index + 1}
                            </Text>
                        </View>
                        <Text className="ml-3 text-lg text-gray-800" style={{ fontFamily: 'Montserrat_600SemiBold' }}>
                            Trip #{trip.ticket_id || index + 1}
                        </Text>
                    </View>
                    <TouchableOpacity
                        onPress={() => deleteTrip(trip.ticket_id)}
                        className="p-2"
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                        <Icon name="delete" size={20} color="#dc2626" />
                    </TouchableOpacity>
                </View>

                {/* Route Information */}
                <View className="mb-3">
                    <View className="flex-row items-center mb-2">
                        <Icon name="my-location" size={16} color="#D15D73" />
                        <Text className="ml-2 text-sm text-gray-700" style={{ fontFamily: 'Montserrat_500Medium' }}>
                            {trip.startLocation?.place}, {trip.startLocation?.province}
                        </Text>
                    </View>
                    <View className="flex-row items-center ml-4 mb-2">
                        <Icon name="trending-down" size={16} color="#ccc" />
                        <Text className="ml-2 text-xs text-gray-500" style={{ fontFamily: 'Montserrat_400Regular' }}>
                            {trip.calculation?.distance?.toFixed(1)} km
                        </Text>
                    </View>
                    <View className="flex-row items-center">
                        <Icon name="place" size={16} color="#D15D73" />
                        <Text className="ml-2 text-sm text-gray-700" style={{ fontFamily: 'Montserrat_500Medium' }}>
                            {trip.endLocation?.place}, {trip.endLocation?.province}
                        </Text>
                    </View>
                </View>

                {/* Trip Details */}
                <View className="flex-row items-center justify-between mb-3">
                    <View className="flex-row items-center">
                        <Icon 
                            name={trip.busType?.type === "Regular" ? "directions-bus" : "ac-unit"} 
                            size={16} 
                            color={trip.busType?.type === "Regular" ? "#F6887C" : "#0d9488"} 
                        />
                        <Text className="ml-2 text-sm text-gray-600" style={{ fontFamily: 'Montserrat_400Regular' }}>
                            {trip.busType?.type} Bus
                        </Text>
                    </View>
                    
                    <View className="flex-row items-center">
                        <Icon 
                            name={
                                trip.passengerType?.type === 'student' ? 'school' :
                                trip.passengerType?.type === 'pwd' ? 'accessible' :
                                trip.passengerType?.type === 'senior' ? 'elderly' : 'person'
                            } 
                            size={16} 
                            color="#666" 
                        />
                        <Text className="ml-2 text-sm text-gray-600" style={{ fontFamily: 'Montserrat_400Regular' }}>
                            {trip.passengerType?.label}
                        </Text>
                    </View>
                </View>

                {/* Fare and Date */}
                <View className="flex-row items-center justify-between">
                    <View className="bg-[#D15D73] px-3 py-1 rounded-lg">
                        <Text className="text-white font-bold" style={{ fontFamily: 'Poppins_700Bold' }}>
                            ₱{trip.calculation?.totalFare?.toFixed(2)}
                        </Text>
                    </View>
                    <Text className="text-xs text-gray-500" style={{ fontFamily: 'Montserrat_400Regular' }}>
                        {trip.savedDate} • {trip.savedTime}
                    </Text>
                </View>
            </TouchableOpacity>
        );
    };

    const renderEmptyState = () => (
        <View className="flex-1 justify-center items-center py-20">
            <Icon name="bookmark-border" size={80} color="#ccc" />
            <Text className="text-xl text-gray-500 mt-4 text-center" style={{ fontFamily: 'Montserrat_600SemiBold' }}>
                No Saved Trips
            </Text>
            <Text className="text-gray-400 mt-2 text-center px-8" style={{ fontFamily: 'Montserrat_400Regular' }}>
                Your saved trip calculations will appear here. Start by calculating a fare and saving your trip!
            </Text>
            <TouchableOpacity
                className="bg-[#D15D73] px-6 py-3 rounded-xl mt-6"
                onPress={() => router.back()}
            >
                <Text className="text-white" style={{ fontFamily: 'Montserrat_600SemiBold' }}>
                    Calculate New Trip
                </Text>
            </TouchableOpacity>
        </View>
    );

    if (isLoading) {
        return (
            <View className="flex-1 justify-center items-center bg-gray-50">
                <ActivityIndicator size="large" color="#D15D73" />
                <Text className="mt-4 text-gray-600" style={{ fontFamily: 'Montserrat_500Medium' }}>
                    Loading saved trips...
                </Text>
            </View>
        );
    }

    return (
        <View className="flex-1 bg-gray-50">
            {/* Header */}
            <View className="pt-14 px-4 pb-4 bg-white border-b border-gray-200">
                <View className="flex-row items-center justify-between">
                    <TouchableOpacity 
                        onPress={() => router.back()}
                        className="flex-row items-center"
                    >
                        <Icon name="arrow-back" size={24} color="#D15D73" />
                        <Text className="ml-2 text-lg text-[#D15D73]" style={{ fontFamily: 'Montserrat_600SemiBold' }}>
                            Back
                        </Text>
                    </TouchableOpacity>
                    
                    {savedTrips.length > 0 && (
                        <TouchableOpacity 
                            onPress={clearAllTrips}
                            className="flex-row items-center"
                        >
                            <Icon name="clear-all" size={20} color="#dc2626" />
                            <Text className="ml-1 text-sm text-red-600" style={{ fontFamily: 'Montserrat_500Medium' }}>
                                Clear All
                            </Text>
                        </TouchableOpacity>
                    )}
                </View>
                
                <View className="mt-4">
                    <Text className="text-2xl text-gray-800" style={{ fontFamily: 'Montserrat_700Bold' }}>
                        Saved Trips
                    </Text>
                    <Text className="text-sm text-gray-600 mt-1" style={{ fontFamily: 'Montserrat_400Regular' }}>
                        {savedTrips.length} trip{savedTrips.length !== 1 ? 's' : ''} saved
                    </Text>
                </View>
            </View>

            {/* Content */}
            {savedTrips.length === 0 ? (
                renderEmptyState()
            ) : (
                <ScrollView
                    className="flex-1"
                    contentContainerStyle={{ paddingVertical: 16 }}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            colors={['#D15D73']}
                            tintColor="#D15D73"
                        />
                    }
                >
                    {savedTrips.map((trip, index) => renderTripCard(trip, index))}
                </ScrollView>
            )}

            {/* Trip Details Modal */}
            {selectedTrip && (
                <Modal
                    visible={showTripModal}
                    animationType="slide"
                    presentationStyle="pageSheet"
                >
                    <View className="flex-1 bg-gray-50">
                        {/* Modal Header */}
                        <View className="pt-14 px-4 pb-4 bg-white border-b border-gray-200">
                            <View className="flex-row items-center justify-between">
                                <TouchableOpacity 
                                    onPress={() => setShowTripModal(false)}
                                    className="flex-row items-center"
                                >
                                    <Icon name="close" size={24} color="#D15D73" />
                                    <Text className="ml-2 text-lg text-[#D15D73]" style={{ fontFamily: 'Montserrat_600SemiBold' }}>
                                        Close
                                    </Text>
                                </TouchableOpacity>
                            </View>
                            <Text className="text-2xl text-gray-800 mt-4" style={{ fontFamily: 'Montserrat_700Bold' }}>
                                Trip #{selectedTrip.ticket_id} Details
                            </Text>
                        </View>

                        <ScrollView className="flex-1 p-4">
                            {/* Route Card */}
                            <View className="bg-white rounded-2xl p-4 mb-4 shadow-sm">
                                <Text className="text-lg mb-4 text-gray-800" style={{ fontFamily: 'Montserrat_700Bold' }}>
                                    Route Information
                                </Text>
                                
                                <View className="flex-row items-center mb-4">
                                    <View className="bg-[#D15D73] w-10 h-10 rounded-full items-center justify-center">
                                        <Icon name="my-location" size={20} color="white" />
                                    </View>
                                    <View className="ml-3 flex-1">
                                        <Text className="text-base text-gray-800" style={{ fontFamily: 'Montserrat_600SemiBold' }}>
                                            {selectedTrip.startLocation?.place}
                                        </Text>
                                        <Text className="text-sm text-gray-500" style={{ fontFamily: 'Montserrat_400Regular' }}>
                                            {selectedTrip.startLocation?.province}
                                        </Text>
                                    </View>
                                </View>

                                <View className="flex-row items-center ml-5 mb-4">
                                    <Icon name="more-vert" size={20} color="#ccc" />
                                    <Text className="ml-3 text-sm text-gray-500" style={{ fontFamily: 'Montserrat_400Regular' }}>
                                        {selectedTrip.calculation?.distance?.toFixed(2)} km
                                    </Text>
                                </View>

                                <View className="flex-row items-center">
                                    <View className="bg-teal-600 w-10 h-10 rounded-full items-center justify-center">
                                        <Icon name="place" size={20} color="white" />
                                    </View>
                                    <View className="ml-3 flex-1">
                                        <Text className="text-base text-gray-800" style={{ fontFamily: 'Montserrat_600SemiBold' }}>
                                            {selectedTrip.endLocation?.place}
                                        </Text>
                                        <Text className="text-sm text-gray-500" style={{ fontFamily: 'Montserrat_400Regular' }}>
                                            {selectedTrip.endLocation?.province}
                                        </Text>
                                    </View>
                                </View>
                            </View>

                            {/* Calculation Card */}
                            <View className="bg-white rounded-2xl p-4 mb-4 shadow-sm">
                                <Text className="text-lg mb-4 text-gray-800" style={{ fontFamily: 'Montserrat_700Bold' }}>
                                    Fare Calculation
                                </Text>
                                
                                <View className="space-y-3">
                                    <View className="flex-row justify-between">
                                        <Text className="text-gray-600" style={{ fontFamily: 'Montserrat_400Regular' }}>
                                            Distance
                                        </Text>
                                        <Text className="text-gray-800" style={{ fontFamily: 'Montserrat_500Medium' }}>
                                            {selectedTrip.calculation?.distance?.toFixed(2)} km
                                        </Text>
                                    </View>
                                    
                                    <View className="flex-row justify-between">
                                        <Text className="text-gray-600" style={{ fontFamily: 'Montserrat_400Regular' }}>
                                            Bus Type
                                        </Text>
                                        <Text className="text-gray-800" style={{ fontFamily: 'Montserrat_500Medium' }}>
                                            {selectedTrip.busType?.type} (₱{selectedTrip.busType?.fare}/km)
                                        </Text>
                                    </View>
                                    
                                    <View className="flex-row justify-between">
                                        <Text className="text-gray-600" style={{ fontFamily: 'Montserrat_400Regular' }}>
                                            Passenger Type
                                        </Text>
                                        <Text className="text-gray-800" style={{ fontFamily: 'Montserrat_500Medium' }}>
                                            {selectedTrip.passengerType?.label}
                                        </Text>
                                    </View>
                                    
                                    <View className="flex-row justify-between">
                                        <Text className="text-gray-600" style={{ fontFamily: 'Montserrat_400Regular' }}>
                                            Base Fare
                                        </Text>
                                        <Text className="text-gray-800" style={{ fontFamily: 'Montserrat_500Medium' }}>
                                            ₱{selectedTrip.calculation?.baseFare?.toFixed(2)}
                                        </Text>
                                    </View>
                                    
                                    {selectedTrip.calculation?.discountAmount > 0 && (
                                        <View className="flex-row justify-between">
                                            <Text className="text-green-600" style={{ fontFamily: 'Montserrat_400Regular' }}>
                                                Discount ({selectedTrip.passengerType?.discount}%)
                                            </Text>
                                            <Text className="text-green-600" style={{ fontFamily: 'Montserrat_500Medium' }}>
                                                -₱{selectedTrip.calculation?.discountAmount?.toFixed(2)}
                                            </Text>
                                        </View>
                                    )}
                                    
                                    <View className="border-t border-gray-200 pt-3 flex-row justify-between">
                                        <Text className="text-lg text-gray-800" style={{ fontFamily: 'Montserrat_700Bold' }}>
                                            Total Fare
                                        </Text>
                                        <Text className="text-lg text-[#D15D73]" style={{ fontFamily: 'Poppins_700Bold' }}>
                                            ₱{selectedTrip.calculation?.totalFare?.toFixed(2)}
                                        </Text>
                                    </View>
                                </View>
                            </View>

                            {/* Save Info Card */}
                            <View className="bg-white rounded-2xl p-4 shadow-sm">
                                <Text className="text-lg mb-4 text-gray-800" style={{ fontFamily: 'Montserrat_700Bold' }}>
                                    Save Information
                                </Text>
                                
                                <View className="flex-row justify-between mb-3">
                                    <Text className="text-gray-600" style={{ fontFamily: 'Montserrat_400Regular' }}>
                                        Saved Date
                                    </Text>
                                    <Text className="text-gray-800" style={{ fontFamily: 'Montserrat_500Medium' }}>
                                        {selectedTrip.savedDate}
                                    </Text>
                                </View>
                                
                                <View className="flex-row justify-between">
                                    <Text className="text-gray-600" style={{ fontFamily: 'Montserrat_400Regular' }}>
                                        Saved Time
                                    </Text>
                                    <Text className="text-gray-800" style={{ fontFamily: 'Montserrat_500Medium' }}>
                                        {selectedTrip.savedTime}
                                    </Text>
                                </View>
                            </View>
                        </ScrollView>
                    </View>
                </Modal>
            )}
        </View>
    );
};

export default SavedTripsPage; 