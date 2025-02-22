import { TouchableOpacity, View} from "react-native";

const CustomHamburgerIcon = ({ onPress }) => {
    return (
        <TouchableOpacity onPress={onPress} className="flex flex-col items-start pr-5">
            <View className="w-6 h-1 bg-teal-600 mb-1" />
            <View className="w-8 h-1 bg-teal-600" />
        </TouchableOpacity>
    );
};

export default CustomHamburgerIcon; 