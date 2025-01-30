import React, { useState } from 'react';
import {
    View, ScrollView, Image, Text, TextInput,
    Dimensions, StyleSheet, FlatList, TouchableOpacity,
    Pressable
} from 'react-native';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
//npm install react-native-tab-view
import { TabView, SceneMap } from 'react-native-tab-view';

//num of cols on bottom half of screen
const numColumns = 3;

//Data (images) to be displayed in the shop
//Temporarily using GitHub web links until can figure out how to use local files
const data = [
    {
        id: 1,
        title: "hat 1",
        imageUrl: "https://raw.githubusercontent.com/ZB103/TasKing/refs/heads/main/app/assets/imgs/4bit/hat1.png",
    },
    {
        id: 2,
        title: "hat 2",
        imageUrl: "https://raw.githubusercontent.com/ZB103/TasKing/refs/heads/main/app/assets/imgs/4bit/hat2.png",
    },
    {
        id: 3,
        title: "hat 3",
        imageUrl: "https://raw.githubusercontent.com/ZB103/TasKing/refs/heads/main/app/assets/imgs/4bit/hat3.png",
    },
    {
        id: 4,
        title: "hat 4",
        imageUrl: "https://raw.githubusercontent.com/ZB103/TasKing/refs/heads/main/app/assets/imgs/4bit/hat4.png",
    },
    {
        id: 5,
        title: "hat 5",
        imageUrl: "https://raw.githubusercontent.com/ZB103/TasKing/refs/heads/main/app/assets/imgs/4bit/hat5.png",
    },
];

const ShopScreen = () => {
    

    //Main - container display
    return (
        <SafeAreaProvider style={styles.background }>
            <SafeAreaView>
                {/* Top half of screen (display of the character) */}
                <View style={styles.background}>
                    <Text>Shop Screen top</Text>
                </View>
                {/* Bottom half of screen (shop portion) */}
                {/* Using a nested FlatList to get rows and cols of imgs */}
                <FlatList
                    style={styles.flatListContainer}
                    numColumns={numColumns}
                    data={data}
                    renderItem={({ item }) => (
                        <View style={styles.flatListContainer}>
                            <Pressable>
                                <Image source={{ uri: item.imageUrl }} style={styles.thumbnails} />
                            </Pressable>
                        </View>
                    )}
                / >
            </SafeAreaView>
        </SafeAreaProvider>
        
    );
};

{/* Styles */}
const styles = StyleSheet.create({
    background: {
        width: Dimensions.get('window').width,
        height: Dimensions.get('window').height / 2,
        backgroundColor: '#E7F0F1',
        paddingTop: 16,
    },
    flatListContainer: {
        backgroundColor: '#C4D7D8',
        marginVertical: 10,
        marginHorizontal: 6,
        paddingTop: 8,
        paddingBottom: 8,
        borderRadius: 10,
    },
    thumbnails: {
        width: 128,
        height: 128,
        resizeMode: 'contain',
        
    },
})

export default ShopScreen;