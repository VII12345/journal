// VideoSection.tsx
import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import Video from 'react-native-video';
import { VIDEO_URL } from '../net';
import styles from './styles';

interface VideoSectionProps {
  videos: string[];
  onAddVideo: () => void;
  onDeleteVideo: (index: number) => void;
}

const VideoSection: React.FC<VideoSectionProps> = ({ videos, onAddVideo, onDeleteVideo }) => {
  return (
    <View style={styles.mediaSection}>
      <Text style={styles.subHeader}>视频展示</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {videos.map((videoUrl, index) => {
          const displayUrl = videoUrl.indexOf('://') !== -1 ? videoUrl : `${VIDEO_URL}${videoUrl}`;
          return (
            <View key={index} style={styles.mediaItemWrapper}>
              <Video
                source={{ uri: displayUrl }}
                style={styles.mediaVideo}
                controls
                resizeMode="contain"
              />
              <TouchableOpacity style={styles.deleteIcon} onPress={() => onDeleteVideo(index)}>
                <Text style={styles.deleteIconText}>X</Text>
              </TouchableOpacity>
            </View>
          );
        })}
        <TouchableOpacity style={styles.addButton} onPress={onAddVideo}>
          <Image
            source={require('./img/add.png')}
            style={{ width: 24, height: 24, tintColor: '#007aff' }}
          />
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

export default VideoSection;
