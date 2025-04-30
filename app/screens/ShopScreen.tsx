﻿import React, { useState, useCallback, memo, useEffect, useContext } from 'react';
import {
  View, Image, ImageBackground, Text, Alert,
  Dimensions, StyleSheet, FlatList, Pressable,
} from 'react-native';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
//npm install react-native-tab-view
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { NavigationContainer, NavigationIndependentTree } from '@react-navigation/native';
import { themes } from '../config/colors';
import useTheme from '../config/useTheme';
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
  equipItem: (category: string, fourBitUrl: string) => void;
  unlockItem: (category: string, fourBitUrl: string) => void;
  data: { id: number; fourBitUrl: string; eightBitUrl: string; sixteenBitUrl: string; }[];
};

//url of currently equipped items, to be derived later
let equippedBody;
let equippedShirt;
let equippedPants;
let equippedHat;
let equippedShoes;
let equippedAcc;

//reorder data such that FlatList will display owned items before unowned
function useOrderedData (category, data) {
  //Fetch user id
  const { user } = useContext(authContext);
  //Ordered data
  const [orderedData, setOrderedData] = useState([]);
  //Unowned items
  const [unownedItems, setUnownedItems] = useState([]);

  //Fetch data from db
  useEffect(() => {
    //Fetch user data
    const userDocRef = doc(FIREBASE_DB, "users", user.uid);
    //err catch
    if (!user || !userDocRef) { return; }
    //Fetch owned items data from db
    const unsubscribe = onSnapshot(userDocRef, (docSnap) => {
      if (docSnap.exists()) {
        //container of unowned items
        let unownedData = [];
        //derive db category name
        const ownedCategory = "owned" + category;
        //container of ordered data - owned shows up first in list
        let preorderedData = docSnap.get(ownedCategory) || [];

        //snapshot.forEach(docsnap => {})
        //add unowned items to end of the list
        for (let item of data) {
          if (!preorderedData.includes(item.id)) {
            preorderedData = [...preorderedData, item.id];
            unownedData = [...unownedData, item.id];
          }
        }
        setOrderedData(preorderedData);
        setUnownedItems(unownedData);
      }
    });
    return () => unsubscribe(); // Cleanup the listener on component unmount
  }, [user, category, data]);
  return [ orderedData, unownedItems ];
}

//Shop tabs instantiation
const Tab = createMaterialTopTabNavigator();

