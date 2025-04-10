import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, Alert, Button } from 'react-native';

const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNkc21kb3VzdXZjaXlsZHNleHZsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQyMDY4NDAsImV4cCI6MjA1OTc4Mjg0MH0.RJYgWhSaTKVP6zVwR_ctEuLh5_M9n7jV2WFeNkY3C5k';
const FUNCTION_URL = 'https://cdsmdousuvciyldsexvl.supabase.co/functions/v1/manage-users';

const UsersScreen = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(FUNCTION_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${ANON_KEY}`,
        },
        body: JSON.stringify({ action: 'list' }),
      });

      const { users, error } = await response.json();

      if (error) {
        throw new Error(error);
      }

      setUsers(users || []);
    } catch (err) {
      setError('Failed to fetch users: ' + err.message);
      Alert.alert('Error', 'Failed to fetch users: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (userId) => {
    // Confirm deletion with the user
    Alert.alert(
      'Delete User',
      'Are you sure you want to delete this user?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            setError(null);
            try {
              const response = await fetch(FUNCTION_URL, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${ANON_KEY}`,
                },
                body: JSON.stringify({ action: 'delete', userId }),
              });

              const { success, error } = await response.json();

              if (error) {
                throw new Error(error);
              }

              if (success) {
                // Refresh the user list after deletion
                Alert.alert('Success', 'User deleted successfully');
                fetchUsers();
              }
            } catch (err) {
              setError('Failed to delete user: ' + err.message);
              Alert.alert('Error', 'Failed to delete user: ' + err.message);
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const renderUserItem = ({ item }) => (
    <View style={styles.userItem}>
      <Text style={styles.userText}>ID: {item.id}</Text>
      <Text style={styles.userText}>Email: {item.email}</Text>
      <Button
        title="Delete"
        color="red"
        onPress={() => deleteUser(item.id)}
        disabled={loading}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Users</Text>

      {loading && <ActivityIndicator size="large" color="#0000ff" />}
      {error && <Text style={styles.errorText}>{error}</Text>}

      {!loading && !error && (
        <FlatList
          data={users}
          keyExtractor={(item) => item.id}
          renderItem={renderUserItem}
          ListEmptyComponent={<Text>No users found.</Text>}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  userItem: {
    padding: 15,
    marginVertical: 5,
    backgroundColor: '#fff',
    borderRadius: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  userText: {
    fontSize: 16,
    marginBottom: 5,
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginVertical: 10,
  },
});

export default UsersScreen;