import { Tabs } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { theme } from '@/config/theme';
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function TabLayout() {
  const [isAdmin, setIsAdmin] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem('current_user').then((userStr) => {
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          const email = (user.email || '').toLowerCase();
          const role = (user.role || '').toLowerCase();
          if (email !== 'muh.serkanozgur@gmail.com' && role !== 'admin' && role !== 'yonetici') {
            setIsAdmin(false);
          }
        } catch {}
      }
    });
  }, []);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textSecondary,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.surfaceVariant,
        },
        headerStyle: {
          backgroundColor: theme.colors.surface,
        },
        headerTintColor: theme.colors.textPrimary,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="view-dashboard" size={24} color={color as string} />
          ),
        }}
      />
      {isAdmin && (
        <Tabs.Screen
          name="transactions"
          options={{
            title: 'İşlemler',
            tabBarIcon: ({ color }) => (
              <MaterialCommunityIcons name="cash-multiple" size={24} color={color as string} />
            ),
          }}
        />
      )}
      <Tabs.Screen
        name="invoices"
        options={{
          title: 'Faturalar',
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="file-document" size={24} color={color as string} />
          ),
        }}
      />
      <Tabs.Screen
        name="contacts"
        options={{
          title: 'Cariler',
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="account-group" size={24} color={color as string} />
          ),
        }}
      />
      {isAdmin && (
        <Tabs.Screen
          name="checks"
          options={{
            title: 'Çek/Senet',
            tabBarIcon: ({ color }) => (
              <MaterialCommunityIcons name="checkbook" size={24} color={color as string} />
            ),
          }}
        />
      )}
      <Tabs.Screen
        name="more"
        options={{
          title: 'Daha Fazla',
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="menu" size={24} color={color as string} />
          ),
        }}
      />
    </Tabs>
  );
}
