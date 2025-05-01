import React, { useContext, useState, useRef, useEffect } from 'react';
import { useRoute } from '@react-navigation/native';
import { View, Text, Button, StyleSheet, Pressable, TextInput, Dimensions, TouchableWithoutFeedback, Keyboard, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { useSharedValue, useDerivedValue } from 'react-native-reanimated';
import { doc, getDoc, updateDoc, increment, addDoc, collection } from "firebase/firestore";
import { Picker } from '@react-native-picker/picker';
import Slider from '@react-native-community/slider';
import { GestureHandlerRootView, ScrollView } from 'react-native-gesture-handler';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';

import { themes } from '@/config/colors';
import useTheme from '@/config/useTheme';
import { SettingsContext } from '@/config/SettingsContext';
import CustomMenu from '@/config/customMenu';
import { FIREBASE_DB } from '@/firebaseConfig';
import { authContext } from '@/config/authContext';

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
    const colors = useTheme();
    const [name, setName] = useState('');
    const [date, setDate] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [time, setTime] = useState(new Date());
    const [showTimePicker, setShowTimePicker] = useState(false);
    const [repeat, setRepeat] = useState('none');
    const [customRepeatValue, setCustomRepeatValue] = useState('1');
    const [customRepeatType, setCustomRepeatType] = useState('days');
    const [difficultyIndex, setDifficultyIndex] = useState(2);
    const [subtasks, setSubtasks] = useState<{ text: string; editable: boolean }[]>([]);
    const [loadingSubtasks, setLoadingSubtasks] = useState(false);
    const difficultyIndexRef = useRef(difficultyIndex);
    const translateY = useSharedValue(MID_POSITION);
    const settings = useContext(SettingsContext);
    const [friends, setFriends] = useState<{ uid: string; username: string }[]>([]);
    const [selectedCollaborator, setSelectedCollaborator] = useState<string | null>(null);
    const [collaboratorPermission, setCollaboratorPermission] = useState<'complete' | 'edit'>('complete');
    const route = useRoute();
    const { taskId } = route.params || {};

    const parseTimeStringToDate = (timeStr: string): Date => {
        try {
          const [timeString, modifier] = timeStr.trim().split(' ');
          if (!timeString || !modifier) return new Date();
      
          let [hours, minutes] = timeString.split(':').map(Number);
      
          if (modifier === 'PM' && hours !== 12) hours += 12;
          if (modifier === 'AM' && hours === 12) hours = 0;
      
          const dateString = `1970-01-01T${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:00`;
          const parsed = new Date(dateString);
          if (isNaN(parsed.getTime())) return new Date();
          return parsed;
        } catch {
          return new Date();
        }
    };      

    useEffect(() => {
        const fetchFriends = async () => {
            try {
                const userRef = doc(FIREBASE_DB, "users", user.uid);
                const userSnap = await getDoc(userRef);
                if (userSnap.exists()) {
                    const data = userSnap.data();
                    const friendUIDs = data.friends || [];
    
                    const friendDataPromises = friendUIDs.map(async (uid: string) => {
                        const friendSnap = await getDoc(doc(FIREBASE_DB, "users", uid));
                        if (friendSnap.exists()) {
                            const friendData = friendSnap.data();
                            return { uid, username: friendData.username };
                        }
                        return null;
                    });
    
                    const resolvedFriends = await Promise.all(friendDataPromises);
                    setFriends(resolvedFriends.filter(f => f !== null) as any);
                }
            } catch (error) {
                console.error("Failed to fetch friends", error);
            }
        };
    
        fetchFriends();
    }, []);

    useEffect(() => {
        const fetchTask = async () => {
          if (!taskId) return;
          const taskDoc = await getDoc(doc(FIREBASE_DB, "tasks", taskId));
          if (taskDoc.exists()) {
            const data = taskDoc.data();
            setName(data.name);
            setDate(new Date(data.date));
    
            if (data.time) {
              setTime(parseTimeStringToDate(data.time));
            } else {
              setTime(new Date()); // fallback only if time is missing
            }
    
            setSubtasks(
                Array.isArray(data.subtask) 
                  ? data.subtask.map((sub: any) => ({
                      text: sub.text || '',
                      editable: sub.editable ?? false,
                      completed: sub.completed ?? false,
                  }))
                  : []
            );              
            setRepeat(data.repeat || 'none');
            if (typeof data.repeat === 'object') {
                setRepeat('custom');
                setCustomRepeatType(data.repeat.type || 'days');
                setCustomRepeatValue(data.repeat.interval?.toString() || '1');
            }            
            const difficultyIdx = difficultyLevels.findIndex(level => level.label === data.difficulty);
            setDifficultyIndex(difficultyIdx !== -1 ? difficultyIdx : 2); // Default to "Normal" if not found
            setSelectedCollaborator(data.collaboratorId || null);
            setCollaboratorPermission(data.collaboratorPermission || 'complete');
          }
        };
        fetchTask();
    }, [taskId]);      

    if (!settings || !user) return null;

    // Saving a Task
    const handleSaveTask = async () => {
        try {
            let repeatData = repeat === "custom"
                ? { type: customRepeatType, interval: parseInt(customRepeatValue) }
                : repeat;
    
            const selectedDifficulty = difficultyLevels[difficultyIndex];
    
            const hours = time.getHours();
            const minutes = time.getMinutes();
            const formattedHours = ((hours + 11) % 12 + 1);
            const ampm = hours >= 12 ? 'PM' : 'AM';
            const formattedTime = `${formattedHours}:${minutes.toString().padStart(2, '0')} ${ampm}`;
    
            const taskData = {
                userId: user.uid,
                name,
                date: date.toISOString().split('T')[0],
                time: formattedTime,
                subtask: subtasks,
                repeat: repeatData,
                xp: selectedDifficulty.xp,
                balance: selectedDifficulty.balance,
                difficulty: selectedDifficulty.label,
                collaboratorId: selectedCollaborator,
                collaboratorPermission,
            };
    
            if (taskId) {
                await updateDoc(doc(FIREBASE_DB, "tasks", taskId), taskData);
            } else {
                await addDoc(collection(FIREBASE_DB, "tasks"), {
                    ...taskData,
                    createdAt: new Date().toISOString(),  // Only add createdAt for brand-new tasks
                });
    
                // Update stats only for new tasks
                const statsRef = doc(FIREBASE_DB, "stats", user.uid);
                const statsSnap = await getDoc(statsRef);
                if (statsSnap.exists()) {
                    await updateDoc(statsRef, {
                        tasksCreated: increment(1),
                    });
                }
            }
    
            navigation.goBack();
        } catch (error) {
            console.error("Error saving task: ", error);
            alert("Failed to save task.");
        }
    };     

    // Subtask
    const handleAddSubtaskManually = () => {
        setSubtasks([...subtasks, { text: `Subtask ${subtasks.length + 1}`, editable: false, completed: false }]);
    };
    
    // AI-generated subtasks (Written by Will and refactored by Bryce)
    const handleGenerateSubtasksAI = async () => {
        if (loadingSubtasks) return;
        if (!name.trim()) {
            alert("Please enter a task name first.");
            return;
        }

        setLoadingSubtasks(true);
        try {
            const API_KEY = "AIzaSyCUc53d2u7oETlQceWvqwPNgPSAXcYtp9c";
            const BASE_URL = "https://generativelanguage.googleapis.com/v1beta";
            const prompt = `Please generate a sensible number of subtasks, less than or equal to 10, with no formatting (like markdown and others); for the main task: ${name}`;
    
            const response = await fetch(`${BASE_URL}/models/gemini-1.5-pro-latest:generateContent?key=${API_KEY}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }]
                })
            });
    
            const data = await response.json();
    
            const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
            if (!text) {
                alert("AI did not return any subtasks.");
                return;
            }
    
            const parsedSubtasks = text
                .split('\n')
                .map((line: string) => line.replace(/^\d+\.\s*/, '').trim())
                .filter((line: string | any[]) => line.length > 0);
    
            const formattedSubtasks = parsedSubtasks.map((item: any) => ({
                text: item,
                editable: false,
                completed: false,
            }));
    
            setSubtasks((prev) => [...prev, ...formattedSubtasks]);
        } catch (error) {
            console.error("AI subtask generation failed", error);
            alert("Could not generate subtasks.");
        } finally {
            setLoadingSubtasks(false);
        }
    };
    
    
    // Toggle edit mode for a subtask
    const toggleEditMode = (index: number) => {
        setSubtasks(subtasks.map((subtask, i) => 
            i === index ? { ...subtask, editable: !subtask.editable } : subtask
        ));
    };
    
    // Update subtask text
    const updateSubtaskText = (index: number, newText: string) => {
        setSubtasks(subtasks.map((subtask, i) => 
            i === index ? { ...subtask, text: newText } : subtask
        ));
    };
    
    // Delete a subtask
    const deleteSubtask = (index: number) => {
        setSubtasks(subtasks.filter((_, i) => i !== index));
    }; 

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
                <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.container}>
                    <View style={{ flex: 1, backgroundColor: colors.white }}>
                        <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
                            <View style={[styles.background, { backgroundColor: colors.white }]}>
                                {/* Header */}
                                <View style={styles.headerContainer}>
                                    <View style={{ position: 'absolute', left: 15, top: Platform.OS === 'ios' ? 50 : 30 }}>
                                        <Button title="Back" color={colors.secondary} onPress={() => navigation.goBack()} />
                                    </View>
                                    <View style={{ flex: 1, alignItems: 'center' }}>
                                        <Text style={[styles.headerText, { color: colors.black }]}>
                                            {taskId ? "Editing Task" : "Creating Task"}
                                        </Text>
                                    </View>
                                </View>

                                {/* TextInputs */}
                                <View style={styles.formContainer}>
                                    <TextInput
                                        style={[styles.textInput, {width: 410, borderColor: colors.black, color: colors.black, alignSelf: 'stretch'}]}
                                        value={name}
                                        onChangeText={(text) => {setName(text)}}
                                        placeholder="Name"
                                        placeholderTextColor={colors.black}
                                        autoCapitalize="none"
                                    />
                                    <View style={styles.row}>
                                        <Pressable 
                                            onPress={() => setShowDatePicker(true)} 
                                            style={[styles.textInput, { borderColor: colors.black, justifyContent: 'center' }]}
                                        >
                                            <Text style={{ color: colors.black }}>
                                                {date.toISOString().split('T')[0]} {/* Shows YYYY-MM-DD */}
                                            </Text>
                                        </Pressable>

                                        <Pressable 
                                            onPress={() => setShowTimePicker(true)} 
                                            style={[styles.textInput, { borderColor: colors.black, justifyContent: 'center' }]}
                                        >
                                            <Text style={{ color: colors.black }}>
                                                {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
                                            </Text>
                                        </Pressable>
                                    </View>

                                    {showDatePicker && (
                                    <DateTimePicker
                                        value={date}
                                        mode="date"
                                        display="default"
                                        onChange={(event, selectedDate) => {
                                        setShowDatePicker(false);
                                        if (selectedDate) {
                                            setDate(selectedDate);
                                        }
                                        }}
                                    />
                                    )}

                                    {showTimePicker && (
                                    <DateTimePicker
                                        value={time}
                                        mode="time"
                                        is24Hour={false}
                                        display="default"
                                        onChange={(event, selectedTime) => {
                                        setShowTimePicker(false);
                                        if (selectedTime) {
                                            setTime(selectedTime);
                                        }
                                        }}
                                    />
                                    )}
                                </View>

                                {/* Repeat Select */}
                                <View style={[styles.sectionContainer, { marginTop: 20 }]}>
                                    <Text style={{ textDecorationLine: "underline", fontSize: 25, color: colors.black }}>Repeat</Text>
                                    <View style={[styles.pickerWrapper, { borderColor: colors.black }]}>
                                        <Picker
                                            selectedValue={repeat}
                                            style={[
                                                styles.repeatPickers, 
                                                { 
                                                    color: colors.black, 
                                                    borderColor: colors.black 
                                                }
                                            ]}
                                            dropdownIconColor={colors.black} // Changes arrow color
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
                                            <Text style={{ color: colors.black, fontSize: 15, marginHorizontal: 10 }}>Every</Text>
                                            <TextInput
                                                style={{
                                                    borderBottomWidth: 1,
                                                    borderColor: colors.black,
                                                    width: 40,
                                                    textAlign: 'center',
                                                    marginHorizontal: 10,
                                                    color: colors.black
                                                }}
                                                keyboardType="numeric"
                                                value={customRepeatValue}
                                                onChangeText={setCustomRepeatValue}
                                                placeholderTextColor={colors.black}
                                            />
                                            <View style={[styles.pickerWrapper, { borderColor: colors.black, marginHorizontal: 10 }]}>
                                                <Picker
                                                    selectedValue={customRepeatType}
                                                    style={[
                                                        styles.repeatPickers, 
                                                        { 
                                                            color: colors.black, 
                                                            borderColor: colors.black
                                                        }
                                                    ]}
                                                    dropdownIconColor={colors.black} // Changes arrow color
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
                                    <Text style={{ textDecorationLine: "underline", fontSize: 25, color: colors.black }}>Difficulty</Text>
                                    <Text style={{ fontSize: 20, fontWeight: "bold", color: colors.black }}>{difficultyLevels[difficultyIndex].label}</Text>
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
                                    <Text style={{ fontSize: 16, color: colors.black }}>
                                        Reward: {difficultyLevels[difficultyIndex].xp} XP | {difficultyLevels[difficultyIndex].balance} Coins
                                    </Text>
                                </View>

                                {/* Collaborator */}
                                <View style={styles.sectionContainer}>
                                    <Text style={{ textDecorationLine: "underline", fontSize: 25, color: colors.black }}>
                                        Collaborator
                                    </Text>

                                    {/* Collaborator Picker */}
                                    <View style={[styles.pickerWrapper, { borderColor: colors.black, marginTop: 5 }]}>
                                        <Picker
                                            selectedValue={selectedCollaborator}
                                            onValueChange={(itemValue) => setSelectedCollaborator(itemValue)}
                                            style={{ color: colors.black }}
                                            dropdownIconColor={colors.black}
                                        >
                                            <Picker.Item label="None" value={null} />
                                            {friends.map((friend) => (
                                                <Picker.Item key={friend.uid} label={friend.username} value={friend.uid} />
                                            ))}
                                        </Picker>
                                    </View>

                                    {/* Permission Picker */}
                                    {selectedCollaborator && (
                                        <View style={{ marginTop: 15 }}>
                                            <Text
                                                style={{
                                                    fontSize: 18,
                                                    marginBottom: 5,
                                                    color: colors.black,
                                                    flexWrap: 'nowrap',
                                                }}
                                            >
                                                Collaborator Permission
                                            </Text>
                                            <View style={[styles.pickerWrapper, { borderColor: colors.black }]}>
                                                <Picker
                                                    selectedValue={collaboratorPermission}
                                                    onValueChange={(value) => setCollaboratorPermission(value)}
                                                    style={{ color: colors.black }}
                                                    dropdownIconColor={colors.black}
                                                >
                                                    <Picker.Item label="Can Complete Only" value="complete" />
                                                    <Picker.Item label="Can Edit & Complete" value="edit" />
                                                </Picker>
                                            </View>
                                        </View>
                                    )}
                                </View>

                                {/* Subtasking */}
                                <View style={styles.subtaskContainer}>
                                    {/* Header */}
                                    <View style={styles.subtaskHeader}>
                                        <Text style={{ textDecorationLine: "underline", fontSize: 25, color: colors.black }}>
                                            Subtasks
                                        </Text>
                                    </View>

                                    <View style={{width: "100%", height: 1, backgroundColor: colors.black, marginVertical: 5}}></View>

                                    {/* Buttons for AI and Manual Subtasks */}
                                    <View style={styles.subtaskButtonContainer}>
                                        <Pressable onPress={handleGenerateSubtasksAI} disabled={loadingSubtasks}>
                                            {loadingSubtasks ? (
                                                <ActivityIndicator size={40} color={colors.black} />
                                            ) : (
                                                <MaterialCommunityIcons name="robot" size={40} color={colors.black} />
                                            )}
                                        </Pressable>
                                        <Pressable onPress={handleAddSubtaskManually}>
                                            <Ionicons name="create-outline" size={40} color={colors.black} />
                                        </Pressable>
                                    </View>

                                    {/* Display Subtasks */}
                                    {subtasks.map((subtask, index) => (
                                        <View key={index} style={styles.subtaskItem}>
                                            {subtask.editable ? (
                                                <TextInput
                                                    style={[styles.editSubtaskInput, { borderColor: colors.primary, color: colors.black }]}
                                                    value={subtask.text}
                                                    onChangeText={(text) => updateSubtaskText(index, text)}
                                                    onBlur={() => toggleEditMode(index)}
                                                    autoFocus
                                                />
                                            ) : (
                                                <Pressable onPress={() => toggleEditMode(index)} style={{ flex: 1 }}>
                                                    <Text style={[styles.subtaskText, {color: colors.black}]}>{subtask.text}</Text>
                                                </Pressable>
                                            )}
                                            
                                            {/* Delete Button */}
                                            <Pressable onPress={() => deleteSubtask(index)} style={styles.deleteButton}>
                                                <Ionicons name="close-circle" size={25} color="red" />
                                            </Pressable>
                                        </View>
                                    ))}
                                </View>
                            </View>
                        </ScrollView>

                        {/* Navbar */}
                        <View style={[styles.navbar, {backgroundColor: colors.primary}]}>
                            <CustomMenu />
                            <View style={{width: "65%"}}></View>
                            <Pressable style={styles.saveTask} onPress={handleSaveTask}>
                                <Text style={{color: themes.light.black, fontSize: 30}}>Save</Text>
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
        alignItems: 'flex-start',
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
        justifyContent: "flex-start",
        gap: 10,
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
        paddingBottom: 20,
    },
    sectionContainer: {
        width: '90%',
        marginTop: 30,
        alignItems: "flex-start",
    },
    subtaskContainer: {
        width: '90%',
        marginTop: 30,
        borderRadius: 10,
        alignItems: 'flex-start',
    },
    subtaskHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 10,
    },
    subtaskButtonContainer: {
        flexDirection: "row",
        justifyContent: "space-around",
        alignSelf: "flex-end",
        gap: 15,
        marginBottom: 10,
    },
    subtaskItem: {
        flexDirection: "row",
        alignItems: "center",
        borderRadius: 5,
        marginBottom: 5,
    },
    subtaskText: {
        fontSize: 18,
        flex: 1,
    },
    editSubtaskInput: {
        borderBottomWidth: 1,
        fontSize: 18,
        flex: 1,
        padding: 5,
    },
    deleteButton: {
        marginLeft: 10,
    },
    textInput: {
        width: 200,
        height: 50,
        fontSize: 25,
        borderWidth: 1,
        borderRadius: 8,
        padding: 10,
        marginBottom: 10,
    },
})
