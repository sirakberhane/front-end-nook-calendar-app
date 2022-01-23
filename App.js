import React, { useEffect } from 'react';
import { Text, View, StyleSheet, Pressable } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createStackNavigator } from "@react-navigation/stack";
import * as Notifications from 'expo-notifications';
import * as Permissions from 'expo-permissions';
import { Ionicons } from '@expo/vector-icons';
const Drawer = createDrawerNavigator();
const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Show notifications when the app is in the foreground
Notifications.setNotificationHandler({
  handleNotification: async () => {
    return {
      shouldShowAlert: true,
    };
  },
});

const TabOneScreen = () => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    <Text>Tab 1</Text>
  </View>
);

const TabTwoScreen = () => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    <Text>Tab 2</Text>
  </View>
);

function Delivery({ delivery }) {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>{delivery} </Text>
    </View>
  );
}

const MainStackNavigator = ({ route }) => {
  return (
    <Stack.Navigator screenOptions={({ navigation, route }) => ({
      headerLeft: (props) => {
        return (
          <Ionicons
            name="ios-arrow-back"
            size={28}
            style={{ marginLeft: 15 }}
            type={'Ionicons'}
            onPress={() => navigation.navigate("JokeApp")}
          />);
      }
    })}>
      <Stack.Screen name="Delivery" options={{ gesturesEnabled: false }} component={() => <Delivery delivery={route.params.delivery} />} />
    </Stack.Navigator>
  );
}

const TabNavigator = () => {
  return (
    <Tab.Navigator>
      <Tab.Screen
        name="Tab1"
        options={{ headerShown: false, gesturesEnabled: false }}
        component={TabOneScreen}
      />
      <Tab.Screen
        name="Tab2"
        options={{ headerShown: false, gesturesEnabled: false }}
        component={TabTwoScreen}
      />
    </Tab.Navigator>
  );
};

function App() {
  useEffect(() => {
    Permissions.getAsync(Permissions.NOTIFICATIONS).then((statusObj) => {
      // Check if we already have permission
      if (statusObj.status !== 'granted') {
        // If permission is not there, ask for the same
        return Permissions.askAsync(Permissions.NOTIFICATIONS);
      }
      return statusObj;
    }).then((statusObj) => {
      // If permission is still not given throw error
      if (statusObj.status !== 'granted') {
        throw new Error('Permission not granted');
      }
    }).catch((err) => {
      return null;
    });
  }, []);

  return (
    <NavigationContainer>
      <Drawer.Navigator initialRouteName="JokeApp" options={{ gesturesEnabled: false }} drawerContent={(props) => {
        return (
          <View
            style={{
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <Pressable
              style={styles.button}
              onPress={async () => {
                props.navigation.navigate("JokeApp");
                fetch('https://v2.jokeapi.dev/joke/Any?type=twopart', {
                  methodq: 'GET',
                  headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                  },
                }).then((res) => res.json()).then((res) => {
                  Notifications.scheduleNotificationAsync({
                    content: {
                      title: 'JokeApp',
                      body: res.setup,
                      data: { data: res },
                    },
                    trigger: { seconds: 1 },
                  });
                  Notifications.addNotificationResponseReceivedListener((response) => {
                    props.navigation.navigate("Delivery", { delivery: String(response.notification.request.content.data.data.delivery) });
                  });
                });
              }}>
              <Text style={styles.text}>Show me a joke</Text>
            </Pressable>
          </View>)
      }}>
        <Drawer.Screen name="JokeApp" component={TabNavigator} />
        <Drawer.Screen name="Delivery" options={{ headerShown: false, gesturesEnabled: false }} component={MainStackNavigator} />
      </Drawer.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 4,
    elevation: 3,
    backgroundColor: 'black',
  },
  text: {
    fontSize: 16,
    lineHeight: 21,
    fontWeight: 'bold',
    letterSpacing: 0.25,
    color: 'white',
  },
});

export default App;
