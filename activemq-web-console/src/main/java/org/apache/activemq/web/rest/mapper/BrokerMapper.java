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

import org.apache.activemq.broker.jmx.BrokerViewMBean;
import org.apache.activemq.web.rest.dto.BrokerInfoDTO;
import org.springframework.stereotype.Component;

/**
 * Mapper to convert BrokerViewMBean to BrokerInfoDTO
 */
@Component
public class BrokerMapper {
    
    public BrokerInfoDTO toBrokerInfoDTO(BrokerViewMBean brokerView, String brokerName) throws Exception {
        BrokerInfoDTO dto = new BrokerInfoDTO();
        
        dto.setName(brokerName);
        dto.setVersion(brokerView.getBrokerVersion());
        dto.setId(brokerView.getBrokerId());
        dto.setUptime(brokerView.getUptime());
        dto.setUptimeMillis(brokerView.getUptimeMillis());
        dto.setDataDirectory(brokerView.getDataDirectory());
        dto.setVmURL(brokerView.getVMURL());
        dto.setStorePercentUsage(brokerView.getStorePercentUsage());
        dto.setMemoryPercentUsage(brokerView.getMemoryPercentUsage());
        dto.setTempPercentUsage(brokerView.getTempPercentUsage());
        dto.setTotalConnections(brokerView.getTotalConnectionsCount());
        dto.setTotalEnqueueCount(brokerView.getTotalEnqueueCount());
        dto.setTotalDequeueCount(brokerView.getTotalDequeueCount());
        dto.setTotalConsumerCount(brokerView.getTotalConsumerCount());
        dto.setTotalProducerCount(brokerView.getTotalProducerCount());
        dto.setTotalMessageCount(brokerView.getTotalMessageCount());
        
        return dto;
    }
}
