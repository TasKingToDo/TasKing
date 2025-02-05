import React from 'react';
import { Button, Text, View } from 'react-native';

const StatisticsScreen = ({navigation}) => {
    return (
        <View>
            <Button title="Back" onPress={() => navigation.navigate('Home')}/>
            <Text>Your Stats</Text>
        </View>
    );
}

export default StatisticsScreen;