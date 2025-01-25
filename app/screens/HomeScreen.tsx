import React from 'react';
import { Text, View, StyleSheet, Pressable } from 'react-native';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';


import colors from "../config/colors";
import TaskScreen from './TaskScreen';
import ShopScreen from './ShopScreen';

const HomeScreen = () => {
    return (
        <SafeAreaProvider style={styles.background}>
            <SafeAreaView>
                <View style={styles.background}>
                    <View style={styles.topHalf}>
                        <ShopScreen />
                    </View>
                    <View style={styles.bottomHalf}>
                        <TaskScreen />
                    </View>
                    <View style={styles.navbar}>
                        <Pressable style={styles.menu}></Pressable>
                        <View style={styles.levelBar}></View>
                        <Pressable style={styles.createTask}></Pressable>
                    </View>
                </View>
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
        alignItems: "center",
        width: "100%",
        height: "45.5%",
        borderTopWidth: 2,
    },
    createTask: {
        width: "17.5%",
        height: 80,
        backgroundColor: colors.primary,
        justifyContent: "center",
        alignItems: "center",
    },
    menu: {
        width: "17.5%",
        height: 80,
        backgroundColor: colors.primary,
    },
    levelBar: {
        width: "65%",
        height: 80,
        backgroundColor: colors.secondary,
    },
    navbar: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        borderTopWidth: 3,
        borderTopColor: colors.black,
    },
    topHalf: {
        alignItems: "center",
        width: "100%",
        height: "45%",
        borderBottomWidth: 2,
    },
})

export default HomeScreen;