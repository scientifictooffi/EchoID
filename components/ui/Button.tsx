import React from 'react';
import { 
  TouchableOpacity, 
  Text, 
  StyleSheet, 
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  TouchableOpacityProps
} from 'react-native';
import { theme } from '@/constants/theme';
import { useTheme } from '@/components/ui/ThemeProvider';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

const Button: React.FC<ButtonProps> = ({
  title,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  style,
  textStyle,
  disabled,
  ...rest
}) => {
  const { isDarkMode } = useTheme();
  const colorMode = isDarkMode ? 'dark' : 'light';
  
  const getButtonStyles = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      borderRadius: theme.borderRadius.md,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    };

    const sizeStyles: Record<string, ViewStyle> = {
      sm: { paddingVertical: 8, paddingHorizontal: 12 },
      md: { paddingVertical: 12, paddingHorizontal: 16 },
      lg: { paddingVertical: 16, paddingHorizontal: 20 },
    };

    const variantStyles: Record<string, ViewStyle> = {
      primary: { 
        backgroundColor: theme.colors[colorMode].primary,
      },
      secondary: { 
        backgroundColor: theme.colors[colorMode].secondary,
      },
      outline: { 
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: theme.colors[colorMode].primary,
      },
      ghost: { 
        backgroundColor: 'transparent',
      },
    };

    const disabledStyles: ViewStyle = {
      opacity: 0.5,
    };

    return {
      ...baseStyle,
      ...sizeStyles[size],
      ...variantStyles[variant],
      ...(disabled || isLoading ? disabledStyles : {}),
    };
  };

  const getTextStyles = (): TextStyle => {
    const baseStyle: TextStyle = {
      fontWeight: '600',
      textAlign: 'center',
    };

    const sizeStyles: Record<string, TextStyle> = {
      sm: { fontSize: 14 },
      md: { fontSize: 16 },
      lg: { fontSize: 18 },
    };

    const variantStyles: Record<string, TextStyle> = {
      primary: { 
        color: '#ffffff',
      },
      secondary: { 
        color: '#ffffff',
      },
      outline: { 
        color: theme.colors[colorMode].primary,
      },
      ghost: { 
        color: theme.colors[colorMode].primary,
      },
    };

    return {
      ...baseStyle,
      ...sizeStyles[size],
      ...variantStyles[variant],
    };
  };

  return (
    <TouchableOpacity
      style={[getButtonStyles(), style]}
      disabled={disabled || isLoading}
      activeOpacity={0.7}
      {...rest}
    >
      {isLoading ? (
        <ActivityIndicator 
          size="small" 
          color={variant === 'outline' || variant === 'ghost' 
            ? theme.colors[colorMode].primary 
            : '#ffffff'} 
        />
      ) : (
        <>
          {leftIcon && <React.Fragment>{leftIcon}</React.Fragment>}
          <Text style={[getTextStyles(), leftIcon && { marginLeft: 8 }, rightIcon && { marginRight: 8 }, textStyle]}>
            {title}
          </Text>
          {rightIcon && <React.Fragment>{rightIcon}</React.Fragment>}
        </>
      )}
    </TouchableOpacity>
  );
};

export default Button;