import React from 'react';
import Main from './scene/Main/Main';
import { SafeAreaView, StyleSheet } from 'react-native';
import Background from './components/Background';

const App: React.FC = () => {
  return (
    <SafeAreaView style={styles.safeContainer}>
      <Background>
        <Main />
      </Background>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeContainer: { flex: 1 },
});

export default App;