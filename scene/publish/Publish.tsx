// scene/publish/Publish.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
  Keyboard,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { launchImageLibrary } from 'react-native-image-picker';
import type { ImageLibraryOptions, PhotoQuality } from 'react-native-image-picker';
import Video from 'react-native-video';
import { TravelLog } from '../home/TravelLogCard';

export interface PublishProps {
  // 编辑模式下预填数据；新建时为 undefined
  log?: TravelLog;
  // 当点击取消时调用，父组件处理返回逻辑
  onCancel: () => void;
  // 当点击发布（或保存编辑）后调用，父组件处理返回逻辑
  onSubmit: () => void;
}

const Publish: React.FC<PublishProps> = ({ log, onCancel, onSubmit }) => {
  const [title, setTitle] = useState<string>(log?.title || '');
  const [content, setContent] = useState<string>(log?.content || '');

  // 图片相关状态：选择的图片 URI 与上传成功后返回的图片 URL
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);

  // 视频相关状态：选择的 URI 与上传成功后返回的视频 URL
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const [uploadedVideoUrl, setUploadedVideoUrl] = useState<string | null>(null);

  useEffect(() => {
    setTitle(log?.title || '');
    setContent(log?.content || '');
  }, [log]);

  // 上传图片到服务器（示例代码，实际接口地址需替换）
  const uploadImageToServer = async (imageUri: string) => {
    const filename = imageUri.split('/').pop();
    const match = /\.(\w+)$/.exec(filename || '');
    const type = match ? `image/${match[1]}` : 'image';

    const formData = new FormData();
    formData.append('photo', {
      uri: imageUri,
      name: filename,
      type,
    } as any);

    try {
      const response = await fetch('http://10.0.2.2:8080/upload', {
        method: 'POST',
        body: formData,
      });
      const result = await response.json();
      console.log('上传图片成功: ', result);
      // 假设服务器返回的 JSON 中带有 imageUrl 字段
      setUploadedImageUrl(result.imageUrl);
    } catch (error) {
      console.error('上传图片过程中出错：', error);
      throw error;
    }
  };

  // 上传视频到服务器（示例代码，服务器需要支持接收 video 字段）
  const uploadVideoToServer = async (videoUri: string) => {
    const filename = videoUri.split('/').pop();
    const match = /\.(\w+)$/.exec(filename || '');
    const type = match ? `video/${match[1]}` : 'video';

    const formData = new FormData();
    formData.append('video', {
      uri: videoUri,
      name: filename,
      type,
    } as any);

    try {
      const response = await fetch('http://10.0.2.2:8080/upload', {
        method: 'POST',
        body: formData,
      });
      const result = await response.json();
      console.log('上传视频成功: ', result);
      // 假设服务器返回的 JSON 中带有 videoUrl 字段
      setUploadedVideoUrl(result.videoUrl);
    } catch (error: any) {
      console.error('上传视频过程中出错：', error.message || error);
      throw error;
    }
  };

  // 发布游记：点击按钮后再上传图片和视频（如果尚未上传），上传完毕后再调用 onSubmit
  const handleSubmit = async () => {
    Keyboard.dismiss();
    if (!title.trim() || !content.trim()) {
      Alert.alert('提示', '请完整填写标题和内容');
      return;
    }
    try {
      // 如果图片已选择，但尚未上传，则先上传
      if (selectedImage && !uploadedImageUrl) {
        await uploadImageToServer(selectedImage);
      }
      // 如果视频已选择，但尚未上传，则先上传
      if (selectedVideo && !uploadedVideoUrl) {
        await uploadVideoToServer(selectedVideo);
      }
      Alert.alert('成功', log ? '编辑成功' : '发布游记', [
        { text: '确定', onPress: onSubmit },
      ]);
    } catch (error) {
      Alert.alert('上传错误', '文件上传失败，请重试');
    }
  };

  const handleCancel = () => {
    onCancel();
  };

  // 选择图片，仅保存图片 URI；上传延后到发布时执行
  const handleUploadImage = () => {
    const options: ImageLibraryOptions = {
      mediaType: 'photo' as const,
      quality: (1 as unknown) as PhotoQuality,
    };
    launchImageLibrary(options, (response) => {
      if (response.didCancel) {
        console.log('用户取消了图片选择');
      } else if (response.errorMessage) {
        console.error('图片选择发生错误:', response.errorMessage);
      } else if (response.assets && response.assets.length > 0) {
        const uri = response.assets[0].uri;
        if (uri) {
          setSelectedImage(uri);
        }
      }
    });
  };

  // 选择视频，仅保存视频 URI；上传视频操作延后到发布时执行
  const handleUploadVideo = () => {
    const options: ImageLibraryOptions = {
      mediaType: 'video' as const,
    };
    launchImageLibrary(options, (response) => {
      if (response.didCancel) {
        console.log('用户取消了视频选择');
      } else if (response.errorMessage) {
        console.error('视频选择发生错误:', response.errorMessage);
      } else if (response.assets && response.assets.length > 0) {
        const uri = response.assets[0].uri;
        if (uri) {
          setSelectedVideo(uri);
        }
      }
    });
  };

  return (
    <LinearGradient colors={['#66B2FF', '#E9E9E9','#FFFFFF']} style={styles.gradient}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <Text style={styles.header}>发布游记</Text>
          <TextInput
            style={styles.input}
            placeholder="请输入游记标题"
            placeholderTextColor="#888"
            value={title}
            onChangeText={setTitle}
          />
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="请输入游记内容"
            placeholderTextColor="#888"
            value={content}
            onChangeText={setContent}
            multiline
            numberOfLines={6}
          />
          <TouchableOpacity style={styles.uploadButton} onPress={handleUploadImage}>
            <Text style={styles.uploadButtonText}>选择图片</Text>
          </TouchableOpacity>
          {selectedImage && (
            <Image source={{ uri: selectedImage }} style={styles.imagePreview} />
          )}
          {uploadedImageUrl && (
            <Text style={styles.uploadInfo}>服务器返回图片地址: {uploadedImageUrl}</Text>
          )}
          <TouchableOpacity style={styles.uploadButton} onPress={handleUploadVideo}>
            <Text style={styles.uploadButtonText}>选择视频</Text>
          </TouchableOpacity>
          {selectedVideo && (
            <View style={styles.videoContainer}>
              <Text style={styles.uploadInfo}>预览选择的视频:</Text>
              <Video
                source={{ uri: selectedVideo }}
                style={styles.videoPreview}
                controls
                resizeMode="cover"
              />
            </View>
          )}
          {uploadedVideoUrl && (
            <Text style={styles.uploadInfo}>服务器返回视频地址: {uploadedVideoUrl}</Text>
          )}
          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <Text style={styles.submitButtonText}>
              {log ? '保存编辑' : '发布游记'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
            <Text style={styles.cancelButtonText}>取消</Text>
          </TouchableOpacity>
          <View style={styles.notice}>
            <Text style={styles.noticeText}>
              用户上传的内容外网展示需符合相关法律法规，上线前设置审核机制非常有必要。
            </Text>
            <Text style={styles.noticeText}>
              进入页面时已校验登录状态。
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  container: { flex: 1 },
  scrollContainer: { padding: 20, paddingTop: 40, paddingBottom: 40 },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 24,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
    color: '#333',
    backgroundColor: '#fff',
    marginBottom: 16,
  },
  textArea: { height: 150, textAlignVertical: 'top' },
  uploadButton: {
    backgroundColor: '#FFA500',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  uploadButtonText: { color: '#fff', fontSize: 16 },
  imagePreview: {
    width: '100%',
    height: 200,
    marginBottom: 12,
    resizeMode: 'cover',
    borderRadius: 8,
  },
  videoContainer: { marginBottom: 12, alignItems: 'center' },
  videoPreview: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    backgroundColor: '#000',
  },
  uploadInfo: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
    textAlign: 'center',
  },
  submitButton: {
    backgroundColor: '#007aff',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  submitButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  cancelButton: {
    backgroundColor: '#888',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 24,
  },
  cancelButtonText: { color: '#fff', fontSize: 16 },
  notice: {
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 8,
    marginTop: 20,
  },
  noticeText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default Publish;
