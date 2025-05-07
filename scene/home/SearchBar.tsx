import React from 'react';
import { TextInput, StyleSheet } from 'react-native';

interface SearchBarProps {
  searchText: string;
  onChangeText: (text: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ searchText, onChangeText }) => {
  return (
    <TextInput
      style={styles.searchInput}
      placeholder="搜索旅行日志..."
      value={searchText}
      onChangeText={onChangeText}
    />
  );
};

const styles = StyleSheet.create({
  searchInput: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
    backgroundColor: '#f9f9f9',
  },
});

export default SearchBar;
