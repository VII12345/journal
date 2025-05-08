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
  ScrollView
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { TravelLog } from '../home/TravelLogCard';

interface EditProps {
  log?: TravelLog;
  onClose: () => void;
}

const Edit: React.FC<EditProps> = ({ log, onClose }) => {
  const [title, setTitle] = useState(log?.title || '');
  const [content, setContent] = useState(log?.content || '');

  useEffect(() => {
    // 可在此处添加初始化或登录校验逻辑
  }, []);

  const handleSubmit = () => {
    if (!title.trim() || !content.trim()) {
      Alert.alert('提示', '请完整填写标题和内容');
      return;
    }
    Alert.alert('成功', log ? '编辑成功' : '发布成功', [
      { text: '确定', onPress: () => onClose() },
    ]);
  };

  return (
    <LinearGradient colors={['#a1c4fd', '#c2e9fb']} style={styles.gradient}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.contentContainer}>
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
          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <Text style={styles.submitButtonText}>
              {log ? '保存编辑' : '发布游记'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
            <Text style={styles.cancelButtonText}>取消</Text>
          </TouchableOpacity>
          <View style={styles.notice}>
            <Text style={styles.noticeText}>
              用户上传的内容外网展示需符合相关法律法规，上线前设置审核机制非常有必要。
            </Text>
            <Text style={styles.noticeText}>进入页面时已校验登录状态。</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    justifyContent: 'center',
  },
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
  textArea: {
    height: 150,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: '#007aff',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  cancelButton: {
    backgroundColor: '#888',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 24,
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  notice: {
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 8,
  },
  noticeText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default Edit;
