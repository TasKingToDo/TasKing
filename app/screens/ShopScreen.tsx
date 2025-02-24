import React, { useState, useCallback, memo } from 'react';
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
import bgData from "../assets/shopdata/bgData";

//num of cols on bottom half of screen
const numColumns = 3;

//Tab menu flatlist base - sent data to display
const ShopMenu = memo(({ data, setUrl }) => {
  const handlePress = useCallback((imageUrl) => setUrl(imageUrl), [setUrl]);
  return (
    <FlatList
      style={styles.flatListContainer}
      numColumns={numColumns}
      data={data}
      keyExtractor={(item, index) => item.id?.toString() || index.toString()}
      renderItem={({ item }) => (
        <View style={styles.flatListContainer}>
        <Pressable
          style={({ pressed }) => ({
            backgroundColor: pressed ? colors.emphasis : colors.primarySoft,
          })}
          onPress={() => handlePress(item.imageUrl)}>
          <Image source={{ uri: item.imageUrl }} style={styles.thumbnails} />
          </Pressable>
        </View>
      )}
    />
  );
});

//Calling flat list function for each tab
const BodyRoute = ({ setUrl }) => <ShopMenu data={bodyData} setUrl={setUrl} />;
const ShirtRoute = ({ setUrl }) => <ShopMenu data={shirtData} setUrl={setUrl} />;
const PantsRoute = ({ setUrl }) => <ShopMenu data={pantsData} setUrl={setUrl} />;
const HatRoute = ({ setUrl }) => <ShopMenu data={hatData} setUrl={setUrl} />;
const ShoesRoute = ({ setUrl }) => <ShopMenu data={shoesData} setUrl={setUrl} />;
const AccRoute = ({ setUrl }) => <ShopMenu data={accData} setUrl={setUrl} />;



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

//Main - container display
const ShopScreen = () => {
  // Initialize the state for accUrl
  const [bgUrl, setBgUrl] = useState("https://firebasestorage.googleapis.com/v0/b/tasking-c1d66.firebasestorage.app/o/background%2Fbg_day.png?alt=media&token=bbe05178-2fd6-4c09-94ae-fcd2a932f8b6");
  const [bodyUrl, setBodyUrl] = useState("https://firebasestorage.googleapis.com/v0/b/tasking-c1d66.firebasestorage.app/o/4bit%2Fbody5.png?alt=media&token=cc932d4b-ebcd-42b2-8c94-d9f3380bca07");
  const [pantsUrl, setPantsUrl] = useState("https://firebasestorage.googleapis.com/v0/b/tasking-c1d66.firebasestorage.app/o/4bit%2Fpants1.png?alt=media&token=bd6acb1a-eb39-4fc5-bb9a-7db56571ed8b");
  const [shirtUrl, setShirtUrl] = useState("https://firebasestorage.googleapis.com/v0/b/tasking-c1d66.firebasestorage.app/o/4bit%2Fshirt1.png?alt=media&token=e85df23e-d994-491f-8095-dc9895265ce9");
  const [hatUrl, setHatUrl] = useState("https://firebasestorage.googleapis.com/v0/b/tasking-c1d66.firebasestorage.app/o/4bit%2Fhat4.png?alt=media&token=19020a01-e907-4071-be8e-05f9435f7a97");
  const [shoesUrl, setShoesUrl] = useState("https://firebasestorage.googleapis.com/v0/b/tasking-c1d66.firebasestorage.app/o/4bit%2Fshoes2.png?alt=media&token=4ade86b0-7a61-415e-bc67-e64807a1d4f6");
  const [accUrl, setAccUrl] = useState("https://firebasestorage.googleapis.com/v0/b/tasking-c1d66.firebasestorage.app/o/4bit%2Facc3.png?alt=media&token=6d968ef5-98bf-48eb-955b-23cacd383e92");

  //Memoize states
  const memoizedSetBgUrl = useCallback((url) => setBgUrl(url), []);
  const memoizedSetBodyUrl = useCallback((url) => setBodyUrl(url), []);
  const memoizedSetShirtUrl = useCallback((url) => setShirtUrl(url), []);
  const memoizedSetPantsUrl = useCallback((url) => setPantsUrl(url), []);
  const memoizedSetHatUrl = useCallback((url) => setHatUrl(url), []);
  const memoizedSetShoesUrl = useCallback((url) => setShoesUrl(url), []);
  const memoizedSetAccUrl = useCallback((url) => setAccUrl(url), []);

  return (
    <SafeAreaProvider style={styles.background}>
      <SafeAreaView>
        {/* Displays amount of coins */}
        
        {/* Top half of screen (display of the character) */}
        <View style={styles.imageContainer}>
          <Image source={{ uri: bgUrl }} style={styles.bgImage} />
          <Image source={{ uri: bodyUrl }} style={styles.image} />
          <Image source={{ uri: shoesUrl }} style={styles.image} />
          <Image source={{ uri: shirtUrl }} style={styles.image} />
          <Image source={{ uri: pantsUrl }} style={styles.image} />
          <Image source={{ uri: hatUrl }} style={styles.hatImage} />
          <Image source={{uri: accUrl}} style={styles.image} />
        </View>
        <View style={styles.coinCountContainer}>
          <Image source={{ uri: "https://firebasestorage.googleapis.com/v0/b/tasking-c1d66.firebasestorage.app/o/coin.png?alt=media&token=e0a45910-fae9-4c15-a462-19154f025f64"}} style={styles.coinImage} />
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
                <Tab.Screen name="🧍" children={() => <BodyRoute setUrl={memoizedSetBodyUrl} />} />
                <Tab.Screen name="👕" children={() => <ShirtRoute setUrl={memoizedSetShirtUrl} />} />
                <Tab.Screen name="👖" children={() => <PantsRoute setUrl={memoizedSetPantsUrl} />} />
                <Tab.Screen name="👑" children={() => <HatRoute setUrl={memoizedSetHatUrl} />} />
                <Tab.Screen name="👟" children={() => <ShoesRoute setUrl={memoizedSetShoesUrl} />} />
                <Tab.Screen name="🌹" children={() => <AccRoute setUrl={memoizedSetAccUrl} />} />
                
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
  hatImage: {
    width: Dimensions.get('window').width * (2 / 3),
    height: Dimensions.get('window').height * (1 / 3),
    objectFit: 'fill',
    position: 'absolute',
    paddingTop: 20,
    top: -65,
    left: 69,
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
