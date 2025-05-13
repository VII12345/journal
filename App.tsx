// journal/App.tsx
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Main from './scene/Main/Main';
import TravelLogDetail from './scene/detail/TravelLogDetail';
import { RootStackParamList } from './navigationTypes';

const Stack = createStackNavigator<RootStackParamList>();

const App: React.FC = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Main" component={Main} />
        <Stack.Screen name="TravelLogDetail" component={TravelLogDetail} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;