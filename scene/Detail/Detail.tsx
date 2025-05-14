// journal/scene/detail/TravelLogDetail.tsx
import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { TravelLog } from '../home/TravelLogCard';


interface TravelLogDetailProps {
  log: TravelLog;
  onBack: () => void;
}

const Detail: React.FC<TravelLogDetailProps> = ({ log, onBack }) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={onBack} style={styles.backButton}>
        <Text style={styles.backButtonText}>← 返回</Text>
      </TouchableOpacity>
      <Image source={log.image} style={styles.image} />
      <Text style={styles.title}>{log.title}</Text>
      <Text style={styles.author}>作者: {log.author}</Text>
      <Text style={styles.content}>{log.content}</Text>
    </View>
  );
};

export default Detail;

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  backButton: {
    marginBottom: 10,
  },
  backButtonText: {
    fontSize: 16,
    color: '#007AFF',
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
