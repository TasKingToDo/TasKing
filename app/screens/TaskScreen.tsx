import React from 'react';
import { Text, View, StyleSheet} from 'react-native';
import { TruncatedTextView } from 'react-native-truncated-text-view';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import colors from '../config/colors';

const TaskScreen = () => {

    return (
        <SafeAreaProvider style={styles.taskSection}>
            <SafeAreaView>
                <View style={styles.taskSection}>
                    <TruncatedTextView text="Task 1" numberOfLines={1} collapsedText='...' enableShowLess={false} />
                    <TruncatedTextView text="Task 2" numberOfLines={1} collapsedText='...' enableShowLess={false} />
                    <TruncatedTextView text="Task 3" numberOfLines={1} collapsedText='...' enableShowLess={false} />
                    <TruncatedTextView text="Task 4" numberOfLines={1} collapsedText='...' enableShowLess={false} />
                </View>
            </SafeAreaView>
        </SafeAreaProvider>
    );
};

const styles = StyleSheet.create({
    taskSection: {
        width: "100%",
    }
})

export default TaskScreen;