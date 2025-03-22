import React, { useContext, useEffect, useState } from 'react';
import { Button, Text, View, StyleSheet, Pressable, Dimensions, FlatList, TextInput, Alert, Modal, Image, Platform } from 'react-native';
import { useSharedValue, useDerivedValue} from 'react-native-reanimated';
import { Entypo, FontAwesome } from '@expo/vector-icons';
import { collection, doc, getDoc, updateDoc, query, where, getDocs, addDoc, deleteDoc, onSnapshot } from "firebase/firestore";
import Toast from 'react-native-toast-message';
import colors from '../config/colors';
import { SettingsContext } from '../config/SettingsContext';
import CustomMenu from '../config/customMenu';
import { FIREBASE_DB } from '@/firebaseConfig';
import { authContext } from '../config/authContext';
import toastConfig from '../config/toastConfig';


const { height } = Dimensions.get("window");
const MID_POSITION = 0;

const FriendsScreen = ({ navigation }) => {
    const { user } = useContext(authContext);
    const [friends, setFriends] = useState([]);
    const [friendUsername, setFriendUsername] = useState('');
    const [friendRequests, setFriendRequests] = useState([]);
    const [sentRequests, setSentRequests] = useState([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [requestModalVisible, setRequestModalVisible] = useState(false);
    const [activeTab, setActiveTab] = useState("received");
    const translateY = useSharedValue(MID_POSITION);
    const navbarVisible = useDerivedValue(() => {
        return translateY.value <= height * 0.15;
    }, []);
    const [selectedFriend, setSelectedFriend] = useState(null);
    const [friendModalVisible, setFriendModalVisible] = useState(false);
    const settings = useContext(SettingsContext);

    if (!settings || !user) return null;

    useEffect(() => {
        if (!user) return;
    
        const userRef = doc(FIREBASE_DB, "users", user.uid);
        const unsubscribeFriends = onSnapshot(userRef, async (userSnap) => {
            if (!userSnap.exists()) return;
            const friendIds = userSnap.data().Friends || [];
        
            const friendData = await Promise.all(friendIds.map(async (id) => {
                const friendDoc = await getDoc(doc(FIREBASE_DB, "users", id));
                if (friendDoc.exists()) {
                    const data = friendDoc.data();
                    return {
                        id,
                        username: data.username || "Unknown",
                        level: data.level || 0,
                        pfp: data.pfp || null,
                        equipped: data.equipped || {},
                    };
                } else {
                    return {
                        id,
                        username: "Unknown",
                        level: 0,
                        pfp: null,
                    };
                }
            }));
        
            setFriends(friendData);
        });
    
        const receivedQuery = query(collection(FIREBASE_DB, "friendRequests"), where("receiverId", "==", user.uid));
        const unsubscribeRequests = onSnapshot(receivedQuery, async (snapshot) => {
            const requests = await Promise.all(snapshot.docs.map(async (docSnap) => {
                const requestData = docSnap.data();
                const senderRef = doc(FIREBASE_DB, "users", requestData.senderId);
                const senderSnap = await getDoc(senderRef);
    
                return {
                    id: docSnap.id,
                    senderId: requestData.senderId,
                    senderUsername: senderSnap.exists() ? senderSnap.data().username : "Unknown",
                    status: requestData.status,
                };
            }));

            if (requests.length > friendRequests.length) {
                const newRequest = requests.find(req => !friendRequests.some(existing => existing.id === req.id));
        
                if (newRequest) {
                    Toast.show({
                        type: 'info',
                        text1: 'New Friend Request',
                        text2: `${newRequest.senderUsername} sent you a friend request!`,
                        position: 'top',
                        visibilityTime: 5000,
                        onPress: () => {
                            Toast.hide();
                            navigation.navigate('Friends');
                        },
                    });
                }
            }

            setFriendRequests(requests);
        });
    
        const sentQuery = query(collection(FIREBASE_DB, "friendRequests"), where("senderId", "==", user.uid));
        const unsubscribeSentRequests = onSnapshot(sentQuery, async (snapshot) => {
            const requests = await Promise.all(snapshot.docs.map(async (docSnap) => {
                const requestData = docSnap.data();
                const receiverRef = doc(FIREBASE_DB, "users", requestData.receiverId);
                const receiverSnap = await getDoc(receiverRef);
    
                return {
                    id: docSnap.id,
                    receiverId: requestData.receiverId,
                    receiverUsername: receiverSnap.exists() ? receiverSnap.data().username : "Unknown",
                    status: requestData.status,
                };
            }));
            
            setSentRequests(requests);
        });
    
        return () => {
            unsubscribeFriends();
            unsubscribeRequests();
            unsubscribeSentRequests();
        };
    }, [user]);    

    const handleSendFriendRequest = async () => {
        if (!friendUsername.trim()) {
            Alert.alert("Error", "Please enter a username.");
            return;
        }
    
        try {
            const q = query(collection(FIREBASE_DB, "users"), where("username", "==", friendUsername.trim()));
            const querySnapshot = await getDocs(q);
    
            if (querySnapshot.empty) {
                Alert.alert("Error", "No user found with that username.");
                return;
            }
    
            const friendDoc = querySnapshot.docs[0];
            const friendId = friendDoc.id;
    
            if (friendId === user.uid) {
                Alert.alert("Error", "You cannot send a friend request to yourself.");
                return;
            }
    
            const requestsQuery = query(
                collection(FIREBASE_DB, "friendRequests"),
                where("senderId", "==", user.uid),
                where("receiverId", "==", friendId)
            );
            const existingRequest = await getDocs(requestsQuery);
    
            if (!existingRequest.empty) {
                Alert.alert("Error", "You have already sent a friend request to this user.");
                return;
            }
    
            await addDoc(collection(FIREBASE_DB, "friendRequests"), {
                senderId: user.uid,
                receiverId: friendId,
                status: "pending",
                timestamp: new Date()
            });
    
            setFriendUsername("");
            setModalVisible(false);
        } catch (error) {
            console.error("Error sending friend request:", error);
            Alert.alert("Error", "Something went wrong. Please try again.");
        }
    };

    const handleAcceptFriendRequest = async (requestId, senderId) => {
        try {
            if (!requestId) {
                Alert.alert("Error", "Invalid request ID.");
                return;
            }
    
            const userRef = doc(FIREBASE_DB, "users", user.uid);
            const senderRef = doc(FIREBASE_DB, "users", senderId);
    
            const userSnap = await getDoc(userRef);
            const senderSnap = await getDoc(senderRef);
    
            if (!userSnap.exists() || !senderSnap.exists()) {
                Alert.alert("Error", "User data not found.");
                return;
            }
    
            const userData = userSnap.data();
            const senderData = senderSnap.data();
    
            await updateDoc(userRef, {
                Friends: [...(userData.Friends || []), senderId]
            });
    
            await updateDoc(senderRef, {
                Friends: [...(senderData.Friends || []), user.uid]
            });
    
            await deleteDoc(doc(FIREBASE_DB, "friendRequests", requestId));
    
            setFriendRequests((prevRequests) => prevRequests.filter((req) => req.id !== requestId));
            setFriends((prevFriends) => [...prevFriends, { id: senderId, username: senderData.username, pfp: senderData.pfp }]);
    
        } catch (error) {
            console.error("Error accepting friend request:", error);
            Alert.alert("Error", "Something went wrong. Please try again.");
        }
    };    

    const handleDeclineFriendRequest = async (requestId) => {
        try {
            if (!requestId) {
                Alert.alert("Error", "Invalid request ID.");
                return;
            }
    
            await deleteDoc(doc(FIREBASE_DB, "friendRequests", requestId));
    
            setFriendRequests((prevRequests) => prevRequests.filter((req) => req.id !== requestId));
    
        } catch (error) {
            console.error("Error declining friend request:", error);
            Alert.alert("Error", "Something went wrong. Please try again.");
        }
    };    
    
    const handleCancelFriendRequest = async (requestId) => {
        try {
            if (!requestId) {
                Alert.alert("Error", "Invalid request ID.");
                return;
            }
    
            await deleteDoc(doc(FIREBASE_DB, "friendRequests", requestId));
    
            setSentRequests((prevRequests) =>
                prevRequests.filter((req) => req.id !== requestId)
            );
        } catch (error) {
            console.error("Error canceling friend request:", error);
            Alert.alert("Error", "Something went wrong. Please try again.");
        }
    };    
    
    const renderFriendItem = ({ item }) => {
        return (
            <Pressable 
                style={styles.friendItem} 
                onPress={() => {
                    setSelectedFriend(item);
                    setFriendModalVisible(true);
                }}
            >
                <View style={styles.friendCardContent}>
                    {/* Avatar or placeholder */}
                    <View style={styles.profilePicWrapper}>
                        {item.pfp ? (
                            <Image source={{ uri: item.pfp }} style={styles.profilePic} />
                        ) : (
                            <View style={styles.profilePicPlaceholder} />
                        )}
                    </View>

                    {/* Username and level */}
                    <Text style={styles.friendText}>
                        {`${item.username} · Lvl ${item.level ?? 0}`}
                    </Text>
                </View>
            </Pressable>
        );
    };

    return (
        <View style={{flex: 1}}>
            <View style={[styles.background, { backgroundColor: settings.darkMode ? colors.black : colors.white }]}>
                { /* Header */}
                <View style={styles.headerContainer}>
                    <View style={{ position: 'absolute', left: 15, top: Platform.OS === 'ios' ? 50 : 30 }}>
                        <Button title="Back" color={settings.darkMode ? colors.secondary : colors.primary} onPress={() => navigation.navigate('Home')} />
                    </View>
                    
                    <View style={{ flex: 1, alignItems: 'center' }}>
                        <Text style={[styles.headerText, { color: settings.darkMode ? colors.white : colors.black }]}>
                            Your Friends
                        </Text>
                    </View>

                    <View style={{ position: 'absolute', right: 15, top: Platform.OS === 'ios' ? 50 : 30}}>
                        <Pressable onPress={() => setRequestModalVisible(true)}>
                            <FontAwesome name="bell" size={35} color={settings.darkMode ? colors.white : colors.black} />
                        </Pressable>
                    </View>
                </View>

                { /* Request Modal */}
                <Modal 
                    visible={requestModalVisible} 
                    animationType="slide" 
                    transparent={true}
                    onRequestClose={() => setRequestModalVisible(false)}
                >
                    <View style={styles.modalBackground}>
                        <View style={styles.modalContainer}>
                            <View style={styles.tabBar}>
                                <Pressable onPress={() => setActiveTab("received")} style={[styles.tab, activeTab === "received" && styles.activeTab]}>
                                    <Text>Received</Text>
                                </Pressable>
                                <Pressable onPress={() => setActiveTab("sent")} style={[styles.tab, activeTab === "sent" && styles.activeTab]}>
                                    <Text>Sent</Text>
                                </Pressable>
                            </View>

                            {activeTab === "received" ? (
                                <FlatList
                                    data={friendRequests}
                                    keyExtractor={(item) => item.id}
                                    renderItem={({ item }) => (
                                        <View style={styles.tabContent}>
                                            <Text style={{marginHorizontal: 15}}>Request from {item.senderUsername}</Text>
                                            <Button title="Accept" onPress={() => handleAcceptFriendRequest(item.id, item.senderId)} color={colors.accept}/>
                                            <Button title="Decline" onPress={() => handleDeclineFriendRequest(item.id)} color={colors.decline} />
                                        </View>
                                    )}
                                />
                            ) : (
                                <FlatList
                                    data={sentRequests}
                                    keyExtractor={(item) => item.id}
                                    renderItem={({ item }) => (
                                        <View style={styles.tabContent}>
                                            <Text style={{marginHorizontal: 15}}>Request to {item.receiverUsername}</Text>
                                            <Button title="Cancel" onPress={() => handleCancelFriendRequest(item.id)} color={colors.decline} />
                                        </View>
                                    )}
                                />
                            )}

                            <Button title="Close" color={colors.secondary} onPress={() => setRequestModalVisible(false)} />
                        </View>
                    </View>
                </Modal>

                { /* Friends List */}
                <View style={styles.friendList}>
                    {friends.length === 0 ? (
                        <Text style={[styles.noFriendsText, { color: settings.darkMode ? colors.white : colors.black }]}>You have no friends</Text>
                    ) : (
                        <FlatList
                            data={friends}
                            keyExtractor={(item, index) => item.id || index.toString()}
                            renderItem={renderFriendItem}
                        />)}
                </View>
            </View>

            { /* Selected Friend Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={friendModalVisible}
                onRequestClose={() => setFriendModalVisible(false)}
            >
                <View style={styles.modalBackground}>
                    <View style={styles.modalContainer}>
                        {selectedFriend && (
                            <>
                                {/* Top: Friends Name and Level */}
                                <View>
                                    <Text style={{ fontSize: 22, fontWeight: 'bold' }}>{selectedFriend.username}</Text>
                                    <Text style={{ fontSize: 16}}>Level {selectedFriend.level}</Text>
                                </View>

                                <View style={{ flexDirection: "row", width: "100%", marginTop: 10 }}>
                                    {/* Left: Character Image */}
                                    <View style={styles.friendImageBackground}>
                                        <View style={styles.friendImageContainer}>
                                            <Image source={{ uri: selectedFriend?.equipped?.body }} style={styles.image} />
                                            <Image source={{ uri: selectedFriend?.equipped?.shoes }} style={styles.image} />
                                            <Image source={{ uri: selectedFriend?.equipped?.shirt }} style={styles.image} />
                                            <Image source={{ uri: selectedFriend?.equipped?.pants }} style={styles.image} />
                                            <Image source={{ uri: selectedFriend?.equipped?.hat }} style={styles.hatImage} />
                                            <Image source={{ uri: selectedFriend?.equipped?.acc }} style={styles.image} />
                                        </View>
                                    </View>

                                    {/* Divider Line */}
                                    <View style={{ width: 1, backgroundColor: colors.black, marginHorizontal: 10 }}></View>

                                    {/* Right: Stats */}
                                    <View style={{ flex: 1 }}>
                                        <Text> Stats Here...</Text>
                                    </View>
                                </View>

                                <View style={{ marginTop: 15, alignSelf: "center" }}>
                                    <Button title="Close" onPress={() => setFriendModalVisible(false)} />
                                </View>
                            </>
                        )}
                    </View>
                </View>
            </Modal>

            { /* Navbar */}
            <View style={[styles.navbar, {backgroundColor: settings.darkMode ? colors.secondary : colors.primary}]}>
                <CustomMenu navbarVisible={navbarVisible}/>
                <View style={{width: "65%"}}></View>
                <Pressable style={styles.addFriend} onPress={() => setModalVisible(true)}>
                    <Entypo name="add-user" size={70} color={settings.darkMode ? colors.white : colors.black} />
                </Pressable>
            </View>

            { /* Add Friend Modal */}
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
                            <Button title="Cancel" onPress={() => setModalVisible(false)} color={colors.decline} />
                            <Button title="Add Friend" onPress={handleSendFriendRequest} color={colors.accept} />
                        </View>
                    </View>
                </View>
            </Modal>
            <Toast config={toastConfig}/>
        </View>
    );
};

