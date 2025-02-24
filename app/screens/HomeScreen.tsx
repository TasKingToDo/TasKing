import React, { useContext, useEffect, useState } from 'react';
import { View, StyleSheet, Pressable, Text, Dimensions } from 'react-native';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import { Gesture, GestureDetector, GestureHandlerRootView } from "react-native-gesture-handler";
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from "react-native-reanimated";
import { Feather } from "@expo/vector-icons";
import { doc, onSnapshot } from "firebase/firestore";
import * as Progress from 'react-native-progress';
import colors from '../config/colors';
import { SettingsContext } from '../config/SettingsContext';
import TaskScreen from './TaskScreen';
import ShopScreen from './ShopScreen';
import CustomMenu from '../config/customMenu';
import { FIREBASE_DB, FIREBASE_AUTH } from '@/firebaseConfig';
import { authContext } from '../config/authContext';

const { height } = Dimensions.get("window");
const NAV_BAR_HEIGHT = 75;
const MID_POSITION = 0;
const TOP_EXPANDED = -height / 1.87 + NAV_BAR_HEIGHT;
const BOTTOM_EXPANDED = height / 1.95 - NAV_BAR_HEIGHT;

const HomeScreen = ({navigation}) => {
    const translateY = useSharedValue(MID_POSITION);
    const settings = useContext(SettingsContext);
    const { user } = useContext(authContext);
    const [xp, setXp] = useState(0);
    const [level, setLevel] = useState(0);
    const [xpProgress, setXpProgress] = useState(0);

    const calculateLevel = (xp) => {
        let level = 0;
        let xpThreshold = 0; // Total XP needed to reach this level
        let nextThreshold = 20; // Next level XP requirement
    
        while (xp >= xpThreshold + nextThreshold) {
            xpThreshold += nextThreshold;
            level++;
            nextThreshold += 20; // Each level requires 10 more XP
        }
    
        return { level, xpThreshold, nextThreshold };
    };
    

    useEffect(() => {
        if (!user) return;
    
        const userDocRef = doc(FIREBASE_DB, "users", user.uid);
    
        const unsubscribe = onSnapshot(userDocRef, (docSnap) => {
            if (docSnap.exists()) {
                const userData = docSnap.data();
                const userXp = userData?.xp || 0;
                setXp(userXp);
    
                // 🔥 Fix XP normalization
                const { level, xpThreshold, nextThreshold } = calculateLevel(userXp);
                setLevel(level);
    
                // XP gained since last level-up
                const xpIntoCurrentLevel = userXp - xpThreshold;
    
                // Ensure progress starts at 0% for XP = 0
                const xpProgress = nextThreshold > 0 ? Math.max(0, Math.min(1, xpIntoCurrentLevel / nextThreshold)) : 0;
    
                setXpProgress(xpProgress);
            }
        });
    
        return () => unsubscribe();
    }, [user]);
    
    
    if (!settings) return null;

    const gesture = Gesture.Pan()
        .onUpdate((event) => {
            translateY.value = event.translationY;
        })
        .onEnd(() => {
            let targetPosition = MID_POSITION;
            if (translateY.value < -height * 0.15) {
                targetPosition = TOP_EXPANDED;
            } else if (translateY.value > height * 0.15) {
                targetPosition = BOTTOM_EXPANDED;
            }
            translateY.value = withSpring(targetPosition, {
                damping: 15, // Adds a smooth effect
                stiffness: 120, // Makes it feel natural
                mass: 0.8, // Adjusts the weight of the transition
                velocity: 5, // Helps with natural momentum
                restSpeedThreshold: 0.5, // Smoothly stops instead of snapping
                restDisplacementThreshold: 0.5, // Prevents abrupt stopping
            });
        });
    
    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: translateY.value }]
    }));
    
    const navbarVisible = translateY.value <= height * 0.15; // Track navbar visibility

    const navbarAnimatedStyle = useAnimatedStyle(() => ({
        opacity: translateY.value > height * 0.15 ? 0 : 1,
        pointerEvents: translateY.value > height * 0.15 ? 'none' : 'auto',
        height: NAV_BAR_HEIGHT, // Keep the navbar layout consistent
        transform: [{ scale: translateY.value > height * 0.15 ? 0.95 : 1 }], // Subtle scale effect
    }));

    const shopAnimatedStyle = useAnimatedStyle(() => ({
        opacity: translateY.value > height * 0.15 ? 1 : 0,
        height: translateY.value > height * 0.15 ? '100%' : '0%',
        position: 'absolute',
        top: translateY.value > height * 0.15 ? 0 : '50%',
        display: translateY.value < -height * 0.15 ? 'none' : 'flex'
    }));
    
    const taskAnimatedStyle = useAnimatedStyle(() => ({
        opacity: 1,
        height: translateY.value < -height * 0.15 ? '100%' : '50%',
        position: 'absolute',
        bottom: 0,
        display: translateY.value > height * 0.15 ? 'none' : 'flex',
        backgroundColor: colors.primarySoft,
    }));
    
    return (
        <SafeAreaProvider style={styles.background}>
            <SafeAreaView style={styles.fullScreen}>
                <GestureHandlerRootView style={styles.fullScreen}>
                    <View style={styles.imageContainer}>
                        <ShopScreen />
                    </View>
                    <GestureDetector gesture={gesture}>
                        <Animated.View style={[styles.middleBar, animatedStyle]}>
                        <View style={styles.dotsContainer}>
                            <View style={styles.dot} />
                            <View style={styles.dot} />
                            <View style={styles.dot} />
                        </View>
                        </Animated.View>
                    </GestureDetector>
                    <Animated.View style={[styles.bottomHalf, taskAnimatedStyle]}>
                        <TaskScreen />
                    </Animated.View>
                    <Animated.View style={[styles.shopContainer, shopAnimatedStyle]}>
                        <ShopScreen />
                    </Animated.View>
                    <Animated.View style={[styles.navbar, navbarAnimatedStyle, { backgroundColor: settings.darkMode ? colors.secondary : colors.primary}]}>
                        <CustomMenu navbarVisible={navbarVisible} />
                        <View style={styles.levelContainer}>
                            <View style={styles.progressBarContainer}>
                                <Progress.Bar 
                                    progress={xpProgress}
                                    width={150}
                                    height={30}
                                    color={colors.accept}
                                    borderColor={colors.black}
                                />

                                <Text style={styles.progressText}>
                                    {Math.round(xpProgress * 100)}%
                                </Text>
                            </View>
                            <View style={{width: "7%"}} />
                            <Text style={[styles.levelText, { color: settings.darkMode ? colors.white : colors.black }]}>
                                Lvl. {level}
                            </Text>
                        </View>
                        <Pressable style={styles.createTask} onPress={() => navigation.navigate('Create Task')}>
                            <Feather name="plus-circle" size={70} color={settings.darkMode ? colors.white : colors.black} />
                        </Pressable>
                    </Animated.View>
                </GestureHandlerRootView>
            </SafeAreaView>
        </SafeAreaProvider>
    );
};

