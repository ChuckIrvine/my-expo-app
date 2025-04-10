import { useState } from 'react';
import { Title, TextInput, Button, Portal, Dialog, Paragraph } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

const LoginScreen = ({ onLogin, onSignUp }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [dialogTitle, setDialogTitle] = useState('');
  const [dialogMessage, setDialogMessage] = useState('');

  const showDialog = (title, message) => {
    setDialogTitle(title);
    setDialogMessage(message);
    setDialogVisible(true);
  };

  const hideDialog = () => {
    setDialogVisible(false);
    setDialogTitle('');
    setDialogMessage('');
  };

  async function signUp() {
    if (password !== confirmPassword) {
      showDialog('Error', 'Passwords do not match!');
      return;
    }
    const { error } = await onSignUp({ email, password });
    if (error) showDialog('Error', error.message);
    else showDialog('Success', 'Check your email to confirm!');
  }

  async function logIn() {
    const { error } = await onLogin({ email, password });
    if (error) showDialog('Error', error.message);
  }

  return (
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
      {isSignUp && (
        <TextInput
          mode="outlined"
          label="Confirm Password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
          autoCapitalize="none"
          style={styles.input}
        />
      )}
      <Button mode="contained" onPress={isSignUp ? signUp : logIn} style={styles.button}>
        {isSignUp ? 'Sign Up' : 'Log In'}
      </Button>
      <Button mode="text" onPress={() => setIsSignUp(!isSignUp)}>
        Switch to {isSignUp ? 'Log In' : 'Sign Up'}
      </Button>
      <Portal>
        <Dialog visible={dialogVisible} onDismiss={hideDialog}>
          <Dialog.Title>{dialogTitle}</Dialog.Title>
          <Dialog.Content>
            <Paragraph>{dialogMessage}</Paragraph>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={hideDialog}>OK</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </SafeAreaView>
  );
};

const styles = {
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  input: { marginBottom: 10 },
  button: { marginBottom: 10 },
};

export default LoginScreen;