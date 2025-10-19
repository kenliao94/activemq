import api, { ApiResponse } from './api';
import { PagedResponse } from './queueService';

// Topic interface
export interface Topic {
  name: string;
  enqueueCount: number;
  dequeueCount: number;
  consumerCount: number;
  producerCount: number;
  queueSize: number;
  memoryPercentUsage: number;
  averageEnqueueTime: number;
  maxEnqueueTime: number;
  minEnqueueTime: number;
  averageMessageSize: number;
  maxMessageSize: number;
  minMessageSize: number;
}

const topicService = {
  async getTopics(page: number = 0, pageSize: number = 20): Promise<PagedResponse<Topic>> {
    const response = await api.get<ApiResponse<PagedResponse<Topic>>>('/topics', {
      params: { page, pageSize },
    });
    return response.data.data;
  },

  async getTopic(name: string): Promise<Topic> {
    const response = await api.get<ApiResponse<Topic>>(`/topics/${encodeURIComponent(name)}`);
    return response.data.data;
  },

  async createTopic(name: string): Promise<void> {
    await api.post<ApiResponse<void>>('/topics', null, {
      params: { name },
    });
  },

  async deleteTopic(name: string): Promise<void> {
    await api.delete<ApiResponse<void>>(`/topics/${encodeURIComponent(name)}`);
  },
};

export default topicService;
