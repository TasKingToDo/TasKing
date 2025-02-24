import React, { useState } from 'react';
import {
  View, ScrollView, Image, Text, TextInput,
  Dimensions, StyleSheet, FlatList, TouchableOpacity, Pressable
} from 'react-native';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
//npm install react-native-tab-view
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { NavigationContainer, NavigationIndependentTree } from '@react-navigation/native';
import colors from '../config/colors';
import { SettingsContext } from '../config/SettingsContext';
import bodyData from "../assets/shopdata/bodyData";
import shirtData from "../assets/shopdata/shirtData";
import pantsData from "../assets/shopdata/pantsData";
import hatData from "../assets/shopdata/hatData";
import shoesData from "../assets/shopdata/shoesData";
import accData from "../assets/shopdata/accData";

//num of cols on bottom half of screen
const numColumns = 3;

//Menus with flatlists using data. Future development,
//need to optimize with states instead of multiple screen instances
//Body shop menu
const BodyRoute = () => {
  return (
    <View>
      <FlatList
        style={styles.flatListContainer}
        numColumns={numColumns}
        data={bodyData}
        renderItem={({ item }) => (
          <View style={styles.flatListContainer}>
            <Pressable style={({ pressed }) => [{
              backgroundColor: pressed ? colors.emphasis : colors.primarySoft,
            }]}>
              <Image source={{ uri: item.imageUrl }} style={styles.thumbnails} />
            </Pressable>
          </View>
        )}
      />
    </View>
  );
}

//Shirt shop menu
const ShirtRoute = () => {
  return (
    <View>
      <FlatList
        style={styles.flatListContainer}
        numColumns={numColumns}
        data={shirtData}
        renderItem={({ item }) => (
          <View style={styles.flatListContainer}>
            <Pressable style={({ pressed }) => [{
              backgroundColor: pressed ? colors.emphasis : colors.primarySoft,
            }]}>
              <Image source={{ uri: item.imageUrl }} style={styles.thumbnails} />
            </Pressable>
          </View>
        )}
      />
    </View>
  );
}

//Pants shop menu
const PantsRoute = () => {
  return (
    <View>
      <FlatList
        style={styles.flatListContainer}
        numColumns={numColumns}
        data={pantsData}
        renderItem={({ item }) => (
          <View style={styles.flatListContainer}>
            <Pressable style={({ pressed }) => [{
              backgroundColor: pressed ? colors.emphasis : colors.primarySoft,
            }]}>
              <Image source={{ uri: item.imageUrl }} style={styles.thumbnails} />
            </Pressable>
          </View>
        )}
      />
    </View>
  );
}

//Hat shop menu
const HatRoute = () => {
  return (
    <View>
      <FlatList
        style={styles.flatListContainer}
        numColumns={numColumns}
        data={hatData}
        renderItem={({ item }) => (
          <View style={styles.flatListContainer}>
            <Pressable style={({ pressed }) => [{
              backgroundColor: pressed ? colors.emphasis : colors.primarySoft,
            }]}>
              <Image source={{ uri: item.imageUrl }} style={styles.thumbnails} />
            </Pressable>
          </View>
        )}
      />
    </View>
  );
}

//Shoes shop menu
const ShoesRoute = () => {
  return (
    <View>
      <FlatList
        style={styles.flatListContainer}
        numColumns={numColumns}
        data={shoesData}
        renderItem={({ item }) => (
          <View style={styles.flatListContainer}>
            <Pressable style={({ pressed }) => [{
              backgroundColor: pressed ? colors.emphasis : colors.primarySoft,
            }]}>
              <Image source={{ uri: item.imageUrl }} style={styles.thumbnails} />
            </Pressable>
          </View>
        )}
      />
    </View>
  );
}

//Accessorites shop menu
const AccRoute = () => {
  return (
    <View>
      <FlatList
        style={styles.flatListContainer}
        numColumns={numColumns}
        data={accData}
        renderItem={({ item }) => (
          <View style={styles.flatListContainer}>
            <Pressable style={({ pressed }) => [{
              backgroundColor: pressed ? colors.emphasis : colors.primarySoft,
            }]}>
              <Image source={{ uri: item.imageUrl }} style={styles.thumbnails} />
            </Pressable>
          </View>
        )}
      />
    </View>
  );
}

