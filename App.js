import React, { useEffect } from 'react';
import { Text, View, StyleSheet, Pressable } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createDrawerNavigator } from '@react-navigation/drawer';
import * as Notifications from "expo-notifications"
import * as Permissions from "expo-permissions"

const Drawer = createDrawerNavigator();
const Tab = createBottomTabNavigator();

// Show notifications when the app is in the foreground
Notifications.setNotificationHandler({
  handleNotification: async () => {
    return {
      shouldShowAlert: true,
    }
  },
})

Notifications.addListener(this._handleNotification);

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

const TabNavigator = () => {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Tab1" options={{headerShown: false }} component={TabOneScreen} />
      <Tab.Screen name="Tab2" options={{headerShown: false }} component={TabTwoScreen} />
    </Tab.Navigator>
  );
};

export default function App () {
  useEffect(() => {
    // Permission for iOS
    Permissions.getAsync(Permissions.NOTIFICATIONS)
      .then(statusObj => {
        // Check if we already have permission
        if (statusObj.status !== "granted") {
          // If permission is not there, ask for the same
          return Permissions.askAsync(Permissions.NOTIFICATIONS)
        }
        return statusObj
      })
      .then(statusObj => {
        // If permission is still not given throw error
        if (statusObj.status !== "granted") {
          throw new Error("Permission not granted")
        }
      })
      .catch(err => {
        return null
      })
  }, [])

  const triggerLocalNotificationHandler = (msg) => {
    Notifications.scheduleNotificationAsync({
      content: {
        title: "JokeApp",
        body: msg,
      },
      trigger: { seconds: 1 },
    })
  }

  return (
    <NavigationContainer>
      <Drawer.Navigator initialRouteName="JokeApp" drawerContent={props => {
          return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
              <Pressable style={styles.button} onPress={async () => {
                props.navigation.navigate("JokeApp")
                fetch("https://v2.jokeapi.dev/joke/Any?type=twopart", {
                  methodq: "GET",
                  headers: {
                    "Accept": "application/json",
                    "Content-Type": "application/json"
                  }}).then(res => res.json()).then(res => {
                    triggerLocalNotificationHandler(res.setup);
                  })
                }}> 
              <Text style={styles.text}> Show me a joke</Text>
              </Pressable>
            </View>
          )
        }}>
        <Drawer.Screen name="JokeApp" component={TabNavigator} />
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
