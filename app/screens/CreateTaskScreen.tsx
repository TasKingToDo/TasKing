import React, { useContext, useState, useRef } from 'react';
import { View, Text, Button, StyleSheet, Pressable, TextInput, Dimensions, TouchableWithoutFeedback, Keyboard, KeyboardAvoidingView, Platform } from 'react-native';
import { useSharedValue, useDerivedValue } from 'react-native-reanimated';
import { addDoc, collection, getDocs } from "firebase/firestore";
import { Picker } from '@react-native-picker/picker';
import Slider from '@react-native-community/slider';
import colors from '../config/colors';
import { SettingsContext } from '../config/SettingsContext';
import CustomMenu from '../config/customMenu';
import { FIREBASE_DB } from '@/firebaseConfig';
import { authContext } from '../config/authContext';
import { GestureHandlerRootView, ScrollView } from 'react-native-gesture-handler';

const { height } = Dimensions.get("window");
const MID_POSITION = 0;

const difficultyLevels = [
    { label: "Very Easy", xp: 5, balance: 5 },
    { label: "Easy", xp: 10, balance: 8 },
    { label: "Normal", xp: 20, balance: 10 },
    { label: "Hard", xp: 35, balance: 12 },
    { label: "Very Hard", xp: 50, balance: 15 },
];

