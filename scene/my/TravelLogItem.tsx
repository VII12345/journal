// scene/my/TravelLogItem.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { TravelLog } from '../home/TravelLogCard';

interface TravelLogItemProps {
  log: TravelLog;
  onEdit: (log: TravelLog) => void;
  onDelete: (log: TravelLog) => void;
}

const TravelLogItem: React.FC<TravelLogItemProps> = ({ log, onEdit, onDelete }) => {
  return (
    <View style={styles.logItem}>
      <Text style={styles.logTitle}>{log.title}</Text>
      <Text style={styles.logContent}>{log.content}</Text>
      <Text style={styles.logStatus}>
        状态： {log.status === 'pending' ? '待审核' : log.status === 'approved' ? '已通过' : '未通过'}
      </Text>
      {log.status === 'rejected' && log.rejectionReason && (
        <Text style={styles.rejectionReason}>拒绝原因： {log.rejectionReason}</Text>
      )}
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
  logTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#222',
  },
  logContent: {
    fontSize: 16,
    color: '#555',
    marginVertical: 8,
  },
  logStatus: {
    fontSize: 14,
    color: '#888',
  },
  rejectionReason: {
    fontSize: 14,
    color: 'red',
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
});

export default TravelLogItem;
