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
import { DATABASE_URL, IMG_URL } from '../net';

const My: React.FC = () => {
  const [logs, setLogs] = useState<TravelLog[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userId, setUserId] = useState<string>('');
  const [showPublish, setShowPublish] = useState(false);
  const [editLog, setEditLog] = useState<TravelLog | null>(null);

  // 封装一个从数据库中获取日志的方法，并逐项将数据添加到日志数组中
const fetchLogsFromDB = () => {
  fetch(`${DATABASE_URL}/User/get?id=${userId}`)
    .then((response) => response.json())
    .then((data) => {
      console.log('后端返回的数据:', data);
      // 根据返回数据检查是否有 id 或其它标识字段，例如可能为 seq_id
      const newLogs: TravelLog[] = data.map((item: any) => {
        let firstImage = '';
        if (Array.isArray(item.image) && item.image.length > 0) {
          firstImage = item.image[0];
        } else if (typeof item.image === 'string' && item.image.includes(',')) {
          firstImage = item.image.split(',')[0];
        } else {
          firstImage = item.image || '';
        }
        return {
          // 优先检查 id 字段，如果没有，再检查 seq_id 或其它字段
          id: item.id ? item.id.toString() : (item.seq_id ? item.seq_id.toString() : ''),
          title: item.title || '',
          image: { uri: `${IMG_URL}${firstImage}` },
          avatar: { uri: `${IMG_URL}${item.avatar}` },
          author: item.author || '',
          content: item.content || '',
          status: item.status || '',
          rejectionReason: item.rejectionReason || '',
        };
      });
      setLogs(newLogs);
    })
    .catch((error) => console.error('获取日志数据失败:', error));
};


  // 模拟用户登录，并设置 userId（实际项目中需要根据登录接口返回的数据设置）
  useEffect(() => {
    setIsLoggedIn(true);
    setUserId('1'); // 示例用户ID
  }, []);

  // 当 userId 设置好后，从数据库中加载该用户的日志
  useEffect(() => {
    if (userId) {
      fetchLogsFromDB();
    }
  }, [userId]);

  const handleEdit = (log: TravelLog) => {
    console.log('编辑按钮点击，log 对象：', log);
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
        onPress: () => {
          // 调用删除接口（这里假设接口 URL 为 /travel_logs/{log.id}）
          fetch(`${DATABASE_URL}/travel_logs/${log.id}`, {
            method: 'DELETE',
          })
            .then((response) => {
              if (response.ok) {
                // 删除成功后重新加载日志数据
                fetchLogsFromDB();
              } else {
                Alert.alert('错误', '删除失败，请稍后重试');
              }
            })
            .catch((error) => console.error('删除日志错误:', error));
        },
      },
    ]);
  };

  const handlePublish = () => {
    // 发布新日志时，不传入编辑对象
    setEditLog(null);
    setShowPublish(true);
  };

  // Edit 组件完成编辑后回调
  // 如果 updatedLog 存在，则表示编辑或新建日志成功，需要刷新日志列表
  const handleEditClose = (updatedLog?: TravelLog) => {
    setShowPublish(false);
    setEditLog(null);
    if (updatedLog) {
      fetchLogsFromDB();
    }
  };

  if (!isLoggedIn) {
    return (
      <View style={styles.centered}>
        <Text style={styles.promptText}>请登录以查看您的游记。</Text>
      </View>
    );
  }

  return (
    <LinearGradient
      colors={['#66B2FF', '#E9E9E9', '#FFFFFF']}
      style={styles.gradient}
    >
      <View style={styles.container}>
        <Text style={styles.header}>我的游记</Text>
        <Text style={styles.userIdText}>用户ID：{userId}</Text>
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
        <Edit 
    log={editLog || undefined} 
    onClose={handleEditClose} 
    travelLogId={editLog ? editLog.id : undefined} 
  />
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
    marginBottom: 8,
    color: '#333',
    textAlign: 'center',
  },
  userIdText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 16,
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
