import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';

// 定义各个 Tab 类型
export type NavTab = 'home' | 'publish' | 'my' | 'login';

interface BottomNavProps {
  currentTab: NavTab;
  onTabPress: (tab: NavTab) => void;
}

const BottomNav: React.FC<BottomNavProps> = ({ currentTab, onTabPress }) => {
  return (
    <View style={styles.bottomNav}>

      <TouchableOpacity
        style={[styles.navItem, currentTab === 'home' && styles.activeNavItem]}
        onPress={() => onTabPress('home')}
      >
        <Image style={styles.navIcon} source={require('./img/home.jpg')} />
        <Text style={currentTab === 'home' ? styles.activeNavText : styles.navText}>首页</Text>
      </TouchableOpacity>


      <TouchableOpacity
        style={[styles.navItem, currentTab === 'publish' && styles.activeNavItem]}
        onPress={() => onTabPress('publish')}
      >
        <Image style={styles.navIcon} source={require('./img/publish.jpg')} />
        <Text style={currentTab === 'publish' ? styles.activeNavText : styles.navText}>发布游记</Text>
      </TouchableOpacity>


      <TouchableOpacity
        style={[styles.navItem, currentTab === 'my' && styles.activeNavItem]}
        onPress={() => onTabPress('my')}
      >
        <Image style={styles.navIcon} source={require('./img/my.jpg')} />
        <Text style={currentTab === 'my' ? styles.activeNavText : styles.navText}>我的游记</Text>
      </TouchableOpacity>


      <TouchableOpacity
        style={[styles.navItem, currentTab === 'login' && styles.activeNavItem]}
        onPress={() => onTabPress('login')}
      >
        <Image style={styles.navIcon} source={require('./img/login.jpg')} />
        <Text style={currentTab === 'login' ? styles.activeNavText : styles.navText}>登录</Text>
      </TouchableOpacity>

    </View>
  );
};

const styles = StyleSheet.create({
  bottomNav: {
    width: '100%',
    height: 40,
    backgroundColor: '#fff',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 8,
  },
  navItem: {
    flex: 1,
    bottom:55,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  activeNavItem: {
    backgroundColor: '#e6f7ff',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 10,
    minHeight: 70,
  },
  navIcon: {
    width: 36,
    height: 36,
    marginBottom: 4,
  },
  navText: {
    fontSize: 16,
    color: 'gray',
  },
  activeNavText: {
    fontSize: 16,
    color: '#007aff',
    fontWeight: 'bold',
  },
});

export default BottomNav;
