import { useState, useEffect } from 'react';
import { FlatList, StyleSheet, Alert, View } from 'react-native';
import { Provider as PaperProvider, Title, TextInput, Button, Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from './supabase';

export default function App() {
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [items, setItems] = useState([]);
  const [newItem, setNewItem] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
      if (session) fetchItems();
    });
    supabase.auth.onAuthStateChange((_event, session) => setUser(session?.user ?? null));
  }, []);

  async function fetchItems() {
    const { data, error } = await supabase.from('items').select('*');
    if (error) console.error(error);
    else setItems(data);
  }

  async function signUp() {
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) Alert.alert('Error', error.message);
    else Alert.alert('Success', 'Check your email to confirm!');
  }

  async function logIn() {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) Alert.alert('Error', error.message);
    else fetchItems();
  }

  async function logOut() {
    await supabase.auth.signOut();
    setItems([]);
    setNewItem('');
  }

  async function addItem() {
    if (!newItem) return;
    const { error } = await supabase.from('items').insert({ name: newItem });
    if (error) console.error(error);
    else { setNewItem(''); fetchItems(); }
  }

  async function deleteItem(id) {
    const { error } = await supabase.from('items').delete().eq('id', id);
    if (error) console.error(error);
    else fetchItems();
  }

  async function updateItem(id) {
    if (!editText) return;
    const { error } = await supabase.from('items').update({ name: editText }).eq('id', id);
    if (error) console.error(error);
    else { setEditingId(null); setEditText(''); fetchItems(); }
  }

  if (loading) return (
    <PaperProvider>
      <SafeAreaView style={styles.container}>
        <Title>Loading...</Title>
      </SafeAreaView>
    </PaperProvider>
  );

  if (!user) {
    return (
      <PaperProvider>
        <SafeAreaView style={styles.container}>
          <Title>{isSignUp ? 'Sign Up' : 'Log In'}</Title>
          <TextInput
            mode="outlined"
            label="Email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            style={styles.input}
          />
          <TextInput
            mode="outlined"
            label="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoCapitalize="none"
            style={styles.input}
          />
          <Button mode="contained" onPress={isSignUp ? signUp : logIn} style={styles.button}>
            {isSignUp ? 'Sign Up' : 'Log In'}
          </Button>
          <Button mode="text" onPress={() => setIsSignUp(!isSignUp)}>
            Switch to {isSignUp ? 'Log In' : 'Sign Up'}
          </Button>
        </SafeAreaView>
      </PaperProvider>
    );
  }

  return (
    <PaperProvider>
      <SafeAreaView style={styles.container}>
        <Title>Items List</Title>
        <Button mode="text" onPress={logOut}>Log Out</Button>
        <TextInput
          mode="outlined"
          label="Add new item"
          value={newItem}
          onChangeText={setNewItem}
          style={styles.input}
        />
        <Button mode="contained" onPress={addItem} style={styles.button}>Add</Button>
        <FlatList
          data={items}
          keyExtractor={item => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.itemRow}>
              {editingId === item.id ? (
                <>
                  <TextInput
                    mode="outlined"
                    value={editText}
                    onChangeText={setEditText}
                    autoFocus
                    style={styles.itemInput}
                  />
                  <Button mode="contained" onPress={() => updateItem(item.id)}>Save</Button>
                </>
              ) : (
                <>
                  <Text style={styles.item} onPress={() => { setEditingId(item.id); setEditText(item.name); }}>
                    {item.name}
                  </Text>
                  <Button mode="text" onPress={() => deleteItem(item.id)}>Delete</Button>
                </>
              )}
            </View>
          )}
        />
      </SafeAreaView>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  input: { marginBottom: 10 },
  button: { marginBottom: 10 },
  itemRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingVertical: 2,
    marginVertical: 0
  },
  item: { 
    fontSize: 18,
    margin: 0
  },
  itemInput: { flex: 1, marginRight: 10 },
});