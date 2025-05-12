import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import BottomNav, { NavTab } from '../home/BottomNav'; 
import Home from '../home/Home';           // 首页组件
import Publish from '../publish/Publish'; // 发布游记页面组件
import My from '../my/My';           // 我的游记组件
//import LoginPage from '../login/LoginPage';     // 登录组件

const Main: React.FC = () => {
  // 当前选中的 Tab，初始为 'home'
  const [currentTab, setCurrentTab] = useState<NavTab>('home');
  

  const handlePublish = () => {
  // 发布新日志，跳转到发布页面
  setCurrentTab('publish');
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
        return <My onPublish={handlePublish} />;
      // case 'login':
      //   return <LoginPage />;

    }
  };

  return (
    <View style={styles.container}>
      {/* 内容区域 */}
      <View style={styles.content}>{renderCurrentPage()}</View>
      {/* 底部导航固定在底部 */}
      <BottomNav currentTab={currentTab} onTabPress={setCurrentTab} />
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
});

export default Main;
