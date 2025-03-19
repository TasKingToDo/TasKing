import React, { useContext, useState, useEffect} from 'react';
import { Button, Modal, Pressable, StyleSheet, Text, View, Image } from "react-native";
import { Entypo } from "@expo/vector-icons";
import Popover from 'react-native-popover-view';
import { doc, updateDoc, onSnapshot } from 'firebase/firestore';
import { useNavigation } from 'expo-router';

import colors from "./colors";
import { SettingsContext } from './SettingsContext';
import { authContext } from './authContext';
import { FIREBASE_DB } from '@/firebaseConfig';

const CustomMenu = ({navbarVisible}) => {
    const [showPopover, setShowPopover] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);

    // Fetch Balance from Database
      const [balance, setBalance] = useState(0);
      const { user } = useContext(authContext);
    
      useEffect(() => {
        if (!user) return;
    
        const userDocRef = doc(FIREBASE_DB, "users", user.uid);
    
        const unsubscribe = onSnapshot(userDocRef, (docSnap) => {
            if (docSnap.exists()) {
                setBalance(docSnap.data().balance || 0);
                setCurrentResolution(docSnap.data().currentresolution || "4-bit"); // Fetch current resolution
            } else {
                console.log("No such user document!");
            }
        }, (error) => {
            console.error("Error fetching user data:", error);
        });
    
        return () => unsubscribe(); // Cleanup listener on unmount
    }, [user]);    

    // Resolution progress
    const [currentResolution, setCurrentResolution] = useState("4-bit");
    const [progress, setProgress] = useState(0); // Example progress (50% towards 8-bit)
    const [unlockedResolutions, setUnlockedResolutions] = useState(["4-bit"]); // 8-bit and 16-bit locked initially

    const handleResolutionSelect = async (resolution) => {
        if (!user) {
            alert("You must be logged in to upgrade.");
            return;
        }
    
        // If the resolution is already unlocked, simply switch to it
        if (unlockedResolutions.includes(resolution) || resolution === "4-bit") {
            setCurrentResolution(resolution);
    
            // Update Firestore to store the selected resolution
            const userRef = doc(FIREBASE_DB, "users", user.uid);
            await updateDoc(userRef, { currentresolution: resolution });
    
            return;
        }
    
        // Otherwise, enforce unlocking conditions
        let cost = 0;
        let requiredProgress = 0;
    
        if (resolution === "8-bit") {
            cost = 50;
            requiredProgress = 100;
        } else if (resolution === "16-bit") {
            cost = 100;
            requiredProgress = 200;
        }
    
        if (progress < requiredProgress) {
            alert(`You need at least ${requiredProgress} progress to unlock ${resolution}.`);
            return;
        }
    
        if (balance < cost) {
            alert(`You need at least ${cost} balance to unlock ${resolution}.`);
            return;
        }
    
        // Deduct balance, unlock resolution, and update Firestore
        const newBalance = balance - cost;
        setBalance(newBalance);
        setUnlockedResolutions([...unlockedResolutions, resolution]);
        setCurrentResolution(resolution);
    
        const userRef = doc(FIREBASE_DB, "users", user.uid);
        await updateDoc(userRef, { 
            balance: newBalance,
            currentresolution: resolution 
        });
    };       

    const navigation = useNavigation();

    const handleCloseMenu = () => {
        setShowPopover(false);
    };

    const handleFriendsNav = () => {
        setShowPopover(false)
        navigation.navigate('Friends')
    }

    const handleStatsNav = () => {
        setShowPopover(false)
        navigation.navigate('Stats')
    }

    const handleResolutionPress = () => {
        setShowPopover(false);
        setModalVisible(true);
    }

    const handleSettingsNav = () => {
        setShowPopover(false)
        navigation.navigate('Settings')
    }

    const settings = useContext(SettingsContext);
    
    if (!settings) return null;

    useEffect(() => {
        if (!navbarVisible) {
            setShowPopover(false);
        }
    }, [navbarVisible]);

    return (
        <View style={styles.container}>
            <Popover 
                from={(
                    <Pressable style={styles.menu} onPress={() => setShowPopover(true)}>
                        <Entypo name="menu" color={settings.darkMode ? colors.white : colors.black} size={70} />
                    </Pressable>
                )}
                isVisible={showPopover}
                onRequestClose={handleCloseMenu}
                backgroundStyle={{backgroundColor: 'transparent'}}
                arrowSize={{width: 55, height: 10}}
                popoverStyle={{backgroundColor: settings.darkMode ? colors.secondary : colors.primary}}>
                <View>
                    <Pressable style={styles.buttonItems} onPress={handleFriendsNav}>
                        <Entypo name="user" color={settings.darkMode ? colors.white : colors.black} size={50} />
                        <View style={styles.divider}></View>
                        <Text></Text>
                        <Text style={{fontSize: 40, color: settings.darkMode ? colors.white : colors.black}}>Friends</Text>
                    </Pressable>
                    <View style={{height: 4}}></View>
                    <Pressable style={styles.buttonItems} onPress={handleStatsNav}>
                        <Entypo name="line-graph" color={settings.darkMode ? colors.white : colors.black} size={50} />
                        <View style={styles.divider}></View>
                        <Text></Text>
                        <Text style={{fontSize: 40, color: settings.darkMode ? colors.white : colors.black}}>Statistics</Text>
                    </Pressable>
                    <View style={{height: 4}}></View>
                    <Pressable style={styles.buttonItems} onPress={handleResolutionPress}>
                        <Entypo name="arrow-up" color={settings.darkMode ? colors.white : colors.black} size={50} />
                        <View style={styles.divider}></View>
                        <Text></Text>
                        <Text style={{fontSize: 40, color: settings.darkMode ? colors.white : colors.black}}>Resolution</Text>
                    </Pressable>
                    <View style={{height: 4}}></View>
                    <Pressable style={styles.buttonItems} onPress={handleSettingsNav}>
                        <Entypo name="cog" color={settings.darkMode ? colors.white : colors.black} size={50} />
                        <View style={styles.divider}></View>
                        <Text></Text>
                        <Text style={{fontSize: 40, color: settings.darkMode ? colors.white : colors.black}}>Settings</Text>
                    </Pressable>
                </View>
            </Popover>
            <Modal 
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalBackground}>
                    <View style={styles.modalContainer}>
                        <Text style={styles.modalTitle}>Select Resolution</Text>
                        <Text style={{fontSize: 15}}> Current Balance: {balance}</Text>

                        {/* 4-bit Resolution (Always Available) */}
                        <Pressable 
                            style={[styles.resolutionButton, currentResolution === "4-bit" && styles.selectedResolution]} 
                            onPress={() => handleResolutionSelect("4-bit")}
                        >
                            <Text style={styles.resolutionText}>4-bit</Text>
                        </Pressable>

                        {/* 8-bit Resolution */}
                        <Pressable 
                            style={[
                                styles.resolutionButton, 
                                (!unlockedResolutions.includes("8-bit") && (progress < 100 || balance < 50)) && styles.locked,
                                currentResolution === "8-bit" && styles.selectedResolution
                            ]} 
                            onPress={() => handleResolutionSelect("8-bit")}
                            disabled={!unlockedResolutions.includes("8-bit") && (progress < 100 || balance < 50)}
                        >
                            <Text style={styles.resolutionText}>
                                8-bit {unlockedResolutions.includes("8-bit") ? "" : `(Progress: ${progress}/100, Cost: 50)`}
                            </Text>
                        </Pressable>

                        {/* 16-bit Resolution */}
                        <Pressable 
                            style={[
                                styles.resolutionButton, 
                                (!unlockedResolutions.includes("16-bit") && (progress < 200 || balance < 100)) && styles.locked,
                                currentResolution === "16-bit" && styles.selectedResolution
                            ]} 
                            onPress={() => handleResolutionSelect("16-bit")}
                            disabled={!unlockedResolutions.includes("16-bit") && (progress < 200 || balance < 100)}
                        >
                            <Text style={styles.resolutionText}>
                                16-bit {unlockedResolutions.includes("16-bit") ? "" : `(Progress: ${progress}/200, Cost: 100)`}
                            </Text>
                        </Pressable>

                        <Button title="Close" color={colors.secondary} onPress={() => setModalVisible(false)} />
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    buttonItems: {
        flexDirection: "row", 
        alignItems: "center",
    },
    container: {
        width: "17.5%",
        position: "relative",
        zIndex: 1000,
        pointerEvents: "auto",
        overflow: "visible"
    },
    divider: {
        width: "3%",
        backgroundColor: colors.primary,
    },
    menu: {
        height: 75,
        zIndex: 2000,
        overflow: "visible",
        alignSelf: "flex-start",
    },
    modalBackground: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0,0,0,0.5)",
    },
    modalContainer: {
        width: "90%",
        padding: 20,
        backgroundColor: "white",
        borderRadius: 10,
        alignItems: "center",
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: "bold",
        marginBottom: 10,
    },
    resolutionButton: {
        width: "80%",
        padding: 15,
        marginVertical: 5,
        borderRadius: 10,
        alignItems: "center",
    },
    resolutionText: {
        fontSize: 15,
        fontWeight: "bold",
    },
    selectedResolution: {
        borderWidth: 3,
        borderColor: colors.primary,
    },
    locked: {
        backgroundColor: colors.white,
        opacity: 0.5,
    },
})

export default CustomMenu;