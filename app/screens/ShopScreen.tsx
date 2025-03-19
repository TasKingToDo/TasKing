import React, { useState, useCallback, memo, useEffect, useContext } from 'react';
import {
  View, ScrollView, Image, Text, TextInput,
  Dimensions, StyleSheet, FlatList, TouchableOpacity, Pressable
} from 'react-native';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import { doc, setDoc, onSnapshot, query, collection, where } from 'firebase/firestore';
//npm install react-native-tab-view
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { NavigationContainer, NavigationIndependentTree } from '@react-navigation/native';
import colors from '../config/colors';
import { SettingsContext } from '../config/SettingsContext';
import { FIREBASE_DB } from '@/firebaseConfig';
import { authContext } from '../config/authContext';
import bodyData from "../assets/shopdata/bodyData";
import shirtData from "../assets/shopdata/shirtData";
import pantsData from "../assets/shopdata/pantsData";
import hatData from "../assets/shopdata/hatData";
import shoesData from "../assets/shopdata/shoesData";
import accData from "../assets/shopdata/accData";
import bgData from "../assets/shopdata/bgData";

//num of cols on bottom half of screen
const numColumns = 3;

//defining expected props for ShopMenu component
type ShopMenuProps = {
  category: string;
  updateEquipped: (category: string, imageUrl: string) => void;
  data: { id: number; imageUrl: string }[];
};

//Tab menu flatlist base - sent data to display
//renders shop and updates equipped items when pressed
const ShopMenu: React.FC<ShopMenuProps> = memo(({ category, updateEquipped, data=[] }) => {
  return (
    <FlatList
      style={styles.flatListContainer}
      numColumns={numColumns}
      data={data.flat()}
      keyExtractor={(item, index) => item.id?.toString() || index.toString()}
      renderItem={({ item }) => (
        <View style={styles.flatListContainer}>
        <Pressable
          style={({ pressed }) => ({
            backgroundColor: pressed ? colors.emphasis : colors.primarySoft,
          })}
            onPress={() => updateEquipped(category, item.imageUrl)}>
          <Image source={{ uri: item.imageUrl }} style={styles.thumbnails} />
          </Pressable>
        </View>
      )}
    />
  );
});

//Shop tabs instantiation
const Tab = createMaterialTopTabNavigator();

//Main - container display
const ShopScreen = () => {
  //Fetch user id
  const { user } = useContext(authContext);
  //Fetch user data
  const userDocRef = doc(FIREBASE_DB, "users", user.uid);

  //Instantiate eqipped items
  const [equipped, setEquipped] = useState({});

  //state management
  // Fetch Balance from Database
  const [balance, setBalance] = useState(0);

  //Fetch data from db
  useEffect(() => {
    //err catch
    if (!user) return;
    //fetch data
    const unsubscribe = onSnapshot(userDocRef, (docSnap) => {
      if (docSnap.exists()) {
        //coin balance
        setBalance(docSnap.data().balance || 0);
        setEquipped(docSnap.data().equipped || {});
      } else {
        console.log("No such user document!");
      }
    }, (error) => {
      console.error("Error fetching data:", error);
    });

    return () => unsubscribe(); // Cleanup the listener on component unmount
  }, [user]);

  // Update equipped item in Firestore
  const updateEquipped = useCallback((category, url) => {
    if (!userDocRef) return; // Prevent errors
    setEquipped((prev) => {
      const newEquipped = { ...prev, [category]: url };
      setDoc(userDocRef, { equipped: newEquipped }, { merge: true });
      return newEquipped;
    });
  }, [user, userDocRef]);

  return (
    <SafeAreaProvider style={styles.background}>
      <SafeAreaView style={styles.background}>
        {/* Displays amount of coins */}
        
        {/* Top half of screen (display of the character) */}
        <View style={styles.imageContainer}>
          <Image source={{ uri: bgData[0].imageUrl }} style={styles.bgImage} />
          <Image source={{ uri: equipped.body }} style={styles.image} />
          <Image source={{ uri: equipped.shoes }} style={styles.image} />
          <Image source={{ uri: equipped.shirt }} style={styles.image} />
          <Image source={{ uri: equipped.pants }} style={styles.image} />
          <Image source={{ uri: equipped.hat }} style={styles.hatImage} />
          <Image source={{ uri: equipped.acc }} style={styles.image} />
        </View>
        <View style={styles.coinCountContainer}>
          <Image source={{ uri: "https://firebasestorage.googleapis.com/v0/b/tasking-c1d66.firebasestorage.app/o/coin.png?alt=media&token=e0a45910-fae9-4c15-a462-19154f025f64"}} style={styles.coinImage} />
          <Text style={styles.coinText}>{balance}</Text>
        </View>
        {/* Bottom half of screen (display of shop tab menu) */}
        <View style={styles.shopContainer}>
          <NavigationIndependentTree>
            <NavigationContainer>
              <Tab.Navigator
                screenOptions={{
                  tabBarStyle: { backgroundColor: colors.primarySoft },
                  tabBarActiveTintColor: colors.black,
                  tabBarInactiveTintColor: colors.white,
                }}>
                <Tab.Screen name="🧍" children={() => <ShopMenu category="body" updateEquipped={updateEquipped} data={bodyData} />} />
                <Tab.Screen name="👕" children={() => <ShopMenu category="shirt" updateEquipped={updateEquipped} data={shirtData} />} />
                <Tab.Screen name="👖" children={() => <ShopMenu category="pants" updateEquipped={updateEquipped} data={pantsData} />} />
                <Tab.Screen name="👑" children={() => <ShopMenu category="hat" updateEquipped={updateEquipped} data={hatData} />} />
                <Tab.Screen name="👟" children={() => <ShopMenu category="shoes" updateEquipped={updateEquipped} data={shoesData} />} />
                <Tab.Screen name="🌹" children={() => <ShopMenu category="acc" updateEquipped={updateEquipped} data={accData} />} />
                
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
    flex: 1,
  },
  coinCountContainer: {
    width: Dimensions.get('window').width,
    height: 25,
    backgroundColor: colors.secondary,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  shopContainer: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
    backgroundColor: colors.primarySoft,
    paddingTop: 16,
    paddingBottom: 16,
    flex: 1,
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
    top: -100,
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
