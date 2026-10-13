import React, { useEffect, useRef } from 'react';
import { Animated, StyleProp, ViewStyle } from 'react-native';

interface FadeInViewProps {
  children: React.ReactNode;
  /** Retraso en ms: útil para que una lista aparezca escalonada. */
  delay?: number;
  /** Cuántos px sube mientras aparece. */
  distance?: number;
  duration?: number;
  style?: StyleProp<ViewStyle>;
}

// Aparece con fade + pequeño deslizamiento hacia arriba al montarse.
export const FadeInView = ({
  children,
  delay = 0,
  distance = 16,
  duration = 380,
  style,
}: FadeInViewProps) => {
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(progress, {
      toValue: 1,
      duration,
      delay,
      useNativeDriver: true,
    }).start();
  }, [progress, duration, delay]);

  return (
    <Animated.View
      style={[
        style,
        {
          opacity: progress,
          transform: [
            {
              translateY: progress.interpolate({
                inputRange: [0, 1],
                outputRange: [distance, 0],
              }),
            },
          ],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
};
