import React from 'react';
import { View, StyleSheet, ViewProps, ViewStyle } from 'react-native';
import { theme } from '@/constants/theme';
import { useTheme } from '@/components/ui/ThemeProvider';

interface CardProps extends ViewProps {
  style?: ViewStyle;
  variant?: 'elevated' | 'outlined' | 'filled';
  children: React.ReactNode;
}

const Card: React.FC<CardProps> = ({ 
  style, 
  variant = 'elevated', 
  children,
  ...rest 
}) => {
  const { isDarkMode } = useTheme();
  const colorMode = isDarkMode ? 'dark' : 'light';
  
  const getCardStyles = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.md,
    };

    const variantStyles: Record<string, ViewStyle> = {
      elevated: {
        backgroundColor: theme.colors[colorMode].card,
        ...theme.shadows.md,
      },
      outlined: {
        backgroundColor: theme.colors[colorMode].card,
        borderWidth: 1,
        borderColor: theme.colors[colorMode].border,
      },
      filled: {
        backgroundColor: theme.colors[colorMode].background,
      },
    };

    return {
      ...baseStyle,
      ...variantStyles[variant],
    };
  };

  return (
    <View style={[getCardStyles(), style]} {...rest}>
      {children}
    </View>
  );
};

export default Card;