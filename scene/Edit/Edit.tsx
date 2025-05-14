// Edit.tsx
import React, { useState, useEffect } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { launchImageLibrary } from 'react-native-image-picker';
import Video from 'react-native-video';
import { DATABASE_URL,IMG_URL } from '../net';
import { TravelLog } from '../home/TravelLogCard';
import ImageSection from './ImageSection';
import VideoSection from './VideoSection';
import ImageViewerModal from './ImageViewerModal';
import styles from './styles';

interface EditProps {
  // 传入已有日志（只用于编辑操作）
  log?: TravelLog;
  // 完成编辑后返回更新后的日志数据以刷新列表
  onClose: (updatedLog?: TravelLog) => void;
  // 编辑时传入对应日志记录的id，用于查询详情数据
  travelLogId?: string;
}

const MIN_INPUT_HEIGHT = 150;

const Edit: React.FC<EditProps> = ({ log, onClose, travelLogId }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [inputHeight, setInputHeight] = useState(MIN_INPUT_HEIGHT);
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [videos, setVideos] = useState<string[]>([]);
  // 用于全屏预览图片
  const [isImageViewerVisible, setIsImageViewerVisible] = useState(false);
  const [viewerImage, setViewerImage] = useState('');
  // 保存从服务器获取的媒体列表（用于判断删除了哪些媒体）
  const [serverImages, setServerImages] = useState<string[]>([]);
  const [serverVideos, setServerVideos] = useState<string[]>([]);

  // 加载详情数据
  useEffect(() => {
    if (travelLogId) {
      fetch(`${DATABASE_URL}/travel_logs/detail?id=${travelLogId}`)
        .then((response) => response.json())
        .then((data) => {
          setTitle(data.title || '');
          setContent(data.content || '');
          let imagesArray: string[] = [];
          if (Array.isArray(data.image)) {
            imagesArray = data.image;
          } else if (typeof data.image === 'string') {
            imagesArray = data.image.split(',');
          }
          setImages(imagesArray);
          let videosArray: string[] = [];
          if (Array.isArray(data.videos)) {
            videosArray = data.videos;
          } else if (typeof data.videos === 'string') {
            videosArray = data.videos.split(',');
          }
          setVideos(videosArray);
          setServerImages(imagesArray);
          setServerVideos(videosArray);
        })
        .catch((error) => {
          Alert.alert('错误', '无法获取日志详情');
        });
    }
  }, [travelLogId]);

  // 选择并添加图片（这里仅保存选中的图片 URI）
        const handleAddImage = () => {
        launchImageLibrary({ mediaType: 'photo' }, (response) => {
            if (response.didCancel) {
            console.log('用户取消选择图片');
            return;
            }
            if (response.errorCode) {
            Alert.alert('错误', response.errorMessage || '选择图片出错');
            return;
            }
            if (response.assets && response.assets.length > 0) {
            const asset = response.assets[0];
            if (asset.uri) {
                // 确保更新的数组只包含有效的字符串，过滤掉 undefined
                setImages(prev => {
                const updatedImages = [...prev, asset.uri];
                return updatedImages.filter((uri): uri is string => uri !== undefined);
                });
            }
            }
        });
        };

  // 选择并添加视频（同上）
        const handleAddVideo = () => {
        launchImageLibrary({ mediaType: 'video' }, (response) => {
            if (response.didCancel) {
            console.log('用户取消选择视频');
            return;
            }
            if (response.errorCode) {
            Alert.alert('错误', response.errorMessage || '选择视频出错');
            return;
            }
            if (response.assets && response.assets.length > 0) {
            const asset = response.assets[0];
            if (asset.uri) {
                // 确保更新的数组只包含有效的字符串，过滤掉 undefined
                setVideos(prev => {
                const updatedVideos = [...prev, asset.uri];
                return updatedVideos.filter((uri): uri is string => uri !== undefined);
                });
            }
            }
        });
        };

// 删除图片
const handleDeleteImage = (index: number) => {
  setImages(prev => prev.filter((_, idx) => idx !== index)); // 删除指定索引的图片
};

// 删除视频
const handleDeleteVideo = (index: number) => {
  setVideos(prev => prev.filter((_, idx) => idx !== index)); // 删除指定索引的视频
};

// 打开大图查看
const openImageViewer = (imgUri: string) => {
  const fullUri =
    imgUri.startsWith('http') || imgUri.startsWith('file://') || imgUri.startsWith('content://')
      ? imgUri
      : `${IMG_URL}${imgUri}`;

  setViewerImage(fullUri);
  setIsImageViewerVisible(true);
};

// 提交上传请求
const handleSubmit = async () => {
  if (!title.trim() || !content.trim()) {
    Alert.alert('提示', '请完整填写标题和内容');
    return;
  }
  setLoading(true);
  const findDeletedMedia = (currentMedia: string[], serverMedia: string[]) => {
  // 返回服务器端存在而客户端已删除的媒体 URL
  return serverMedia.filter((url) => !currentMedia.includes(url));
};

  try {
    // 查找客户端删除的图片和视频
    const deletedImages = findDeletedMedia(images, serverImages);
    const deletedVideos = findDeletedMedia(videos, serverVideos);

    // 如果有要删除的文件，调用删除接口
    if (deletedImages.length > 0 || deletedVideos.length > 0) {
      const deleteFormData = new FormData();
      deleteFormData.append('images', JSON.stringify(deletedImages));
      deleteFormData.append('videos', JSON.stringify(deletedVideos));

      const deleteRes = await fetch(`${DATABASE_URL}/media_delete`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    images: deletedImages,
    videos: deletedVideos,
    travel_log_id:travelLogId
  }),
});


      if (!deleteRes.ok) {
        throw new Error('删除媒体文件失败');
      }

      console.log('删除成功:', deletedImages, deletedVideos);
    }

    // 上传图片和视频
    const uploadedImages = await Promise.all(
      images
        .filter(imgUri => imgUri.startsWith('file://') || imgUri.startsWith('content://'))
        .map(async (imgUri) => {
          const formData = new FormData();
          formData.append('file', {
            uri: imgUri,
            name: 'upload.jpg',
            type: 'image/jpeg',
          } as any);
          formData.append('filetype', 'image');
          if (travelLogId) {
            formData.append('travel_log_id', travelLogId);
          }

          const res = await fetch(`${DATABASE_URL}/upload_media`, {
            method: 'POST',
            body: formData,
          });

          const contentType = res.headers.get('Content-Type') || '';

          if (!res.ok) {
            const errorText = contentType.includes('application/json')
              ? await res.text()
              : '服务器错误';
            throw new Error(`上传图片失败: ${errorText}`);
          }

          const json = await res.json();

          if (!json.file_url) {
            throw new Error('上传失败：响应中缺少 file_url');
          }

          return json.file_url;
        })
    );

    // 上传视频
    const uploadedVideos = await Promise.all(
      videos
        .filter(videoUri => videoUri.startsWith('file://') || videoUri.startsWith('content://'))
        .map(async (videoUri) => {
          const formData = new FormData();
          formData.append('file', {
            uri: videoUri,
            name: 'upload_video.mp4',
            type: 'video/mp4',
          } as any);
          formData.append('filetype', 'video');
          if (travelLogId) {
            formData.append('travel_log_id', travelLogId);
          }

          const res = await fetch(`${DATABASE_URL}/upload_media`, {
            method: 'POST',
            body: formData,
          });

          const contentType = res.headers.get('Content-Type') || '';
          const status = res.status;
          const responseText = await res.text();

          console.log('上传视频响应状态:', status);
          console.log('上传视频响应内容:', responseText);

          if (!res.ok) {
            throw new Error(`上传视频失败（状态码 ${status}）: ${responseText}`);
          }

          return videoUri; // 这里返回视频的 URI
        })
    );

    // 合并本地上传的和已存在的远程资源
    const payload = {
      title: title.trim(),
      content: content.trim(),
      status: 'pending',
      image: [
        ...images.filter(uri => uri.startsWith('http')), // 已存在的远程图
        ...uploadedImages,                               // 新上传的图
      ],
      videos: [
        ...videos.filter(uri => uri.startsWith('http')), // 已存在的远程视频
        ...uploadedVideos,                               // 新上传的视频
      ]
    };

    if (!travelLogId) {
      Alert.alert('错误', '编辑失败：缺少日志 ID');
      setLoading(false);
      return;
    }

    const updateRes = await fetch(`${DATABASE_URL}/travel_logs/${travelLogId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!updateRes.ok) {
      throw new Error('保存失败，请稍后重试');
    }

    const updatedLog = await updateRes.json();
    Alert.alert('成功', '编辑成功', [
      { text: '确定', onPress: () => onClose(updatedLog) },
    ]);
  } catch (error: any) {
    Alert.alert('错误', error.message);
  } finally {
    setLoading(false);
  }
};


  return (
    <LinearGradient colors={['#a1c4fd', '#c2e9fb']} style={styles.gradient}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.contentContainer}>
          <Text style={styles.header}>编辑游记</Text>
          <TextInput
            style={styles.input}
            placeholder="请输入游记标题"
            placeholderTextColor="#888"
            value={title}
            onChangeText={setTitle}
          />
          <TextInput
            style={[styles.input, styles.textArea, { height: Math.max(MIN_INPUT_HEIGHT, inputHeight) }]}
            placeholder="请输入游记内容"
            placeholderTextColor="#888"
            value={content}
            onChangeText={setContent}
            multiline
            numberOfLines={6}
            onContentSizeChange={(e) => setInputHeight(e.nativeEvent.contentSize.height)}
          />

          {/* 图片部分，由单独的组件处理 */}
          <ImageSection
            images={images}
            onAddImage={handleAddImage}
            onDeleteImage={handleDeleteImage}
            onImagePress={openImageViewer}
          />

          {/* 视频部分，由单独的组件处理 */}
          <VideoSection
            videos={videos}
            onAddVideo={handleAddVideo}
            onDeleteVideo={handleDeleteVideo}
          />

          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit} disabled={loading}>
            <Text style={styles.submitButtonText}>保存编辑</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cancelButton} onPress={() => onClose()}>
            <Text style={styles.cancelButtonText}>取消</Text>
          </TouchableOpacity>
          <View style={styles.notice}>
            <Text style={styles.noticeText}>
              用户上传的内容须符合相关法律法规，上线前设置审核机制非常有必要。
            </Text>
            <Text style={styles.noticeText}>进入页面时已校验登录状态。</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* 图片全屏预览组件 */}
      <ImageViewerModal
        visible={isImageViewerVisible}
        imageUri={viewerImage}
        onClose={() => setIsImageViewerVisible(false)}
      />
    </LinearGradient>
  );
};

export default Edit;
