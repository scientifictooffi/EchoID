.
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { theme } from '@/constants/theme';
import { Identity } from '@/types/polygon-id';
import { Copy, Edit } from 'lucide-react-native';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';
import { useTheme } from '@/components/ui/ThemeProvider';

interface IdentityHeaderProps {
  identity: Identity;
  onEditProfile?: () => void;
}

const IdentityHeader: React.FC<IdentityHeaderProps> = ({ 
  identity,
  onEditProfile,
}) => {
  const { isDarkMode } = useTheme();
  const colorMode = isDarkMode ? 'dark' : 'light';
  
  const handleCopyDid = async () => {
    await Clipboard.setStringAsync(identity.did);
    
    if (Platform.OS !== 'web') {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  const getInitials = () => {
    if (!identity.profileName) return '?';
    return identity.profileName
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const styles = StyleSheet.create({
    container: {
      padding: 16,
      backgroundColor: theme.colors[colorMode].card,
      borderRadius: theme.borderRadius.lg,
      marginBottom: 16,
      ...theme.shadows.sm,
    },
    avatarContainer: {
      alignItems: 'center',
      marginBottom: 16,
      position: 'relative',
    },
    avatar: {
      width: 80,
      height: 80,
      borderRadius: 40,
    },
    avatarFallback: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: theme.colors[colorMode].primary,
      justifyContent: 'center',
      alignItems: 'center',
    },
    avatarInitials: {
      color: '#ffffff',
      fontSize: 28,
      fontWeight: '600',
    },
    editButton: {
      position: 'absolute',
      bottom: 0,
      right: 0,
      backgroundColor: theme.colors[colorMode].secondary,
      width: 28,
      height: 28,
      borderRadius: 14,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 2,
      borderColor: theme.colors[colorMode].card,
    },
    infoContainer: {
      alignItems: 'center',
    },
    profileName: {
      fontSize: 20,
      fontWeight: '600',
      marginBottom: 8,
      color: theme.colors[colorMode].text,
    },
    didContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 16,
      maxWidth: '100%',
    },
    didText: {
      fontSize: 14,
      color: theme.colors[colorMode].tabIconDefault,
      maxWidth: '90%',
    },
    copyButton: {
      marginLeft: 8,
      padding: 4,
    },
    statsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      width: '100%',
      paddingTop: 16,
      borderTopWidth: 1,
      borderTopColor: theme.colors[colorMode].border,
    },
    statItem: {
      alignItems: 'center',
      flex: 1,
    },
    statValue: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors[colorMode].text,
      marginBottom: 4,
    },
    statLabel: {
      fontSize: 14,
      color: theme.colors[colorMode].tabIconDefault,
    },
    statDivider: {
      width: 1,
      height: '100%',
      backgroundColor: theme.colors[colorMode].border,
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.avatarContainer}>
        {identity.avatar ? (
          <Image
            source={{ uri: identity.avatar }}
            style={styles.avatar}
            contentFit="cover"
          />
        ) : (
          <View style={styles.avatarFallback}>
            <Text style={styles.avatarInitials}>{getInitials()}</Text>
          </View>
        )}
        
        {onEditProfile && (
          <TouchableOpacity 
            style={styles.editButton}
            onPress={onEditProfile}
            activeOpacity={0.7}
          >
            <Edit size={16} color="#ffffff" />
          </TouchableOpacity>
        )}
      </View>
      
      <View style={styles.infoContainer}>
        <Text style={styles.profileName}>{identity.profileName || 'Unnamed Identity'}</Text>
        
        <View style={styles.didContainer}>
          <Text style={styles.didText} numberOfLines={1} ellipsizeMode="middle">
            {identity.did}
          </Text>
          
          <TouchableOpacity 
            onPress={handleCopyDid}
            style={styles.copyButton}
            activeOpacity={0.7}
          >
            <Copy size={16} color={theme.colors[colorMode].primary} />
          </TouchableOpacity>
        </View>
        
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{identity.credentials.length}</Text>
            <Text style={styles.statLabel}>Credentials</Text>
          </View>
          
          <View style={styles.statDivider} />
          
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {new Date(identity.createdAt).toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'short', 
                day: 'numeric' 
              })}
            </Text>
            <Text style={styles.statLabel}>Created</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

export default IdentityHeader;