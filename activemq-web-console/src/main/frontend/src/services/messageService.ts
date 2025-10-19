import api from './api';
import { PagedResponse } from './queueService';

// Message interface
export interface Message {
  id: string;
  messageId: string;
  destination: string;
  timestamp: number;
  expiration: number;
  priority: number;
  redelivered: boolean;
  redeliveryCounter: number;
  correlationId?: string;
  type?: string;
  persistent: boolean;
  properties: Record<string, any>;
  headers: Record<string, any>;
  body: string;
  bodyPreview: string;
  size: number;
}

// Send message request interface
export interface SendMessageRequest {
  destination: string;
  body: string;
  headers?: Record<string, string>;
  properties?: Record<string, any>;
  persistent?: boolean;
  priority?: number;
  timeToLive?: number;
}

// API response for send/delete/move/copy operations
export interface MessageOperationResponse {
  status: string;
  message: string;
}

const messageService = {
  async browseMessages(
    queueName: string,
    page: number = 0,
    pageSize: number = 50
  ): Promise<PagedResponse<Message>> {
    const response = await api.get<PagedResponse<Message>>(
      `/messages/queue/${encodeURIComponent(queueName)}`,
      {
        params: { page, pageSize },
      }
    );
    return response.data;
  },

  async getMessage(queueName: string, messageId: string): Promise<Message> {
    const response = await api.get<Message>(
      `/messages/${encodeURIComponent(queueName)}/${encodeURIComponent(messageId)}`
    );
    return response.data;
  },

  async sendMessage(request: SendMessageRequest): Promise<MessageOperationResponse> {
    const response = await api.post<MessageOperationResponse>('/messages/send', request);
    return response.data;
  },

  async deleteMessage(queueName: string, messageId: string): Promise<MessageOperationResponse> {
    const response = await api.delete<MessageOperationResponse>(
      `/messages/${encodeURIComponent(queueName)}/${encodeURIComponent(messageId)}`
    );
    return response.data;
  },

  async moveMessage(
    queueName: string,
    messageId: string,
    targetDestination: string
  ): Promise<MessageOperationResponse> {
    const response = await api.post<MessageOperationResponse>(
      `/messages/${encodeURIComponent(queueName)}/${encodeURIComponent(messageId)}/move`,
      { targetDestination }
    );
    return response.data;
  },

  async copyMessage(
    queueName: string,
    messageId: string,
    targetDestination: string
  ): Promise<MessageOperationResponse> {
    const response = await api.post<MessageOperationResponse>(
      `/messages/${encodeURIComponent(queueName)}/${encodeURIComponent(messageId)}/copy`,
      { targetDestination }
    );
    return response.data;
  },
};

export default messageService;
