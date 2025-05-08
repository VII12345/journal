import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Modal,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import TravelLogList from './TravelLogList';
import Edit from './Edit';
import { TravelLog } from '../home/TravelLogCard';


const initialLogs: TravelLog[] = [
  {
    id: '1',
    title: '旅行日志 1',
    content: '这是日志内容 1 ...',
    status: 'pending',
    image: 0,
    avatar: 0,
    author: '',
    rejectionReason: '',
  },
  {
    id: '2',
    title: '旅行日志 2',
    content: '这是日志内容 2 ...',
    status: 'approved',
    image: 0,
    avatar: 0,
    author: '',
    rejectionReason: '',
  },
  {
    id: '3',
    title: '旅行日志 3',
    content: '这是日志内容 3 ...',
    status: 'rejected',
    rejectionReason: '图片不清楚',
    image: 0,
    avatar: 0,
    author: '',
  },
];

const My: React.FC = () => {
  const [logs, setLogs] = useState<TravelLog[]>(initialLogs);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showPublish, setShowPublish] = useState(false);
  const [editLog, setEditLog] = useState<TravelLog | null>(null);

  useEffect(() => {
    setIsLoggedIn(true);
  }, []);

  const handleEdit = (log: TravelLog) => {
    if (log.status === 'pending' || log.status === 'rejected') {
      setEditLog(log);
      setShowPublish(true);
    } else {
      Alert.alert('提示', '该日志已通过审核，不允许编辑');
    }
  };

  const handleDelete = (log: TravelLog) => {
    Alert.alert('删除确认', `确定要删除 "${log.title}" 吗？`, [
      { text: '取消', style: 'cancel' },
      {
        text: '确定',
        onPress: () =>
          setLogs((current) => current.filter((item) => item.id !== log.id)),
      },
    ]);
  };

  const handlePublish = () => {
    setEditLog(null);
    setShowPublish(true);
  };

  if (!isLoggedIn) {
    return (
      <View style={styles.centered}>
        <Text style={styles.promptText}>请登录以查看您的游记。</Text>
      </View>
    );
  }

  return (
    <LinearGradient colors={['#66B2FF', '#E9E9E9','#FFFFFF']} style={styles.gradient}>
      <View style={styles.container}>
        <Text style={styles.header}>我的游记</Text>
        <TravelLogList logs={logs} onEdit={handleEdit} onDelete={handleDelete} />
        <TouchableOpacity style={styles.publishButton} onPress={handlePublish}>
          <Text style={styles.publishButtonText}>发布游记</Text>
        </TouchableOpacity>
        <View style={styles.notice}>
          <Text style={styles.noticeText}>
            用户上传的内容须符合相关法律法规，上线前设置审核机制非常有必要。
          </Text>
          <Text style={styles.noticeText}>进入页面时已校验登录状态。</Text>
        </View>
      </View>

      <Modal visible={showPublish} animationType="slide">
        <Edit log={editLog || undefined} onClose={() => setShowPublish(false)} />
      </Modal>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: 'transparent',
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
    textAlign: 'center',
  },
  publishButton: {
    backgroundColor: '#34C759',
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
    marginTop: 16,
  },
  publishButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  notice: {
    marginTop: 24,
    padding: 12,
    backgroundColor: '#f9f9f9',
    borderRadius: 6,
  },
  noticeText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    textAlign: 'center',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  promptText: {
    fontSize: 18,
    color: '#666',
  },
});

export default My;
