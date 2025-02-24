import React, { useContext, useEffect, useState } from 'react';
import { Button, Text, View, StyleSheet, Pressable, Dimensions, FlatList, TextInput, Alert, Modal} from 'react-native';
import { useSharedValue } from 'react-native-reanimated';
import { Entypo } from '@expo/vector-icons';
import { collection, doc, getDoc, updateDoc, query, where, getDocs } from "firebase/firestore";
import colors from '../config/colors';
import { SettingsContext } from '../config/SettingsContext';
import CustomMenu from '../config/customMenu';
import { FIREBASE_DB } from '@/firebaseConfig';
import { authContext } from '../config/authContext';


const { height } = Dimensions.get("window");
const NAV_BAR_HEIGHT = 75;
const MID_POSITION = 0;

const FriendsScreen = ({ navigation }) => {
    const { user } = useContext(authContext);
    const [friends, setFriends] = useState([]);
    const [friendUsername, setFriendUsername] = useState('');
    const [modalVisible, setModalVisible] = useState(false);
    const [userId, setUserId] = useState<string | null>(null);
    const translateY = useSharedValue(MID_POSITION);
    const navbarVisible = translateY.value <= height * 0.15;
    const settings = useContext(SettingsContext);

    useEffect(() => {
        if (!user) return; // Ensure user is logged in

        const fetchFriends = async () => {
            try {
                const userRef = doc(FIREBASE_DB, "users", user.uid);
                const userSnap = await getDoc(userRef);

                if (userSnap.exists()) {
                    const userData = userSnap.data();
                    setFriends(userData.Friends || []);
                }
            } catch (error) {
                console.error("Error fetching friends:", error);
            }
        };

        fetchFriends();
    }, [user]); // Refetch when user changes

    if (!settings || !user) return null;

    const handleAddFriend = async () => {
        if (!friendUsername.trim()) {
            Alert.alert("Error", "Please enter a username.");
            return;
        }

        try {
            // Find user by username
            const q = query(collection(FIREBASE_DB, "users"), where("username", "==", friendUsername.trim()));
            const querySnapshot = await getDocs(q);

            if (querySnapshot.empty) {
                Alert.alert("Error", "No user found with that username.");
                return;
            }

            const friendDoc = querySnapshot.docs[0]; // Get the first result
            const friendData = friendDoc.data();
            const friendId = friendDoc.id;

            if (friendId === user.uid) {
                Alert.alert("Error", "You cannot add yourself as a friend.");
                return;
            }

            const userRef = doc(FIREBASE_DB, "users", user.uid);
            const friendRef = doc(FIREBASE_DB, "users", friendId);

            // Fetch current user and friend data
            const userSnap = await getDoc(userRef);
            if (!userSnap.exists()) {
                Alert.alert("Error", "Your user data could not be found.");
                return;
            }

            const userData = userSnap.data();
            const currentFriends = userData.Friends || [];

            if (currentFriends.includes(friendUsername.trim())) {
                Alert.alert("Error", "You are already friends with this user.");
                return;
            }

            // Update friends list for both users
            await updateDoc(userRef, {
                Friends: [...currentFriends, friendUsername.trim()]
            });

            await updateDoc(friendRef, {
                Friends: [...(friendData.Friends || []), userData.username]
            });

            setFriends([...currentFriends, friendUsername.trim()]); // Update state
            setFriendUsername(""); // Clear input
            setModalVisible(false); // Close modal
            Alert.alert("Success", `${friendUsername} has been added as a friend!`);
        } catch (error) {
            console.error("Error adding friend:", error);
            Alert.alert("Error", "Something went wrong. Please try again.");
        }
    };

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
                <Pressable style={styles.addFriend} onPress={() => setModalVisible(true)}>
                    <Entypo name="add-user" size={70} color={settings.darkMode ? colors.white : colors.black} />
                </Pressable>
            </View>
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalBackground}>
                    <View style={styles.modalContainer}>
                        <Text style={styles.modalTitle}>Add Friend</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter friend's username"
                            autoCapitalize="none"
                            value={friendUsername}
                            onChangeText={setFriendUsername}
                        />
                        <View style={styles.modalButtons}>
                            <Button title="Cancel" onPress={() => setModalVisible(false)} color="red" />
                            <Button title="Add Friend" onPress={handleAddFriend} color="green" />
                        </View>
                    </View>
                </View>
            </Modal>
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
    input: {
        width: "100%",
        padding: 10,
        borderWidth: 1,
        borderRadius: 5,
        marginBottom: 10,
    },
    modalBackground: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0,0,0,0.5)",
    },
    modalButtons: {
        flexDirection: "row",
        justifyContent: "space-between",
        width: "100%",
    },
    modalContainer: {
        width: 300,
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
