// scene/my/TravelLogList.tsx
import React from 'react';
import { FlatList, StyleSheet } from 'react-native';
import { TravelLog } from '../home/TravelLogCard';
import TravelLogItem from './TravelLogItem';

interface TravelLogListProps {
  logs: TravelLog[];
  onEdit: (log: TravelLog) => void;
  onDelete: (log: TravelLog) => void;
}

const TravelLogList: React.FC<TravelLogListProps> = ({ logs, onEdit, onDelete }) => {
  return (
    <FlatList
      data={logs}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <TravelLogItem log={item} onEdit={onEdit} onDelete={onDelete} />
      )}
      contentContainerStyle={styles.list}
    />
  );
};

const styles = StyleSheet.create({
  list: {
    paddingBottom: 16,
  },
});

export default TravelLogList;
