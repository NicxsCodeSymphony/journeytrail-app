import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, Image, FlatList, TextInput } from "react-native";
import { useRouter } from "expo-router";
import CustomHamburgerIcon from "../components/Hamburger";
import Icon from "react-native-vector-icons/MaterialIcons";
import Animated, { 
    useSharedValue, 
    useAnimatedStyle, 
    withTiming, 
    withSpring 
} from "react-native-reanimated";
import * as Location from 'expo-location'; // Import the Location module
import { getData } from "../../utils/getData";
import BusDetailsModal from '../components/BusDetails';

const MainPage = () => {
    const router = useRouter();
    
    const opacity = useSharedValue(0);
    const translateY = useSharedValue(-50);
    const rotation = useSharedValue(0);

    const [lat, setLat] = useState(null); // Initialize as null
    const [lon, setLon] = useState(null); // Initialize as null

    const { data: busData } = getData(`getBus?lat=${lat}&lon=${lon}`);
    const { data: busFareData } = getData(`busFare`);

    const [modalVisible, setModalVisible] = useState(false);
    const [selectedBus, setSelectedBus] = useState(null);

    const fetchLocation = async () => {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
            let location = await Location.getCurrentPositionAsync({});
            setLat(location.coords.latitude);
            setLon(location.coords.longitude);
        } else {
            console.log("Location permission not granted");
        }
    };


    useEffect(() => {
        fetchLocation();

        opacity.value = withTiming(1, { duration: 1000 });
        translateY.value = withSpring(0, { damping: 10 });
        rotation.value = withTiming(360, { duration: 1000 });
    }, [busData, busFareData]);

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

    const calculateEstimatedArrivalTime = (distance, averageSpeed) => {
        if (!distance || distance <= 0) {
            return 'Calculating...'; // Handle cases where distance is not valid
        }
        
        const timeInHours = distance / averageSpeed;
        const timeInMinutes = Math.round(timeInHours * 60);

        if (timeInMinutes >= 60) {
            return `${Math.floor(timeInMinutes / 60)} hr ${timeInMinutes % 60} min`;
        } else if (timeInMinutes > 30) {
            return `${timeInMinutes} mins`;
        } else {
            return `${timeInMinutes} mins`;
        }
    };

    const closeModal = () => {
        setModalVisible(false);
    }

    const renderItem = ({ item }) => (
        <TouchableOpacity
            onPress={() => handleBusPress(item)}
            className="bg-[#F3D3AC] w-48 rounded-2xl p-4 m-2 shadow-lg h-64 relative" 
        >
            <Image className="w-28 h-28 mx-auto" resizeMode="contain" />
            <Text className="mt-4 text-xl text-center" style={{ fontFamily: 'Montserrat_700Bold' }}>{item.bus_code}</Text>
            <View className="mt-1 flex flex-row items-center justify-center">
                <Icon name="person" size={20} color="gray" />
                <Text className="text-lg ml-1">{item.passenger_count || 0}</Text>
            </View>
            <View className="mt-3 flex flex-row justify-between items-center">
                <View className="flex flex-row items-center">
                    <Icon name="place" size={20} color="gray" />
                    <Text className="text-sm">{item.distance?.toFixed(2) + " km" || '0'}</Text>
                </View>
                <View className="flex flex-row items-center">
                    <Icon name="access-time" size={20} color="gray" />
                    <Text className="text-sm">{calculateEstimatedArrivalTime(item.distance, 40)}</Text>
                </View>
            </View>
        </TouchableOpacity>
    );

    return (
        <Animated.View className="h-screen w-full border" style={containerStyle}>
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
                    <TouchableOpacity className="bg-teal-600 p-2 rounded-md mt-2 self-end">
                        <Animated.View style={animatedRotationStyle}>
                            <Icon name="directions-bus" size={30} color="white" />
                        </Animated.View>
                    </TouchableOpacity>
                </View>
            </Animated.View>
            
            <View className="h-[23vh] px-7">
                <BusDetailsModal visible={modalVisible} onClose={() => closeModal()} selectedBus={selectedBus} />
                <View className="flex flex-row justify-around gap-4 mt-1">
                    <Animated.View className="mt-4 w-20 h-20">
                        <View className="bg-[#F5D5AC] w-full h-full rounded-3xl flex justify-center items-center">
                            <Text className="text-2xl text-white" style={{ fontFamily: 'Poppins_700Bold' }}>{busData && busData.length ? busData.length : 0}</Text>
                        </View>
                        <Text className="text-sm text-center font-medium mt-2" style={{ fontFamily: "Poppins_500Medium" }}>Bus On Departure</Text>
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
            
            <View className="w-full px-7">
                <Text className="text-xl" style={{ fontFamily: 'Montserrat_700Bold' }}>Buses Near You</Text>
                {busData && (
                    <FlatList
                        data={busData}
                        renderItem={renderItem}
                        keyExtractor={(item, index) => index.toString()}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={{ paddingVertical: 16 }}
                        snapToInterval={150} 
                        decelerationRate="fast"
                    />
                )}
            </View>
        </Animated.View>
    );
};

export default MainPage;