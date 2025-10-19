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
import org.apache.activemq.broker.jmx.TopicViewMBean;
import org.apache.activemq.command.ActiveMQDestination;
import org.apache.activemq.command.ActiveMQQueue;
import org.apache.activemq.command.ActiveMQTopic;
import org.apache.activemq.web.BrokerFacade;
import org.apache.activemq.web.rest.dto.PagedResponse;
import org.apache.activemq.web.rest.dto.QueueDTO;
import org.apache.activemq.web.rest.dto.TopicDTO;
import org.apache.activemq.web.rest.exception.ApiException;
import org.apache.activemq.web.rest.mapper.DestinationMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Service for queue and topic operations
 */
@Service
public class DestinationService {
    
    private static final Logger LOG = LoggerFactory.getLogger(DestinationService.class);
    
    @Autowired
    private BrokerFacade brokerFacade;
    
    @Autowired
    private DestinationMapper destinationMapper;
    
    /**
     * Get all queues with pagination support
     */
    public PagedResponse<QueueDTO> getQueues(int page, int pageSize) {
        try {
            Collection<QueueViewMBean> queues = brokerFacade.getQueues();
            List<QueueDTO> queueDTOs = new ArrayList<>();
            
            for (QueueViewMBean queue : queues) {
                queueDTOs.add(destinationMapper.toQueueDTO(queue));
            }
            
            // Apply pagination
            int totalElements = queueDTOs.size();
            int fromIndex = page * pageSize;
            int toIndex = Math.min(fromIndex + pageSize, totalElements);
            
            List<QueueDTO> pagedData = fromIndex < totalElements 
                ? queueDTOs.subList(fromIndex, toIndex) 
                : new ArrayList<>();
            
            return new PagedResponse<>(pagedData, page, pageSize, totalElements);
        } catch (Exception e) {
            LOG.error("Failed to get queues", e);
            throw new ApiException(500, "Failed to retrieve queues: " + e.getMessage(), e);
        }
    }
    
    /**
     * Get a specific queue by name
     */
    public QueueDTO getQueue(String name) {
        try {
            QueueViewMBean queue = brokerFacade.getQueue(name);
            if (queue == null) {
                throw new ApiException(404, "Queue not found: " + name);
            }
            return destinationMapper.toQueueDTO(queue);
        } catch (ApiException e) {
            throw e;
        } catch (Exception e) {
            LOG.error("Failed to get queue: " + name, e);
            throw new ApiException(500, "Failed to retrieve queue: " + e.getMessage(), e);
        }
    }
    
    /**
     * Create a new queue
     */
    public void createQueue(String name) {
        try {
            // Check if queue already exists
            QueueViewMBean existingQueue = brokerFacade.getQueue(name);
            if (existingQueue != null) {
                throw new ApiException(409, "Queue already exists: " + name);
            }
            
            // Create the queue using broker admin
            brokerFacade.getBrokerAdmin().addQueue(name);
            LOG.info("Queue created: " + name);
        } catch (ApiException e) {
            throw e;
        } catch (Exception e) {
            LOG.error("Failed to create queue: " + name, e);
            throw new ApiException(500, "Failed to create queue: " + e.getMessage(), e);
        }
    }
    
    /**
     * Delete a queue
     */
    public void deleteQueue(String name) {
        try {
            QueueViewMBean queue = brokerFacade.getQueue(name);
            if (queue == null) {
                throw new ApiException(404, "Queue not found: " + name);
            }
            
            brokerFacade.getBrokerAdmin().removeQueue(name);
            LOG.info("Queue deleted: " + name);
        } catch (ApiException e) {
            throw e;
        } catch (Exception e) {
            LOG.error("Failed to delete queue: " + name, e);
            throw new ApiException(500, "Failed to delete queue: " + e.getMessage(), e);
        }
    }
    
    /**
     * Purge all messages from a queue
     */
    public void purgeQueue(String name) {
        try {
            QueueViewMBean queue = brokerFacade.getQueue(name);
            if (queue == null) {
                throw new ApiException(404, "Queue not found: " + name);
            }
            
            ActiveMQDestination destination = new ActiveMQQueue(name);
            brokerFacade.purgeQueue(destination);
            LOG.info("Queue purged: " + name);
        } catch (ApiException e) {
            throw e;
        } catch (Exception e) {
            LOG.error("Failed to purge queue: " + name, e);
            throw new ApiException(500, "Failed to purge queue: " + e.getMessage(), e);
        }
    }
    
