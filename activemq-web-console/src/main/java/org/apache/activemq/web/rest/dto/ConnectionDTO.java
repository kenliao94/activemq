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
package org.apache.activemq.web.rest.dto;

/**
 * Data Transfer Object for connection information
 */
public class ConnectionDTO {
    
    private String connectionId;
    private String remoteAddress;
    private String userName;
    private String clientId;
    private boolean connected;
    private boolean active;
    private boolean slow;
    private boolean blocked;
    private int dispatchQueueSize;
    private long connectedTimestamp;
    private int activeTransactionCount;
    private Long oldestActiveTransactionDuration;
    private boolean faultTolerantConnection;
    private boolean networkConnection;
    private String wireFormatInfo;
    
    public ConnectionDTO() {
    }
    
    public String getConnectionId() {
        return connectionId;
    }
    
    public void setConnectionId(String connectionId) {
        this.connectionId = connectionId;
    }
    
    public String getRemoteAddress() {
        return remoteAddress;
    }
    
    public void setRemoteAddress(String remoteAddress) {
        this.remoteAddress = remoteAddress;
    }
    
    public String getUserName() {
        return userName;
    }
    
    public void setUserName(String userName) {
        this.userName = userName;
    }
    
    public String getClientId() {
        return clientId;
    }
    
    public void setClientId(String clientId) {
        this.clientId = clientId;
    }
    
    public boolean isConnected() {
        return connected;
    }
    
    public void setConnected(boolean connected) {
        this.connected = connected;
    }
    
    public boolean isActive() {
        return active;
    }
    
    public void setActive(boolean active) {
        this.active = active;
    }
    
    public boolean isSlow() {
        return slow;
    }
    
    public void setSlow(boolean slow) {
        this.slow = slow;
    }
    
    public boolean isBlocked() {
        return blocked;
    }
    
    public void setBlocked(boolean blocked) {
        this.blocked = blocked;
    }
    
    public int getDispatchQueueSize() {
        return dispatchQueueSize;
    }
    
    public void setDispatchQueueSize(int dispatchQueueSize) {
        this.dispatchQueueSize = dispatchQueueSize;
    }
    
    public long getConnectedTimestamp() {
        return connectedTimestamp;
    }
    
    public void setConnectedTimestamp(long connectedTimestamp) {
        this.connectedTimestamp = connectedTimestamp;
    }
    
    public int getActiveTransactionCount() {
        return activeTransactionCount;
    }
    
    public void setActiveTransactionCount(int activeTransactionCount) {
        this.activeTransactionCount = activeTransactionCount;
    }
    
    public Long getOldestActiveTransactionDuration() {
        return oldestActiveTransactionDuration;
    }
    
    public void setOldestActiveTransactionDuration(Long oldestActiveTransactionDuration) {
        this.oldestActiveTransactionDuration = oldestActiveTransactionDuration;
    }
    
    public boolean isFaultTolerantConnection() {
        return faultTolerantConnection;
    }
    
    public void setFaultTolerantConnection(boolean faultTolerantConnection) {
        this.faultTolerantConnection = faultTolerantConnection;
    }
    
    public boolean isNetworkConnection() {
        return networkConnection;
    }
    
    public void setNetworkConnection(boolean networkConnection) {
        this.networkConnection = networkConnection;
    }
    
    public String getWireFormatInfo() {
        return wireFormatInfo;
    }
    
    public void setWireFormatInfo(String wireFormatInfo) {
        this.wireFormatInfo = wireFormatInfo;
    }
}
