import React, { useContext } from 'react';
import { View, Text, Button } from 'react-native';
import colors from '../config/colors';
import { SettingsContext } from '../SettingsContext';

const CreateTaskScreen = ({navigation}) => {
    const settings = useContext(SettingsContext);
    return (
        <View>
            <Button title="Back" onPress={() => navigation.navigate('Home')}/>
            <Text>New Task</Text>
        </View>
    );
}

export default CreateTaskScreen;