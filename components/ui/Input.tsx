import React from 'react';
import { 
  View, 
  TextInput, 
  Text, 
  StyleSheet, 
  TextInputProps,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { theme } from '@/constants/theme';
import { useTheme } from '@/components/ui/ThemeProvider';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Input: React.FC<InputProps> = ({
  label,
  error,
  containerStyle,
  inputStyle,
  leftIcon,
  rightIcon,
  ...rest
}) => {
  const { isDarkMode } = useTheme();
  const colorMode = isDarkMode ? 'dark' : 'light';
  
  const styles = StyleSheet.create({
    container: {
      marginBottom: 16,
    },
    label: {
      fontSize: 16,
      fontWeight: '500',
      marginBottom: 6,
      color: theme.colors[colorMode].text,
    },
    inputContainer: {
      position: 'relative',
      borderWidth: 1,
      borderColor: theme.colors[colorMode].border,
      borderRadius: theme.borderRadius.md,
      backgroundColor: theme.colors[colorMode].card,
    },
    input: {
      paddingVertical: 12,
      paddingHorizontal: 16,
      fontSize: 16,
      color: theme.colors[colorMode].text,
    },
    inputError: {
      borderColor: theme.colors[colorMode].error,
    },
    leftIcon: {
      position: 'absolute',
      left: 12,
      top: 12,
      zIndex: 1,
    },
    rightIcon: {
      position: 'absolute',
      right: 12,
      top: 12,
      zIndex: 1,
    },
    errorText: {
      color: theme.colors[colorMode].error,
      fontSize: 14,
      marginTop: 4,
    },
  });

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}
      
      <View style={[
        styles.inputContainer,
        error ? styles.inputError : null,
      ]}>
        {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}
        
        <TextInput
          style={[
            styles.input,
            leftIcon ? { paddingLeft: 40 } : null,
            rightIcon ? { paddingRight: 40 } : null,
            inputStyle,
          ]}
          placeholderTextColor={theme.colors[colorMode].tabIconDefault}
          {...rest}
        />
        
        {rightIcon && <View style={styles.rightIcon}>{rightIcon}</View>}
      </View>
      
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

export default Input;