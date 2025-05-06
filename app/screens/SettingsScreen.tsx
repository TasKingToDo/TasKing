import React, { useState, useContext } from 'react';
import {
  Text, View, Switch, TouchableOpacity, StyleSheet, TextInput,
  KeyboardAvoidingView, Platform, ScrollView, TouchableWithoutFeedback, Keyboard
} from 'react-native';
import { getAuth, signOut, updatePassword, EmailAuthProvider, reauthenticateWithCredential, deleteUser } from 'firebase/auth';
import { getFirestore, doc, updateDoc, deleteDoc } from 'firebase/firestore';

import { SettingsContext } from '@/config/SettingsContext';
import useTheme from '@/config/useTheme';
import { themes } from '@/config/colors';
import PressableButton from '@/config/PressableButton';

const SettingsScreen = ({ navigation }) => {
  const settings = useContext(SettingsContext);
  const colors = useTheme();
  const auth = getAuth();
  const db = getFirestore();

  const [deleteMode, setDeleteMode] = useState(false); // whether user is attempting deletion
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteError, setDeleteError] = useState('');
  const [deleteCountdown, setDeleteCountdown] = useState(5); // seconds
  const [deleteConfirmEnabled, setDeleteConfirmEnabled] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [showAccount, setShowAccount] = useState(false);

  const [newUsername, setNewUsername] = useState('');
  const [usernameCurrentPassword, setUsernameCurrentPassword] = useState('');

  const [newPassword, setNewPassword] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');

  const [loadingUsername, setLoadingUsername] = useState(false);
  const [loadingPassword, setLoadingPassword] = useState(false);

  const [usernameError, setUsernameError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  React.useEffect(() => {
    if (successMessage || usernameError || passwordError) {
      const timer = setTimeout(() => {
        setSuccessMessage('');
        setUsernameError('');
        setPasswordError('');
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [successMessage, usernameError, passwordError]);

  React.useEffect(() => {
    if (deleteMode && !deleteConfirmEnabled) {
      setDeleteError('');
      setDeleteCountdown(5);
      const interval = setInterval(() => {
        setDeleteCountdown((sec) => {
          if (sec <= 1) {
            clearInterval(interval);
            setDeleteConfirmEnabled(true);
            return 0;
          }
          return sec - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    } else if (!deleteMode) {
      setDeleteConfirmEnabled(false);
      setDeleteCountdown(5);
    }
  }, [deleteMode]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      alert("See you soon! You've got this.");
    } catch (error) {
      alert('Logout failed.');
      console.error('Logout failed:', error);
    }
  };

  const handleDeleteAccount = async () => {
    setDeleteError('');
    setIsDeleting(true);
    try {
      const user = auth.currentUser;
      if (user && user.email) {
        const credential = EmailAuthProvider.credential(user.email, deletePassword);
        await reauthenticateWithCredential(user, credential);
  
        const userRef = doc(db, 'users', user.uid);
        await deleteDoc(userRef);
  
        await deleteUser(user);
  
        alert('Account deleted');
        navigation.reset({
          index: 0,
          routes: [{ name: "Welcome" }]
        });
      }
    } catch (err) {
      if (err.code === 'auth/wrong-password') setDeleteError('Incorrect password.');
      else setDeleteError('Failed to delete account. ' + (err.message || ''));
      setIsDeleting(false);
    }
  };
  

  const reauthenticate = async (email, plainPassword, errorCb) => {
    try {
      const credential = EmailAuthProvider.credential(email, plainPassword);
      await reauthenticateWithCredential(auth.currentUser, credential);
      return true;
    } catch (err) {
      if (errorCb) errorCb(err);
      return false;
    }
  };

  const handleUsernameUpdate = async () => {
    setUsernameError('');
    setSuccessMessage('');
    if (!newUsername.trim()) {
      setUsernameError('Username cannot be empty.');
      return;
    }
    setLoadingUsername(true);
    try {
      const user = auth.currentUser;
      if (user && user.email) {
        const ok = await reauthenticate(
          user.email,
          usernameCurrentPassword,
          () => setUsernameError('Current password incorrect.')
        );
        if (!ok) {
          setLoadingUsername(false);
          return;
        }
        const userRef = doc(db, 'users', user.uid);
        await updateDoc(userRef, { username: newUsername });
        setSuccessMessage("Username updated!");
        setNewUsername('');
        setUsernameCurrentPassword('');
      }
    } catch (error) {
      setUsernameError('Failed to update username.');
      console.error(error);
    }
    setLoadingUsername(false);
  };

  const handlePasswordUpdate = async () => {
    setPasswordError('');
    setSuccessMessage('');
    if (!newPassword) {
      setPasswordError('New password cannot be empty.');
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters.');
      return;
    }
    setLoadingPassword(true);
    try {
      const user = auth.currentUser;
      if (user && user.email) {
        const ok = await reauthenticate(
          user.email,
          currentPassword,
          () => setPasswordError('Current password incorrect.')
        );
        if (!ok) {
          setLoadingPassword(false);
          return;
        }
        await updatePassword(user, newPassword);
        setSuccessMessage('Password updated!');
        setNewPassword('');
        setCurrentPassword('');
      }
    } catch (error) {
      setPasswordError('Failed to update password.');
      console.error(error);
    }
    setLoadingPassword(false);
  };

  if (!settings) return null;

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          <View style={[styles.background, { backgroundColor: colors.white }]}>

            <View style={styles.headerContainer}>
              <View style={{ position: 'absolute', left: 15, top: Platform.OS === 'ios' ? 50 : 30, backgroundColor: colors.secondary, borderRadius: 3 }}>
                <PressableButton onPress={() => navigation.goBack()} haptic style={styles.backButton}>
                  <Text style={{color: themes.light.white, fontWeight: 'bold', fontSize: 14}}>BACK</Text>
                </PressableButton>
              </View>
              <View style={{ flex: 1, alignItems: 'center' }}>
                <Text style={[styles.headerText, { color: colors.black }]}>Your Settings</Text>
              </View>
            </View>

            <View style={styles.toggleContainer}>
              <Text style={[styles.label, { color: colors.black }]}>Dark Mode</Text>
              <Switch
                value={settings.darkMode}
                onValueChange={settings.toggleDarkMode}
              />
            </View>

            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
              <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>

            <View style={[
                styles.accountMenuContainer,
                { backgroundColor: colors.white, borderColor: colors.primarySoft, borderWidth: 1 }
              ]}>
                <TouchableOpacity
                  style={[
                    styles.accountMenuButton,
                    { backgroundColor: colors.primarySoft }
                  ]}
                  onPress={() => setShowAccount(!showAccount)}
                >
                  <Text style={[styles.accountMenuText, { color: colors.black }]}>
                    Account Settings
                  </Text>
                  <Text style={{ fontSize: 18, color: colors.black }}>
                    {showAccount ? '▲' : '▼'}
                  </Text>
                </TouchableOpacity>

              {showAccount && (
                <View>
                  <View style={styles.changeContainer}>
                    <Text style={[styles.changeText, { color: colors.black }]}>Change Username</Text>
                    <TextInput
                      style={[
                        styles.input,
                        {
                          color: colors.black,
                          borderColor: colors.black,
                          backgroundColor: colors.white || 'transparent',
                        },
                      ]}
                      placeholder="New Username"
                      placeholderTextColor={colors.grey || colors.black + '99'}
                      value={newUsername}
                      onChangeText={setNewUsername}
                      editable={!loadingUsername}
                      autoCapitalize="none"
                    />
                    <TextInput
                      style={[
                        styles.input,
                        {
                          color: colors.black,
                          borderColor: colors.black,
                          backgroundColor: colors.white || 'transparent',
                        },
                      ]}
                      placeholder="New Password"
                      placeholderTextColor={colors.grey || colors.black + '99'}
                      value={usernameCurrentPassword}
                      onChangeText={setUsernameCurrentPassword}
                      secureTextEntry
                      editable={!loadingUsername}
                    />
                    <TouchableOpacity
                      style={[styles.button, { backgroundColor: colors.primary, opacity: loadingUsername ? 0.6 : 1 }]}
                      onPress={handleUsernameUpdate}
                      disabled={loadingUsername}
                    >
                      <Text style={styles.buttonText}>
                        {loadingUsername ? "Updating..." : "Update Username"}
                      </Text>
                    </TouchableOpacity>
                    {usernameError ? (
                      <Text style={styles.errorText}>{usernameError}</Text>
                    ) : null}
                  </View>

                  <View style={styles.changeContainer}>
                    <Text style={[styles.changeText, { color: colors.black }]}>Change Password</Text>
                    <TextInput
                      style={[
                        styles.input,
                        {
                          color: colors.black,
                          borderColor: colors.black,
                          backgroundColor: colors.white || 'transparent',
                        },
                      ]}
                      placeholder="Current Password"
                      placeholderTextColor={colors.grey || colors.black + '99'}
                      value={currentPassword}
                      onChangeText={setCurrentPassword}
                      secureTextEntry
                      editable={!loadingPassword}
                    />
                    <TextInput
                      style={[
                        styles.input,
                        {
                          color: colors.black,
                          borderColor: colors.black,
                          backgroundColor: colors.white || 'transparent',
                        },
                      ]}
                      placeholder="New Password"
                      placeholderTextColor={colors.grey || colors.black + '99'}
                      value={newPassword}
                      onChangeText={setNewPassword}
                      secureTextEntry
                      editable={!loadingPassword}
                    />
                    <TouchableOpacity
                      style={[styles.button, { backgroundColor: colors.primary, opacity: loadingPassword ? 0.6 : 1 }]}
                      onPress={handlePasswordUpdate}
                      disabled={loadingPassword}
                    >
                      <Text style={styles.buttonText}>
                        {loadingPassword ? "Updating..." : "Update Password"}
                      </Text>
                    </TouchableOpacity>
                    {passwordError ? (
                      <Text style={styles.errorText}>{passwordError}</Text>
                    ) : null}
                  </View>

                  <View style={{marginTop: 40, alignItems: 'center'}}>
                    <TouchableOpacity
                      style={[{
                        backgroundColor: colors.decline,
                        paddingVertical: 10,
                        paddingHorizontal: 15,
                        borderRadius: 8,
                        marginBottom: 8,
                        opacity: deleteMode ? 0.6 : 1,
                      }]}
                      onPress={() => setDeleteMode(true)}
                      disabled={deleteMode}
                    >
                      <Text style={{color: 'white', fontWeight: 'bold', fontSize: 16}}>Delete Account</Text>
                    </TouchableOpacity>

                    {deleteMode && (
                      <View style={{ width: 260, marginTop: 6, alignItems: 'center' }}>
                        <Text style={{ color: colors.black, marginBottom: 8, textAlign: 'center', fontWeight: 'bold' }}>
                          Type your password to confirm deletion. This is permanent!
                        </Text>
                        <TextInput
                          style={[
                            styles.input,
                            {
                              color: colors.black,
                              borderColor: colors.black,
                              backgroundColor: colors.white,
                              marginBottom: 8,
                            }
                          ]}
                          placeholder="Current password"
                          placeholderTextColor={colors.grey}
                          secureTextEntry
                          value={deletePassword}
                          onChangeText={setDeletePassword}
                          editable={!isDeleting}
                        />

                        {!deleteConfirmEnabled && (
                          <Text style={{ color: colors.black, marginBottom: 4 }}>
                            Hold on… Enabling in {deleteCountdown} second{deleteCountdown!==1?'s':''}…
                          </Text>
                        )}

                        <TouchableOpacity
                          style={{
                            backgroundColor: deleteConfirmEnabled ? colors.decline : colors.decline + "88",
                            paddingVertical: 12,
                            paddingHorizontal: 25,
                            borderRadius: 8,
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: 200,
                            opacity: isDeleting ? 0.7 : 1,
                            marginBottom: 4,
                          }}
                          onPress={handleDeleteAccount}
                          disabled={!deleteConfirmEnabled || isDeleting}
                        >
                          <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}>
                            {isDeleting ? "Deleting…" : "CONFIRM DELETE"}
                          </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={{marginTop: 4}}
                          onPress={() => { setDeleteMode(false); setDeletePassword(''); setDeleteError(''); }}
                          disabled={isDeleting}
                        >
                          <Text style={{ color: colors.black, textDecorationLine: 'underline' }}>Cancel</Text>
                        </TouchableOpacity>
                        {deleteError !== '' &&
                          <Text style={{ color: 'red', marginTop: 4, textAlign: 'center' }}>
                            {deleteError}
                          </Text>
                        }
                      </View>
                    )}
                  </View>


                  {successMessage ? (
                    <Text style={[styles.successText, { color: 'green', textAlign: 'center', marginTop: 10 }]}>{successMessage}</Text>
                  ) : null}
                </View>
              )}
            </View>

          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

export default SettingsScreen;

const styles = StyleSheet.create({
  background: { flex: 1, alignItems: 'center' },
  backButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  headerContainer: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    width: '100%', paddingHorizontal: 15, paddingTop: Platform.OS === 'ios' ? 50 : 30, position: 'relative',
  },
  headerText: { fontSize: 26, fontWeight: 'bold', },
  label: { fontSize: 18, },
  logoutButton: {
    backgroundColor: 'red', borderRadius: 8, paddingVertical: 15, paddingHorizontal: 50,
    minWidth: 150, alignItems: 'center', justifyContent: 'center',
  },
  logoutText: {
    color: 'white', fontSize: 18, fontWeight: 'bold', textAlign: 'center',
  },
  // For both change forms inside menu
  changeContainer: {
    alignItems: 'center',
    marginTop: 30,
  },
  changeText: { fontSize: 18, marginBottom: 10, },
  input: {
    width: 250, height: 50, borderWidth: 1, borderRadius: 10,
    paddingHorizontal: 15, fontSize: 18, marginBottom: 12,
  },
  button: {
    paddingVertical: 15, paddingHorizontal: 25,
    borderRadius: 8, alignItems: 'center', justifyContent: 'center',
    minWidth: 180,
  },
  buttonText: { color: 'white', fontSize: 18, fontWeight: 'bold', },
  toggleContainer: {
    alignItems: 'center', justifyContent: 'space-between', width: '80%', marginBottom: 20,
  },
  accountMenuContainer: {
    marginTop: 35,
  marginBottom: 15,
  borderRadius: 10,
  overflow: 'hidden',
  alignSelf: 'center',
  },
    accountMenuButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 15,
      paddingHorizontal: 16,
      
    },
  accountMenuText: {
    fontSize: 18, fontWeight: 'bold',
  },
  errorText: {
    color: 'red', fontSize: 15, marginTop: 6, minHeight: 20, textAlign: 'center',
  },
  successText: {
    fontSize: 15, minHeight: 20,
  }
});
