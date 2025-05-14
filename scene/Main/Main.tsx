import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import BottomNav, { NavTab } from '../home/BottomNav'; 
import Home from '../home/Home';
import Publish from '../publish/Publish';
import My from '../my/My';
import Detail from '../Detail/Detail';
import { TravelLog } from '../home/TravelLogCard';
import LoginPage from '../Login/LoginPage';

const Main: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<NavTab>('home');
  const [selectedLog, setSelectedLog] = useState<TravelLog | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const handlePublish = () => {
    setCurrentTab('publish');
  };

  const handleCardPress = (log: TravelLog) => {
    setSelectedLog(log); // 显示详情页
  };

  const handleBack = () => {
    setSelectedLog(null); // 返回主页面
  };

  const renderCurrentPage = () => {
    

    if (selectedLog) {
      return <Detail log={selectedLog} onBack={handleBack} />;
    }

    switch (currentTab) {
      case 'home':
        return <Home onCardPress={handleCardPress} />;
      case 'publish':
        return (
          <Publish
            onCancel={() => setCurrentTab('home')}
            onSubmit={() => setCurrentTab('my')}
          />
        );
      case 'my':
        if (!userId) {
              return <LoginPage onLoginSuccess={(id) => setUserId(id)} />;
            }
        return <My onPublish={handlePublish} userId={userId} />;
      case 'login':
        return <LoginPage onLoginSuccess={(id) => setUserId(id)} />;
        
    }
  };


  return (
    <View style={styles.container}>
      <View style={styles.content}>{renderCurrentPage()}</View>
      {!selectedLog && <BottomNav currentTab={currentTab} onTabPress={setCurrentTab} />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    marginBottom: 60,
  },
});

export default Main;