    /**
     * Pause a queue
     */
    public void pauseQueue(String name) {
        try {
            QueueViewMBean queue = brokerFacade.getQueue(name);
            if (queue == null) {
                throw new ApiException(404, "Queue not found: " + name);
            }
            
            queue.pause();
            LOG.info("Queue paused: " + name);
        } catch (ApiException e) {
            throw e;
        } catch (Exception e) {
            LOG.error("Failed to pause queue: " + name, e);
            throw new ApiException(500, "Failed to pause queue: " + e.getMessage(), e);
        }
    }
    
    /**
     * Resume a paused queue
     */
    public void resumeQueue(String name) {
        try {
            QueueViewMBean queue = brokerFacade.getQueue(name);
            if (queue == null) {
                throw new ApiException(404, "Queue not found: " + name);
            }
            
            queue.resume();
            LOG.info("Queue resumed: " + name);
        } catch (ApiException e) {
            throw e;
        } catch (Exception e) {
            LOG.error("Failed to resume queue: " + name, e);
            throw new ApiException(500, "Failed to resume queue: " + e.getMessage(), e);
        }
    }
    
    /**
     * Get all topics with pagination support
     */
    public PagedResponse<TopicDTO> getTopics(int page, int pageSize) {
        try {
            Collection<TopicViewMBean> topics = brokerFacade.getTopics();
            List<TopicDTO> topicDTOs = new ArrayList<>();
            
            for (TopicViewMBean topic : topics) {
                topicDTOs.add(destinationMapper.toTopicDTO(topic));
            }
            
            // Apply pagination
            int totalElements = topicDTOs.size();
            int fromIndex = page * pageSize;
            int toIndex = Math.min(fromIndex + pageSize, totalElements);
            
            List<TopicDTO> pagedData = fromIndex < totalElements 
                ? topicDTOs.subList(fromIndex, toIndex) 
                : new ArrayList<>();
            
            return new PagedResponse<>(pagedData, page, pageSize, totalElements);
        } catch (Exception e) {
            LOG.error("Failed to get topics", e);
            throw new ApiException(500, "Failed to retrieve topics: " + e.getMessage(), e);
        }
    }
    
    /**
     * Get a specific topic by name
     */
    public TopicDTO getTopic(String name) {
        try {
            TopicViewMBean topic = brokerFacade.getTopic(name);
            if (topic == null) {
                throw new ApiException(404, "Topic not found: " + name);
            }
            return destinationMapper.toTopicDTO(topic);
        } catch (ApiException e) {
            throw e;
        } catch (Exception e) {
            LOG.error("Failed to get topic: " + name, e);
            throw new ApiException(500, "Failed to retrieve topic: " + e.getMessage(), e);
        }
    }
    
    /**
     * Create a new topic
     */
    public void createTopic(String name) {
        try {
            // Check if topic already exists
            TopicViewMBean existingTopic = brokerFacade.getTopic(name);
            if (existingTopic != null) {
                throw new ApiException(409, "Topic already exists: " + name);
            }
            
            // Create the topic using broker admin
            brokerFacade.getBrokerAdmin().addTopic(name);
            LOG.info("Topic created: " + name);
        } catch (ApiException e) {
            throw e;
        } catch (Exception e) {
            LOG.error("Failed to create topic: " + name, e);
            throw new ApiException(500, "Failed to create topic: " + e.getMessage(), e);
        }
    }
    
    /**
     * Delete a topic
     */
    public void deleteTopic(String name) {
        try {
            TopicViewMBean topic = brokerFacade.getTopic(name);
            if (topic == null) {
                throw new ApiException(404, "Topic not found: " + name);
            }
            
            brokerFacade.getBrokerAdmin().removeTopic(name);
            LOG.info("Topic deleted: " + name);
        } catch (ApiException e) {
            throw e;
        } catch (Exception e) {
            LOG.error("Failed to delete topic: " + name, e);
            throw new ApiException(500, "Failed to delete topic: " + e.getMessage(), e);
        }
    }
}
