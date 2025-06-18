import React, { useState, useEffect, useCallback } from "react";
import { View, Text, TouchableOpacity, Image, FlatList, TextInput, RefreshControl, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import CustomHamburgerIcon from "../components/Hamburger";
import Icon from "react-native-vector-icons/MaterialIcons";
import Animated, { 
    useSharedValue, 
    useAnimatedStyle, 
    withTiming, 
    withSpring 
} from "react-native-reanimated";
import * as Location from 'expo-location';
import { getData } from "../../utils/getData";
import BusDetailsModal from '../components/BusDetails';

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

const MainPage = () => {
    const router = useRouter();
    
    const opacity = useSharedValue(0);
    const translateY = useSharedValue(-50);
    const rotation = useSharedValue(0);

    const [lat, setLat] = useState(null);
    const [lon, setLon] = useState(null);
    const [refreshing, setRefreshing] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const { data: busData, isLoading: isBusLoading, error: busError, refetch: refetchBuses } = getData(`getBus?lat=${lat}&lon=${lon}`);
    const { data: busFareData, isLoading: isFareLoading } = getData(`busFare`);

    const [modalVisible, setModalVisible] = useState(false);
    const [selectedBus, setSelectedBus] = useState(null);
    
    const filteredBuses = busData ? busData.filter(bus => 
        bus.from_latitude && bus.from_longitude && bus.to_latitude && bus.to_longitude
    ) : [];

    const fetchLocation = async () => {
        try {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status === 'granted') {
                let location = await Location.getCurrentPositionAsync({});
                setLat(location.coords.latitude);
                setLon(location.coords.longitude);
            } else {
                setError('Location permission denied');
            }
        } catch (err) {
            setError('Failed to get location');
            console.error(err);
        }
    };

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        try {
            await fetchLocation();
            await refetchBuses();
        } catch (err) {
            console.error('Refresh error:', err);
        } finally {
            setRefreshing(false);
        }
    }, [refetchBuses]);

    useEffect(() => {
        const initialize = async () => {
            setIsLoading(true);
            try {
                await fetchLocation();
            } catch (err) {
                console.error('Initialization error:', err);
            } finally {
                setIsLoading(false);
            }
        };
        initialize();

        opacity.value = withTiming(1, { duration: 1000 });
        translateY.value = withSpring(0, { damping: 10 });
        rotation.value = withTiming(360, { duration: 1000 });
    }, []);

    const containerStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
    }));

    const headerStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: translateY.value }],
        opacity: opacity.value,
    }));

    const animatedRotationStyle = useAnimatedStyle(() => ({
        transform: [{ rotate: `${rotation.value}deg` }],
    }));

    const handleBusPress = (item) => {
        setSelectedBus(item);
        setModalVisible(true);
    };

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

    const closeModal = () => {
        setModalVisible(false);
    }

    const renderItem = ({ item, index }) => {
        const distance = calculateDistance(
            item.from_latitude, 
            item.from_longitude, 
            item.to_latitude, 
            item.to_longitude
        );
        
        const arrivalTime = calculateEstimatedArrivalTime(
            item.from_latitude, 
            item.from_longitude, 
            item.to_latitude, 
            item.to_longitude
        );
        
        return (
            <TouchableOpacity
                onPress={() => handleBusPress(item)}
                className="bg-[#F3D3AC] w-48 rounded-2xl p-4 m-2 shadow-lg h-64 relative"
                style={{
                    transform: [{ scale: 1 }],
                    opacity: 1,
                }}
                activeOpacity={0.7}
            >
                <Image 
                    className="w-28 h-28 mx-auto" 
                    resizeMode="contain"
                    // source={require('../../assets/bus-icon.png')} // Make sure to add this image
                    // defaultSource={require('../../assets/bus-icon.png')}
                />
                <Text className="mt-4 text-xl text-center" style={{ fontFamily: 'Montserrat_700Bold' }}>{item.bus_code}</Text>
                <View className="mt-1 flex flex-row items-center justify-center">
                    <Icon name="person" size={20} color="gray" />
                    <Text className="text-lg ml-1">{item.passenger_count || 0}</Text>
                </View>
                <View className="mt-3 flex flex-row justify-between items-center">
                    <View className="flex flex-row items-center">
                        <Icon name="place" size={20} color="gray" />
                        <Text className="text-sm">{distance ? Math.round(distance) + " km" : 'N/A'}</Text>
                    </View>
                    <View className="flex flex-row items-center">
                        <Icon name="access-time" size={20} color="gray" />
                        <Text className="text-sm">{arrivalTime}</Text>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    const renderEmptyComponent = () => (
        <View className="flex items-center justify-center py-12">
            {isBusLoading ? (
                <ActivityIndicator size="large" color="#D15D73" />
            ) : error ? (
                <>
                    <Icon name="error-outline" size={50} color="#D15D73" />
                    <Text className="mt-3 text-gray-500 text-center" style={{ fontFamily: 'Montserrat_500Medium' }}>
                        {error}
                    </Text>
                    <TouchableOpacity 
                        onPress={onRefresh}
                        className="mt-4 bg-[#D15D73] px-4 py-2 rounded-lg"
                    >
                        <Text className="text-white">Try Again</Text>
                    </TouchableOpacity>
                </>
            ) : (
                <>
                    <Icon name="directions-bus" size={50} color="#ccc" />
                    <Text className="mt-3 text-gray-500 text-center" style={{ fontFamily: 'Montserrat_500Medium' }}>
                        No buses available in your area
                    </Text>
                </>
            )}
        </View>
    );

    if (isLoading) {
        return (
            <View className="flex-1 justify-center items-center">
                <ActivityIndicator size="large" color="#D15D73" />
                <Text className="mt-4 text-gray-600">Loading...</Text>
            </View>
        );
    }

    return (
        <Animated.View className="h-screen w-full" style={containerStyle}>
            <Animated.View className="pt-14 px-7" style={headerStyle}>
                <CustomHamburgerIcon />
                <Text className="mt-5 text-4xl w-[90%] text-[#D15D73]" style={{ fontFamily: 'Montserrat_700Bold' }}>
                    Journey Trail Bus Monitoring
                </Text>
                <View className="flex flex-row gap-3 justify-between mt-3">
                    <View className="flex-row items-center bg-[#F5D5AC] rounded-2xl mt-5 py-1 px-3 w-[80%]">
                        <Icon name="search" size={24} color="teal" />
                        <TextInput placeholder="Search..." className="flex-1 ml-2 h-10" />
                    </View>
                    <TouchableOpacity 
                        className="bg-teal-600 p-2 rounded-md mt-2 self-end"
                        onPress={() => router.push('/calculator')}
                    >
                        <Animated.View style={animatedRotationStyle}>
                            <Icon name="calculate" size={30} color="white" />
                        </Animated.View>
                    </TouchableOpacity>
                </View>
            </Animated.View>
            
            <View className="h-[23vh] px-7">
                <BusDetailsModal visible={modalVisible} onClose={() => closeModal()} selectedBus={selectedBus} />
                <View className="flex flex-row justify-around gap-4 mt-1">
                    <Animated.View className="mt-4 w-20 h-20">
                        <View className="bg-[#F5D5AC] w-full h-full rounded-3xl flex justify-center items-center">
                            <Text className="text-2xl text-white" style={{ fontFamily: 'Poppins_700Bold' }}>{filteredBuses.length}</Text>
                        </View>
                        <Text className="text-sm text-center font-medium mt-2" style={{ fontFamily: "Poppins_500Medium" }}>Available Buses</Text>
                    </Animated.View>
                    <Animated.View className="mt-4 w-20 h-20">
                        <View className="bg-[#F6887C] w-full h-full rounded-3xl flex justify-center items-center">
                            <Text className="text-2xl text-white" style={{ fontFamily: 'Poppins_700Bold' }}>{busFareData && busFareData[1] && busFareData[1].fare ? busFareData[1].fare : 'N/A'}</Text>
                        </View>
                        <Text className="text-sm text-center font-medium mt-2" style={{ fontFamily: "Poppins_500Medium" }}>Regular Bus Fare</Text>
                    </Animated.View>
                    <Animated.View className="mt-4 w-20 h-20">
                        <View className="bg-teal-600 w-full h-full rounded-3xl flex justify-center items-center">
                            <Text className="text-2xl text-white" style={{ fontFamily: 'Poppins_700Bold' }}>{busFareData && busFareData[2] && busFareData[2].fare ? busFareData[2].fare : 'N/A'}</Text>
                        </View>
                        <Text className="text-sm text-center font-medium mt-2" style={{ fontFamily: "Poppins_500Medium" }}>Aircon Bus Fare</Text>
                    </Animated.View>
                </View>
            </View>
            
            <View className="w-full px-7 flex-1">
                <Text className="text-xl" style={{ fontFamily: 'Montserrat_700Bold' }}>Buses Near You</Text>
                <FlatList
                    data={filteredBuses}
                    renderItem={renderItem}
                    keyExtractor={(item, index) => item.bus_id || index.toString()}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ paddingVertical: 16 }}
                    snapToInterval={150}
                    decelerationRate="fast"
                    ListEmptyComponent={renderEmptyComponent}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            colors={['#D15D73']}
                            tintColor="#D15D73"
                        />
                    }
                    onEndReachedThreshold={0.5}
                    initialNumToRender={5}
                    maxToRenderPerBatch={5}
                    windowSize={5}
                />
            </View>
        </Animated.View>
    );
};

export default MainPage;