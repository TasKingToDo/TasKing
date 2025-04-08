import React, { useContext, useState, useEffect} from 'react';
import { Button, Modal, Pressable, StyleSheet, Text, View, Image } from "react-native";
import { Entypo } from "@expo/vector-icons";
import Popover from 'react-native-popover-view';
import { doc, updateDoc, onSnapshot } from 'firebase/firestore';
import { useNavigation } from 'expo-router';

import { themes } from '../config/colors';
import useTheme from '../config/useTheme';
import { SettingsContext } from './SettingsContext';
import { authContext } from './authContext';
import { FIREBASE_DB } from '@/firebaseConfig';

const CustomMenu = ({navbarVisible}) => {
    const [showPopover, setShowPopover] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);

    // Color Themes
    const colors = useTheme();

    // Resolution progress
    const [currentResolution, setCurrentResolution] = useState("fourBit");
    const [progress, setProgress] = useState(0);
    const [unlockedResolutions, setUnlockedResolutions] = useState(["fourBit"]);

    // Fetch Balance from Database
    const [balance, setBalance] = useState(0);
    const { user } = useContext(authContext);
    
    useEffect(() => {
        if (!user) return;
      
        const userDocRef = doc(FIREBASE_DB, "users", user.uid);
        const statsDocRef = doc(FIREBASE_DB, "stats", user.uid);
      
        // Listen for changes in the user's main data (balance, current resolution)
        const unsubscribeUser = onSnapshot(userDocRef, (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                setBalance(data.balance || 0);
                setCurrentResolution(data.currentresolution || "fourBit");
            } else {
                console.log("No such user document!");
            }
        }, (error) => {
            console.error("Error fetching user data:", error);
        });
      
        // Listen for changes in the user's stats (tasks completed -> progress)
        const unsubscribeStats = onSnapshot(statsDocRef, (docSnap) => {
            if (docSnap.exists()) {
                const statsData = docSnap.data();
                setProgress(statsData.tasksCompleted || 0);
            } else {
                console.log("No stats document found.");
            }
        }, (error) => {
            console.error("Error fetching stats data:", error);
        });
      
        // Cleanup both listeners
        return () => {
          unsubscribeUser();
          unsubscribeStats();
        };
    }, [user]);

    const handleResolutionSelect = async (resolution) => {
        if (!user) {
            alert("You must be logged in to upgrade.");
            return;
        }
    
        // If the resolution is already unlocked, simply switch to it
        if (unlockedResolutions.includes(resolution) || resolution === "fourBit") {
            setCurrentResolution(resolution);
    
            // Update Firestore to store the selected resolution
            const userRef = doc(FIREBASE_DB, "users", user.uid);
            await updateDoc(userRef, { currentresolution: resolution });
    
            return;
        }
    
        // Otherwise, enforce unlocking conditions
        let cost = 0;
        let requiredProgress = 0;
    
        if (resolution === "eightBit") {
            cost = 100;
            requiredProgress = 100;
        } else if (resolution === "sixteenBit") {
            cost = 250;
            requiredProgress = 400;
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
                        <Entypo name="menu" color={themes.light.black} size={70} />
                    </Pressable>
                )}
                isVisible={showPopover}
                onRequestClose={handleCloseMenu}
                backgroundStyle={{backgroundColor: 'transparent'}}
                arrowSize={{width: 25, height: 15}}
                popoverStyle={{backgroundColor: colors.primary}}>
                <View>
                    <Pressable style={styles.buttonItems} onPress={handleFriendsNav}>
                        <Entypo name="user" color={themes.light.black} size={50} />
                        <View style={[styles.divider, { backgroundColor: colors.primary }]}></View>
                        <Text></Text>
                        <Text style={{fontSize: 40, color: themes.light.black}}>Friends</Text>
                    </Pressable>
                    <View style={{height: 4}}></View>
                    <Pressable style={styles.buttonItems} onPress={handleStatsNav}>
                        <Entypo name="line-graph" color={themes.light.black} size={50} />
                        <View style={[styles.divider, { backgroundColor: colors.primary }]}></View>
                        <Text></Text>
                        <Text style={{fontSize: 40, color: themes.light.black}}>Statistics</Text>
                    </Pressable>
                    <View style={{height: 4}}></View>
                    <Pressable style={styles.buttonItems} onPress={handleResolutionPress}>
                        <Entypo name="arrow-up" color={themes.light.black} size={50} />
                        <View style={[styles.divider, { backgroundColor: colors.primary }]}></View>
                        <Text></Text>
                        <Text style={{fontSize: 40, color: themes.light.black}}>Resolution</Text>
                    </Pressable>
                    <View style={{height: 4}}></View>
                    <Pressable style={styles.buttonItems} onPress={handleSettingsNav}>
                        <Entypo name="cog" color={themes.light.black} size={50} />
                        <View style={[styles.divider, { backgroundColor: colors.primary }]}></View>
                        <Text></Text>
                        <Text style={{fontSize: 40, color: themes.light.black}}>Settings</Text>
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

                        {/* fourBit Resolution (Always Available) */}
                        <Pressable 
                            style={[styles.resolutionButton, currentResolution === "fourBit" && [styles.selectedResolution, { borderColor: colors.primary }]]} 
                            onPress={() => handleResolutionSelect("fourBit")}
                        >
                            <Text style={styles.resolutionText}>fourBit</Text>
                        </Pressable>

                        {/* eightBit Resolution */}
                        <Pressable 
                            style={[
                                styles.resolutionButton, 
                                (!unlockedResolutions.includes("eightBit") && (progress < 100 || balance < 100)) && styles.locked,
                                currentResolution === "eightBit" && [styles.selectedResolution, { borderColor: colors.primary }]
                            ]} 
                            onPress={() => handleResolutionSelect("eightBit")}
                            disabled={!unlockedResolutions.includes("eightBit") && (progress < 100 || balance < 100)}
                        >
                            <Text style={styles.resolutionText}>
                                eightBit {unlockedResolutions.includes("eightBit") ? "" : `(Progress: ${progress}/100, Cost: 100)`}
                            </Text>
                        </Pressable>

                        {/* sixteenBit Resolution */}
                        <Pressable 
                            style={[
                                styles.resolutionButton, 
                                (!unlockedResolutions.includes("sixteenBit") && (progress < 400 || balance < 250)) && styles.locked,
                                currentResolution === "sixteenBit" && [styles.selectedResolution, { borderColor: colors.primary }]
                            ]} 
                            onPress={() => handleResolutionSelect("sixteenBit")}
                            disabled={!unlockedResolutions.includes("sixteenBit") && (progress < 400 || balance < 250)}
                        >
                            <Text style={styles.resolutionText}>
                                sixteenBit {unlockedResolutions.includes("sixteenBit") ? "" : `(Progress: ${progress}/400, Cost: 250)`}
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
    },
    locked: {
        opacity: 0.5,
    },
})

export default CustomMenu;