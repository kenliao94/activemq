import api, { ApiResponse } from './api';

// Connection interface
export interface Connection {
  connectionId: string;
  remoteAddress: string;
  userName: string;
  clientId: string;
  connectorName: string;
  connected: boolean;
  active: boolean;
  slow: boolean;
  blocked: boolean;
  dispatchQueueSize: number;
}

// Subscriber/Consumer interface
export interface Subscriber {
  consumerId: string;
  connectionId: string;
  sessionId: string;
  destination: string;
  selector?: string;
  enqueueCounter: number;
  dequeueCounter: number;
  dispatchedCounter: number;
  dispatchedQueueSize: number;
  prefetchSize: number;
  maximumPendingMessageLimit: number;
  exclusive: boolean;
  retroactive: boolean;
  subscriptionName?: string;
}

const connectionService = {
  async getConnections(): Promise<Connection[]> {
    const response = await api.get<ApiResponse<Connection[]>>('/connections');
    return response.data.data;
  },

  async getConnection(id: string): Promise<Connection> {
    const response = await api.get<ApiResponse<Connection>>(
      `/connections/${encodeURIComponent(id)}`
    );
    return response.data.data;
  },

  async closeConnection(id: string): Promise<void> {
    await api.delete<ApiResponse<void>>(`/connections/${encodeURIComponent(id)}`);
  },

  async getSubscribers(): Promise<Subscriber[]> {
    const response = await api.get<ApiResponse<Subscriber[]>>('/subscribers');
    return response.data.data;
  },

  async getSubscriber(id: string): Promise<Subscriber> {
    const response = await api.get<ApiResponse<Subscriber>>(
      `/subscribers/${encodeURIComponent(id)}`
    );
    return response.data.data;
  },

  async deleteSubscriber(id: string): Promise<void> {
    await api.delete<ApiResponse<void>>(`/subscribers/${encodeURIComponent(id)}`);
  },
};

export default connectionService;
