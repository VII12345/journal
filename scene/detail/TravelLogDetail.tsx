// journal/scene/detail/TravelLogDetail.tsx
import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { TravelLog } from '../home/TravelLogCard';
import { useRoute } from '@react-navigation/native';
import { TravelLogDetailRouteProp } from '../../navigationTypes';

// 定义 TravelLogDetailProps 接口，使用 useRoute 获取参数
interface TravelLogDetailProps {
  // 不需要显式定义 route，useRoute 会自动处理
}

const TravelLogDetail: React.FC<TravelLogDetailProps> = () => {
  const route = useRoute<TravelLogDetailRouteProp>();
  const { log } = route.params;

  return (
    <View style={styles.container}>
      <Image source={log.image} style={styles.image} />
      <Text style={styles.title}>{log.title}</Text>
      <Text style={styles.author}>作者: {log.author}</Text>
      <Text style={styles.content}>{log.content}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  image: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
    marginBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  author: {
    fontSize: 16,
    color: '#666',
    marginBottom: 10,
  },
  content: {
    fontSize: 18,
  },
});

export default TravelLogDetail;