const styles = StyleSheet.create({
    activeTab: {
        borderColor: colors.secondary,
    },
    addFriend: {
        width: "17.5%",
        height: 75,
        justifyContent: "center",
        alignItems: "center",
    },
    background: {
        flex: 1,
        alignItems: "center",
    },
    friendCardContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 15,
    },
    friendImageBackground: {
        alignItems: "center",
        backgroundColor: colors.primarySoft,
        borderRadius: 10,
        padding: 10,
    },
    friendImageContainer: {
        width: 140,
        height: 170,
        position: 'relative',
        justifyContent: 'center',
        alignItems: 'center',
    },
    friendItem: {
        backgroundColor: colors.primarySoft,
        borderRadius: 12,
        paddingVertical: 12,
        marginBottom: 10,
        width: 'auto',
        alignSelf: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    friendList: {
        marginTop: 15,
        paddingHorizontal: 10,
        width: '100%',
        alignItems: 'center',
    },
    friendText: {
        fontSize: 18,
        fontWeight: '600',
    },
    hatImage: {
        width: "100%",
        height: "100%",
        resizeMode: 'contain',
        position: 'absolute',
        top: -69,
    },
    headerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        paddingHorizontal: 15,
        paddingTop: Platform.OS === 'ios' ? 50 : 30,
        position: 'relative',
    },
    headerText: {
        fontSize: 26,
        fontWeight: 'bold',
    },
    image: {
        width: "100%",
        height: "100%",
        resizeMode: 'contain',
        position: 'absolute',
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
        width: "90%",
        height: "auto",
        padding: 20,
        backgroundColor: "white",
        borderRadius: 10,
        alignItems: "flex-start",
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: "bold",
        marginBottom: 10,
    },
    navbar: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        borderTopWidth: 2,
        paddingVertical: 10,
        height: 75,
        width: "100%",
        paddingHorizontal: 15,
    },
    noFriendsText: {
        textAlign: 'center',
        marginTop: 20,
        fontSize: 20,
        fontWeight: "bold",
    },
    notification: {
        position: "absolute",
        top: "1%",
        right: "2%",
    },
    profilePic: {
        width: 50,
        height: 50,
        borderRadius: 25,
        borderWidth: 1,
        borderColor: '#ccc',
    },
    profilePicPlaceholder: {
        width: 50,
        height: 50,
        borderRadius: 25,
    },
    profilePicWrapper: {
        width: 50,
        height: 50,
        marginRight: 15,
        justifyContent: 'center',
        alignItems: 'center',
      },
    tab: {
        padding: 10,
        borderBottomWidth: 2,
        borderColor: "transparent",
    },
    tabBar: {
        flexDirection: "row",
        justifyContent: "space-around",
        width: "100%",
        marginBottom: 20,
    },
    tabContent: {
        flexDirection: "row", 
        alignItems: "center", 
        marginBottom: 10
    },
});

export default FriendsScreen;