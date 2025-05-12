import React, { useEffect, useState, useMemo } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import SearchBar from './SearchBar';
import TravelLogCard, { TravelLog } from './TravelLogCard';
import { NavTab } from './BottomNav';
import { fetchTravelLogs, PAGE_SIZE, allLogs } from './TravelLogData';
import MasonryList from '@react-native-seoul/masonry-list';

type SearchMode = 'title' | 'author';

interface RenderTravelLogCardProps {
  log: TravelLog;
  onPress: () => void;
}

const RenderTravelLogCard: React.FC<RenderTravelLogCardProps> = ({ log, onPress }) => {
  // 利用 useMemo 保证每个卡片的随机比例仅根据 log.id 来计算一次
  const randomRatio = useMemo(() => Math.random() * 0.4 + 0.8, [log.id]);
  return (
    <View style={styles.itemWrapper}>
      <TravelLogCard log={log} onPress={onPress} imageRatio={randomRatio} />
    </View>
  );
};

const Home: React.FC = () => {
  // 基本状态
  const [pagedLogs, setPagedLogs] = useState<TravelLog[]>([]);
  const [searchResults, setSearchResults] = useState<TravelLog[]>([]);
  const [page, setPage] = useState<number>(1);
  const [search, setSearch] = useState<string>('');
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [currentTab, setCurrentTab] = useState<NavTab>('home');

  // 搜索模式（标题或昵称）
  const [searchMode, setSearchMode] = useState<SearchMode>('title');
  // 控制下拉菜单是否展开（采用绝对定位覆盖，不推掉后续布局）
  const [dropdownVisible, setDropdownVisible] = useState(false);

  const dataToRender = search.trim() === '' ? pagedLogs : searchResults;

  // 根据当前搜索模式过滤数据
  const handleSearch = (text: string) => {
    setSearch(text);
    if (text.trim() !== '') {
      const filtered = allLogs.filter(log =>
        searchMode === 'title'
          ? log.title.toLowerCase().includes(text.toLowerCase())
          : log.author.toLowerCase().includes(text.toLowerCase())
      );
      setSearchResults(filtered);
    } else {
      setSearchResults([]);
    }
  };

  const handleRefresh = () => {
    if (search.trim() === '') {
      loadLogs(1, true);
    } else {
      const filtered = allLogs.filter(log =>
        searchMode === 'title'
          ? log.title.toLowerCase().includes(search.toLowerCase())
          : log.author.toLowerCase().includes(search.toLowerCase())
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

  useEffect(() => {
    if (search.trim() === '') {
      loadLogs(1, true);
    }
  }, [search]);

  // 改为选择搜索模式时不调用 handleSearch，以免刷新界面
  const selectSearchMode = (mode: SearchMode) => {
    setSearchMode(mode);
    setDropdownVisible(false);
  };

  return (
    <SafeAreaView style={styles.safeContainer}>
      <LinearGradient colors={['#66B2FF', '#E9E9E9', '#FFFFFF']} style={styles.gradient}>
        <View style={styles.content}>
          <Text style={styles.header}>旅行日志</Text>
          {/* 搜索区域容器，设置 relative 以便下方绝对定位的下拉菜单不推掉布局 */}
          <View style={styles.searchWrapper}>
            <View style={styles.searchContainer}>
              <TouchableOpacity
                style={styles.modeButton}
                onPress={() => setDropdownVisible(!dropdownVisible)}
              >
                <Text style={styles.modeButtonText}>
                  {searchMode === 'title' ? '标题搜索' : '昵称搜索'}
                </Text>
              </TouchableOpacity>
              <View style={styles.searchBarContainer}>
                <SearchBar searchText={search} onChangeText={handleSearch} />
              </View>
            </View>
            {dropdownVisible && (
              <View style={styles.dropdownContainer}>
                <TouchableOpacity style={styles.dropdownItem} onPress={() => selectSearchMode('title')}>
                  <Text style={styles.dropdownItemText}>标题搜索</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.dropdownItem} onPress={() => selectSearchMode('author')}>
                  <Text style={styles.dropdownItemText}>昵称搜索</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          <MasonryList
            data={dataToRender}
            keyExtractor={(item) => item.id}
            numColumns={2}
            showsVerticalScrollIndicator={false}
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.1}
            refreshing={search.trim() === '' ? refreshing : false}
            onRefresh={handleRefresh}
            renderItem={({ item }) => (
              <RenderTravelLogCard
                log={item as TravelLog}
                onPress={() => handleCardPress(item as TravelLog)}
              />
            )}
            ListFooterComponent={() =>
              search.trim() === '' && loadingMore ? (
                <ActivityIndicator size="large" color="#0000ff" style={styles.loader} />
              ) : null
            }
            contentContainerStyle={styles.listContainer}
          />
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
  listContainer: {
    paddingHorizontal: 2,
    paddingTop: 16,
  },
  loader: {
    marginVertical: 16,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingBottom: 10,
    borderRadius: 8,
    margin: 16,
  },
  header: {
    fontSize: 24,
    marginVertical: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  searchWrapper: {
    position: 'relative',
    marginBottom: 12,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  modeButton: {
    justifyContent: 'center',
    alignItems: 'center',
    height: 40,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#999',
    borderTopLeftRadius: 4,
    borderBottomLeftRadius: 4,
    borderRightWidth: 0,
    backgroundColor: '#fff',
  },
  modeButtonText: {
    fontSize: 14,
    color: '#333',
  },
  searchBarContainer: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: '#999',
    borderTopRightRadius: 4,
    borderBottomRightRadius: 4,
    backgroundColor: '#fff',
  },
  dropdownContainer: {
    position: 'absolute',
    top: 42,
    left: 0,
    zIndex: 100,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#999',
    borderRadius: 4,
    width: 120,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
    elevation: 4,
  },
  dropdownItem: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  dropdownItemText: {
    fontSize: 14,
    color: '#333',
  },
  itemWrapper: {
    marginHorizontal: 2,
    marginVertical: 2,
  },
});

export default Home;
