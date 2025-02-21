import React, { useContext, useState, useEffect} from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { Entypo } from "@expo/vector-icons";
import Popover from 'react-native-popover-view';

import colors from "./colors";
import { useNavigation } from 'expo-router';
import { SettingsContext } from '../SettingsContext';

const CustomMenu = ({navbarVisible}) => {
    const [showPopover, setShowPopover] = useState(false);
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
                    <Pressable style={styles.buttonItems} onPress={() => setShowPopover(false)}>
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
})

export default CustomMenu;