//Shop tabs instantiation
const Tab = createMaterialTopTabNavigator({
  screens: {
    Body: BodyRoute,
    Shirts: ShirtRoute,
    Pants: PantsRoute,
    Hats: HatRoute,
    Shoes: ShoesRoute,
    Accessories: AccRoute,
  },
});

//images layered in 
const layers = [
  ,
  '../assets/imgs/8bit/body3.png',
  '../assets/imgs/8bit/pants3.png',
  '../assets/imgs/8bit/shirt3.png',
  '../assets/imgs/8bit/shoes3.png',
  '../assets/imgs/8bit/hat3.png',
  '../assets/imgs/8bit/acc3.png',
];

//Main - container display
const ShopScreen = () => {
  return (
    <SafeAreaProvider style={styles.background}>
      <SafeAreaView>
        {/* Displays amount of coins */}
        
        {/* Top half of screen (display of the character) */}
        <View style={styles.imageContainer}>
          <Image source={require('../assets/imgs/background/bg_evening.png')} style={styles.bgImage} />
          <Image source={require('../assets/imgs/8bit/body3.png')} style={styles.image} />
          <Image source={require('../assets/imgs/8bit/pants2.png')} style={styles.image} />
          <Image source={require('../assets/imgs/8bit/shirt5.png')} style={styles.image} />
          <Image source={require('../assets/imgs/8bit/shoes4.png')} style={styles.image} />
          <Image source={require('../assets/imgs/8bit/acc3.png')} style={styles.image} />
        </View>
        <View style={styles.coinCountContainer}>
          <Image source={require('../assets/imgs/coin.png')} style={styles.coinImage} />
          <Text style={styles.coinText}>100   </Text>
        </View>
        {/* Bottom half of screen (shop portion) */}
        <View style={styles.background}>
          <NavigationIndependentTree>
            <NavigationContainer>
              <Tab.Navigator
                screenOptions={{
                  tabBarStyle: { backgroundColor: colors.primarySoft },
                  tabBarActiveTintColor: colors.black,
                  tabBarInactiveTintColor: colors.white,
                }}>
                <Tab.Screen name="🧍" component={BodyRoute} />
                <Tab.Screen name="👕" component={ShirtRoute} />
                <Tab.Screen name="👖" component={PantsRoute} />
                <Tab.Screen name="👑" component={HatRoute} />
                <Tab.Screen name="👟" component={ShoesRoute} />
                <Tab.Screen name="🌹" component={AccRoute} />
                
              </Tab.Navigator>
            </NavigationContainer>
          </NavigationIndependentTree>
        </View>
        
        
      </SafeAreaView>
    </SafeAreaProvider>
    
  );
};

{/* Styles */}
const styles = StyleSheet.create({
  background: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
    backgroundColor: colors.primarySoft,
    paddingTop: 16,
    paddingBottom: 16,
  },
  flatListContainer: {
    backgroundColor: colors.primarySoft,
    marginVertical: 5,
    marginHorizontal: 6,
    paddingBottom: 8,
    borderRadius: 10,
  },
  imageContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 5,
  },
  coinCountContainer: {
    width: Dimensions.get('window').width,
    height: 25,
    backgroundColor: colors.secondary,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  thumbnails: {
    width: 128,
    height: 128,
    resizeMode: 'contain',
  },
  bgImage: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height / 2,
    resizeMode: 'cover',

  },
  image: {
    width: Dimensions.get('window').width * (2/3),
    height: Dimensions.get('window').height * (1/3),
    objectFit: 'fill',
    position: 'absolute',

  },
  coinImage: {
    width: 21,
    height: 24,
    padding: 1,
  },
  coinText: {
    fontSize: 18,
    paddingRight: 5,
    fontWeight: 'bold',
    color: colors.white,
  },
})

export default ShopScreen;
