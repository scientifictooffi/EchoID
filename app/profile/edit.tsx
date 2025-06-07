import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Platform } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { theme } from '@/constants/theme';
import polygonIdStore from '@/store/polygon-id-store';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Image } from 'expo-image';
import { Camera, User } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';

export default function EditProfileScreen() {
  const router = useRouter();
  const { identity, updateProfile, isLoading } = polygonIdStore();
  
  if (!identity) {
    router.replace('/');
    return null;
  }
  
  const [profileName, setProfileName] = useState(identity.profileName || '');
  const [avatar, setAvatar] = useState(identity.avatar || '');
  const [error, setError] = useState('');
  
  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });
    
    if (!result.canceled) {
      setAvatar(result.assets[0].uri);
    }
  };
  
  const handleSave = async () => {
    if (!profileName.trim()) {
      setError('Profile name cannot be empty');
      return;
    }
    
    if (Platform.OS !== 'web') {
      Haptics.selectionAsync();
    }
    
    try {
      await updateProfile(profileName, avatar);
      router.back();
    } catch (error) {
      console.error('Failed to update profile:', error);
      Alert.alert('Error', 'Failed to update profile. Please try again.');
      
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    }
  };
  
  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Edit Profile' }} />
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.avatarContainer}>
          {avatar ? (
            <Image
              source={{ uri: avatar }}
              style={styles.avatar}
              contentFit="cover"
            />
          ) : (
            <View style={styles.avatarFallback}>
              <User size={40} color={theme.colors.light.primary} />
            </View>
          )}
          
          <TouchableOpacity 
            style={styles.changeAvatarButton}
            onPress={handlePickImage}
            activeOpacity={0.7}
          >
            <Camera size={20} color="#ffffff" />
          </TouchableOpacity>
        </View>
        
        <Card variant="outlined" style={styles.formCard}>
          <Input
            label="Profile Name"
            placeholder="Enter your profile name"
            value={profileName}
            onChangeText={(text) => {
              setProfileName(text);
              if (error) setError('');
            }}
            error={error}
          />
          
          <View style={styles.didContainer}>
            <Text style={styles.didLabel}>DID (Decentralized Identifier)</Text>
            <Text style={styles.didValue} numberOfLines={2} ellipsizeMode="middle">
              {identity.did}
            </Text>
            <Text style={styles.didNote}>
              Your DID cannot be changed as it is your unique identifier on the blockchain.
            </Text>
          </View>
          
          <Button
            title="Save Changes"
            onPress={handleSave}
            isLoading={isLoading}
            disabled={isLoading || !profileName.trim()}
            style={styles.saveButton}
          />
        </Card>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.light.background,
  },
  scrollContent: {
    padding: 16,
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 24,
    position: 'relative',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  avatarFallback: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: `${theme.colors.light.primary}15`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  changeAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: '35%',
    backgroundColor: theme.colors.light.secondary,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: theme.colors.light.background,
  },
  formCard: {
    marginBottom: 24,
  },
  didContainer: {
    marginTop: 16,
    marginBottom: 16,
  },
  didLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
    color: theme.colors.light.text,
  },
  didValue: {
    fontSize: 14,
    color: theme.colors.light.tabIconDefault,
    backgroundColor: `${theme.colors.light.border}50`,
    padding: 12,
    borderRadius: theme.borderRadius.md,
    marginBottom: 8,
  },
  didNote: {
    fontSize: 12,
    color: theme.colors.light.tabIconDefault,
    fontStyle: 'italic',
  },
  saveButton: {
    marginTop: 8,
  },
});