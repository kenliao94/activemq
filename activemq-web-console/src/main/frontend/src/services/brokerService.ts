import api, { ApiResponse } from './api';

// Broker info interface
export interface BrokerInfo {
  name: string;
  version: string;
  id: string;
  uptime: number;
  uptimeMillis: number;
  dataDirectory: string;
  vmURL: string;
  storePercentUsage: number;
  memoryPercentUsage: number;
  tempPercentUsage: number;
  totalConnections: number;
  totalEnqueueCount: number;
  totalDequeueCount: number;
  totalConsumerCount: number;
  totalProducerCount: number;
  totalMessageCount: number;
}

// Broker statistics interface
export interface BrokerStatistics {
  [key: string]: any;
}

// Broker health interface
export interface BrokerHealth {
  status: string;
  [key: string]: any;
}

const brokerService = {
  async getBrokerInfo(): Promise<BrokerInfo> {
    const response = await api.get<ApiResponse<BrokerInfo>>('/broker/info');
    return response.data.data;
  },

  async getBrokerStatistics(): Promise<BrokerStatistics> {
    const response = await api.get<ApiResponse<BrokerStatistics>>('/broker/statistics');
    return response.data.data;
  },

  async getBrokerHealth(): Promise<BrokerHealth> {
    const response = await api.get<ApiResponse<BrokerHealth>>('/broker/health');
    return response.data.data;
  },
};

export default brokerService;
