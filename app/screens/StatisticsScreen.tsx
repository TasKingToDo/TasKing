import React, { useContext } from 'react';
import { Button, Text, View, StyleSheet } from 'react-native';
import colors from '../config/colors';
import { SettingsContext } from '../SettingsContext';

const StatisticsScreen = ({ navigation }) => {
    const settings = useContext(SettingsContext);

    if (!settings) return null;

    return (
        <View style={[styles.background, { backgroundColor: settings.darkMode ? colors.black : colors.white }]}>
            <View style={styles.backButton}>
                <Button title="Back" color={settings.darkMode ? colors.secondary : colors.primary} onPress={() => navigation.navigate('Home')} />
            </View>
            <View style={styles.textContainer}>
                <Text style={[styles.text, { color: settings.darkMode ? colors.white : colors.black}]}>Your Stats</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
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
    textContainer: {
        flex: 1,
        justifyContent: 'flex-start',
        alignItems: 'center',
        width: '100%',
        paddingTop: 50,
    },
    text: {
        fontWeight: 'bold',
        position: "absolute",
        top: "5%",
        fontSize: 30
    },
});

export default StatisticsScreen;
