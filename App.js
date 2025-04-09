import { useState, useEffect } from 'react';
import { SafeAreaView, Text, TextInput, Button, FlatList, StyleSheet, Alert } from 'react-native';
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

  if (loading) return <SafeAreaView style={styles.container}><Text>Loading...</Text></SafeAreaView>;

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.title}>{isSignUp ? 'Sign Up' : 'Log In'}</Text>
        <TextInput style={styles.input} value={email} onChangeText={setEmail} placeholder="Email" autoCapitalize="none" keyboardType="email-address" />
        <TextInput style={styles.input} value={password} onChangeText={setPassword} placeholder="Password" secureTextEntry autoCapitalize="none" />
        <Button title={isSignUp ? 'Sign Up' : 'Log In'} onPress={isSignUp ? signUp : logIn} />
        <Button title={`Switch to ${isSignUp ? 'Log In' : 'Sign Up'}`} onPress={() => setIsSignUp(!isSignUp)} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Items List</Text>
      <Button title="Log Out" onPress={logOut} />
      <TextInput style={styles.input} value={newItem} onChangeText={setNewItem} placeholder="Add new item" />
      <Button title="Add" onPress={addItem} />
      <FlatList
        data={items}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => (
          <SafeAreaView style={styles.itemRow}>
            {editingId === item.id ? (
              <>
                <TextInput
                  style={styles.itemInput}
                  value={editText}
                  onChangeText={setEditText}
                  autoFocus
                />
                <Button title="Save" onPress={() => updateItem(item.id)} />
              </>
            ) : (
              <>
                <Text style={styles.item} onPress={() => { setEditingId(item.id); setEditText(item.name); }}>{item.name}</Text>
                <Button title="Delete" onPress={() => deleteItem(item.id)} />
              </>
            )}
          </SafeAreaView>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 10, textAlign: 'center' },
  input: { borderWidth: 1, padding: 8, marginBottom: 10, width: '100%' },
  itemRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 10 },
  item: { fontSize: 18 },
  itemInput: { flex: 1, borderWidth: 1, padding: 5, marginRight: 10 },
});