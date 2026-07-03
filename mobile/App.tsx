import { StatusBar } from "expo-status-bar";
import { Text } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "./contexts/AuthContext";
import MapScreen from "./screens/MapScreen";
import GuestbookScreen from "./screens/GuestbookScreen";
import ProfileScreen from "./screens/ProfileScreen";
import BenchDetailScreen from "./screens/BenchDetailScreen";
import { colors } from "./lib/theme";
import type { RootStackParamList } from "./navigation/types";

const queryClient = new QueryClient();
const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator();

// Emoji tab icons keep the POC free of an icon-font dependency; swap for
// @expo/vector-icons in the phase 5 polish pass.
const tabIcon = (emoji: string) =>
  ({ focused }: { focused: boolean }) => (
    <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.45 }}>{emoji}</Text>
  );

function Tabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.mutedText,
        headerStyle: { backgroundColor: colors.background },
        headerTitleStyle: { color: colors.text },
      }}
    >
      <Tab.Screen
        name="Mappa"
        component={MapScreen}
        options={{ headerShown: false, tabBarIcon: tabIcon("🗺️") }}
      />
      <Tab.Screen
        name="Guestbook"
        component={GuestbookScreen}
        options={{ tabBarIcon: tabIcon("📖") }}
      />
      <Tab.Screen
        name="Profilo"
        component={ProfileScreen}
        options={{ tabBarIcon: tabIcon("👤") }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <NavigationContainer>
          <Stack.Navigator>
            <Stack.Screen name="Tabs" component={Tabs} options={{ headerShown: false }} />
            <Stack.Screen
              name="BenchDetail"
              component={BenchDetailScreen}
              options={{
                title: "Panchina",
                headerStyle: { backgroundColor: colors.background },
                headerTintColor: colors.primary,
                headerTitleStyle: { color: colors.text },
              }}
            />
          </Stack.Navigator>
        </NavigationContainer>
        <StatusBar style="dark" />
      </AuthProvider>
    </QueryClientProvider>
  );
}
