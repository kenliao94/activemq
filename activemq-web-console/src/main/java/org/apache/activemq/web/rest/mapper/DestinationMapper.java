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

import org.apache.activemq.broker.jmx.QueueViewMBean;
import org.apache.activemq.broker.jmx.TopicViewMBean;
import org.apache.activemq.web.rest.dto.QueueDTO;
import org.apache.activemq.web.rest.dto.TopicDTO;
import org.springframework.stereotype.Component;

/**
 * Mapper to convert Queue/Topic MBeans to DTOs
 */
@Component
public class DestinationMapper {
    
    public QueueDTO toQueueDTO(QueueViewMBean queueView) throws Exception {
        QueueDTO dto = new QueueDTO();
        
        dto.setName(queueView.getName());
        dto.setEnqueueCount(queueView.getEnqueueCount());
        dto.setDequeueCount(queueView.getDequeueCount());
        dto.setConsumerCount(queueView.getConsumerCount());
        dto.setProducerCount(queueView.getProducerCount());
        dto.setQueueSize(queueView.getQueueSize());
        dto.setMemoryPercentUsage(queueView.getMemoryPercentUsage());
        dto.setAverageEnqueueTime(queueView.getAverageEnqueueTime());
        dto.setMaxEnqueueTime(queueView.getMaxEnqueueTime());
        dto.setMinEnqueueTime(queueView.getMinEnqueueTime());
        dto.setAverageMessageSize(queueView.getAverageMessageSize());
        dto.setMaxMessageSize(queueView.getMaxMessageSize());
        dto.setMinMessageSize(queueView.getMinMessageSize());
        dto.setPaused(queueView.isPaused());
        
        return dto;
    }
    
    public TopicDTO toTopicDTO(TopicViewMBean topicView) throws Exception {
        TopicDTO dto = new TopicDTO();
        
        dto.setName(topicView.getName());
        dto.setEnqueueCount(topicView.getEnqueueCount());
        dto.setDequeueCount(topicView.getDequeueCount());
        dto.setConsumerCount(topicView.getConsumerCount());
        dto.setProducerCount(topicView.getProducerCount());
        dto.setQueueSize(topicView.getQueueSize());
        dto.setMemoryPercentUsage(topicView.getMemoryPercentUsage());
        dto.setAverageEnqueueTime(topicView.getAverageEnqueueTime());
        dto.setMaxEnqueueTime(topicView.getMaxEnqueueTime());
        dto.setMinEnqueueTime(topicView.getMinEnqueueTime());
        dto.setAverageMessageSize(topicView.getAverageMessageSize());
        dto.setMaxMessageSize(topicView.getMaxMessageSize());
        dto.setMinMessageSize(topicView.getMinMessageSize());
        
        return dto;
    }
}
