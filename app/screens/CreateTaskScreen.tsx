import React, { useContext, useState } from 'react';
import { View, Text, Button, StyleSheet, Pressable, TextInput, Dimensions } from 'react-native';
import colors from '../config/colors';
import { SettingsContext } from '../SettingsContext';
import CustomMenu from '../config/customMenu';
import { useSharedValue } from 'react-native-reanimated';

const { height } = Dimensions.get("window");
const MID_POSITION = 0;

const CreateTaskScreen = ({navigation}) => {
    const [name, setName] = useState('');
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const translateY = useSharedValue(MID_POSITION);
    const settings = useContext(SettingsContext);

    if (!settings) return null;

    const handleSaveTask = () => {
        alert("Task has been created!")
        navigation.navigate('Home')
    }

    const navbarVisible = translateY.value <= height * 0.15;

    return (
        <View style={styles.background}>
            <View style={styles.backButton}>
                <Button title="Back" color={settings.darkMode ? colors.secondary : colors.primary} onPress={() => navigation.navigate('Home')}/>
            </View>
            <Text style={styles.text}>Creating Task</Text>
            <View style={{position: "absolute", top: "10%", left: "10%"}}>
                <TextInput
                    style={styles.textInput}
                    value={name}
                    placeholder="Name"
                    autoCapitalize="none"
                />
            </View>
            <View style={{position: "absolute", top: "17%", left: "10%", flexDirection: "row"}}>
                <TextInput 
                    style={styles.textInput}
                    value={date}
                    placeholder="Date"
                    autoCapitalize="none"
                />
                <View style={{width: "15%"}}></View>
                <TextInput
                    style={styles.textInput}
                    value={time}
                    placeholder="Time"
                    autoCapitalize="none"
                />
            </View>
            <View style={{position: "absolute", top: "24%", left: "10%"}}>
                <Text style={{textDecorationLine:"underline"}}>Repeat?</Text>
            </View>
            <View style={[styles.navbar, {backgroundColor: settings.darkMode ? colors.secondary : colors.primary}]}>
                <CustomMenu navbarVisible={navbarVisible}/>
                <View style={{width: "65%"}}></View>
                <Pressable style={styles.saveTask} onPress={handleSaveTask}>
                    <Text style={{color: settings.darkMode ? colors.white : colors.black, fontSize: 30}}>Save</Text>
                </Pressable>
            </View>
        </View>
    );
}

export default CreateTaskScreen;

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
    navbar: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        borderTopWidth: 3,
        borderTopColor: colors.black,
        overflow: "visible",
    },
    saveTask: {
        width: "17.5%",
        height: 75,
        justifyContent: "center",
        alignItems: "center",
    },
    text: {
        position: "absolute",
        top: "5%",
        fontSize: 30
    },
    textInput: {
        fontSize: 30
    },
})