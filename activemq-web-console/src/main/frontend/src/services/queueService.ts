import api, { ApiResponse } from './api';

// Queue interface
export interface Queue {
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
  paused: boolean;
}

// Paged response interface
export interface PagedResponse<T> {
  content: T[];
  page: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
}

const queueService = {
  async getQueues(page: number = 0, pageSize: number = 20): Promise<PagedResponse<Queue>> {
    const response = await api.get<ApiResponse<PagedResponse<Queue>>>('/queues', {
      params: { page, pageSize },
    });
    return response.data.data;
  },

  async getQueue(name: string): Promise<Queue> {
    const response = await api.get<ApiResponse<Queue>>(`/queues/${encodeURIComponent(name)}`);
    return response.data.data;
  },

  async createQueue(name: string): Promise<void> {
    await api.post<ApiResponse<void>>('/queues', null, {
      params: { name },
    });
  },

  async deleteQueue(name: string): Promise<void> {
    await api.delete<ApiResponse<void>>(`/queues/${encodeURIComponent(name)}`);
  },

  async purgeQueue(name: string): Promise<void> {
    await api.post<ApiResponse<void>>(`/queues/${encodeURIComponent(name)}/purge`);
  },

  async pauseQueue(name: string): Promise<void> {
    await api.post<ApiResponse<void>>(`/queues/${encodeURIComponent(name)}/pause`);
  },

  async resumeQueue(name: string): Promise<void> {
    await api.post<ApiResponse<void>>(`/queues/${encodeURIComponent(name)}/resume`);
  },
};

export default queueService;
