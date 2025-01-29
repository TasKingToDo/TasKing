import React, { useState } from 'react';
import {
    View, ScrollView, Image, Text, TextInput,
    Dimensions, StyleSheet, FlatList, TouchableOpacity
} from 'react-native';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';

{/* Data (images) to be displayed in the shop*/}
const data = [
    {
        id: 1,
        title: "hat 1",
        imageUrl: "./assets/imgs/4bit/hat1.png",
    },
    {
        id: 2,
        title: "hat 2",
        imageUrl: "./assets/imgs/4bit/hat2.png",
    },
];

const ShopScreen = ({  }) => {
    

    //Main - container display
    return (
        <SafeAreaProvider>
            <SafeAreaView>
                {/* Top half of screen (display of the character) */}
                <View style={styles.background}>
                    <Text>Shop Screen top</Text>
                </View>
                {/* Bottom half of screen (shop portion) */}
                <FlatList
                    data={data}
                    renderItem={({ item }) => (
                        /* Next step figure out how to get list items side by side */
                        <View style={styles.flatListContainer}>
                            <Text>{item.title}</Text>
                            <Image source={{ uri: item.imageUrl }} style={styles.thumbnails} />
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
    },
    flatListContainer: {
        backgroundColor: "#70aeff",
        marginVertical: 10,
        marginHorizontal: 16,
        paddingBottom: 32,
        borderRadius: 6,
    },
    separator: {
        height: 2,
    },
    thumbnails: {
        width: 10,
        height: 10,
    },
})

export default ShopScreen;