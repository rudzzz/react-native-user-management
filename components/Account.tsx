import { useEffect, useState } from "react";
import { Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import { Alert, StyleSheet, View } from "react-native";
import { Button, Input } from "react-native-elements";
import Avatar from "./Avatar";

const Account = ({ session }: { session: Session }) => {
    const [loading, setLoading] = useState(true);
    const [username, setUsername] = useState('');
    const [website, setWebsite] = useState('');
    const [avatarUrl, setAvatarUrl] = useState('');

    useEffect(() => {
        if(session) {
            getProfile()
        }
    }, [session]);

    const getProfile = async () => {
        try {
            setLoading(true);
            if(!session?.user) {
                throw new Error('No user on the session!');
            }

            const { data, error, status} = await supabase.from('profiles')
                .select(`username, website, avatar_url`)
                .eq('id', !session?.user.id)
                .single();

            if(error && status !== 406) {
                throw error;
            }

            if(data) {
                setUsername(data.username);
                setWebsite(data.website);
                setAvatarUrl(data.avatar_url);
            }
        } catch (error) {
            if(error instanceof Error) {
                Alert.alert(error.message);
            }
        } finally {
            setLoading(false);
        }
    }

    const updateProfile = async ({
        username,
        website,
        avatar_url
    } : {
        username: string
        website: string
        avatar_url: string
    }) => {
        try {
            setLoading(true);
            if(!session?.user) {
                throw new Error('No user on the session!')
            }

            const updates = {
                id: session?.user.id,
                username,
                website,
                avatarUrl,
                updated_at: new Date()
            }

            const { error } = await supabase.from('profiles').upsert(updates);

            if (error) {
                throw error
            }
        } catch (error) {
            if (error instanceof Error) {
                Alert.alert(error.message)
            }
        } finally {
            setLoading(false)
        }
    }

    return (
        <>
            <View style={styles.container}>
                <View>
                    <Input label="Email" value={session?.user?.email} disabled/>
                </View>
                <View>
                    <Input label="Username" value={username || ''} onChangeText={(text) => setUsername(text)}/>
                </View>
                <View>
                    <Input label="Website" value={website || ''} onChangeText={(text) => setWebsite(text)}/>
                </View>

                <View>
                    <Avatar size={200} 
                        url={avatarUrl}
                        onUpload={(url: string) => {
                            setAvatarUrl(url)
                            updateProfile({username, website, avatar_url: url})
                        }}
                    />
                </View>
                
            </View>
            <View style={styles.buttonContainer}>
                <Button title={loading ? 'Loading...' : 'Update'} 
                        onPress={() => updateProfile({username, website, avatar_url: avatarUrl})}
                        disabled={loading}
                />
                <Button title='Sign Out' onPress={() => supabase.auth.signOut()} />
            </View>
        </>
    )

}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
		padding: 10,
    },
	buttonContainer: {
		gap: 10,
        justifyContent: 'center',
        padding: 15,
        marginBottom: 100
	},
})

export default Account;