//Main - container display
const ShopScreen = () => {
  // Set up colors for proper theme usage
  const colors = useTheme();

  //Fetch user id
  const { user } = useContext(authContext);
  //Fetch user & stat data
  const userDocRef = doc(FIREBASE_DB, "users", user.uid);
  const statsRef = doc(FIREBASE_DB, "stats", user.uid);

  //Instantiate eqipped items
  const [equipped, setEquipped] = useState({});

  //Instantiate owned items
  const [ownedShirt, setOwnedShirt] = useState({});
  const [ownedPants, setOwnedPants] = useState({});
  const [ownedHat, setOwnedHat] = useState({});
  const [ownedShoes, setOwnedShoes] = useState({});
  const [ownedAcc, setOwnedAcc] = useState({});

  //state management
  // Fetch Balance from Database
  const [balance, setBalance] = useState(0);

  //Set background based on time of day
  const [bg, setBg] = useState("");

  //Change coins spent statistics
  const [coinSpent, setCoinSpent] = useState(0);

  //Fetch resolution
  const [resolution, setResolution] = useState("");

  //Fetch data from db
  useEffect(() => {
    //err catch
    if (!user) return;
    //fetch data
    const unsubscribe = onSnapshot(userDocRef, (docSnap) => {
      if (docSnap.exists()) {
        //set starting data from db
        setBalance(docSnap.data().balance || 0);
        setEquipped(docSnap.data().equipped || {});
        setOwnedShirt(docSnap.data().ownedshirt || {});
        setOwnedPants(docSnap.data().ownedpants || {});
        setOwnedHat(docSnap.data().ownedhat || {});
        setOwnedShoes(docSnap.data().ownedshoes || {});
        setOwnedAcc(docSnap.data().ownedacc || {});
        setResolution(docSnap.data().currentresolution || "");

        //set background based on time of day
        var hour = new Date().getHours();
        //day
        if (hour >= 8 && hour <= 18) { setBg(bgData[0].imageUrl); }
        //night
        else if (hour < 5 || hour > 22) { setBg(bgData[2].imageUrl); }
        //golden hour
        else { setBg(bgData[1].imageUrl); }
      } else {
        console.log("No such user document!");
      }
    }, (error) => {
      console.error("Error fetching data:", error);
    });
    const unsub = onSnapshot(statsRef, (docSnap) => {
      if (docSnap.exists()) {
        //set starting data from db
        setCoinSpent(docSnap.data().coinsSpent || 0);
      } else {
        console.log("No such user document!");
      }
    }, (error) => {
      console.error("Error fetching data:", error);
    });
    return () => {unsubscribe(); unsub();} // Cleanup the listener on component unmount
  }, [user]);

  // Update equipped item in db
  const equipItem = useCallback((category, item) => {

    setEquipped((prev) => {
      const newEquipped = { ...prev, [category]: item };
      setDoc(userDocRef, { equipped: newEquipped }, { merge: true });
      return newEquipped;
    });
  }, [resolution, equipped]);

  //Attempt to unlock item
  const unlockItem = useCallback((category, item) => {
    //err catch
    if (!userDocRef) return;

    //instantiating price variable
    let price = 20;
    switch (category) {
      case "shirt":
        price = 20;
        break;
      case "pants":
        price = 20;
        break;
      case "hat":
        price = 35;
        break;
      case "shoes":
        price = 25;
        break;
      case "acc":
        price = 35;
        break;
      default:
        console.log("err setting price");
    }

    //display popup that confirms user decision
    Alert.alert("", "Unlock item? Price = " + price, [
      {
        text: "Unlock",
        onPress: () => {
          //if insufficient coins, abort action w/ error message
          if (balance < price) {
            Alert.alert("Insufficient coins!");
          } else {
            updateOwned(category, item, price);
          }
        },
      },
      {
        text: "Nevermind",
        onPress: () => { return; },
      }
    ],
      {
        cancelable: true,
        onDismiss: () => { return; },
      },
    );
    
      
    
  }, [userDocRef]);

  const updateOwned = useCallback((category, item, price) => {
      //Get stats from db to update coins spent stat
      const statsRef = doc(FIREBASE_DB, "stats", user.uid);
      //const userDocRef = doc(FIREBASE_DB, "users", user.uid);
    
      //add unlocked item to owned items in db and set price
      switch (category) {
        case "shirt":
          setOwnedShirt((prev) => {
            const nowOwned = [...prev, item];
            setDoc(userDocRef, { ownedshirt: nowOwned }, { merge: true });
            return nowOwned;
          });
          break;
        case "pants":
          setOwnedPants((prev) => {
            const nowOwned = [...prev, item];
            setDoc(userDocRef, { ownedpants: nowOwned }, { merge: true });
            return nowOwned;
          });
          break;
        case "hat":
          setOwnedHat((prev) => {
            const nowOwned = [...prev, item];
            setDoc(userDocRef, { ownedhat: nowOwned }, { merge: true });
            return nowOwned;
          });
          break;
        case "shoes":
          setOwnedShoes((prev) => {
            const nowOwned = [...prev, item];
            setDoc(userDocRef, { ownedshoes: nowOwned }, { merge: true });
            return nowOwned;
          });
          break;
        case "acc":
          setOwnedAcc((prev) => {
            const nowOwned = [...prev, item];
            setDoc(userDocRef, { ownedacc: nowOwned }, { merge: true });
            return nowOwned;
          });
          break;
        default:
          console.log("ERR: unlockItem");
      }

    //change coin balance
    setBalance((prev) => {
      const newBalance = prev - price;
      setDoc(userDocRef, { balance: newBalance }, {merge: true});
      return newBalance;
    });
    //change coins spent stat
    setCoinSpent((prev) => {
      const newStat = prev + price;
      setDoc(statsRef, { coinsSpent: newStat }, { merge: true });
      return newStat;
    });
    return () => unsubscribe(); // Cleanup the listener on component unmount;
  }, [userDocRef]);

  //Tab menu flatlist base - sent data to display
  //renders shop and updates equipped items when pressed
  const ShopMenu: React.FC<ShopMenuProps> = memo(({ category, equipItem, unlockItem, data = [] }) => {
    //Reordering data and figuring out which ones are new
    const [orderedData, unownedItems] = useOrderedData(category, data);
    //Set url
    const imageUrl = resolution + "Url";
    //Get equipped items
    // equippedBody = bodyData.find(({ id }) => id === equipped.body)[imageUrl];
    // equippedShirt = shirtData.find(({ id }) => id === equipped.shirt)[imageUrl];
    // equippedPants = pantsData.find(({ id }) => id === equipped.pants)[imageUrl];
    // equippedHat = hatData.find(({ id }) => id === equipped.hat)[imageUrl];
    // equippedShoes = shoesData.find(({ id }) => id === equipped.shoes)[imageUrl];
    // equippedAcc = accData.find(({ id }) => id === equipped.acc)[imageUrl];

    return (
      //render flatlist
      <FlatList
        style={[styles.flatListContainer, { backgroundColor: colors.primarySoft }]}
        numColumns={numColumns}
        data={orderedData}
        renderItem={({ item }) => (
          <View style={[styles.flatListContainer, { backgroundColor: colors.primarySoft }]}>
            <Pressable
              style={({ pressed }) => ({
              backgroundColor: pressed ? colors.emphasis : colors.primarySoft,
              })}
              onPress={() => unownedItems.includes(item) ? unlockItem(category, item) : equipItem(category, item)}>
              <ImageBackground source={{ uri: data.find(({ id }) => id === item)[imageUrl] }} style={styles.blockedThumbnails}>
                {unownedItems.includes(item) && (<Image source={{ uri: "https://firebasestorage.googleapis.com/v0/b/tasking-c1d66.firebasestorage.app/o/blocked_item.png?alt=media&token=eb83ac1f-cff7-48de-81d6-8aed6f168850" }}
                  resizeMode="cover" style={styles.thumbnails} />)}
              </ImageBackground>
            </Pressable>
          </View>
        )}
      />
    );
  });

  return (
    <SafeAreaProvider style={[styles.background, { backgroundColor: colors.primarySoft }]}>
      <SafeAreaView style={[styles.background, { backgroundColor: colors.primarySoft }]}>
        {/* Top half of screen (display of the character) */}
        <View style={styles.imageContainer}>
          <Image source={{ uri: bg }} style={styles.bgImage} />
          <Image source={{ uri: equippedBody }} style={styles.image} />
          <Image source={{ uri: equippedShoes }} style={styles.image} />
          <Image source={{ uri: equippedShirt }} style={styles.image} />
          <Image source={{ uri: equippedPants }} style={styles.image} />
          <Image source={{ uri: equippedHat }} style={styles.hatImage} />
          <Image source={{ uri: equippedAcc }} style={styles.image} />
        </View>
        <View style={[styles.coinCountContainer, { backgroundColor: colors.secondary }]}>
          <Image source={{ uri: "https://firebasestorage.googleapis.com/v0/b/tasking-c1d66.firebasestorage.app/o/coin.png?alt=media&token=e0a45910-fae9-4c15-a462-19154f025f64" }} style={styles.coinImage} />
          <Text style={[styles.coinText, { color: themes.light.white }]}>{balance}</Text>
        </View>
        {/* Bottom half of screen (display of shop tab menu) */}
        <View style={[styles.shopContainer, { backgroundColor: colors.primarySoft }]}>
          <NavigationIndependentTree>
            <NavigationContainer>
              <Tab.Navigator
                screenOptions={{
                  tabBarStyle: { backgroundColor: colors.emphasis },
                  tabBarActiveTintColor: colors.black,
                  tabBarInactiveTintColor: colors.white,
                }}>
                <Tab.Screen name="🧍" options={{
                  tabBarIcon: () => (<Image source={{ uri: bodyData[1].fourBitUrl }} style={styles.flatListIcons} />), tabBarLabel: () => null, }}
                  children={() => <ShopMenu category="body" equipItem={equipItem} unlockItem={unlockItem} data={bodyData} />}
                />
                <Tab.Screen name="👕" options={{
                  tabBarIcon: () => (<Image source={{ uri: shirtData[2].fourBitUrl }} style={styles.flatListIcons} />), tabBarLabel: () => null,
                }}
                  children={() => <ShopMenu category="shirt" equipItem={equipItem} unlockItem={unlockItem} data={shirtData} />}
                />
                <Tab.Screen name="👖" options={{
                  tabBarIcon: () => (<Image source={{ uri: pantsData[4].fourBitUrl }} style={styles.flatListIcons} />), tabBarLabel: () => null,
                }}
                  children={() => <ShopMenu category="pants" equipItem={equipItem} unlockItem={unlockItem} data={pantsData} />}
                />
                <Tab.Screen name="👑" options={{
                  tabBarIcon: () => (<Image source={{ uri: hatData[3].fourBitUrl }} style={styles.flatListIcons} />), tabBarLabel: () => null,
                }}
                  children={() => <ShopMenu category="hat" equipItem={equipItem} unlockItem={unlockItem} data={hatData} />}
                />
                <Tab.Screen name="👟" options={{
                  tabBarIcon: () => (<Image source={{ uri: shoesData[2].fourBitUrl }} style={styles.flatListIcons} />), tabBarLabel: () => null,
                }}
                  children={() => <ShopMenu category="shoes" equipItem={equipItem} unlockItem={unlockItem} data={shoesData} />}
                />
                <Tab.Screen name="🌹" options={{
                  tabBarIcon: () => (<Image source={{ uri: accData[3].fourBitUrl }} style={styles.flatListIcons} />), tabBarLabel: () => null,
                }}
                  children={() => <ShopMenu category="acc" equipItem={equipItem} unlockItem={unlockItem} data={accData} />}
                />
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
    paddingTop: 16,
    paddingBottom: 16,
  },
  flatListContainer: {
    marginVertical: 5,
    marginHorizontal: 6,
    paddingBottom: 8,
    borderRadius: 10,
  },
  flatListIcons: {
    width: 30,
    height: 30,
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
    flexDirection: 'row',
    justifyContent: 'center',
  },
  shopContainer: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
    paddingBottom: 16,
    flex: 1,
  },
  thumbnails: {
    width: 128,
    height: 128,
    resizeMode: 'contain',
  },
  blockedThumbnails: {
    width: 128, 
    height: 128,
    resizeMode: 'contain',
  },
  bgImage: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height / 1.9,
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
    top: -98,
    left: 67,
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
  },
})

export default ShopScreen;