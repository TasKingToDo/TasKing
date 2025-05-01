import React, { useContext, useState, useEffect} from 'react';
import { Button, Modal, Pressable, StyleSheet, Text, View, } from "react-native";
import { Menu, User, LineChart, Settings, Upload, } from 'lucide-react-native';
import Popover from 'react-native-popover-view';
import { doc, updateDoc, onSnapshot, collection, query, where, } from 'firebase/firestore';
import { useNavigation } from 'expo-router';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

import { themes } from './colors';
import useTheme from './useTheme';
import { SettingsContext } from './SettingsContext';
import { authContext } from './authContext';
import { FIREBASE_DB } from '@/firebaseConfig';
import PressableButton from './PressableButton';

const CustomMenu = () => {
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

    // Used to make a notif for Friends in the menu
    const [friendRequestCount, setFriendRequestCount] = useState(0);

    // Fetch friend requests
    useEffect(() => {
        if (!user) return;
      
        const friendRequestsQuery = query(collection(FIREBASE_DB, 'friendRequests'), where('receiverId', '==', user.uid));
      
        const unsubscribe = onSnapshot(friendRequestsQuery, (snapshot) => {
            setFriendRequestCount(snapshot.size);
        });
      
        return () => unsubscribe();
    }, [user]);
    
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
                setUnlockedResolutions(data.unlockedResolutions || ["fourBit"]);
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
            currentresolution: resolution,
            unlockedResolutions: [...unlockedResolutions, resolution]
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

    return (
        <View style={styles.container}>
            <Popover 
                from={(
                    <PressableButton style={styles.menu} onPress={() => setShowPopover(true)} shadow={false}>
                        <Menu color={themes.light.black} size={70} />
                        {friendRequestCount > 0 && (
                            <Animated.View entering={FadeIn.duration(300)} exiting={FadeOut.duration(200)} style={{ position: 'absolute', top: 6, right: 1, width: 11, height: 11, borderRadius: 5, backgroundColor: themes.light.decline, }} />
                        )}
                    </PressableButton>
                )}
                isVisible={showPopover}
                onRequestClose={handleCloseMenu}
                backgroundStyle={{backgroundColor: 'transparent'}}
                arrowSize={{width: 25, height: 15}}
                popoverStyle={{backgroundColor: colors.primary}}>
                <View>
                    <PressableButton style={styles.buttonItems} onPress={handleFriendsNav}>
                        <User color={themes.light.black} size={50} />
                        <View style={[styles.divider, { backgroundColor: colors.primary }]}></View>
                        <Text></Text>
                        <Text style={{fontSize: 40, color: themes.light.black}}>Friends</Text>
                        {friendRequestCount > 0 && (
                            <View style={[styles.notifIndicator, {backgroundColor: themes.light.decline}]}>
                                <Text style={{ color: themes.light.black, fontSize: 13, fontWeight: 'bold' }}>
                                    {friendRequestCount > 9 ? '9+' : friendRequestCount}
                                </Text>
                            </View>
                        )}
                    </PressableButton>
                    <View style={{height: 4}}></View>
                    <PressableButton style={styles.buttonItems} onPress={handleStatsNav}>
                        <LineChart color={themes.light.black} size={50} />
                        <View style={[styles.divider, { backgroundColor: colors.primary }]}></View>
                        <Text></Text>
                        <Text style={{fontSize: 40, color: themes.light.black}}>Statistics</Text>
                    </PressableButton>
                    <View style={{height: 4}}></View>
                    <PressableButton style={styles.buttonItems} onPress={handleResolutionPress}>
                        <Upload color={themes.light.black} size={50} />
                        <View style={[styles.divider, { backgroundColor: colors.primary }]}></View>
                        <Text></Text>
                        <Text style={{fontSize: 40, color: themes.light.black}}>Resolution</Text>
                    </PressableButton>
                    <View style={{height: 4}}></View>
                    <PressableButton style={styles.buttonItems} onPress={handleSettingsNav}>
                        <Settings color={themes.light.black} size={50} />
                        <View style={[styles.divider, { backgroundColor: colors.primary }]}></View>
                        <Text></Text>
                        <Text style={{fontSize: 40, color: themes.light.black}}>Settings</Text>
                    </PressableButton>
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
                        <View style={[styles.resolutionButton, currentResolution === "fourBit" && [styles.selectedResolution, { borderColor: colors.primary }]]}>
                            <PressableButton onPress={() => handleResolutionSelect("fourBit")} haptic>
                                <Text style={styles.resolutionText}>4-bit</Text>
                            </PressableButton>
                        </View>

                        {/* eightBit Resolution */}
                        <View style={[styles.resolutionButton, (!unlockedResolutions.includes("eightBit") && (progress < 100 || balance < 100)) && styles.locked, currentResolution === "eightBit" && [styles.selectedResolution, { borderColor: colors.primary }]]}>
                            <PressableButton onPress={() => handleResolutionSelect("eightBit")} disabled={!unlockedResolutions.includes("eightBit") && (progress < 100 || balance < 100)} haptic>
                                <Text style={styles.resolutionText}>8-bit {unlockedResolutions.includes("eightBit") ? "" : `(Progress: ${progress}/100, Cost: 100)`}</Text>
                            </PressableButton>
                        </View>

                        {/* sixteenBit Resolution */}
                        <View style={[styles.resolutionButton, (!unlockedResolutions.includes("sixteenBit") && (progress < 400 || balance < 250)) && styles.locked, currentResolution === "sixteenBit" && [styles.selectedResolution, { borderColor: colors.primary }]]}>
                            <PressableButton onPress={() => handleResolutionSelect("sixteenBit")} disabled={!unlockedResolutions.includes("sixteenBit") && (progress < 400 || balance < 250)} haptic>
                                <Text style={styles.resolutionText}>16-bit {unlockedResolutions.includes("sixteenBit") ? "" : `(Progress: ${progress}/400, Cost: 250)`}</Text>
                            </PressableButton>
                        </View>

                        <View style={[styles.button, { backgroundColor: colors.secondary }]}>
                                <PressableButton onPress={() => setModalVisible(false)} haptic>
                                    <Text style={{color: themes.light.white, fontWeight: 'bold', fontSize: 14}}>CLOSE</Text>
                                </PressableButton>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    button: {
        paddingVertical: 8,
        paddingHorizontal: 16,
    },
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
        width: 'auto',
        height: 75,
        alignSelf: "flex-start",
        borderRadius: 8,
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
    notifIndicator: {
        marginLeft: 6,
        minWidth: 20,
        height: 20,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 5,
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