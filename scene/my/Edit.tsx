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
  Modal as RNModal
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Video from 'react-native-video';
import { launchImageLibrary } from 'react-native-image-picker';
import { TravelLog } from '../home/TravelLogCard';
import { DATABASE_URL, IMG_URL, VIDEO_URL } from '../net';

interface EditProps {
  // 传入已有日志（只用于编辑操作）
  log?: TravelLog;
  // onClose 回调：完成编辑后返回更新后的日志数据以刷新列表
  onClose: (updatedLog?: TravelLog) => void;
  // 编辑时传入对应日志记录的 id，用于查询详情数据
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
  // 用于全屏查看图片
  const [isImageViewerVisible, setIsImageViewerVisible] = useState(false);
  const [viewerImage, setViewerImage] = useState('');


const [serverImages, setServerImages] = useState<string[]>([]);  // 服务器端的图片列表
const [serverVideos, setServerVideos] = useState<string[]>([]);  // 服务器端的视频列表

  // 当 travelLogId 存在时，调用接口获取日志详情
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

        // 保存服务器端的图片和视频列表
        setServerImages(imagesArray);
        setServerVideos(videosArray);
      })
      .catch((error) => {
        Alert.alert('错误', '无法获取日志详情');
      });
  }
}, [travelLogId]);

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

// 选择视频
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
          style={[
            styles.input,
            styles.textArea,
            { height: Math.max(MIN_INPUT_HEIGHT, inputHeight) },
          ]}
          placeholder="请输入游记内容"
          placeholderTextColor="#888"
          value={content}
          onChangeText={setContent}
          multiline
          numberOfLines={6}
          onContentSizeChange={(e) =>
            setInputHeight(e.nativeEvent.contentSize.height)
          }
        />

        {/* 图片部分 */}
        <View style={styles.mediaSection}>
          <Text style={styles.subHeader}>图片展示</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {images.map((imgUrl, index) => {
              // 组装显示使用的 URL，若未包含协议则加上 IMG_URL 前缀
              const displayUrl =
                imgUrl.indexOf('://') !== -1 ? imgUrl : `${IMG_URL}${imgUrl}`;
              return (
                <View key={index} style={styles.mediaItemWrapper}>
                  <TouchableOpacity onPress={() => openImageViewer(imgUrl)}>
                    <Image
                      source={{
                        uri: displayUrl,
                      }}
                      style={styles.mediaImage}
                    />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.deleteIcon}
                    onPress={() => handleDeleteImage(index)}
                  >
                    <Text style={styles.deleteIconText}>X</Text>
                  </TouchableOpacity>
                </View>
              );
            })}
            <TouchableOpacity style={styles.addButton} onPress={handleAddImage}>
              <Text style={styles.addButtonText}>添加图片</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* 视频部分 */}
        <View style={styles.mediaSection}>
          <Text style={styles.subHeader}>视频展示</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {videos.map((videoUrl, index) => {
              // 如果 videoUrl 不包含协议，则使用 VIDEO_URL 拼接
              const displayUrl =
                videoUrl.indexOf('://') !== -1 ? videoUrl : `${VIDEO_URL}${videoUrl}`;
              return (
                <View key={index} style={styles.mediaItemWrapper}>
                  <Video
                    source={{
                      uri: displayUrl,
                    }}
                    style={styles.mediaVideo}
                    controls
                    resizeMode="contain"
                  />
                  <TouchableOpacity
                    style={styles.deleteIcon}
                    onPress={() => handleDeleteVideo(index)}
                  >
                    <Text style={styles.deleteIconText}>X</Text>
                  </TouchableOpacity>
                </View>
              );
            })}
            <TouchableOpacity style={styles.addButton} onPress={handleAddVideo}>
              <Text style={styles.addButtonText}>添加视频</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        <TouchableOpacity
          style={styles.submitButton}
          onPress={handleSubmit}
          disabled={loading}
        >
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

    {/* 图片大图查看 Modal */}
    {isImageViewerVisible && (
      <RNModal visible={isImageViewerVisible} transparent animationType="fade">
        <View style={styles.imageViewerContainer}>
          <Image
            source={{
              uri:
                viewerImage.indexOf('://') !== -1
                  ? viewerImage
                  : `${IMG_URL}${viewerImage}`,
            }}
            style={styles.fullscreenImage}
            resizeMode="contain"
          />
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setIsImageViewerVisible(false)}
          >
            <Text style={styles.closeButtonText}>关闭</Text>
          </TouchableOpacity>
        </View>
      </RNModal>
    )}
  </LinearGradient>
);


};

const styles = StyleSheet.create({
  urlText: {
    marginTop: 4,
    fontSize: 12,
    color: '#333',
    textAlign: 'center',
  },
  gradient: { flex: 1 },
  container: { flex: 1 },
  contentContainer: { padding: 20, justifyContent: 'center' },
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
  textArea: { textAlignVertical: 'top' },
  mediaSection: { marginBottom: 16 },
  subHeader: { fontSize: 16, fontWeight: 'bold', marginBottom: 8, color: '#333' },
  mediaItemWrapper: { position: 'relative', marginRight: 8 },
  mediaImage: { width: 120, height: 80, borderRadius: 8, resizeMode: 'cover' },
  mediaVideo: { width: 120, height: 80, borderRadius: 8, backgroundColor: '#000' },
  deleteIcon: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: 'rgba(255,0,0,0.7)',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteIconText: { color: '#fff', fontSize: 12 },
  addButton: {
    backgroundColor: '#007aff',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  addButtonText: { color: '#fff', fontSize: 14, padding: 5 },
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
  notice: { backgroundColor: '#f9f9f9', padding: 12, borderRadius: 8 },
  noticeText: { fontSize: 14, color: '#666', textAlign: 'center', lineHeight: 20 },
  imageViewerContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullscreenImage: { width: '100%', height: '80%' },
  closeButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 10,
    borderRadius: 20,
  },
  closeButtonText: { color: '#fff', fontSize: 16 },
});

export default Edit;
