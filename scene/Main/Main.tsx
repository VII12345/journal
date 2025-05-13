import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import BottomNav, { NavTab } from '../home/BottomNav'; 
import Home from '../home/Home';           // 首页组件
import Publish from '../publish/Publish'; // 发布游记页面组件
import My from '../my/My';           // 我的游记组件
import LoginPage from '../login/LoginPage'; // 登录组件
import RegisterPage from '../login/Register'; // 注册组件

// 新增状态类型
type PageType = NavTab | 'register';

const Main: React.FC = () => {
  // 当前选中的 Tab，初始为 'home'
  const [currentTab, setCurrentTab] = useState<PageType>('home');

  // 登录成功后的回调函数
  const handleLoginSuccess = () => {
    setCurrentTab('home');
  };

  // 注册成功后的回调函数
  const handleRegisterSuccess = () => {
    setCurrentTab('login');
  };

  // 根据当前 Tab 渲染对应的页面组件
  const renderCurrentPage = () => {
    switch (currentTab) {
      case 'home':
        return <Home />;
      case 'publish':
        return (
          <Publish
            onCancel={() => setCurrentTab('home')}
            onSubmit={() => setCurrentTab('my')}
          />
        );
      case 'my':
        return <My />;
      case 'login':
        return <LoginPage onLoginSuccess={handleLoginSuccess} />;
      case 'register':
        return <RegisterPage onRegisterSuccess={handleRegisterSuccess} />;
    }
  };

  // 底部导航点击事件处理
  const handleTabPress = (tab: NavTab) => {
    if (tab === 'login') {
      setCurrentTab('login');
    } else {
      setCurrentTab(tab);
    }
  };

  // 注册导航点击事件处理
  const handleRegisterPress = () => {
    setCurrentTab('register');
  };

  return (
    <View style={styles.container}>
      {/* 内容区域 */}
      <View style={styles.content}>{renderCurrentPage()}</View>
      {/* 底部导航固定在底部 */}
      <BottomNav currentTab={currentTab as NavTab} onTabPress={handleTabPress} />
      {/* 如果当前是登录页面，显示注册按钮 */}
      {currentTab === 'login' && (
        <TouchableOpacity style={styles.registerLink} onPress={handleRegisterPress}>
          <Text style={styles.registerLinkText}>注册</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  // 给内容区域设置 marginBottom，保证不会被底部导航遮挡
  content: {
    flex: 1,
    marginBottom: 60, // 此值需根据底部导航高度来调整
  },
  registerLink: {
    position: 'absolute',
    bottom: 80,
    right: 20,
    backgroundColor: '#fff',
    padding: 8,
    borderRadius: 4,
  },
  registerLinkText: {
    color: '#007aff',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default Main;