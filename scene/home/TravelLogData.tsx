import { TravelLog } from './TravelLogCard';
import { DATABASE_URL,IMG_URL } from '../net';

// 全局变量，用于存储后端获取的数据
let TOTAL_LOGS = 0;
export let allLogs: TravelLog[] = [];

// 首先通过接口获取总日志数，然后获取所有日志数据
fetch(`${DATABASE_URL}/travel_logs/count`)
  .then(response => response.json())
  .then(data => {
    TOTAL_LOGS = data.total;
    console.log('Total logs:', TOTAL_LOGS);
    // 在获取到总数后，再调用接口获取日志列表
    return fetch(`${DATABASE_URL}/travel_logs/get`);
  })
  .then(response => response.json())
  .then(data => {
    // 假设后端返回的日志数据字段与前端一致，
    // 但 image 和 avatar 需包装成 { uri: string } 格式以供 React Native 使用
    allLogs = data.map((item: any) => ({
      id: '',      
      title: item.title,
      image: { uri: `${IMG_URL}${item.image}`},   // 转换格式
      avatar: { uri:`${IMG_URL}${item.avatar}`}, // 转换格式
      author: item.author,
      content: '',
      status: '',
      rejectionReason: ''
    }));
    console.log('Fetched all logs:', allLogs);
  })
  .catch(error => {
    console.error('获取日志数据失败:', error);
  });

// 根据后端获取的数据返回日志数组（结构不变）
export const generateLogs = (): TravelLog[] => {
  return allLogs;
};

// 每页返回条目数保持不变
export const PAGE_SIZE = 10;

// 分页加载函数：从 allLogs 数组中切割出对应页的数据
export const fetchTravelLogs = (page: number, pageSize: number): Promise<TravelLog[]> => {
  return fetch(`${DATABASE_URL}/travel_logs/get?page=${page}&pageSize=${pageSize}`)
    .then(response => response.json())
    .then(data => {
      // 遍历数据并转换 image 和 avatar 字段
      return data.map((item: any) => ({
        id: item.id ? item.id.toString() : '',
        title: item.title,
        image: { uri: `${IMG_URL}${item.image}` },
        avatar: { uri: `${IMG_URL}${item.avatar}` },
        author: item.nickname,
        content: item.content || '',
        status: item.status || '',
        rejectionReason: item.rejectionReason || ''
      }));
    })
    .catch(error => {
      console.error("分页获取日志数据失败:", error);
      return [];
    });
};