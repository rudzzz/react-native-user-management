import { Alert, AppState, StyleSheet, View } from "react-native";
import { supabase } from "../lib/supabase";
import { useState } from "react";
import { Button, Input } from "react-native-elements";

AppState.addEventListener('change', (state) => {
	if(state === 'active') {
		supabase.auth.startAutoRefresh();
	} else {
		supabase.auth.stopAutoRefresh();
	}
});

const Login = () => {
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [loading, setLoading] = useState(false);

	const signInWithEmail = async () => {
		setLoading(true);
		const { error } = await supabase.auth.signInWithPassword({
			email: email,
			password: password
		});

		if(error) {
			Alert.alert(error.message);
			setLoading(false);
		}
	}

  	const signUpWithEmail = async () => {
		setLoading(true);
		const {
			data: { session },
			error,
		} = await supabase.auth.signUp({
			email: email,
			password: password
		});

		if(error) {
			Alert.alert(error.message);
			console.log('error: ', error.message);
			setLoading(false);
		}
		
		if(!session) {
			Alert.alert('Please check your inbox for email verification!')
			console.log('session: ', session);
			setLoading(false);
		}
	}

	return (
		<>
			<View style={styles.container}>
				<View>
					<Input 
						label='Email'
						rightIcon={{type: 'font-awesome', name: 'envelope'}}
						onChangeText={(text) => setEmail(text)}
						value={email}
						placeholder="email@address.com"
						autoCapitalize={'none'}
					/>
					<Input 
						label='Password'
						rightIcon={{type: 'font-awesome', name: 'lock'}}
						onChangeText={(text) => setPassword(text)}
						value={password}
						placeholder="Password"
						autoCapitalize={'none'}
					/>
				</View>
			</View>
			<View style={styles.buttonContainer}>
				<Button title="Sign in" disabled={loading} onPress={signInWithEmail}/>
				<Button title="Sign up" disabled={loading} onPress={signUpWithEmail}/>
			</View>
		</>
	)
}

const styles = StyleSheet.create({
	container: {
		flex: 4,
		padding: 10,
		justifyContent: 'center',
		marginBottom: -300
	},
	buttonContainer: {
		flex: 3,
		gap: 10,
        justifyContent: 'center',
        padding: 15,
	},
})

export default Login;