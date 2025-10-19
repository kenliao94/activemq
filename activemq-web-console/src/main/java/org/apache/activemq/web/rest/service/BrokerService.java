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

import org.apache.activemq.broker.jmx.BrokerViewMBean;
import org.apache.activemq.web.BrokerFacade;
import org.apache.activemq.web.rest.dto.BrokerInfoDTO;
import org.apache.activemq.web.rest.exception.ApiException;
import org.apache.activemq.web.rest.mapper.BrokerMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

/**
 * Service for broker operations
 */
@Service
public class BrokerService {
    
    private static final Logger LOG = LoggerFactory.getLogger(BrokerService.class);
    
    @Autowired
    private BrokerFacade brokerFacade;
    
    @Autowired
    private BrokerMapper brokerMapper;
    
    /**
     * Get broker information
     */
    public BrokerInfoDTO getBrokerInfo() {
        try {
            String brokerName = brokerFacade.getBrokerName();
            BrokerViewMBean brokerView = brokerFacade.getBrokerAdmin();
            
            return brokerMapper.toBrokerInfoDTO(brokerView, brokerName);
        } catch (Exception e) {
            LOG.error("Failed to get broker info", e);
            throw new ApiException(500, "Failed to retrieve broker information: " + e.getMessage(), e);
        }
    }
    
    /**
     * Get broker statistics
     */
    public Map<String, Object> getBrokerStatistics() {
        try {
            BrokerViewMBean brokerView = brokerFacade.getBrokerAdmin();
            
            Map<String, Object> stats = new HashMap<>();
            stats.put("timestamp", System.currentTimeMillis());
            stats.put("totalEnqueueCount", brokerView.getTotalEnqueueCount());
            stats.put("totalDequeueCount", brokerView.getTotalDequeueCount());
            stats.put("totalMessageCount", brokerView.getTotalMessageCount());
            stats.put("totalConsumerCount", brokerView.getTotalConsumerCount());
            stats.put("totalProducerCount", brokerView.getTotalProducerCount());
            stats.put("memoryPercentUsage", brokerView.getMemoryPercentUsage());
            stats.put("storePercentUsage", brokerView.getStorePercentUsage());
            stats.put("tempPercentUsage", brokerView.getTempPercentUsage());
            stats.put("averageMessageSize", brokerView.getAverageMessageSize());
            stats.put("maxMessageSize", brokerView.getMaxMessageSize());
            stats.put("minMessageSize", brokerView.getMinMessageSize());
            
            return stats;
        } catch (Exception e) {
            LOG.error("Failed to get broker statistics", e);
            throw new ApiException(500, "Failed to retrieve broker statistics: " + e.getMessage(), e);
        }
    }
    
    /**
     * Get broker health status
     */
    public Map<String, Object> getBrokerHealth() {
        try {
            BrokerViewMBean brokerView = brokerFacade.getBrokerAdmin();
            
            Map<String, Object> health = new HashMap<>();
            
            // Determine health status based on resource usage
            int memoryUsage = brokerView.getMemoryPercentUsage();
            int storeUsage = brokerView.getStorePercentUsage();
            int tempUsage = brokerView.getTempPercentUsage();
            
            String status = "UP";
            if (memoryUsage > 90 || storeUsage > 90 || tempUsage > 90) {
                status = "CRITICAL";
            } else if (memoryUsage > 75 || storeUsage > 75 || tempUsage > 75) {
                status = "WARNING";
            }
            
            health.put("status", status);
            health.put("timestamp", System.currentTimeMillis());
            health.put("uptime", brokerView.getUptime());
            health.put("uptimeMillis", brokerView.getUptimeMillis());
            health.put("memoryPercentUsage", memoryUsage);
            health.put("storePercentUsage", storeUsage);
            health.put("tempPercentUsage", tempUsage);
            health.put("totalConnections", brokerView.getTotalConnectionsCount());
            
            return health;
        } catch (Exception e) {
            LOG.error("Failed to get broker health", e);
            
            Map<String, Object> health = new HashMap<>();
            health.put("status", "DOWN");
            health.put("timestamp", System.currentTimeMillis());
            health.put("error", e.getMessage());
            
            return health;
        }
    }
}
