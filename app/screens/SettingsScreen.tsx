import React, { useContext } from 'react';
import { Button, Text, View, Switch, TouchableOpacity } from 'react-native';
import { SettingsContext } from '../SettingsContext';

const SettingsScreen = ({ navigation }) => {
  const settings = useContext(SettingsContext);

  if (!settings) return null;

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: settings.darkMode ? '#222' : '#fff' }}>
      <Button title="Back" onPress={() => navigation.navigate('Home')} />
      <Text style={{ color: settings.darkMode ? '#fff' : '#000', fontSize: settings.fontSize }}>Your Settings</Text>

      <Text style={{ color: settings.darkMode ? '#fff' : '#000', marginTop: 20 }}>Dark Mode</Text>
      <Switch value={settings.darkMode} onValueChange={settings.toggleDarkMode} />

      <Text style={{ color: settings.darkMode ? '#fff' : '#000', marginTop: 20 }}>Font Size</Text>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 10 }}>
        <TouchableOpacity 
          onPress={() => settings.setFontSize(Math.max(12, settings.fontSize - 1))} 
          style={{ padding: 10, backgroundColor: '#ddd', borderRadius: 5, marginHorizontal: 10 }}>
          <Text style={{ fontSize: 18 }}>➖</Text>
        </TouchableOpacity>

        <Text style={{ fontSize: 18, color: settings.darkMode ? '#fff' : '#000' }}>{settings.fontSize}</Text>

        <TouchableOpacity 
          onPress={() => settings.setFontSize(Math.min(24, settings.fontSize + 1))} 
          style={{ padding: 10, backgroundColor: '#ddd', borderRadius: 5, marginHorizontal: 10 }}>
          <Text style={{ fontSize: 18 }}>➕</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default SettingsScreen;
