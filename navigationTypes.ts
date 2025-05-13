// journal/navigationTypes.ts
import { TravelLog } from './scene/home/TravelLogCard';
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

// 定义路由参数类型
export type RootStackParamList = {
  Main: undefined;
  TravelLogDetail: { log: TravelLog };
  Home: undefined;
  Publish: { log?: TravelLog };
  My: undefined;
  Login: undefined;
};

// 定义 TravelLogDetail 页面的 RouteProp 类型
export type TravelLogDetailRouteProp = RouteProp<RootStackParamList, 'TravelLogDetail'>;

// 定义 Home 页面的 StackNavigationProp 类型
export type HomeNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;