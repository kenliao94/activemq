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

import org.apache.activemq.broker.jmx.ConnectionViewMBean;
import org.apache.activemq.web.rest.dto.ConnectionDTO;
import org.springframework.stereotype.Component;

/**
 * Mapper to convert Connection MBeans to DTOs
 */
@Component
public class ConnectionMapper {
    
    public ConnectionDTO toConnectionDTO(ConnectionViewMBean connectionView, String connectionId) {
        ConnectionDTO dto = new ConnectionDTO();
        
        dto.setConnectionId(connectionId);
        dto.setRemoteAddress(connectionView.getRemoteAddress());
        dto.setUserName(connectionView.getUserName());
        dto.setClientId(connectionView.getClientId());
        dto.setConnected(connectionView.isConnected());
        dto.setActive(connectionView.isActive());
        dto.setSlow(connectionView.isSlow());
        dto.setBlocked(connectionView.isBlocked());
        dto.setDispatchQueueSize(connectionView.getDispatchQueueSize());
        dto.setConnectedTimestamp(connectionView.getConnectedTimestamp());
        dto.setActiveTransactionCount(connectionView.getActiveTransactionCount());
        dto.setOldestActiveTransactionDuration(connectionView.getOldestActiveTransactionDuration());
        dto.setFaultTolerantConnection(connectionView.isFaultTolerantConnection());
        dto.setNetworkConnection(connectionView.isNetworkConnection());
        dto.setWireFormatInfo(connectionView.getWireFormatInfo());
        
        return dto;
    }
}
