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
 * Data Transfer Object for queue information
 */
public class QueueDTO {
    
    private String name;
    private long enqueueCount;
    private long dequeueCount;
    private long consumerCount;
    private long producerCount;
    private long queueSize;
    private int memoryPercentUsage;
    private double averageEnqueueTime;
    private long maxEnqueueTime;
    private long minEnqueueTime;
    private long averageMessageSize;
    private long maxMessageSize;
    private long minMessageSize;
    private boolean paused;
    
    public QueueDTO() {
    }
    
    public String getName() {
        return name;
    }
    
    public void setName(String name) {
        this.name = name;
    }
    
    public long getEnqueueCount() {
        return enqueueCount;
    }
    
    public void setEnqueueCount(long enqueueCount) {
        this.enqueueCount = enqueueCount;
    }
    
    public long getDequeueCount() {
        return dequeueCount;
    }
    
    public void setDequeueCount(long dequeueCount) {
        this.dequeueCount = dequeueCount;
    }
    
    public long getConsumerCount() {
        return consumerCount;
    }
    
    public void setConsumerCount(long consumerCount) {
        this.consumerCount = consumerCount;
    }
    
    public long getProducerCount() {
        return producerCount;
    }
    
    public void setProducerCount(long producerCount) {
        this.producerCount = producerCount;
    }
    
    public long getQueueSize() {
        return queueSize;
    }
    
    public void setQueueSize(long queueSize) {
        this.queueSize = queueSize;
    }
    
    public int getMemoryPercentUsage() {
        return memoryPercentUsage;
    }
    
    public void setMemoryPercentUsage(int memoryPercentUsage) {
        this.memoryPercentUsage = memoryPercentUsage;
    }
    
    public double getAverageEnqueueTime() {
        return averageEnqueueTime;
    }
    
    public void setAverageEnqueueTime(double averageEnqueueTime) {
        this.averageEnqueueTime = averageEnqueueTime;
    }
    
    public long getMaxEnqueueTime() {
        return maxEnqueueTime;
    }
    
    public void setMaxEnqueueTime(long maxEnqueueTime) {
        this.maxEnqueueTime = maxEnqueueTime;
    }
    
    public long getMinEnqueueTime() {
        return minEnqueueTime;
    }
    
    public void setMinEnqueueTime(long minEnqueueTime) {
        this.minEnqueueTime = minEnqueueTime;
    }
    
    public long getAverageMessageSize() {
        return averageMessageSize;
    }
    
    public void setAverageMessageSize(long averageMessageSize) {
        this.averageMessageSize = averageMessageSize;
    }
    
    public long getMaxMessageSize() {
        return maxMessageSize;
    }
    
    public void setMaxMessageSize(long maxMessageSize) {
        this.maxMessageSize = maxMessageSize;
    }
    
    public long getMinMessageSize() {
        return minMessageSize;
    }
    
    public void setMinMessageSize(long minMessageSize) {
        this.minMessageSize = minMessageSize;
    }
    
    public boolean isPaused() {
        return paused;
    }
    
    public void setPaused(boolean paused) {
        this.paused = paused;
    }
}
