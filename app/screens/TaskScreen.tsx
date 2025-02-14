import React, { useContext } from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { TruncatedTextView } from 'react-native-truncated-text-view';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import colors from '../config/colors';
import { SettingsContext } from '../SettingsContext';

const TaskScreen = () => {
    const settings = useContext(SettingsContext);

    return (
        <SafeAreaProvider style={styles.taskSection}>
            <SafeAreaView>
                <View style={styles.taskSection}>
                    <TruncatedTextView style={styles.task} text="Task1" numberOfLines={1} collapsedText='...' enableShowLess={false} />
                    <TruncatedTextView style={styles.task} text="Task 2" numberOfLines={1} collapsedText='...' enableShowLess={false} />
                    <TruncatedTextView style={styles.task} text="Task 3" numberOfLines={1} collapsedText='...' enableShowLess={false} />
                    <TruncatedTextView style={styles.task} text="Task 4" numberOfLines={1} collapsedText='...' enableShowLess={false} />
                    <TruncatedTextView style={styles.task} text="Task 5" numberOfLines={1} collapsedText='...' enableShowLess={false} />
                </View>
            </SafeAreaView>
        </SafeAreaProvider>
    );
};

const styles = StyleSheet.create({
    task: {
        height: 79,
        backgroundColor: colors.primarySoft,
        borderWidth: 2,
        fontSize: 18,
        padding: 10,
        margin: 0
    },
    taskSection: {
        width: "100%",
    }
})

export default TaskScreen;