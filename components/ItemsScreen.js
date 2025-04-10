import { useState, useEffect } from 'react';
import { FlatList, View, StyleSheet } from 'react-native';
import { Title, TextInput, Button, Text, Portal, Dialog, Paragraph } from 'react-native-paper';
import { supabase } from '../supabase'; // Adjust path as needed

const ItemsScreen = ({ onLogout }) => {
  const [items, setItems] = useState([]);
  const [newItem, setNewItem] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  useEffect(() => {
    fetchItems();
  }, []);

  async function fetchItems() {
    const { data, error } = await supabase.from('items').select('*');
    if (error) console.error(error);
    else setItems(data);
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

  return (
    <View style={styles.container}>
      <Title>Items List</Title>
      <Button mode="text" onPress={onLogout}>Log Out</Button>
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
    </View>
  );
};

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

export default ItemsScreen;