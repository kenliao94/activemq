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

import org.apache.activemq.broker.jmx.ConnectionViewMBean;
import org.apache.activemq.web.BrokerFacade;
import org.apache.activemq.web.rest.dto.ConnectionDTO;
import org.apache.activemq.web.rest.exception.ApiException;
import org.apache.activemq.web.rest.mapper.ConnectionMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

/**
 * Service for connection operations
 */
@Service
public class ConnectionService {
    
    private static final Logger LOG = LoggerFactory.getLogger(ConnectionService.class);
    
    @Autowired
    private BrokerFacade brokerFacade;
    
    @Autowired
    private ConnectionMapper connectionMapper;
    
    /**
     * Get all connections
     */
    public List<ConnectionDTO> getConnections() {
        try {
            Collection<ConnectionViewMBean> connections = brokerFacade.getConnections();
            List<ConnectionDTO> connectionDTOs = new ArrayList<>();
            
            for (ConnectionViewMBean connection : connections) {
                try {
                    // Extract connection ID from the connection
                    String connectionId = extractConnectionId(connection);
                    ConnectionDTO dto = connectionMapper.toConnectionDTO(connection, connectionId);
                    connectionDTOs.add(dto);
                } catch (Exception e) {
                    LOG.warn("Failed to map connection", e);
                }
            }
            
            return connectionDTOs;
        } catch (Exception e) {
            LOG.error("Failed to get connections", e);
            throw new ApiException(500, "Failed to retrieve connections: " + e.getMessage(), e);
        }
    }
    
    /**
     * Get a specific connection by ID
     */
    public ConnectionDTO getConnection(String connectionId) {
        try {
            ConnectionViewMBean connection = brokerFacade.getConnection(connectionId);
            
            if (connection == null) {
                throw new ApiException(404, "Connection not found: " + connectionId);
            }
            
            return connectionMapper.toConnectionDTO(connection, connectionId);
        } catch (ApiException e) {
            throw e;
        } catch (Exception e) {
            LOG.error("Failed to get connection: " + connectionId, e);
            throw new ApiException(500, "Failed to retrieve connection: " + e.getMessage(), e);
        }
    }
    
    /**
     * Close a connection
     */
    public void closeConnection(String connectionId) {
        try {
            ConnectionViewMBean connection = brokerFacade.getConnection(connectionId);
            
            if (connection == null) {
                throw new ApiException(404, "Connection not found: " + connectionId);
            }
            
            connection.stop();
            LOG.info("Connection closed: " + connectionId);
        } catch (ApiException e) {
            throw e;
        } catch (Exception e) {
            LOG.error("Failed to close connection: " + connectionId, e);
            throw new ApiException(500, "Failed to close connection: " + e.getMessage(), e);
        }
    }
    
    /**
     * Extract connection ID from ConnectionViewMBean
     * The connection ID is typically available through the client ID or remote address
     */
    private String extractConnectionId(ConnectionViewMBean connection) {
        // Try to get a meaningful ID from the connection
        String clientId = connection.getClientId();
        if (clientId != null && !clientId.isEmpty()) {
            return clientId;
        }
        
        // Fall back to remote address
        String remoteAddress = connection.getRemoteAddress();
        if (remoteAddress != null && !remoteAddress.isEmpty()) {
            return remoteAddress;
        }
        
        // Last resort: use toString
        return connection.toString();
    }
}
