import React, { useContext, useState, useRef } from 'react';
import { View, Text, Button, StyleSheet, Pressable, TextInput, Dimensions, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { useSharedValue, useDerivedValue } from 'react-native-reanimated';
import { addDoc, collection, getDocs } from "firebase/firestore";
import { Picker } from '@react-native-picker/picker';
import Slider from '@react-native-community/slider';
import colors from '../config/colors';
import { SettingsContext } from '../config/SettingsContext';
import CustomMenu from '../config/customMenu';
import { FIREBASE_DB } from '@/firebaseConfig';
import { authContext } from '../config/authContext';

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

    const handleDateChange = (text) => {
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

    const handleTimeChange = (text) => {
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
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
            <View style={[styles.background, { backgroundColor: settings.darkMode ? colors.black : colors.white }]}>
                <View style={styles.backButton}>
                    <Button title="Back" color={settings.darkMode ? colors.secondary : colors.primary} onPress={() => navigation.navigate('Home')}/>
                </View>
                <View style={styles.textContainer}>
                    <Text style={[styles.text, { color: settings.darkMode ? colors.white : colors.black}]}>Creating Task</Text>
                </View>
                <View style={{position: "absolute", top: "10%", left: "8%"}}>
                    <TextInput
                        style={styles.textInput}
                        value={name}
                        onChangeText={setName}
                        placeholder="Name"
                        autoCapitalize="none"
                    />
                </View>
                <View style={{position: "absolute", top: "17%", left: "8%", flexDirection: "row"}}>
                    <TextInput 
                        style={styles.textInput}
                        value={date}
                        onChangeText={(text) => handleDateChange(text)}
                        placeholder="YYYY-MM-DD"
                        keyboardType="numeric"
                        maxLength={10}
                    />
                    <View style={{width: "5%"}}></View>
                    <TextInput
                        style={styles.textInput}
                        value={time}
                        onChangeText={(text) => handleTimeChange(text)}
                        placeholder="HH:MM AM/PM"
                        keyboardType="default"
                        maxLength={8}
                    />
                </View>
                <View style={{ position: "absolute", top: "26%", left: "8%" }}>
                    <Text style={{ textDecorationLine: "underline", fontSize: 25, color: settings.darkMode ? colors.white : colors.black }}>Repeat?</Text>
                    <Picker
                        selectedValue={repeat}
                        style={styles.repeatPickers}
                        onValueChange={(itemValue) => setRepeat(itemValue)}
                    >
                        <Picker.Item label="None" value="none" />
                        <Picker.Item label="Daily" value="daily" />
                        <Picker.Item label="Weekly" value="weekly" />
                        <Picker.Item label="Monthly" value="monthly" />
                        <Picker.Item label="Custom" value="custom" />
                    </Picker>
                    {repeat === "custom" && (
                        <View style={{ flexDirection: "row", alignItems: "center", marginTop: 10 }}>
                            <Text style={{ color: settings.darkMode ? colors.white : colors.black }}>Every</Text>
                            <TextInput
                                style={{
                                    borderBottomWidth: 1,
                                    borderColor: 'black',
                                    width: 40,
                                    textAlign: 'center',
                                    marginHorizontal: 5,
                                }}
                                keyboardType="numeric"
                                value={customRepeatValue}
                                onChangeText={setCustomRepeatValue}
                            />
                            <Picker
                                selectedValue={customRepeatType}
                                style={styles.repeatPickers}
                                onValueChange={(itemValue) => setCustomRepeatType(itemValue)}
                            >
                                <Picker.Item label="Days" value="days" />
                                <Picker.Item label="Weeks" value="weeks" />
                                <Picker.Item label="Months" value="months" />
                            </Picker>
                        </View>
                    )}
                </View>
                <View style={{ position: "absolute", top: repeat === "custom" ? "45%" : "40%", left: "8%" }}>
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
                <View style={[styles.navbar, {backgroundColor: settings.darkMode ? colors.secondary : colors.primary}]}>
                    <CustomMenu navbarVisible={navbarVisible.value}/>
                    <View style={{width: "65%"}}></View>
                    <Pressable style={styles.saveTask} onPress={handleSaveTask}>
                        <Text style={{color: settings.darkMode ? colors.white : colors.black, fontSize: 30}}>Save</Text>
                    </Pressable>
                </View>
            </View>
        </TouchableWithoutFeedback>
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
    repeatPickers: {
        height: 50, 
        width: 140,
        backgroundColor: colors.primarySoft,
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
        fontSize: 30,
        textDecorationLine: "underline",
    },
    textContainer: {
        flex: 1,
        width: '100%',
        alignItems: "center",
    },
    textInput: {
        fontSize: 25,
        backgroundColor: colors.primarySoft,
        borderWidth: 2,
        borderRadius: 8
    },
})