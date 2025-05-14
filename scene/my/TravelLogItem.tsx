import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  LayoutChangeEvent,
} from 'react-native';
import { TravelLog } from '../home/TravelLogCard';

interface TravelLogItemProps {
  log: TravelLog;
  onEdit: (log: TravelLog) => void;
  onDelete: (log: TravelLog) => void;
}

const TravelLogItem: React.FC<TravelLogItemProps> = ({ log, onEdit, onDelete }) => {
  // 用于记录左侧“图片+标题+状态+拒绝原因”部分的高度
  const [leftContentHeight, setLeftContentHeight] = useState<number>(0);

  const handleLeftLayout = (event: LayoutChangeEvent) => {
    const { height } = event.nativeEvent.layout;
    setLeftContentHeight(height);
  };

  // 根据文字行高（假设为22）和统计的高度，动态计算允许显示的行数
  const lineHeight = 22;
  const numberOfLines = leftContentHeight ? Math.floor(leftContentHeight / lineHeight) : undefined;

  return (
    <View style={styles.logItem}>
      <View style={styles.rowContainer}>
        {/* 左侧部分：图片、标题、状态、拒绝原因以及按钮 */}
        <View style={styles.leftColumn}>
          {/* 包裹图片和上方文字信息，测量其总高度 */}
          <View onLayout={handleLeftLayout}>
            <Image source={log.image} style={styles.image} />
            <Text style={styles.logTitle}>{log.title}</Text>
            <Text style={styles.logStatus}>
              状态： {log.status === 'pending' ? '待审核' : log.status === 'approved' ? '已通过' : '未通过'}
            </Text>
            {log.status === 'rejected' && log.rejectionReason && (
              <Text style={styles.rejectionReason}>拒绝原因： {log.rejectionReason}</Text>
            )}
          </View>
          <View style={styles.buttonContainer}>
            {(log.status === 'pending' || log.status === 'rejected') && (
              <TouchableOpacity style={styles.button} onPress={() => onEdit(log)}>
                <Text style={styles.buttonText}>编辑</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={styles.button} onPress={() => onDelete(log)}>
              <Text style={styles.buttonText}>删除</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 右侧部分：内容文本，其高度由左侧信息决定，从图片顶部开始 */}
        <View style={[styles.rightColumn, { height: leftContentHeight }]}>
          <Text style={styles.logContent} numberOfLines={numberOfLines}>
            {log.content}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  logItem: {
    backgroundColor: '#fff',
    padding: 12,
    marginBottom: 12,
    borderRadius: 8,
    elevation: 2,
  },
  rowContainer: {
    flexDirection: 'row',
  },
  leftColumn: {
    flex: 1,
    paddingRight: 8,
  },
  rightColumn: {
    flex: 1,
    paddingLeft: 8,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: 120,
    resizeMode: 'cover',
    borderRadius: 4,
    marginBottom: 8,
  },
  logTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 4,
  },
  logStatus: {
    fontSize: 14,
    color: '#888',
    marginBottom: 4,
  },
  rejectionReason: {
    fontSize: 14,
    color: 'red',
    marginBottom: 4,
  },
  buttonContainer: {
    flexDirection: 'row',
    marginTop: 8,
  },
  button: {
    backgroundColor: '#007aff',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
    marginRight: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
  },
  logContent: {
    fontSize: 16,
    color: '#555',
    lineHeight: 22,
  },
});

export default TravelLogItem;
