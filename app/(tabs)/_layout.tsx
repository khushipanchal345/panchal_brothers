import { Tabs } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';
import { Home, Search, ShoppingBag, Heart, User } from 'lucide-react-native';
import { useShop } from '@/contexts/ShopContext';
import { Colors, Typography } from '@/constants/theme';

function TabIcon({ icon: Icon, focused, badge }: { icon: any; focused: boolean; badge?: number }) {
  return (
    <View style={styles.iconWrap}>
      <Icon size={24} color={focused ? Colors.primary : Colors.textTertiary} strokeWidth={focused ? 2.5 : 1.8} />
      {badge && badge > 0 ? (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{badge > 9 ? '9+' : badge}</Text>
        </View>
      ) : null}
    </View>
  );
}

export default function TabLayout() {
  const { cartCount, wishlistCount } = useShop();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarShowLabel: true,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textTertiary,
        tabBarLabelStyle: styles.tabLabel,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ focused }) => <TabIcon icon={Home} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: 'Search',
          tabBarIcon: ({ focused }) => <TabIcon icon={Search} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="cart"
        options={{
          title: 'Cart',
          tabBarIcon: ({ focused }) => <TabIcon icon={ShoppingBag} focused={focused} badge={cartCount} />,
        }}
      />
      <Tabs.Screen
        name="wishlist"
        options={{
          title: 'Wishlist',
          tabBarIcon: ({ focused }) => <TabIcon icon={Heart} focused={focused} badge={wishlistCount} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Account',
          tabBarIcon: ({ focused }) => <TabIcon icon={User} focused={focused} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: Colors.surface,
    borderTopColor: Colors.border,
    borderTopWidth: 1,
    height: 60,
    paddingBottom: 8,
    paddingTop: 4,
  },
  tabLabel: {
    ...Typography.labelSmall,
    marginTop: 2,
  },
  iconWrap: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -8,
    backgroundColor: Colors.accent,
    borderRadius: 9,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    ...Typography.labelSmall,
    color: Colors.textInverse,
    fontSize: 9,
  },
});
