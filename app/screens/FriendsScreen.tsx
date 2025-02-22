import React, { useContext } from 'react';
import { Button, Text, View, StyleSheet, Pressable, Dimensions } from 'react-native';
import { useSharedValue } from 'react-native-reanimated';
import { Entypo } from '@expo/vector-icons';
import colors from '../config/colors';
import { SettingsContext } from '../SettingsContext';
import CustomMenu from '../config/customMenu';

const { height } = Dimensions.get("window");
const NAV_BAR_HEIGHT = 75;
const MID_POSITION = 0;

const FriendsScreen = ({ navigation }) => {
    const translateY = useSharedValue(MID_POSITION);
    const navbarVisible = translateY.value <= height * 0.15;
    const settings = useContext(SettingsContext);

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
    navbar: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        borderTopWidth: 3,
        borderTopColor: colors.black,
        overflow: "visible",
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
        fontSize: 30
    },
});

export default FriendsScreen;
