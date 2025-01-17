import React, { useState } from 'react';
import { Alert, View } from 'react-native';
import auth from '@react-native-firebase/auth';
import {
  Layout,
  Text,
  Input,
  Button,
  useStyleSheet,
  StyleService,
} from '@ui-kitten/components';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import {
  LoginManager,
  AccessToken,
  GraphRequest,
  GraphRequestManager,
} from 'react-native-fbsdk';
import { AuthHeader } from '../components/AuthHeader';
import GoogleLogo from '../assets/images/google_g_logo.svg';
import FacebookLogo from '../assets/images/facebook_logo.svg';

export const LoginScreen = ({ navigation }) => {
  const styles = useStyleSheet(themedStyles);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [inProgress, setInProgress] = useState(false);
  const [message, setMessage] = useState(null);
  // in cases where account exists with different credentials
  let linkCredential;

  const onEmailSignIn = async () => {
    try {
      setMessage(null);
      setInProgress(true);
      await auth().signInWithEmailAndPassword(email, password);
    } catch (error) {
      setMessage(error.message);
      // console.error(error);
      setInProgress(false);
    }
  };

  const onGoogleSignIn = async () => {
    try {
      setMessage(null);
      setInProgress(true);
      const { idToken } = await GoogleSignin.signIn();
      const cred = auth.GoogleAuthProvider.credential(idToken);
      const userCred = await auth().signInWithCredential(cred);
      if (linkCredential) {
        await userCred.user.linkWithCredential(linkCredential);
        linkCredential = null;
      }
    } catch (error) {
      setMessage(error.message);
      // console.error(error);
      setInProgress(false);
    }
  };

  const onFacebookSignIn = async () => {
    let credential;
    try {
      setMessage(null);
      setInProgress(true);

      const result = await LoginManager.logInWithPermissions([
        'public_profile',
        'email',
      ]);

      if (result.isCancelled) {
        throw { message: 'User cancelled the login process' };
      }

      const data = await AccessToken.getCurrentAccessToken();

      if (!data) {
        throw { message: 'Something went wrong obtaining access token' };
      }

      credential = auth.FacebookAuthProvider.credential(data.accessToken);

      await auth().signInWithCredential(credential);
    } catch (error) {
      if (error.code === 'auth/account-exists-with-different-credential') {
        const request = new GraphRequest(
          '/me?fields=email',
          null,
          async (error, result) => {
            if (error) {
              console.error(error.toString());
              setMessage(error.toString());
              setInProgress(false);
            } else if (result) {
              linkCredential = credential;
              const providers = await auth().fetchSignInMethodsForEmail(
                result.email
              );
              providerAlert(providers);
            }
          }
        );
        new GraphRequestManager().addRequest(request).start();
      } else {
        setMessage(error.message);
        console.error(error);
        setInProgress(false);
      }
    }
  };

  const providerAlert = providers => {
    if (providers.includes('apple.com')) {
      Alert.alert(
        'Sign-in via Apple',
        "Looks like you previously signed in via Apple. You'll need to sign-in there to continue.",
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Continue', onPress: () => {} },
        ]
      );
    } else if (providers.includes('google.com')) {
      Alert.alert(
        'Sign-in via Google',
        "Looks like you previously signed in via Google. You'll need to sign-in there to continue.",
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Continue', onPress: () => onGoogleSignIn() },
        ]
      );
    } else if (providers.includes('facebook.com')) {
      Alert.alert(
        'Sign-in via Facebook',
        "Looks like you previously signed in via Facebook. You'll need to sign-in there to continue.",
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Continue', onPress: () => onFacebookSignIn() },
        ]
      );
    } else {
      Alert.alert('Login Error', 'Sign in using a different provider');
    }
  };

  return (
    <Layout style={styles.container}>
      <AuthHeader
        titleText="Sign In"
        leadText="Please enter your credentials to proceed"
      />
      <View style={styles.bodyContainer}>
        <View>
          {message && <Text status="warning">{message}</Text>}
          <Input
            autoCapitalize="none"
            value={email}
            label="EMAIL"
            placeholder="Email"
            onChangeText={nextValue => setEmail(nextValue)}
            style={styles.formField}
          />
          <Input
            value={password}
            label="PASSWORD"
            placeholder="Password"
            onChangeText={nextValue => setPassword(nextValue)}
            style={styles.formField}
            secureTextEntry
          />

          <Text
            status="primary"
            style={styles.forgotPasswordText}
            onPress={() => {
              navigation.navigate('Forgot Password');
            }}
          >
            Forgot Password?
          </Text>
        </View>

        <View>
          <Button onPress={onEmailSignIn} disabled={inProgress}>
            SIGN IN
          </Button>
          <View>
            <Text style={styles.orText} appearance="hint">
              OR
            </Text>
          </View>
          <View style={styles.authButtonRow}>
            {/*TODO: This violates branding guidelines for sign-in */}
            <Button
              style={styles.providerLoginButton}
              onPress={() => onGoogleSignIn()}
              disabled={inProgress}
              accessoryLeft={() => <GoogleLogo height={18} />}
            />
            <Button
              style={styles.providerLoginButton}
              onPress={() => onFacebookSignIn()}
              disabled={inProgress}
              accessoryLeft={() => (
                <FacebookLogo fill={'#4267B2'}>Facebook</FacebookLogo>
              )}
            />
          </View>
          <Text appearance="hint" style={{ textAlign: 'center' }}>
            Don't have an account?{' '}
            <Text
              status="primary"
              category="s1"
              onPress={() => navigation.navigate('Signup')}
            >
              Sign Up
            </Text>
          </Text>
        </View>
      </View>
    </Layout>
  );
};

const themedStyles = StyleService.create({
  container: {
    backgroundColor: 'background-basic-color-1',
    flex: 1,
  },
  authButtonRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 24,
  },
  bodyContainer: {
    padding: 24,
    flex: 1,
    justifyContent: 'space-between',
  },
  forgotPasswordText: {
    // fontFamily: 'OpenSans-Bold',
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 24,
  },
  formField: {
    marginTop: 10,
  },
  signInButton: {},
  orText: {
    fontSize: 15,
    color: '#8F9BB3',
    textAlign: 'center',
    marginTop: 12,
    marginBottom: 12,
  },
  providerLoginButton: {
    marginLeft: 7,
    marginRight: 7,
    borderColor: '#5D1B45',
    borderRadius: 100,
    width: 42,
    height: 42,
    backgroundColor: '#fff',
  },
});
