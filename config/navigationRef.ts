import { createNavigationContainerRef } from '@react-navigation/native';

export type RootStackParamList = {
  Home: undefined;
  Shop: undefined;
  'Create Task': undefined;
  Friends: undefined;
  Stats: undefined;
  Settings: undefined;
  ForgotPass: undefined;
  Welcome: undefined;
};

export const navigationRef = createNavigationContainerRef<RootStackParamList>();