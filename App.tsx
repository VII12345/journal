import React from 'react';
import { SafeAreaView } from 'react-native';
import Home from './scene/home/Home';

const App: React.FC = () => {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Home />
    </SafeAreaView>
  );
};

export default App;
