import { useEffect, useState } from "react"
import { supabase } from "../lib/supabase"
import * as ImagePicker from 'expo-image-picker'
import { Alert, View, Image, StyleSheet, Text } from "react-native"
import { Button } from "react-native-elements"

interface Props {
    size: number
    url: string | null
    onUpload: (filePath: string) => void
}

const Avatar = ({size= 150, url, onUpload} : Props) => {
    const [uploading, setUploading] = useState(false);
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
    const avatarSize = { height: size, width: size };

    useEffect(() => {
        if (url) downloadImage(url)
      }, [url])

    const downloadImage = async (path: string) => {
        try {
            const { data, error } = await supabase.storage.from('avatars').download(path);
            
            if (error) {
                throw error
            }

            const fileReader = new FileReader();
            fileReader.readAsDataURL(data);
            fileReader.onload = () => {
                setAvatarUrl(fileReader.result as string);
            }
        } catch (error) {
            if(error instanceof Error) {
                console.log('Error downloading image: ', error.message)
            }
        }
    }

    const uploadAvatar = async () => {
        try {
            setUploading(true);

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsMultipleSelection: false,
                allowsEditing: true,
                quality: 1,
                exif: false
            });

            if(result.canceled || !result.assets || result.assets.length === 0) {
                console.log('User cancelled image picker');
                return
            }

            const image = result.assets[0];
            console.log('Image: ', image);

            if(!image.uri) {
                throw new Error('No image uri');
            }

            const arrayBuffer = await fetch(image.uri).then((result => result.arrayBuffer()));

            const fileExtension = image.uri.split('.').pop()?.toLowerCase ?? 'jpeg';
            const path = `${Date.now()}.${fileExtension}`;
            const { data, error: uploadError} = await supabase.storage.from('avatars')
                .upload(path, arrayBuffer, {
                    contentType: image.mimeType ?? 'image/jpeg',
                });

            if(uploadError) {
                console.log('uploadError: ', uploadError);
                throw uploadError;
            }
            onUpload(data.path);
        } catch (error) {
            if(error instanceof Error) {
                Alert.alert(error.message);
            } else {
                console.log('catch error: ', error);
                throw error;
            }
        } finally {
            setUploading(false);
        }
    }

    return (
        <View style={styles.container}>
            {
                avatarUrl ? (
                    <Image source={{ uri: avatarUrl }} accessibilityLabel="Avatar" 
                        style={[avatarSize, styles.avatar, styles.image]}
                    />
                ) : (
                    <View style={[avatarSize, styles.avatar, styles.noImage]}>
                        <Text style={styles.noImageText}>No image</Text>
                    </View>
                )
            }
            <View>
                <Button title={uploading ? 'Uploading...' : 'Upload'} onPress={uploadAvatar} disabled={uploading}/>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        paddingBottom: 15,
        gap: 15
    },
    avatar: {
        borderRadius: 5,
        overflow: 'hidden',
        maxWidth: '100%'
    },
    image: {
        objectFit: 'cover',
        paddingTop: 0
    },
    noImage: {
        backgroundColor: '#333',
        borderWidth: 1,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center'
    },
    noImageText: {
        fontSize: 20,
        color: '#FFF'
    }
})

export default Avatar;