import React, { useContext } from 'react';
import { Button, Text, View, StyleSheet } from 'react-native';
import colors from '../config/colors';
import { SettingsContext } from '../SettingsContext';

const StatisticsScreen = ({ navigation }) => {
    const settings = useContext(SettingsContext);

    if (!settings) return null;

    return (
        <View style={[styles.container, { backgroundColor: settings.darkMode ? '#222' : '#fff' }]}>
            <View style={styles.textContainer}>
                <Text style={[styles.text, { color: settings.darkMode ? '#fff' : '#000', fontSize: settings.fontSize }]}>
                    Your Stats
                </Text>
            </View>

            <View style={styles.buttonContainer}>
                <Button title="Back" onPress={() => navigation.navigate('Home')} />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'space-between', 
        alignItems: 'center',
        paddingVertical: 20,
    },
    textContainer: {
        flex: 1,
        justifyContent: 'flex-start',
        alignItems: 'center',
        width: '100%',
        paddingTop: 50,
    },
    text: {
        fontWeight: 'bold',
    },
    buttonContainer: {
        paddingBottom: 20,
        alignSelf: 'center',
    },
});

export default StatisticsScreen;