const CreateTaskScreen = ({navigation}) => {
    const { user } = useContext(authContext);
    const [name, setName] = useState('');
    const [date, setDate] = useState('');
    const [dateError, setDateError] = useState('');
    const [time, setTime] = useState('');
    const [timeError, setTimeError] = useState('');
    const [repeat, setRepeat] = useState('none');
    const [customRepeatValue, setCustomRepeatValue] = useState('1');
    const [customRepeatType, setCustomRepeatType] = useState('days');
    const [difficultyIndex, setDifficultyIndex] = useState(2);
    const difficultyIndexRef = useRef(difficultyIndex);
    const translateY = useSharedValue(MID_POSITION);
    const settings = useContext(SettingsContext);

    if (!settings || !user) return null;

    const handleDateChange = (text: string) => {
        let formattedText = text.replace(/[^0-9-]/g, '');

        if (formattedText.length === 4 || formattedText.length === 7) {
            formattedText += '-';
        }

        setDate(formattedText);

        if (/^\d{4}-\d{2}-\d{2}$/.test(formattedText)) {
            setDateError('');
        } else {
            setDateError('Date must be in YYYY-MM-DD format');
        }
    };

    const handleTimeChange = (text: string) => {
        let formattedText = text.replace(/[^0-9:APM ]/gi, '');
    
        if (formattedText.length === 2 && !formattedText.includes(':')) {
            formattedText += ':';
        }
    
        if (formattedText.length === 5 && !formattedText.includes(' ')) {
            formattedText += ' ';
        }
    
        formattedText = formattedText.toUpperCase();
    
        setTime(formattedText);
    
        if (/^(0[1-9]|1[0-2]):[0-5][0-9] (AM|PM)$/.test(formattedText)) {
            setTimeError('');
        } else {
            setTimeError('Time must be in HH:MM AM/PM format');
        }
    };

    const handleSaveTask = async () => {
        try {
            let repeatData = repeat === "custom"
                ? { type: customRepeatType, interval: parseInt(customRepeatValue) }
                : repeat;

            const selectedDifficulty = difficultyLevels[difficultyIndex];

            await addDoc(collection(FIREBASE_DB, "tasks"), {
                userId: user.uid,
                name: name,
                date: date,
                time: time,
                repeat: repeatData,
                createdAt: new Date().toISOString(),
                xp: selectedDifficulty.xp,
                balance: selectedDifficulty.balance,
                difficulty: selectedDifficulty.label,
            });

            alert("Task has been created!");
            navigation.navigate('Home');
        } catch (error) {
            console.error("Error adding document: ", error);
            alert("Failed to save task.");
        }
    };

    const navbarVisible = useDerivedValue(() => translateY.value <= height * 0.15);

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
                <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.container}>
                    <View style={{flex: 1}}>
                        <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
                            <View style={[styles.background, { backgroundColor: settings.darkMode ? colors.black : colors.white }]}>
                                {/* Header */}
                                <View style={styles.headerContainer}>
                                    <View style={{ position: 'absolute', left: 15, top: Platform.OS === 'ios' ? 50 : 30 }}>
                                        <Button title="Back" color={settings.darkMode ? colors.secondary : colors.primary} onPress={() => navigation.goBack()} />
                                    </View>
                                    <View style={{ flex: 1, alignItems: 'center' }}>
                                        <Text style={[styles.headerText, { color: settings.darkMode ? colors.white : colors.black }]}>
                                            Creating Task
                                        </Text>
                                    </View>
                                </View>

                                {/* TextInputs */}
                                <View style={styles.formContainer}>
                                    <TextInput
                                        style={[styles.textInput, {borderColor: settings.darkMode ? colors.white : colors.black}]}
                                        value={name}
                                        onChangeText={(text) => {setName(text)}}
                                        placeholder="Name"
                                        placeholderTextColor={settings.darkMode ? colors.white : colors.black}
                                        autoCapitalize="none"
                                    />
                                    <View style={styles.row}>
                                        <TextInput 
                                            style={[styles.textInput, {borderColor: settings.darkMode ? colors.white : colors.black}]}
                                            value={date}
                                            onChangeText={(text) => handleDateChange(text)}
                                            placeholder="YYYY-MM-DD"
                                            placeholderTextColor={settings.darkMode ? colors.white : colors.black}
                                            keyboardType="numeric"
                                            maxLength={10}
                                        />
                                        <TextInput
                                            style={[styles.textInput, {borderColor: settings.darkMode ? colors.white : colors.black}]}
                                            value={time}
                                            onChangeText={(text) => handleTimeChange(text)}
                                            placeholder="HH:MM AM/PM"
                                            placeholderTextColor={settings.darkMode ? colors.white : colors.black}
                                            keyboardType="default"
                                            maxLength={8}
                                        />
                                    </View>
                                </View>
                                {/* Repeat Select */}

                                <View style={[styles.sectionContainer, { marginTop: 20 }]}>
                                    <Text style={{ textDecorationLine: "underline", fontSize: 25, color: settings.darkMode ? colors.white : colors.black }}>Repeat?</Text>
                                    <View style={[styles.pickerWrapper, { borderColor: settings.darkMode ? colors.white : colors.black }]}>
                                        <Picker
                                            selectedValue={repeat}
                                            style={[
                                                styles.repeatPickers, 
                                                { 
                                                    color: settings.darkMode ? colors.white : colors.black, 
                                                    borderColor: settings.darkMode ? colors.white : colors.black 
                                                }
                                            ]}
                                            dropdownIconColor={settings.darkMode ? colors.white : colors.black} // Changes arrow color
                                            onValueChange={(itemValue) => setRepeat(itemValue)}
                                        >
                                            <Picker.Item label="None" value="none" />
                                            <Picker.Item label="Daily" value="daily" />
                                            <Picker.Item label="Weekly" value="weekly" />
                                            <Picker.Item label="Monthly" value="monthly" />
                                            <Picker.Item label="Custom" value="custom" />
                                        </Picker>
                                    </View>
                                    {repeat === "custom" && (
                                        <View style={{ flexDirection: "row", alignItems: "center", marginTop: 10}}>
                                            <Text style={{ color: settings.darkMode ? colors.white : colors.black, fontSize: 15, marginHorizontal: 10 }}>Every</Text>
                                            <TextInput
                                                style={{
                                                    borderBottomWidth: 1,
                                                    borderColor: settings.darkMode ? colors.white : colors.black,
                                                    width: 40,
                                                    textAlign: 'center',
                                                    marginHorizontal: 10,
                                                    color: settings.darkMode ? colors.white : colors.black
                                                }}
                                                keyboardType="numeric"
                                                value={customRepeatValue}
                                                onChangeText={setCustomRepeatValue}
                                                placeholderTextColor={settings.darkMode ? colors.white : colors.black}
                                            />
                                            <View style={[styles.pickerWrapper, { borderColor: settings.darkMode ? colors.white : colors.black, marginHorizontal: 10 }]}>
                                                <Picker
                                                    selectedValue={customRepeatType}
                                                    style={[
                                                        styles.repeatPickers, 
                                                        { 
                                                            color: settings.darkMode ? colors.white : colors.black, 
                                                            borderColor: settings.darkMode ? colors.white : colors.black
                                                        }
                                                    ]}
                                                    dropdownIconColor={settings.darkMode ? colors.white : colors.black} // Changes arrow color
                                                    onValueChange={(itemValue) => setCustomRepeatType(itemValue)}
                                                >
                                                    <Picker.Item label="Days" value="days" />
                                                    <Picker.Item label="Weeks" value="weeks" />
                                                    <Picker.Item label="Months" value="months" />
                                                </Picker>
                                            </View>
                                        </View>
                                    )}
                                </View>

                                {/* Difficulty Slider */}
                                <View style={styles.sectionContainer}>
                                    <Text style={{ textDecorationLine: "underline", fontSize: 25, color: settings.darkMode ? colors.white : colors.black }}>Difficulty:</Text>
                                    <Text style={{ fontSize: 20, fontWeight: "bold", color: settings.darkMode ? colors.white : colors.black }}>{difficultyLevels[difficultyIndex].label}</Text>
                                    <Slider
                                        style={{ width: 250, height: 40 }}
                                        minimumValue={0}
                                        maximumValue={4}
                                        step={1}
                                        value={difficultyIndex}
                                        onValueChange={(value) => {
                                            difficultyIndexRef.current = value;
                                        }}
                                        onSlidingComplete={(value) => {
                                            setDifficultyIndex(value);
                                        }}
                                        minimumTrackTintColor={colors.primary}
                                        maximumTrackTintColor={colors.secondary}
                                        thumbTintColor={colors.accept}
                                    />
                                    <Text style={{ fontSize: 16, color: settings.darkMode ? colors.white : colors.black }}>
                                        Reward: {difficultyLevels[difficultyIndex].xp} XP | {difficultyLevels[difficultyIndex].balance} Coins
                                    </Text>
                                </View>
                            </View>
                        </ScrollView>

                        {/* Navbar */}
                        <View style={[styles.navbar, {backgroundColor: settings.darkMode ? colors.secondary : colors.primary}]}>
                            <CustomMenu navbarVisible={navbarVisible.value}/>
                            <View style={{width: "65%"}}></View>
                            <Pressable style={styles.saveTask} onPress={handleSaveTask}>
                                <Text style={{color: settings.darkMode ? colors.white : colors.black, fontSize: 30}}>Save</Text>
                            </Pressable>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </TouchableWithoutFeedback>
        </GestureHandlerRootView>
    );
}

export default CreateTaskScreen;

const styles = StyleSheet.create({
    background: {
        flex: 1,
        alignItems: "center",
    },
    container: {
        flex: 1,
    },
    formContainer: {
        width: '90%',
        marginTop: 40,
        alignItems: 'center',
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
    navbar: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        borderTopWidth: 2,
        paddingVertical: 10,
        height: 75,
        width: "100%",
        paddingHorizontal: 15,
    },
    pickerWrapper: {
        borderWidth: 1,
        borderRadius: 10,
        overflow: 'hidden',
        marginTop: 5,
        width: 160,
    },    
    repeatPickers: {
        height: 50, 
        width: 150,
        borderWidth: 1,
        borderRadius: 10,
        paddingHorizontal: 10,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginTop: 10,
    },
    saveTask: {
        width: "17.5%",
        height: 75,
        justifyContent: "center",
        alignItems: "center",
    },
    scrollContainer: {
        flexGrow: 1,
        justifyContent: 'flex-start',
        alignItems: "center",
        paddingBottom: 20,
    },
    sectionContainer: {
        width: '85%',
        marginTop: 30,
    },
    textInput: {
        fontSize: 25,
        borderWidth: 1,
        borderRadius: 8
    },
})