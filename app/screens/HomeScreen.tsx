import React from 'react';
import { View, StyleSheet, Pressable} from 'react-native';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import { Feather } from "@expo/vector-icons";


import colors from "../config/colors";
import TaskScreen from './TaskScreen';
import ShopScreen from './ShopScreen';
import CustomMenu from '../config/customMenu';

const HomeScreen = ({navigation}) => {
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
                        <CustomMenu />
                        <View style={styles.levelBar}></View>
                        <Pressable style={styles.createTask} onPress={() => navigation.navigate('Create Task')}>
                            <Feather name="plus-circle" size={70}/>
                        </Pressable>
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
        height: "45%",
        borderTopWidth: 2,
        backgroundColor: colors.white,
    },
    createTask: {
        width: "17.5%",
        height: 75,
        backgroundColor: colors.white,
        justifyContent: "center",
        alignItems: "center",
    },
    levelBar: {
        width: "65%",
        height: 75,
        backgroundColor: colors.secondary,
    },
    navbar: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        borderTopWidth: 3,
        borderTopColor: colors.black,
        backgroundColor: colors.white,
    },
    topHalf: {
        alignItems: "center",
        width: "100%",
        height: "45%",
        borderBottomWidth: 2,
    },
})

export default HomeScreen;