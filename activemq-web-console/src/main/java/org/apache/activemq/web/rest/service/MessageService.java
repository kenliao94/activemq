/**
 * Licensed to the Apache Software Foundation (ASF) under one or more
 * contributor license agreements.  See the NOTICE file distributed with
 * this work for additional information regarding copyright ownership.
 * The ASF licenses this file to You under the Apache License, Version 2.0
 * (the "License"); you may not use this file except in compliance with
 * the License.  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package org.apache.activemq.web.rest.service;

import org.apache.activemq.broker.jmx.QueueViewMBean;
import org.apache.activemq.command.ActiveMQQueue;
import org.apache.activemq.web.BrokerFacade;
import org.apache.activemq.web.rest.dto.MessageDTO;
import org.apache.activemq.web.rest.dto.PagedResponse;
import org.apache.activemq.web.rest.dto.SendMessageRequest;
import org.apache.activemq.web.rest.exception.ApiException;
import org.apache.activemq.web.rest.mapper.MessageMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import jakarta.jms.Connection;
import jakarta.jms.ConnectionFactory;
import jakarta.jms.DeliveryMode;
import jakarta.jms.Destination;
import jakarta.jms.MessageProducer;
import jakarta.jms.Session;
import jakarta.jms.TextMessage;
import javax.management.openmbean.CompositeData;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * Service for message operations
 */
@Service
public class MessageService {
    
    private static final Logger LOG = LoggerFactory.getLogger(MessageService.class);
    
    @Autowired
    private BrokerFacade brokerFacade;
    
    @Autowired
    private MessageMapper messageMapper;
    
    @Autowired(required = false)
    private ConnectionFactory connectionFactory;
    
    /**
     * Browse messages in a queue with pagination
     */
    public PagedResponse<MessageDTO> browseMessages(String queueName, int page, int pageSize) {
        try {
            QueueViewMBean queue = brokerFacade.getQueue(queueName);
            if (queue == null) {
                throw new ApiException(404, "Queue not found: " + queueName);
            }
            
            // Browse all messages
            CompositeData[] messages = queue.browse();
            List<MessageDTO> messageDTOs = new ArrayList<>();
            
            if (messages != null) {
                for (CompositeData message : messages) {
                    messageDTOs.add(messageMapper.toMessageDTO(message));
                }
            }
            
            // Apply pagination
            int totalElements = messageDTOs.size();
            int fromIndex = page * pageSize;
            int toIndex = Math.min(fromIndex + pageSize, totalElements);
            
            List<MessageDTO> pagedData = fromIndex < totalElements 
                ? messageDTOs.subList(fromIndex, toIndex) 
                : new ArrayList<>();
            
            return new PagedResponse<>(pagedData, page, pageSize, totalElements);
        } catch (ApiException e) {
            throw e;
        } catch (Exception e) {
            LOG.error("Failed to browse messages in queue: " + queueName, e);
            throw new ApiException(500, "Failed to browse messages: " + e.getMessage(), e);
        }
    }
    
    /**
     * Get a specific message by ID
     */
    public MessageDTO getMessage(String queueName, String messageId) {
        try {
            QueueViewMBean queue = brokerFacade.getQueue(queueName);
            if (queue == null) {
                throw new ApiException(404, "Queue not found: " + queueName);
            }
            
            CompositeData message = queue.getMessage(messageId);
            if (message == null) {
                throw new ApiException(404, "Message not found: " + messageId);
            }
            
            return messageMapper.toMessageDTO(message);
        } catch (ApiException e) {
            throw e;
        } catch (Exception e) {
            LOG.error("Failed to get message: " + messageId, e);
            throw new ApiException(500, "Failed to retrieve message: " + e.getMessage(), e);
        }
    }
    
