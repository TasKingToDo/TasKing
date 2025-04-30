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
import FriendsScreen from "./screens/FriendsScreen";
import SettingsScreen from "./screens/SettingsScreen";
import StatisticsScreen from "./screens/StatisticsScreen";
import CreateTaskScreen from "./screens/CreateTaskScreen";
import ForgotPassScreen from "./screens/ForgotPassScreen";
import { SettingsProvider } from "./config/SettingsContext";
import { AuthProvider, authContext } from "./config/authContext";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import toastConfig from "./config/toastConfig";
import Toast from "react-native-toast-message";

//creating stack navigator
const Stack = createNativeStackNavigator();

const RootNavigator = () => {
  const { user } = React.useContext(authContext);

  return (
    <SettingsProvider>
      <SafeAreaProvider>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {user ? (
            // navigate here if auth state is detected
            <>
              <Stack.Screen name="Home" component={HomeScreen} />
              <Stack.Screen name="Shop" component={ShopScreen} />
              <Stack.Screen name="Create Task" component={CreateTaskScreen} />
              <Stack.Screen name="Friends" component={FriendsScreen} />
              <Stack.Screen name="Stats" component={StatisticsScreen} />
              <Stack.Screen name="Settings" component={SettingsScreen} />
              <Stack.Screen name="ForgotPass" component={ForgotPassScreen} />
            </>
          ) : (
            <>
              <Stack.Screen name="Welcome" component={OpeningScreen} />
              <Stack.Screen name="ForgotPass" component={ForgotPassScreen} />
            </>
          )}
        </Stack.Navigator>
      </SafeAreaProvider>
    </SettingsProvider>
  );
};

const Index = () => {
  return (
    <GestureHandlerRootView style={{flex: 1}}>
      <AuthProvider>
        <RootNavigator />
        <Toast config={toastConfig} />
      </AuthProvider>
    </GestureHandlerRootView>
  );
};

export default Index;
