import { useState, useEffect } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { Provider as PaperProvider, Title, TextInput, Button, Text, Portal, Dialog, Paragraph } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from './supabase';
import LoginScreen from './components/LoginScreen'; // Adjust path as needed

export default function App() {
  const [user, setUser] = useState(null);
  const [items, setItems] = useState([]);
  const [newItem, setNewItem] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');
  const [loading, setLoading] = useState(true);
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

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

  async function signUp({ email, password }) {
    return await supabase.auth.signUp({ email, password });
  }

  async function logIn({ email, password }) {
    return await supabase.auth.signInWithPassword({ email, password });
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

  async function deleteItem() {
    if (!itemToDelete) return;
    const { error } = await supabase.from('items').delete().eq('id', itemToDelete.id);
    if (error) console.error(error);
    else fetchItems();
    setDeleteDialogVisible(false);
    setItemToDelete(null);
  }

  async function updateItem(id) {
    if (!editText) return;
    const { error } = await supabase.from('items').update({ name: editText }).eq('id', id);
    if (error) console.error(error);
    else { setEditingId(null); setEditText(''); fetchItems(); }
  }

  const showDeleteDialog = (item) => {
    setItemToDelete(item);
    setDeleteDialogVisible(true);
  };

  const hideDeleteDialog = () => {
    setDeleteDialogVisible(false);
    setItemToDelete(null);
  };

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
        <LoginScreen onLogin={logIn} onSignUp={signUp} />
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
                  <Button mode="text" onPress={() => showDeleteDialog(item)}>Delete</Button>
                </>
              )}
            </View>
          )}
        />
        <Portal>
          <Dialog visible={deleteDialogVisible} onDismiss={hideDeleteDialog}>
            <Dialog.Title>Confirm Delete</Dialog.Title>
            <Dialog.Content>
              <Paragraph>Are you sure you want to delete "{itemToDelete?.name}"?</Paragraph>
            </Dialog.Content>
            <Dialog.Actions>
              <Button onPress={hideDeleteDialog}>Cancel</Button>
              <Button onPress={deleteItem}>Delete</Button>
            </Dialog.Actions>
          </Dialog>
        </Portal>
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