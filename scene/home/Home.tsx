// scene/home/Home.tsx
import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  FlatList,
  ActivityIndicator,
  StyleSheet
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import SearchBar from './SearchBar';
import TravelLogCard, { TravelLog } from './TravelLogCard';
import BottomNav, { NavTab } from './BottomNav';
import { fetchTravelLogs, PAGE_SIZE, allLogs } from './TravelLogData';

const Home: React.FC = () => {
  // 定义状态
  const [pagedLogs, setPagedLogs] = useState<TravelLog[]>([]);
  const [searchResults, setSearchResults] = useState<TravelLog[]>([]);
  const [page, setPage] = useState<number>(1);
  const [search, setSearch] = useState<string>('');
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [currentTab, setCurrentTab] = useState<NavTab>('home');

  const dataToRender = search.trim() === '' ? pagedLogs : searchResults;

  // 事件处理函数（略）
  const handleSearch = (text: string) => {
    setSearch(text);
    if (text.trim() !== '') {
      const filtered = allLogs.filter(log =>
        log.title.toLowerCase().includes(text.toLowerCase())
      );
      setSearchResults(filtered);
    }
  };

  const handleRefresh = () => {
    if (search.trim() === '') {
      loadLogs(1, true);
    } else {
      const filtered = allLogs.filter(log =>
        log.title.toLowerCase().includes(search.toLowerCase())
      );
      setSearchResults(filtered);
    }
  };

  const loadLogs = async (pageNumber: number, isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoadingMore(true);
    }
    const logs = await fetchTravelLogs(pageNumber, PAGE_SIZE);
    if (isRefresh) {
      setPagedLogs(logs);
    } else {
      setPagedLogs(prev => [...prev, ...logs]);
    }
    setHasMore(logs.length === PAGE_SIZE);
    setPage(pageNumber);
    setRefreshing(false);
    setLoadingMore(false);
  };

  const handleLoadMore = () => {
    if (search.trim() === '' && !loadingMore && hasMore) {
      loadLogs(page + 1);
    }
  };

  const handleCardPress = (log: TravelLog) => {
    console.log('选中日志：', log);
  };

  const handleNavPress = (tab: NavTab) => {
    setCurrentTab(tab);
    console.log('当前页面：', tab);
  };

  // 初次加载数据或搜索为空时加载第一页数据
  useEffect(() => {
    if (search.trim() === '') {
      loadLogs(1, true);
    }
  }, [search]);

  return (
    <SafeAreaView style={styles.safeContainer}>
      {/* 使用 LinearGradient 包裹整个页面 */}
      <LinearGradient colors={['#FFFFFF', '#E9E9E9','#FFFFFF']} style={styles.gradient}>
        <View style={styles.container}>
          {/* 内容区域 */}
          <View style={styles.content}>
            <Text style={styles.header}>旅行日志</Text>
            <SearchBar searchText={search} onChangeText={handleSearch} />
            <FlatList
              data={dataToRender}
              keyExtractor={item => item.id}
              renderItem={({ item }) => (
                <TravelLogCard log={item} onPress={() => handleCardPress(item)} />
              )}
              onEndReached={handleLoadMore}
              onEndReachedThreshold={0.1}
              refreshing={search.trim() === '' ? refreshing : false}
              onRefresh={handleRefresh}
              ListFooterComponent={() =>
                search.trim() === '' && loadingMore ? (
                  <ActivityIndicator size="large" color="#0000ff" />
                ) : null
              }
              contentContainerStyle={styles.listContainer}
            />
          </View>
          {/* 底部导航 */}
          <BottomNav currentTab={currentTab} onTabPress={handleNavPress} />
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
    position: 'relative',
    backgroundColor: 'transparent', // 透明背景让渐变更明显
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingBottom: 80, // 为底部导航预留空间
    // backgroundColor: 'rgba(255, 255, 255, 0.8)', // 半透明白色，可以使文本更易读
    borderRadius: 8,
    margin: 16,
  },
  header: {
    fontSize: 24,
    marginVertical: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  listContainer: {
    paddingBottom: 16,
  },
});

export default Home;
