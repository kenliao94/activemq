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
package org.apache.activemq.web.rest.mapper;

import org.apache.activemq.broker.jmx.SubscriptionViewMBean;
import org.apache.activemq.web.rest.dto.SubscriberDTO;
import org.springframework.stereotype.Component;

/**
 * Mapper to convert Subscription MBeans to DTOs
 */
@Component
public class SubscriberMapper {
    
    public SubscriberDTO toSubscriberDTO(SubscriptionViewMBean subscriptionView, String consumerId) {
        SubscriberDTO dto = new SubscriberDTO();
        
        dto.setConsumerId(consumerId);
        dto.setConnectionId(subscriptionView.getConnectionId());
        dto.setClientId(subscriptionView.getClientId());
        dto.setSessionId(subscriptionView.getSessionId());
        dto.setSubscriptionId(subscriptionView.getSubscriptionId());
        dto.setDestinationName(subscriptionView.getDestinationName());
        dto.setSelector(subscriptionView.getSelector());
        dto.setDestinationQueue(subscriptionView.isDestinationQueue());
        dto.setDestinationTopic(subscriptionView.isDestinationTopic());
        dto.setDestinationTemporary(subscriptionView.isDestinationTemporary());
        dto.setActive(subscriptionView.isActive());
        dto.setNetwork(subscriptionView.isNetwork());
        dto.setPendingQueueSize(subscriptionView.getPendingQueueSize());
        dto.setDispatchedQueueSize(subscriptionView.getDispatchedQueueSize());
        dto.setDispatchedCounter(subscriptionView.getDispatchedCounter());
        dto.setEnqueueCounter(subscriptionView.getEnqueueCounter());
        dto.setDequeueCounter(subscriptionView.getDequeueCounter());
        dto.setConsumedCount(subscriptionView.getConsumedCount());
        dto.setPrefetchSize(subscriptionView.getPrefetchSize());
        dto.setRetroactive(subscriptionView.isRetroactive());
        dto.setExclusive(subscriptionView.isExclusive());
        dto.setDurable(subscriptionView.isDurable());
        dto.setNoLocal(subscriptionView.isNoLocal());
        dto.setDispatchAsync(subscriptionView.isDispatchAsync());
        dto.setMaximumPendingMessageLimit(subscriptionView.getMaximumPendingMessageLimit());
        dto.setPriority(subscriptionView.getPriority());
        dto.setSubscriptionName(subscriptionView.getSubscriptionName());
        dto.setSlowConsumer(subscriptionView.isSlowConsumer());
        dto.setUserName(subscriptionView.getUserName());
        
        return dto;
    }
}
