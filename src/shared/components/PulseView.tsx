import React, { useEffect, useRef } from 'react';
import { Animated, StyleProp, ViewStyle } from 'react-native';

interface PulseViewProps {
  style?: StyleProp<ViewStyle>;

  scaleTo?: number;

  duration?: number;
}

// Figura decorativa que "respira" (crece y se encoge) en bucle, sin tocar nada.
export const PulseView = ({ style, scaleTo = 1.15, duration = 1800 }: PulseViewProps) => {
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(progress, { toValue: 1, duration, useNativeDriver: true }),
        Animated.timing(progress, { toValue: 0, duration, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [progress, duration]);

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        style,
        {
          transform: [
            { scale: progress.interpolate({ inputRange: [0, 1], outputRange: [1, scaleTo] }) },
          ],
        },
      ]}
    />
  );
};