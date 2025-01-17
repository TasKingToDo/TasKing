import * as React from "react";
import { Text, View, StyleSheet } from "react-native";
//to install run: npm install @react-navigation/native
import { NavigationContainer } from "@react-navigation/native";
//to install run: npx expo install react-native-screens react-native-safe-area-context
import { createNativeStackNavigator } from "@react-navigation/native-stack";
//talks to files found in screens folder
import OpeningScreen from "./screens/OpeningScreen";
import ShopScreen from "./screens/ShopScreen";
import HomeScreen from "./screens/HomeScreen";

//creating stack navigator
const Stack = createNativeStackNavigator();

const Index = () => {
    return (
        /* Stack consists of the stack of screens in project.
        Project opens on the Welcome / Opening screen and will be
        navigated to other  screens via Stack. */
        <Stack.Navigator>
            <Stack.Screen name="Welcome" component={OpeningScreen} options={{headerShown: false}} />
            <Stack.Screen name="Home" component={HomeScreen } options={{headerShown: false}} />
            <Stack.Screen name="Shop" component={ShopScreen} options={{headerShown: false}} />
        </Stack.Navigator>
    );
};

export default Index;
