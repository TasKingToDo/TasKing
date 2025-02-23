import React, { useContext, useEffect, useState } from 'react';
import { Button, Text, View, StyleSheet, Pressable, Dimensions, FlatList } from 'react-native';
import { useSharedValue } from 'react-native-reanimated';
import { Entypo } from '@expo/vector-icons';
import { collection, doc, getDoc } from "firebase/firestore";
import colors from '../config/colors';
import { SettingsContext } from '../SettingsContext';
import CustomMenu from '../config/customMenu';
import { FIREBASE_DB, FIREBASE_AUTH } from '@/firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';

const { height } = Dimensions.get("window");
const NAV_BAR_HEIGHT = 75;
const MID_POSITION = 0;

const FriendsScreen = ({ navigation }) => {
    const [friends, setFriends] = useState([]);
    const [userId, setUserId] = useState<string | null>(null);
    const translateY = useSharedValue(MID_POSITION);
    const navbarVisible = translateY.value <= height * 0.15;
    const settings = useContext(SettingsContext);

    useEffect(() => {
        // Listen for authentication state changes
        const unsubscribe = onAuthStateChanged(FIREBASE_AUTH, (user) => {
            if (user) {
                setUserId(user.uid);
            } else {
                setUserId(null);
            }
        });

        return () => unsubscribe();
    }, []);

    useEffect(() => {
        const fetchFriends = async () => {
            if (!userId) return;

            try {
                const userRef = doc(FIREBASE_DB, "users", userId);
                const userSnap = await getDoc(userRef);

                if (userSnap.exists()) {
                    const userData = userSnap.data();
                    setFriends(userData.Friends || []);
                } else {
                    console.log("No such user found!");
                }
            } catch (error) {
                console.error("Error fetching friends:", error);
            }
        };

        fetchFriends();
    }, [userId]);

    if (!settings) return null;

    const handleAddFriend = () => {
        alert("Friend Menu Opened")
    }

    return (
        <View style={[styles.background, { backgroundColor: settings.darkMode ? colors.black : colors.white }]}>
            <View style={styles.backButton}>
                <Button title="Back" color={settings.darkMode ? colors.secondary : colors.primary} onPress={() => navigation.navigate('Home')} />
            </View>
            <View style={styles.textContainer}>
                <Text style={[styles.text, { color: settings.darkMode ? colors.white : colors.black}]}>Your Friends</Text>
            </View>
            <View style={styles.friendList}>
                {friends.length === 0 ? (
                    <Text style={styles.noFriendsText}>You have no friends</Text>
                ) : (
                    <FlatList
                    data={friends}
                    keyExtractor={(item, index) => index.toString()}
                    renderItem={({ item }) => (
                        <Text style={{ color: settings.darkMode ? colors.white : colors.black, fontSize: 20, padding: 10 }}>
                            {item}
                        </Text>
                    )}
                />)}
            </View>
            <View style={[styles.navbar, {backgroundColor: settings.darkMode ? colors.secondary : colors.primary}]}>
                <CustomMenu navbarVisible={navbarVisible}/>
                <View style={{width: "65%"}}></View>
                <Pressable style={styles.addFriend} onPress={handleAddFriend}>
                    <Entypo name="add-user" size={70} color={settings.darkMode ? colors.white : colors.black} />
                </Pressable>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    addFriend: {
        width: "17.5%",
        height: 75,
        justifyContent: "center",
        alignItems: "center",
    },
    backButton: {
        position: "absolute",
        top: "1%",
        left: "2%",
        width: "20%",
        height: "7%",
    },
    background: {
        flex: 1,
        justifyContent: "flex-end",
        alignItems: "center",
    },
    friendList: {
        position: "absolute",
        top: "10%"
    },
    navbar: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        borderTopWidth: 3,
        borderTopColor: colors.black,
        overflow: "visible",
    },
    noFriendsText: {
        textAlign: 'center',
        marginTop: 20,
        fontSize: 20,
        fontWeight: "bold",
    },
    textContainer: {
        flex: 1,
        width: '100%',
        alignItems: "center",
    },
    text: {
        fontWeight: 'bold',
        position: "absolute",
        top: "5%",
        fontSize: 30,
        textDecorationLine: "underline",
    },
});

export default FriendsScreen;
