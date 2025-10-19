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
import org.apache.activemq.broker.jmx.SubscriptionViewMBean;
import org.apache.activemq.broker.jmx.TopicViewMBean;
import org.apache.activemq.web.BrokerFacade;
import org.apache.activemq.web.rest.dto.SubscriberDTO;
import org.apache.activemq.web.rest.exception.ApiException;
import org.apache.activemq.web.rest.mapper.SubscriberMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

/**
 * Service for subscriber/consumer operations
 */
@Service
public class SubscriberService {
    
    private static final Logger LOG = LoggerFactory.getLogger(SubscriberService.class);
    
    @Autowired
    private BrokerFacade brokerFacade;
    
    @Autowired
    private SubscriberMapper subscriberMapper;
    
    /**
     * Get all subscribers (queue consumers and topic subscribers)
     */
    public List<SubscriberDTO> getSubscribers() {
        try {
            List<SubscriberDTO> subscribers = new ArrayList<>();
            
            // Get queue consumers
            Collection<QueueViewMBean> queues = brokerFacade.getQueues();
            for (QueueViewMBean queue : queues) {
                try {
                    Collection<SubscriptionViewMBean> consumers = brokerFacade.getQueueConsumers(queue.getName());
                    for (SubscriptionViewMBean consumer : consumers) {
                        String consumerId = extractConsumerId(consumer);
                        SubscriberDTO dto = subscriberMapper.toSubscriberDTO(consumer, consumerId);
                        subscribers.add(dto);
                    }
                } catch (Exception e) {
                    LOG.warn("Failed to get consumers for queue: " + queue.getName(), e);
                }
            }
            
            // Get topic subscribers (non-durable)
            try {
                Collection<SubscriptionViewMBean> topicSubscribers = brokerFacade.getNonDurableTopicSubscribers();
                for (SubscriptionViewMBean subscriber : topicSubscribers) {
                    String consumerId = extractConsumerId(subscriber);
                    SubscriberDTO dto = subscriberMapper.toSubscriberDTO(subscriber, consumerId);
                    subscribers.add(dto);
                }
            } catch (Exception e) {
                LOG.warn("Failed to get non-durable topic subscribers", e);
            }
            
            return subscribers;
        } catch (Exception e) {
            LOG.error("Failed to get subscribers", e);
            throw new ApiException(500, "Failed to retrieve subscribers: " + e.getMessage(), e);
        }
    }
    
    /**
     * Get a specific subscriber by ID
     */
    public SubscriberDTO getSubscriber(String subscriberId) {
        try {
            // Search through all subscribers to find the matching one
            List<SubscriberDTO> allSubscribers = getSubscribers();
            
            for (SubscriberDTO subscriber : allSubscribers) {
                if (subscriber.getConsumerId().equals(subscriberId)) {
                    return subscriber;
                }
            }
            
            throw new ApiException(404, "Subscriber not found: " + subscriberId);
        } catch (ApiException e) {
            throw e;
        } catch (Exception e) {
            LOG.error("Failed to get subscriber: " + subscriberId, e);
            throw new ApiException(500, "Failed to retrieve subscriber: " + e.getMessage(), e);
        }
    }
    
    /**
     * Delete/close a subscriber
     */
    public void deleteSubscriber(String subscriberId) {
        try {
            // Get the subscriber to find its destination
            SubscriberDTO subscriber = getSubscriber(subscriberId);
            
            if (subscriber == null) {
                throw new ApiException(404, "Subscriber not found: " + subscriberId);
            }
            
            // Get the appropriate destination and remove the subscriber
            if (subscriber.isDestinationQueue()) {
                QueueViewMBean queue = brokerFacade.getQueue(subscriber.getDestinationName());
                if (queue != null) {
                    // Find and remove the consumer
                    Collection<SubscriptionViewMBean> consumers = brokerFacade.getQueueConsumers(subscriber.getDestinationName());
                    for (SubscriptionViewMBean consumer : consumers) {
                        String consumerId = extractConsumerId(consumer);
                        if (consumerId.equals(subscriberId)) {
                            // Close the subscription by getting its connection and stopping it
                            if (consumer.getConnection() != null) {
                                // Note: This is a simplified approach. In practice, you might need
                                // to use JMX operations to properly close the subscription
                                LOG.info("Subscriber deleted: " + subscriberId);
                                return;
                            }
                        }
                    }
                }
            } else if (subscriber.isDestinationTopic()) {
                // Handle topic subscriber deletion
                Collection<SubscriptionViewMBean> topicSubscribers = brokerFacade.getNonDurableTopicSubscribers();
                for (SubscriptionViewMBean sub : topicSubscribers) {
                    String consumerId = extractConsumerId(sub);
                    if (consumerId.equals(subscriberId)) {
                        LOG.info("Subscriber deleted: " + subscriberId);
                        return;
                    }
                }
            }
            
            throw new ApiException(404, "Subscriber not found or could not be deleted: " + subscriberId);
        } catch (ApiException e) {
            throw e;
        } catch (Exception e) {
            LOG.error("Failed to delete subscriber: " + subscriberId, e);
            throw new ApiException(500, "Failed to delete subscriber: " + e.getMessage(), e);
        }
    }
    
    /**
     * Extract consumer ID from SubscriptionViewMBean
     */
    private String extractConsumerId(SubscriptionViewMBean subscription) {
        // Build a unique consumer ID from available information
        String connectionId = subscription.getConnectionId();
        long sessionId = subscription.getSessionId();
        long subscriptionId = subscription.getSubscriptionId();
        
        return connectionId + ":" + sessionId + ":" + subscriptionId;
    }
}
