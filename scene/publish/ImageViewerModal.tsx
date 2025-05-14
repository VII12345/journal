// ImageViewerModal.tsx
import React from 'react';
import { Modal, View, Image, TouchableOpacity, Text } from 'react-native';
import { IMG_URL } from '../net';
import styles from './styles';

interface ImageViewerModalProps {
  visible: boolean;
  imageUri: string;
  onClose: () => void;
}

const ImageViewerModal: React.FC<ImageViewerModalProps> = ({ visible, imageUri, onClose }) => {
  const fullUri =
    imageUri.indexOf('://') !== -1 ? imageUri : `${IMG_URL}${imageUri}`;
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.imageViewerContainer}>
        <Image source={{ uri: fullUri }} style={styles.fullscreenImage} resizeMode="contain" />
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Text style={styles.closeButtonText}>关闭</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
};

export default ImageViewerModal;
