import { ActivityIndicator } from 'react-native';
import { useState } from "react";
import { useFonts } from "expo-font";
import '../index.css'

import {
  Montserrat_400Regular,
  Montserrat_500Medium,
  Montserrat_600SemiBold,
  Montserrat_700Bold,
  Montserrat_800ExtraBold,
} from "@expo-google-fonts/montserrat";

import {
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
} from "@expo-google-fonts/poppins";

import MainPage from './pages/main';
import SplashScreen from "./components/SplashScreen";

const App = () => {

  const [isSplashVisible, setSplashVisible] = useState(true);

  const [fontsLoaded] = useFonts({
    Montserrat_400Regular,
    Montserrat_500Medium,
    Montserrat_600SemiBold,
    Montserrat_700Bold,
    Montserrat_800ExtraBold,
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
  });

  const handleSplashFinish = () => {
    setSplashVisible(false);
  };

  if (!fontsLoaded) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  return(
    <>
    {isSplashVisible ? <SplashScreen onFinish={handleSplashFinish} /> : <MainPage />}
  </>
  )
};

export default App