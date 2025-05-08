import React from 'react';
import { StyleSheet, ViewStyle } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

interface BackgroundProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

const Background: React.FC<BackgroundProps> = ({ children, style }) => {
  return (
    <LinearGradient
      colors={['#FFFFFF', '#E9E9E9', '#FFFFFF']}
      style={[styles.gradient, style]}
    >
      {children}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
});

export default Background;
