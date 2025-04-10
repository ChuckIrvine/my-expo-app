import { useState, useEffect } from 'react';
import { Text } from 'react-native'; // Add this import
import { Provider as PaperProvider, BottomNavigation } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from './supabase';
import LoginScreen from './components/LoginScreen'; // Adjust path
import ItemsScreen from './components/ItemsScreen'; // Adjust path
import UsersScreen from './components/UsersScreen'; // Adjust path

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [index, setIndex] = useState(0);
  const [routes] = useState([
    { key: 'items', title: 'Items', focusedIcon: 'format-list-bulleted' },
    { key: 'users', title: 'Users', focusedIcon: 'account-group' },
  ]);

  const renderScene = BottomNavigation.SceneMap({
    items: () => <ItemsScreen onLogout={logOut} />,
    users: UsersScreen,
  });

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });
    supabase.auth.onAuthStateChange((_event, session) => setUser(session?.user ?? null));
  }, []);

  async function signUp({ email, password }) {
    return await supabase.auth.signUp({ email, password });
  }

  async function logIn({ email, password }) {
    return await supabase.auth.signInWithPassword({ email, password });
  }

  async function logOut() {
    await supabase.auth.signOut();
  }

  if (loading) return (
    <PaperProvider>
      <SafeAreaView style={{ flex: 1, padding: 20 }}>
        <Text>Loading...</Text>
      </SafeAreaView>
    </PaperProvider>
  );

  if (!user) {
    return (
      <PaperProvider>
        <LoginScreen onLogin={logIn} onSignUp={signUp} />
      </PaperProvider>
    );
  }

  return (
    <PaperProvider>
      <BottomNavigation
        navigationState={{ index, routes }}
        onIndexChange={setIndex}
        renderScene={renderScene}
      />
    </PaperProvider>
  );
}