import React from 'react';
import { TouchableOpacity, Text, Image, View, StyleSheet, ImageSourcePropType } from 'react-native';

export interface TravelLog {
  id: string;
  title: string;
  image: ImageSourcePropType;
  video:ImageSourcePropType
  avatar: ImageSourcePropType;
  author: string;
  content:string;
  status:string;
  rejectionReason:string;
}

interface TravelLogCardProps {
  log: TravelLog;
  onPress: () => void;
}

const TravelLogCard: React.FC<TravelLogCardProps> = ({ log, onPress }) => {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <Image source={log.image} style={styles.image} />

      <View style={styles.cardContent}>

      <Text style={styles.title}>{log.title}</Text>
      
        <View style={styles.userInfo}>
          <Image source={log.avatar} style={styles.avatar} />
          <Text style={styles.author}>{log.author}</Text>
        </View>
        
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    marginBottom: 16,
    backgroundColor: '#fafafa',
    borderRadius: 8,
    overflow: 'hidden',
    elevation: 2,
  },
  image: {
    width: 150,
    height: 100,
    resizeMode: 'cover',
  },
  cardContent: {
    flex: 1,
    padding: 8,
    justifyContent: 'center',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: -5,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 8,
  },
  title: {
    bottom:15,
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  author: {
    fontSize: 14,
    color: '#666',
  },
});

export default TravelLogCard;
