import React from 'react';

import {
  TouchableOpacity,
  Text,
  Image,
  View,
  StyleSheet,
  ImageSourcePropType,
} from 'react-native';

export interface TravelLog {
  id: string;
  title: string;
  image: ImageSourcePropType;
  video: ImageSourcePropType;
  avatar: ImageSourcePropType;
  author: string;
  content: string;
  status: string;
  rejectionReason: string;
}

interface TravelLogCardProps {
  log: TravelLog;
  onPress: () => void;
  imageRatio?: number; // 可选的动态图片宽高比例
}

const TravelLogCard: React.FC<TravelLogCardProps> = ({ log, onPress, imageRatio }) => {
  // 每次渲染时随机生成一个 0～10px 的额外底部内边距
  const randomPadding = Math.floor(Math.random() * 10);

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <Image
        source={log.image}
        // 如果传入了 imageRatio，则动态设置图片比例，否则就让图片自适应高度（这里取消了默认的 aspectRatio）
        style={[
          styles.image,
          imageRatio ? { aspectRatio: imageRatio } : {}
        ]}
      />
      <View style={[styles.cardContent, { paddingBottom: 8 + randomPadding }]}>
        <Text style={styles.title} numberOfLines={2}>
          {log.title}
        </Text>
        <Text style={styles.contentText} numberOfLines={3}>
          {log.content}
        </Text>
        <View style={styles.userInfo}>
          <Image source={log.avatar} style={styles.avatar} />
          <Text style={styles.author} numberOfLines={1}>
            {log.author}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 3,
    // marginBottom 可交由外层 wrapper 控制，这样在 MasonryList 中能更好分隔卡片
    // marginBottom: 16,
  },
  image: {
    width: '100%',
    // 默认不设置 aspectRatio，这样当没有传入 imageRatio 时，
    // 图片会根据原始尺寸自适应（如果图片素材尺寸各异，则更容易形成瀑布流效果）
    // aspectRatio: 9 / 12,
    resizeMode: 'cover',
  },
  cardContent: {
    padding: 5,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  contentText: {
    fontSize: 14,
    color: '#555',
    marginBottom: 8,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 8,
  },
  author: {
    fontSize: 14,
    color: '#666',
  },
});

export default TravelLogCard;
