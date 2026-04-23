import 'react-native-gesture-handler';
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import HomeScreen from './src/screens/HomeScreen';
import InterviewScreen from './src/screens/InterviewScreen';
import SummaryScreen from './src/screens/SummaryScreen';
import { theme } from './src/theme';

const Stack = createNativeStackNavigator();

const navTheme = {
  dark: true,
  colors: {
    primary: theme.colors.brand,
    background: theme.colors.bg,
    card: theme.colors.bgElev,
    text: theme.colors.text,
    border: theme.colors.border,
    notification: theme.colors.brand,
  },
};

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <NavigationContainer theme={navTheme}>
        <Stack.Navigator
          screenOptions={{
            headerStyle: { backgroundColor: theme.colors.bg },
            headerTintColor: theme.colors.text,
            headerTitleStyle: { fontWeight: '700' },
            contentStyle: { backgroundColor: theme.colors.bg },
          }}
        >
          <Stack.Screen
            name="Home"
            component={HomeScreen}
            options={{ title: 'AI Interview Coach' }}
          />
          <Stack.Screen
            name="Interview"
            component={InterviewScreen}
            options={{ title: 'Interview' }}
          />
          <Stack.Screen
            name="Summary"
            component={SummaryScreen}
            options={{ title: 'Report', headerBackVisible: false }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