    /**
     * Send a message to a destination
     */
    public void sendMessage(SendMessageRequest request) {
        if (request.getDestination() == null || request.getDestination().isEmpty()) {
            throw new ApiException(400, "Destination is required");
        }
        
        if (request.getBody() == null) {
            throw new ApiException(400, "Message body is required");
        }
        
        Connection connection = null;
        Session session = null;
        
        try {
            if (connectionFactory == null) {
                throw new ApiException(500, "ConnectionFactory not available");
            }
            
            connection = connectionFactory.createConnection();
            session = connection.createSession(false, Session.AUTO_ACKNOWLEDGE);
            
            // Create destination (queue or topic)
            Destination destination;
            if (request.getDestination().startsWith("topic://")) {
                destination = session.createTopic(request.getDestination().substring(8));
            } else if (request.getDestination().startsWith("queue://")) {
                destination = session.createQueue(request.getDestination().substring(8));
            } else {
                // Default to queue
                destination = session.createQueue(request.getDestination());
            }
            
            MessageProducer producer = session.createProducer(destination);
            
            // Set delivery mode
            producer.setDeliveryMode(request.isPersistent() ? 
                DeliveryMode.PERSISTENT : DeliveryMode.NON_PERSISTENT);
            
            // Set priority
            producer.setPriority(request.getPriority());
            
            // Set time to live
            producer.setTimeToLive(request.getTimeToLive());
            
            // Create text message
            TextMessage message = session.createTextMessage(request.getBody());
            
            // Set correlation ID if provided
            if (request.getCorrelationId() != null) {
                message.setJMSCorrelationID(request.getCorrelationId());
            }
            
            // Set type if provided
            if (request.getType() != null) {
                message.setJMSType(request.getType());
            }
            
            // Set custom properties
            if (request.getProperties() != null) {
                for (Map.Entry<String, Object> entry : request.getProperties().entrySet()) {
                    message.setObjectProperty(entry.getKey(), entry.getValue());
                }
            }
            
            // Send message
            producer.send(message);
            
            LOG.info("Message sent to destination: " + request.getDestination());
            
        } catch (ApiException e) {
            throw e;
        } catch (Exception e) {
            LOG.error("Failed to send message", e);
            throw new ApiException(500, "Failed to send message: " + e.getMessage(), e);
        } finally {
            try {
                if (session != null) {
                    session.close();
                }
                if (connection != null) {
                    connection.close();
                }
            } catch (Exception e) {
                LOG.warn("Failed to close JMS resources", e);
            }
        }
    }
    
    /**
     * Delete a message from a queue
     */
    public void deleteMessage(String queueName, String messageId) {
        try {
            QueueViewMBean queue = brokerFacade.getQueue(queueName);
            if (queue == null) {
                throw new ApiException(404, "Queue not found: " + queueName);
            }
            
            boolean removed = queue.removeMessage(messageId);
            if (!removed) {
                throw new ApiException(404, "Message not found or already dispatched: " + messageId);
            }
            
            LOG.info("Message deleted: " + messageId);
        } catch (ApiException e) {
            throw e;
        } catch (Exception e) {
            LOG.error("Failed to delete message: " + messageId, e);
            throw new ApiException(500, "Failed to delete message: " + e.getMessage(), e);
        }
    }
    
    /**
     * Move a message to another destination
     */
    public void moveMessage(String queueName, String messageId, String targetDestination) {
        try {
            QueueViewMBean queue = brokerFacade.getQueue(queueName);
            if (queue == null) {
                throw new ApiException(404, "Queue not found: " + queueName);
            }
            
            boolean moved = queue.moveMessageTo(messageId, targetDestination);
            if (!moved) {
                throw new ApiException(404, "Message not found or could not be moved: " + messageId);
            }
            
            LOG.info("Message moved from " + queueName + " to " + targetDestination);
        } catch (ApiException e) {
            throw e;
        } catch (Exception e) {
            LOG.error("Failed to move message: " + messageId, e);
            throw new ApiException(500, "Failed to move message: " + e.getMessage(), e);
        }
    }
    
    /**
     * Copy a message to another destination
     */
    public void copyMessage(String queueName, String messageId, String targetDestination) {
        try {
            QueueViewMBean queue = brokerFacade.getQueue(queueName);
            if (queue == null) {
                throw new ApiException(404, "Queue not found: " + queueName);
            }
            
            boolean copied = queue.copyMessageTo(messageId, targetDestination);
            if (!copied) {
                throw new ApiException(404, "Message not found or could not be copied: " + messageId);
            }
            
            LOG.info("Message copied from " + queueName + " to " + targetDestination);
        } catch (ApiException e) {
            throw e;
        } catch (Exception e) {
            LOG.error("Failed to copy message: " + messageId, e);
            throw new ApiException(500, "Failed to copy message: " + e.getMessage(), e);
        }
    }
}
