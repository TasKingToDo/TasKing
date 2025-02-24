import React, { useState, useContext } from 'react';
import { Button, Text, View, Switch, TouchableOpacity, StyleSheet, TextInput } from 'react-native';
import { SettingsContext } from '../config/SettingsContext';
import colors from '../config/colors';
import { getAuth, signOut, updatePassword } from 'firebase/auth';
import { getFirestore, doc, updateDoc } from 'firebase/firestore';

const SettingsScreen = ({ navigation }) => {
  const settings = useContext(SettingsContext);
  const auth = getAuth();
  const db = getFirestore();

  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const handleLogout = async () => {
    try {
      await signOut(auth);
      console.log('User logged out successfully');
      alert('User logged out successfully');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleUsernameUpdate = async () => {
    try {
      const user = auth.currentUser;
      if (user) {
        const userRef = doc(db, 'users', user.uid);
        await updateDoc(userRef, { username: newUsername });
        alert('Username updated successfully');
        console.log('Username updated successfully');
        setNewUsername('');
      }
    } catch (error) {
      console.error('Failed to update username:', error);
    }
  };

  const handlePasswordUpdate = async () => {
    try {
      const user = auth.currentUser;
      if (user) {
        await updatePassword(user, newPassword);
        alert('Password updated successfully');
        console.log('Password updated successfully');
        setNewPassword('');
      }
    } catch (error) {
      console.error('Failed to update password:', error);
    }
  };

  if (!settings) return null;

  return (
    <View style={[styles.background, { backgroundColor: settings.darkMode ? colors.black : colors.white }]}>
      <View style={styles.backButton}>
        <Button
          title="Back"
          color={settings.darkMode ? colors.secondary : colors.primary}
          onPress={() => navigation.navigate('Home')}
        />
      </View>
      <View style={styles.textContainer}>
        <Text style={[styles.text, { color: settings.darkMode ? colors.white : colors.black }]}>
          Your Settings
        </Text>
      </View>

      <Text style={[styles.label, { top: '20%', color: settings.darkMode ? colors.white : colors.black }]}>
        Dark Mode
      </Text>
      <Switch
        style={{ position: 'absolute', top: '25%' }}
        value={settings.darkMode}
        onValueChange={settings.toggleDarkMode}
      />

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>

      <View style={[styles.changeContainer, { top: '45%' }]}>
        <Text style={[styles.changeText, { color: settings.darkMode ? colors.white : colors.black }]}>
          Change Username
        </Text>
        <TextInput
          style={[
            styles.input,
            {
              color: settings.darkMode ? colors.white : colors.black,
              borderColor: settings.darkMode ? colors.white : colors.black,
            },
          ]}
          placeholder="New Username"
          placeholderTextColor={settings.darkMode ? colors.white : colors.black}
          value={newUsername}
          onChangeText={setNewUsername}
        />
        <TouchableOpacity style={styles.button} onPress={handleUsernameUpdate}>
          <Text style={styles.buttonText}>Update Username</Text>
        </TouchableOpacity>
      </View>

      <View style={[styles.changeContainer, { top: '65%' }]}>
        <Text style={[styles.changeText, { color: settings.darkMode ? colors.white : colors.black }]}>
          Change Password
        </Text>
        <TextInput
          style={[
            styles.input,
            {
              color: settings.darkMode ? colors.white : colors.black,
              borderColor: settings.darkMode ? colors.white : colors.black,
            },
          ]}
          placeholder="New Password"
          placeholderTextColor={settings.darkMode ? colors.white : colors.black}
          secureTextEntry
          value={newPassword}
          onChangeText={setNewPassword}
        />
        <TouchableOpacity style={styles.button} onPress={handlePasswordUpdate}>
          <Text style={styles.buttonText}>Update Password</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default SettingsScreen;

const styles = StyleSheet.create({
  background: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButton: {
    position: 'absolute',
    top: '1%',
    left: '2%',
    width: '20%',
    height: '7%',
  },
  textContainer: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
  },
  text: {
    fontWeight: 'bold',
    position: 'absolute',
    top: '5%',
    fontSize: 30,
    textDecorationLine: 'underline',
  },
  label: {
    position: 'absolute',
    fontSize: 18,
  },
  logoutButton: {
    position: 'absolute',
    top: '35%',
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
  changeContainer: {
    position: 'absolute',
    width: '80%',
    alignItems: 'center',
  },
  changeText: {
    fontSize: 18,
    marginBottom: 10,
  },
  input: {
    width: '100%',
    height: 50, 
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 15,
    fontSize: 18,
    marginBottom: 15,
  },
  button: {
    backgroundColor: colors.primary,
    paddingVertical: 15, 
    paddingHorizontal: 25,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 180, 
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
