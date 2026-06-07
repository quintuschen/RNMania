import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { Text } from 'react-native'
import { useAuthStore } from '../store/authStore'
import { LoginScreen } from '../screens/LoginScreen'
import { DashboardScreen } from '../screens/DashboardScreen'
import { PayeesScreen } from '../screens/payees/PayeesScreen'
import { AddPayeeScreen } from '../screens/payees/AddPayeeScreen'
import { EditPayeeScreen } from '../screens/payees/EditPayeeScreen'

// MIGRATION NOTE:
// Web used React Router (<Routes>, <Route>, <Navigate>).
// RN uses React Navigation: NavigationContainer + Stack/Tab navigators.
// Route guards (RequireAuth) become conditional navigator rendering.

export type RootStackParamList = {
  Login: undefined
  App: undefined
}

export type AppStackParamList = {
  Tabs: undefined
  AddPayee: undefined
  EditPayee: { id: string }
}

export type TabParamList = {
  Dashboard: undefined
  Payees: undefined
}

const Root = createNativeStackNavigator<RootStackParamList>()
const App = createNativeStackNavigator<AppStackParamList>()
const Tab = createBottomTabNavigator<TabParamList>()

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#2563eb',
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{ tabBarLabel: 'Dashboard', tabBarIcon: ({ color }) => <Text style={{ fontSize: 18, color }}>▦</Text> }}
      />
      <Tab.Screen
        name="Payees"
        component={PayeesScreen as any}
        options={{ tabBarLabel: 'Payees', tabBarIcon: ({ color }) => <Text style={{ fontSize: 18, color }}>⊕</Text> }}
      />
    </Tab.Navigator>
  )
}

function AppNavigator() {
  return (
    <App.Navigator>
      <App.Screen name="Tabs" component={TabNavigator} options={{ headerShown: false }} />
      <App.Screen name="AddPayee" component={AddPayeeScreen} options={{ title: 'Add Payee' }} />
      <App.Screen name="EditPayee" component={EditPayeeScreen} options={{ title: 'Edit Payee' }} />
    </App.Navigator>
  )
}

export function RootNavigator() {
  const token = useAuthStore(s => s.token)

  return (
    <NavigationContainer>
      <Root.Navigator screenOptions={{ headerShown: false }}>
        {token ? (
          <Root.Screen name="App" component={AppNavigator} />
        ) : (
          <Root.Screen name="Login" component={LoginScreen} />
        )}
      </Root.Navigator>
    </NavigationContainer>
  )
}
