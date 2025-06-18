import React, { useState, useMemo } from "react";
import { 
    View, 
    Text, 
    TouchableOpacity, 
    Modal, 
    FlatList, 
    TextInput, 
    SafeAreaView,
    StatusBar 
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import locationData from "./locationList";

const LocationPicker = ({ 
    visible, 
    onClose, 
    onSelectLocation, 
    title = "Select Location",
    selectedLocation = null 
}) => {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedProvince, setSelectedProvince] = useState(null);

    // Filter locations based on search query and selected province
    const filteredLocations = useMemo(() => {
        let locations = locationData.bus_route;

        // Filter by province if selected
        if (selectedProvince) {
            locations = locations.filter(location => 
                location.province === selectedProvince
            );
        }

        // Filter by search query
        if (searchQuery.trim()) {
            locations = locations.filter(location =>
                location.place.toLowerCase().includes(searchQuery.toLowerCase()) ||
                location.province.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        return locations;
    }, [searchQuery, selectedProvince]);

    // Group locations by province for better organization
    const groupedLocations = useMemo(() => {
        if (selectedProvince || searchQuery.trim()) {
            return filteredLocations;
        }

        const grouped = {};
        locationData.bus_route.forEach(location => {
            if (!grouped[location.province]) {
                grouped[location.province] = [];
            }
            grouped[location.province].push(location);
        });
        return grouped;
    }, [filteredLocations, selectedProvince, searchQuery]);

    const handleLocationSelect = (location) => {
        onSelectLocation(location);
        onClose();
        setSearchQuery("");
        setSelectedProvince(null);
    };

    const handleProvinceSelect = (province) => {
        setSelectedProvince(province);
        setSearchQuery("");
    };

    const handleBack = () => {
        if (selectedProvince) {
            setSelectedProvince(null);
        } else {
            onClose();
            setSearchQuery("");
            setSelectedProvince(null);
        }
    };

    const renderProvinceItem = ({ item: province }) => {
        const locationCount = locationData.bus_route.filter(
            loc => loc.province === province
        ).length;

        return (
            <TouchableOpacity
                className="bg-white mx-4 mb-3 p-4 rounded-xl shadow-sm border border-gray-100"
                onPress={() => handleProvinceSelect(province)}
                activeOpacity={0.7}
            >
                <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center flex-1">
                        <View className="bg-[#D15D73] w-10 h-10 rounded-full items-center justify-center">
                            <Icon name="location-city" size={20} color="white" />
                        </View>
                        <View className="ml-3 flex-1">
                            <Text 
                                className="text-lg text-gray-800" 
                                style={{ fontFamily: 'Montserrat_600SemiBold' }}
                            >
                                {province}
                            </Text>
                            <Text 
                                className="text-sm text-gray-500" 
                                style={{ fontFamily: 'Montserrat_400Regular' }}
                            >
                                {locationCount} location{locationCount !== 1 ? 's' : ''}
                            </Text>
                        </View>
                    </View>
                    <Icon name="keyboard-arrow-right" size={24} color="#ccc" />
                </View>
            </TouchableOpacity>
        );
    };

    const renderLocationItem = ({ item: location }) => {
        const isSelected = selectedLocation && 
            selectedLocation.place === location.place && 
            selectedLocation.province === location.province;

        return (
            <TouchableOpacity
                className={`mx-4 mb-3 p-4 rounded-xl shadow-sm border ${
                    isSelected 
                        ? 'bg-[#D15D73] border-[#D15D73]' 
                        : 'bg-white border-gray-100'
                }`}
                onPress={() => handleLocationSelect(location)}
                activeOpacity={0.7}
            >
                <View className="flex-row items-center">
                    <View className={`w-10 h-10 rounded-full items-center justify-center ${
                        isSelected ? 'bg-white' : 'bg-teal-600'
                    }`}>
                        <Icon 
                            name="place" 
                            size={20} 
                            color={isSelected ? '#D15D73' : 'white'} 
                        />
                    </View>
                    <View className="ml-3 flex-1">
                        <Text 
                            className={`text-lg ${isSelected ? 'text-white' : 'text-gray-800'}`}
                            style={{ fontFamily: 'Montserrat_600SemiBold' }}
                        >
                            {location.place}
                        </Text>
                        <Text 
                            className={`text-sm ${isSelected ? 'text-white opacity-90' : 'text-gray-500'}`}
                            style={{ fontFamily: 'Montserrat_400Regular' }}
                        >
                            {location.province}
                        </Text>
                    </View>
                    {isSelected && (
                        <Icon name="check-circle" size={24} color="white" />
                    )}
                </View>
            </TouchableOpacity>
        );
    };

    const renderGroupedLocations = () => {
        return Object.entries(groupedLocations).map(([province, locations]) => (
            <View key={province} className="mb-4">
                <View className="px-4 py-2">
                    <Text 
                        className="text-lg text-[#D15D73]" 
                        style={{ fontFamily: 'Montserrat_700Bold' }}
                    >
                        {province}
                    </Text>
                </View>
                {locations.map((location, index) => (
                    <View key={`${province}-${index}`}>
                        {renderLocationItem({ item: location })}
                    </View>
                ))}
            </View>
        ));
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            presentationStyle="pageSheet"
        >
            <SafeAreaView className="flex-1 bg-gray-50">
                <StatusBar barStyle="dark-content" />
                
                {/* Header */}
                <View className="bg-white px-4 py-4 border-b border-gray-200">
                    <View className="flex-row items-center justify-between">
                        <TouchableOpacity 
                            onPress={handleBack}
                            className="flex-row items-center"
                        >
                            <Icon 
                                name={selectedProvince ? "arrow-back" : "close"} 
                                size={24} 
                                color="#D15D73" 
                            />
                            <Text 
                                className="ml-2 text-lg text-[#D15D73]" 
                                style={{ fontFamily: 'Montserrat_600SemiBold' }}
                            >
                                {selectedProvince ? selectedProvince : "Cancel"}
                            </Text>
                        </TouchableOpacity>
                        
                        <Text 
                            className="text-lg text-gray-800" 
                            style={{ fontFamily: 'Montserrat_700Bold' }}
                        >
                            {title}
                        </Text>
                        
                        <View style={{ width: 60 }} />
                    </View>

                    {/* Search Bar */}
                    <View className="flex-row items-center bg-gray-100 rounded-xl mt-4 px-4 py-3">
                        <Icon name="search" size={20} color="#666" />
                        <TextInput
                            className="flex-1 ml-3 text-gray-800"
                            placeholder={selectedProvince ? "Search locations..." : "Search provinces or locations..."}
                            placeholderTextColor="#999"
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            style={{ fontFamily: 'Montserrat_400Regular' }}
                        />
                        {searchQuery.length > 0 && (
                            <TouchableOpacity onPress={() => setSearchQuery("")}>
                                <Icon name="clear" size={20} color="#666" />
                            </TouchableOpacity>
                        )}
                    </View>
                </View>

                {/* Content */}
                <View className="flex-1">
                    {!selectedProvince && !searchQuery.trim() ? (
                        // Show provinces
                        <FlatList
                            data={locationData.provinces}
                            renderItem={renderProvinceItem}
                            keyExtractor={(item) => item}
                            contentContainerStyle={{ paddingVertical: 16 }}
                            showsVerticalScrollIndicator={false}
                        />
                    ) : searchQuery.trim() && !selectedProvince ? (
                        // Show search results (grouped)
                        <FlatList
                            data={[1]} // Dummy data to render once
                            renderItem={() => (
                                <View>
                                    {renderGroupedLocations()}
                                </View>
                            )}
                            keyExtractor={() => "search-results"}
                            contentContainerStyle={{ paddingVertical: 16 }}
                            showsVerticalScrollIndicator={false}
                        />
                    ) : (
                        // Show locations in selected province or search results
                        <FlatList
                            data={filteredLocations}
                            renderItem={renderLocationItem}
                            keyExtractor={(item, index) => `${item.province}-${item.place}-${index}`}
                            contentContainerStyle={{ paddingVertical: 16 }}
                            showsVerticalScrollIndicator={false}
                            ListEmptyComponent={() => (
                                <View className="flex-1 items-center justify-center py-20">
                                    <Icon name="search-off" size={48} color="#ccc" />
                                    <Text 
                                        className="text-gray-500 mt-4 text-center" 
                                        style={{ fontFamily: 'Montserrat_500Medium' }}
                                    >
                                        No locations found
                                    </Text>
                                </View>
                            )}
                        />
                    )}
                </View>
            </SafeAreaView>
        </Modal>
    );
};

export default LocationPicker; 