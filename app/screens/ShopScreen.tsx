import React from 'react';
import { View, ScrollView, Image, Text, TextInput, Dimensions, StyleSheet } from 'react-native';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
const ShopScreen = () => {
    return (
        <SafeAreaProvider>
            <SafeAreaView>
                <View style={styles.background}>
                    <Text>Shop Screen top</Text>
                </View>
                <ScrollView>
                    <Text>Shop Screen bottom</Text>
                </ScrollView>
            </SafeAreaView>
        </SafeAreaProvider>
        
    );
};

const styles = StyleSheet.create({
    background: {
        width: Dimensions.get('window').width,
        height: Dimensions.get('window').height / 2,
    },
})

export default ShopScreen;