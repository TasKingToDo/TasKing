import React, { useContext } from 'react';
import { Button, Text, View, Switch, TouchableOpacity, StyleSheet } from 'react-native';
import { SettingsContext } from '../SettingsContext';
import colors from '../config/colors';
import { getAuth, signOut } from 'firebase/auth';

const SettingsScreen = ({ navigation }) => {
  const settings = useContext(SettingsContext);
  const auth = getAuth();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      console.log('User logged out successfully')
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  if (!settings) return null;

  return (
    <View style={[styles.background, {backgroundColor: settings.darkMode ? colors.black : colors.white}]}>
      <View style={styles.backButton}>
        <Button title="Back" color={settings.darkMode ? colors.secondary : colors.primary} onPress={() => navigation.navigate('Home')} />
      </View>
      <View style={styles.textContainer}>
        <Text style={[styles.text, { color: settings.darkMode ? colors.white : colors.black}]}>Your Settings</Text>
      </View>

      <Text style={{ color: settings.darkMode ? colors.white : colors.black, marginTop: 20, position: "absolute", top: "20%" }}>Dark Mode</Text>
      <Switch style={{position: "absolute", top: "25%"}} value={settings.darkMode} onValueChange={settings.toggleDarkMode} />

      <Text style={{ color: settings.darkMode ? colors.white : colors.black, marginTop: 20, position: "absolute", top: "30%" }}>Font Size</Text>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 10, position: "absolute", top: "35%"}}>
        <TouchableOpacity 
          onPress={() => settings.setFontSize(Math.max(12, settings.fontSize - 1))} 
          style={{ padding: 10, backgroundColor: '#ddd', borderRadius: 5, marginHorizontal: 10 }}>
          <Text style={{ fontSize: 18 }}>➖</Text>
        </TouchableOpacity>

        <Text style={{ fontSize: 18, color: settings.darkMode ? colors.white : colors.black }}>{settings.fontSize}</Text>

        <TouchableOpacity 
          onPress={() => settings.setFontSize(Math.min(24, settings.fontSize + 1))} 
          style={{ padding: 10, backgroundColor: '#ddd', borderRadius: 5, marginHorizontal: 10 }}>
          <Text style={{ fontSize: 18 }}>➕</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default SettingsScreen;

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
    alignItems: 'center', 
    justifyContent: 'center'
  },
  textContainer: {
    flex: 1,
    width: '100%',
    alignItems: "center",
  },
  text: {
      fontWeight: 'bold',
      position: "absolute",
      top: "5%",
      fontSize: 30,
      textDecorationLine: "underline"
  },
  logoutButton: {
    position: 'absolute',
    top: 350,
    backgroundColor: 'red',
    borderRadius: 8,
    paddingVertical: 15,
    paddingHorizontal: 50, 
    minWidth: 150,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
})
