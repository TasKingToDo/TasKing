import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Platform,
  StyleSheet,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

import useTheme from '@/config/useTheme';
import { SettingsContext } from '@/config/SettingsContext';

export default function NotificationScreen({ navigation, route }) {
  const settings = useContext(SettingsContext);
  const colors = useTheme();

  const [date, setDate] = useState(new Date());
  const [mode, setMode] = useState<'date' | 'time'>('date');
  const [show, setShow] = useState(false);

  const onChange = (event: any, selectedDate?: Date) => {
    setShow(Platform.OS === 'ios');

    if (selectedDate) {
      if (mode === 'date') {
        setDate(selectedDate);
        setMode('time');
        setShow(true);
      } else {
        const finalDate = selectedDate;
        setDate(finalDate);
        if (route.params?.onSelect) {
          route.params.onSelect(finalDate);
        }
        navigation.goBack();
      }
    }
  };

  const showPicker = (currentMode: 'date' | 'time') => {
    setMode(currentMode);
    setShow(true);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.white }]}>
      <Text style={[styles.title, { color: colors.black }]}>Select Notification Date & Time</Text>

      <TouchableOpacity
        onPress={() => showPicker('date')}
        style={[styles.button, { backgroundColor: colors.secondary }]}
      >
        <Text style={[styles.buttonText, { color: colors.white }]}>Pick Date & Time</Text>
      </TouchableOpacity>

      <Text style={[styles.selectedText, { color: colors.black }]}>
        {date.toLocaleString()}
      </Text>

      {show && (
        <DateTimePicker
          value={date}
          mode={mode}
          display="default"
          onChange={onChange}
          themeVariant={settings?.theme === 'dark' ? 'dark' : 'light'}
        />
      )}

      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={[styles.button, { backgroundColor: '#ccc' }]}
      >
        <Text style={{ color: 'black' }}>Cancel</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    marginBottom: 20,
  },
  button: {
    padding: 12,
    marginVertical: 8,
    borderRadius: 6,
    width: '80%',
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
  },
  selectedText: {
    marginVertical: 16,
    fontSize: 16,
  },
});
