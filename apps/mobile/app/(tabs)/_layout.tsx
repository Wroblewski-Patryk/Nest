import React from 'react';
import { Pressable, StyleSheet, View, type GestureResponderEvent } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { mobileUiTokens } from '@/constants/uiTokens';

type TabIconName =
  | 'list-alt'
  | 'checklist'
  | 'flag'
  | 'menu-book'
  | 'calendar-today'
  | 'insights'
  | 'credit-card'
  | 'eco';

function TabIcon({ name, color, size = 21 }: { name: TabIconName; color: string; size?: number }) {
  return <MaterialIcons name={name} color={color} size={size} />;
}

function SeedlingButton({
  onPress,
  accessibilityState,
}: {
  onPress?: (event: GestureResponderEvent) => void;
  accessibilityState?: { selected?: boolean };
}) {
  const focused = Boolean(accessibilityState?.selected);

  return (
    <Pressable onPress={onPress} style={styles.seedlingWrap}>
      <View style={[styles.seedlingButton, focused && styles.seedlingButtonFocused]}>
        <TabIcon name="eco" color={focused ? '#ffffff' : mobileUiTokens.ink} size={24} />
      </View>
    </Pressable>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: mobileUiTokens.accent,
        tabBarInactiveTintColor: mobileUiTokens.muted,
        tabBarItemStyle: styles.tabItem,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Tasks',
          tabBarIcon: ({ color }) => <TabIcon name="list-alt" color={color} />,
          tabBarButton: (props) => (
            <SeedlingButton
              onPress={props.onPress}
              accessibilityState={props.accessibilityState}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="habits"
        options={{
          title: 'Habits',
          tabBarIcon: ({ color }) => <TabIcon name="checklist" color={color} />,
        }}
      />
      <Tabs.Screen
        name="goals"
        options={{
          title: 'Goals',
          tabBarIcon: ({ color }) => <TabIcon name="flag" color={color} />,
        }}
      />
      <Tabs.Screen
        name="journal"
        options={{
          title: 'Journal',
          tabBarIcon: ({ color }) => <TabIcon name="menu-book" color={color} />,
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          title: 'Calendar',
          tabBarIcon: ({ color }) => <TabIcon name="calendar-today" color={color} />,
        }}
      />
      <Tabs.Screen
        name="insights"
        options={{
          title: 'Insights',
          tabBarIcon: ({ color }) => <TabIcon name="insights" color={color} />,
        }}
      />
      <Tabs.Screen
        name="billing"
        options={{
          title: 'Billing',
          tabBarIcon: ({ color }) => <TabIcon name="credit-card" color={color} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    left: 14,
    right: 14,
    bottom: 18,
    height: 74,
    borderRadius: 26,
    borderTopWidth: 0,
    backgroundColor: 'rgba(253,252,248,0.93)',
    paddingHorizontal: 12,
    paddingTop: 12,
    shadowColor: '#4B3F34',
    shadowOpacity: 0.12,
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 18,
    elevation: 10,
  },
  tabItem: {
    height: 48,
  },
  seedlingWrap: {
    top: -18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  seedlingButton: {
    width: 58,
    height: 58,
    borderRadius: 29,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.9)',
    backgroundColor: mobileUiTokens.accentSoft,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#4B3F34',
    shadowOpacity: 0.18,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 12,
    elevation: 8,
  },
  seedlingButtonFocused: {
    backgroundColor: mobileUiTokens.accent,
  },
});
