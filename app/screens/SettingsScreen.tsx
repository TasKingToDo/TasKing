import React from 'react';
import { Button, Text, View } from 'react-native';

const SettingsScreen = ({navigation}) => {
    return (
        <View>
            <Button title="Back" onPress={(navigation.navigate('Home'))}/>
            <Text>Your Settings</Text>
        </View>
    );
}

export default SettingsScreen;