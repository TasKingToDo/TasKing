import React, { forwardRef } from 'react';
import { Pressable, PressableProps, ViewStyle } from 'react-native';
import * as Haptics from 'expo-haptics';

type Props = PressableProps & {
  haptic?: boolean;
  shadow?: boolean;
  children: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
};

const PressableButton = forwardRef<any, Props>(
  ({ haptic = false, shadow = true, onPress, children, style, ...rest }, ref) => {
    const handlePress = () => {
      if (haptic) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      onPress?.();
    };

    return (
      <Pressable
        ref={ref}
        onPress={handlePress}
        style={({ pressed }) => {
          const baseStyle = {
            transform: [{ scale: pressed ? 0.95 : 1 }],
            ...(shadow && {
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: pressed ? 0.15 : 0,
              shadowRadius: pressed ? 4 : 0,
              elevation: pressed ? 3 : 0,
            }),
          };          

          const flattenedStyle = Array.isArray(style) ? Object.assign({}, ...style) : style || {};

          return {
            ...flattenedStyle,
            ...baseStyle,
          };
        }}
        android_ripple={{ color: 'rgba(0,0,0,0.05)', borderless: true }}
        {...rest}
      >
        {children}
      </Pressable>
    );
  }
);

PressableButton.displayName = 'PressableButton';

export default PressableButton;