const styles = StyleSheet.create({
    background: {
        flex: 1,
        justifyContent: "flex-end",
        alignItems: "center",
    },
    bottomHalf: {
        flex: 1,
        width: "100%",
    },
    createTask: {
        width: "17.5%",
        justifyContent: "center",
        alignItems: "center",
    },
    dot: {
        width: 8,
        height: 8,
        backgroundColor: colors.white,
        borderRadius: 4,
        marginHorizontal: 4,
    },
    dotsContainer: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        width: "100%",
        height: "100%",
    },
    fullScreen: {
        flex: 1,
        width: "100%",
    },
    imageContainer: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: height / 2,
        justifyContent: "center",
        alignItems: "center",
    },
    levelContainer: {
        width: "65%",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "row",
    },
    levelText: {
        fontSize: 25,
        fontWeight: "bold",
        marginBottom: 5,
    },
    middleBar: {
        width: "40%",
        top: "50%",
        alignSelf: "center",
        left: 0,
        right: 0,
        height: 10,
        backgroundColor: colors.black,
        borderRadius: 50,
        zIndex: 10,
    },
    navbar: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        height: NAV_BAR_HEIGHT,
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        borderTopWidth: 3,
        borderTopColor: colors.black,
        overflow: "visible",
    },
    progressBarContainer: {
        position: "relative",
        alignItems: "center",
        justifyContent: "center",
    },
    progressText: {
        position: "absolute",
        fontSize: 20,
        fontWeight: "bold",
        color: colors.black,
    },
    shopContainer: {
        position: "absolute",
        top: "50%",
        left: 0,
        right: 0,
        height: "50%",
    },
    xpText: {
        fontSize: 15,
        marginTop: 5,
    }
})

export default HomeScreen;