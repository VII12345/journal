import { TravelLog } from './TravelLogCard';

// 模拟总数据量，比如 30 条日志
const TOTAL_LOGS = 30;

// 根据总条数生成所有数据
export const generateLogs = (): TravelLog[] => {
  const logs: TravelLog[] = [];
  for (let i = 1; i <= TOTAL_LOGS; i++) {
    logs.push({
      id: `${i}`,
      title: `旅行日志 ${i}`,
      image: { uri: `http://10.0.2.2:8000/scene/home/img/image${(i % 5) + 1}.jpg` },
      author: `作者 ${i}`,
      avatar: { uri: `http://10.0.2.2:8000/scene/home/img/avatar${(i % 5) + 1}.jpg` },
      content: '',
      status: '',
      rejectionReason: ''
    });
  }
  return logs;
};

export const allLogs = generateLogs();

// 每页返回条目数
export const PAGE_SIZE = 10;

// 模拟分页加载：实际项目中可用 fetch 或 axios 请求服务器接口
export const fetchTravelLogs = (page: number, pageSize: number): Promise<TravelLog[]> => {
  return new Promise(resolve => {
    setTimeout(() => {
      const startIndex = (page - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      resolve(allLogs.slice(startIndex, endIndex));
    }, 1000); // 模拟网络延迟
  });
};
