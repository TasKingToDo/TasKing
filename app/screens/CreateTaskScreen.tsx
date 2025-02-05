import React from 'react';
import { View, Text, Button } from 'react-native';

const CreateTaskScreen = ({navigation}) => {
    return (
        <View>
            <Button title="Back" onPress={() => navigation.navigate('Home')}/>
            <Text>New Task</Text>
        </View>
    );
}

export default CreateTaskScreen;