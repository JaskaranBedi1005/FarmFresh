import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, View } from 'react-native';

export const PrimaryButton = ({
  title,
  onPress,
  loading = false,
  disabled = false,
  variant = 'primary', // 'primary' | 'outline' | 'ghost'
  size = 'md', // 'sm' | 'md' | 'lg'
  icon = null,
  style = '',
}) => {
  const baseStyle = 'flex-row items-center justify-center rounded-2xl';

  const sizeStyles = {
    sm: 'px-4 py-2',
    md: 'px-6 py-4',
    lg: 'px-8 py-5',
  };

  const textSizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  };

  const variantStyles = {
    primary: `bg-green-600 ${disabled ? 'opacity-50' : 'active:bg-green-700'}`,
    outline: `border-2 border-green-600 bg-transparent ${disabled ? 'opacity-50' : ''}`,
    ghost: `bg-green-50 ${disabled ? 'opacity-50' : 'active:bg-green-100'}`,
    danger: `bg-red-500 ${disabled ? 'opacity-50' : 'active:bg-red-600'}`,
  };

  const textColors = {
    primary: 'text-white',
    outline: 'text-green-600',
    ghost: 'text-green-700',
    danger: 'text-white',
  };

  return (
    <TouchableOpacity
      className={`${baseStyle} ${sizeStyles[size]} ${variantStyles[variant]} ${style}`}
      onPress={onPress}
      disabled={!!(disabled || loading)}
      activeOpacity={0.85}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' || variant === 'danger' ? '#fff' : '#16a34a'} size="small" />
      ) : (
        <>
          {icon && <View className="mr-2">{icon}</View>}
          <Text
            className={`font-bold tracking-wide ${textSizes[size]} ${textColors[variant]}`}
          >
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
};
