import React from 'react';
import { Button, Text, View } from 'react-native';

const FriendsScreen = ({navigation}) => {
    return (
        <View>
            <Button title="Back" onPress={() => navigation.navigate('Home')}/>
            <Text>Your Friends</Text>
        </View>
    );
}

export default FriendsScreen;