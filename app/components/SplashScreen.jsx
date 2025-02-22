import { View, Text } from "react-native";
import Icon from 'react-native-vector-icons/FontAwesome';
import { useEffect, useState } from 'react';
import { Animated } from 'react-native';

const SplashScreen = ({ onFinish }) => {
    const [fadeAnim] = useState(new Animated.Value(0)); 

    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
        }).start(() => {
            setTimeout(onFinish, 4000);
        });
    }, [fadeAnim, onFinish]);

    return(
        <Animated.View style={{ 
            flex: 1, 
            alignItems: 'center', 
            justifyContent: 'center', 
            backgroundColor: '#f67f00', 
            opacity: fadeAnim, 
        }}>
            <Icon name="bus" size={100} color="#fff" />
            <Text className="text-4xl font-black text-white mt-5">JourneyTrail</Text>
        </Animated.View>
    );
}

export default SplashScreen;