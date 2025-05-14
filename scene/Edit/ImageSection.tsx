// ImageSection.tsx
import React from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity } from 'react-native';
import { IMG_URL } from '../net';
import styles from './styles';

interface ImageSectionProps {
  images: string[];
  onAddImage: () => void;
  onDeleteImage: (index: number) => void;
  onImagePress: (imgUri: string) => void;
}

const ImageSection: React.FC<ImageSectionProps> = ({ images, onAddImage, onDeleteImage, onImagePress }) => {
  return (
    <View style={styles.mediaSection}>
      <Text style={styles.subHeader}>图片展示</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {images.map((imgUrl, index) => {
          const displayUrl = imgUrl.indexOf('://') !== -1 ? imgUrl : `${IMG_URL}${imgUrl}`;
          return (
            <View key={index} style={styles.mediaItemWrapper}>
              <TouchableOpacity onPress={() => onImagePress(imgUrl)}>
                <Image source={{ uri: displayUrl }} style={styles.mediaImage} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.deleteIcon} onPress={() => onDeleteImage(index)}>
                <Text style={styles.deleteIconText}>X</Text>
              </TouchableOpacity>
            </View>
          );
        })}
        <TouchableOpacity style={styles.addButton} onPress={onAddImage}>
          <Image
            source={require('./img/add.png')} // 本地"添加"图标
            style={{ width: 24, height: 24, tintColor: '#007aff' }}
          />
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

export default ImageSection;
