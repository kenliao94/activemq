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
 * Data Transfer Object for broker information
 */
public class BrokerInfoDTO {
    
    private String name;
    private String version;
    private String id;
    private String uptime;
    private long uptimeMillis;
    private String dataDirectory;
    private String vmURL;
    private int storePercentUsage;
    private int memoryPercentUsage;
    private int tempPercentUsage;
    private long totalConnections;
    private long totalEnqueueCount;
    private long totalDequeueCount;
    private long totalConsumerCount;
    private long totalProducerCount;
    private long totalMessageCount;
    
    public BrokerInfoDTO() {
    }
    
    public String getName() {
        return name;
    }
    
    public void setName(String name) {
        this.name = name;
    }
    
    public String getVersion() {
        return version;
    }
    
    public void setVersion(String version) {
        this.version = version;
    }
    
    public String getId() {
        return id;
    }
    
    public void setId(String id) {
        this.id = id;
    }
    
    public String getUptime() {
        return uptime;
    }
    
    public void setUptime(String uptime) {
        this.uptime = uptime;
    }
    
    public long getUptimeMillis() {
        return uptimeMillis;
    }
    
    public void setUptimeMillis(long uptimeMillis) {
        this.uptimeMillis = uptimeMillis;
    }
    
    public String getDataDirectory() {
        return dataDirectory;
    }
    
    public void setDataDirectory(String dataDirectory) {
        this.dataDirectory = dataDirectory;
    }
    
    public String getVmURL() {
        return vmURL;
    }
    
    public void setVmURL(String vmURL) {
        this.vmURL = vmURL;
    }
    
    public int getStorePercentUsage() {
        return storePercentUsage;
    }
    
    public void setStorePercentUsage(int storePercentUsage) {
        this.storePercentUsage = storePercentUsage;
    }
    
    public int getMemoryPercentUsage() {
        return memoryPercentUsage;
    }
    
    public void setMemoryPercentUsage(int memoryPercentUsage) {
        this.memoryPercentUsage = memoryPercentUsage;
    }
    
    public int getTempPercentUsage() {
        return tempPercentUsage;
    }
    
    public void setTempPercentUsage(int tempPercentUsage) {
        this.tempPercentUsage = tempPercentUsage;
    }
    
    public long getTotalConnections() {
        return totalConnections;
    }
    
    public void setTotalConnections(long totalConnections) {
        this.totalConnections = totalConnections;
    }
    
    public long getTotalEnqueueCount() {
        return totalEnqueueCount;
    }
    
    public void setTotalEnqueueCount(long totalEnqueueCount) {
        this.totalEnqueueCount = totalEnqueueCount;
    }
    
    public long getTotalDequeueCount() {
        return totalDequeueCount;
    }
    
    public void setTotalDequeueCount(long totalDequeueCount) {
        this.totalDequeueCount = totalDequeueCount;
    }
    
    public long getTotalConsumerCount() {
        return totalConsumerCount;
    }
    
    public void setTotalConsumerCount(long totalConsumerCount) {
        this.totalConsumerCount = totalConsumerCount;
    }
    
    public long getTotalProducerCount() {
        return totalProducerCount;
    }
    
    public void setTotalProducerCount(long totalProducerCount) {
        this.totalProducerCount = totalProducerCount;
    }
    
    public long getTotalMessageCount() {
        return totalMessageCount;
    }
    
    public void setTotalMessageCount(long totalMessageCount) {
        this.totalMessageCount = totalMessageCount;
    }
}
