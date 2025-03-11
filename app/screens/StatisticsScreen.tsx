import React, { useContext } from 'react';
import { Button, Text, View, StyleSheet, Platform } from 'react-native';
import Toast from 'react-native-toast-message';
import colors from '../config/colors';
import { SettingsContext } from '../config/SettingsContext';
import toastConfig from '../config/toastConfig';

const StatisticsScreen = ({ navigation }) => {
    const settings = useContext(SettingsContext);

    if (!settings) return null;

    return (
        <View style={[styles.background, { backgroundColor: settings.darkMode ? colors.black : colors.white }]}>
            {/* Header */}
            <View style={styles.headerContainer}>
                <View style={{ position: 'absolute', left: 15, top: Platform.OS === 'ios' ? 50 : 30 }}>
                    <Button title="Back" color={settings.darkMode ? colors.secondary : colors.primary} onPress={() => navigation.goBack()} />
                </View>
                <View style={{ flex: 1, alignItems: 'center' }}>
                    <Text style={[styles.headerText, { color: settings.darkMode ? colors.white : colors.black }]}>
                        Your Stats
                    </Text>
                </View>
            </View>
            <Toast config={toastConfig}/>
        </View>
    );
};

const styles = StyleSheet.create({
    background: {
        flex: 1,
        alignItems: "center",
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
});

export default StatisticsScreen;
