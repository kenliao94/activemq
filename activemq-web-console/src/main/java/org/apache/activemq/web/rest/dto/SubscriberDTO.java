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
 * Data Transfer Object for subscriber/consumer information
 */
public class SubscriberDTO {
    
    private String consumerId;
    private String connectionId;
    private String clientId;
    private long sessionId;
    private long subscriptionId;
    private String destinationName;
    private String selector;
    private boolean destinationQueue;
    private boolean destinationTopic;
    private boolean destinationTemporary;
    private boolean active;
    private boolean network;
    private int pendingQueueSize;
    private int dispatchedQueueSize;
    private long dispatchedCounter;
    private long enqueueCounter;
    private long dequeueCounter;
    private long consumedCount;
    private int prefetchSize;
    private boolean retroactive;
    private boolean exclusive;
    private boolean durable;
    private boolean noLocal;
    private boolean dispatchAsync;
    private int maximumPendingMessageLimit;
    private byte priority;
    private String subscriptionName;
    private boolean slowConsumer;
    private String userName;
    
    public SubscriberDTO() {
    }
    
    public String getConsumerId() {
        return consumerId;
    }
    
    public void setConsumerId(String consumerId) {
        this.consumerId = consumerId;
    }
    
    public String getConnectionId() {
        return connectionId;
    }
    
    public void setConnectionId(String connectionId) {
        this.connectionId = connectionId;
    }
    
    public String getClientId() {
        return clientId;
    }
    
    public void setClientId(String clientId) {
        this.clientId = clientId;
    }
    
    public long getSessionId() {
        return sessionId;
    }
    
    public void setSessionId(long sessionId) {
        this.sessionId = sessionId;
    }
    
    public long getSubscriptionId() {
        return subscriptionId;
    }
    
    public void setSubscriptionId(long subscriptionId) {
        this.subscriptionId = subscriptionId;
    }
    
    public String getDestinationName() {
        return destinationName;
    }
    
    public void setDestinationName(String destinationName) {
        this.destinationName = destinationName;
    }
    
    public String getSelector() {
        return selector;
    }
    
    public void setSelector(String selector) {
        this.selector = selector;
    }
    
    public boolean isDestinationQueue() {
        return destinationQueue;
    }
    
    public void setDestinationQueue(boolean destinationQueue) {
        this.destinationQueue = destinationQueue;
    }
    
    public boolean isDestinationTopic() {
        return destinationTopic;
    }
    
    public void setDestinationTopic(boolean destinationTopic) {
        this.destinationTopic = destinationTopic;
    }
    
    public boolean isDestinationTemporary() {
        return destinationTemporary;
    }
    
    public void setDestinationTemporary(boolean destinationTemporary) {
        this.destinationTemporary = destinationTemporary;
    }
    
    public boolean isActive() {
        return active;
    }
    
    public void setActive(boolean active) {
        this.active = active;
    }
    
    public boolean isNetwork() {
        return network;
    }
    
    public void setNetwork(boolean network) {
        this.network = network;
    }
    
    public int getPendingQueueSize() {
        return pendingQueueSize;
    }
    
    public void setPendingQueueSize(int pendingQueueSize) {
        this.pendingQueueSize = pendingQueueSize;
    }
    
    public int getDispatchedQueueSize() {
        return dispatchedQueueSize;
    }
    
    public void setDispatchedQueueSize(int dispatchedQueueSize) {
        this.dispatchedQueueSize = dispatchedQueueSize;
    }
    
    public long getDispatchedCounter() {
        return dispatchedCounter;
    }
    
    public void setDispatchedCounter(long dispatchedCounter) {
        this.dispatchedCounter = dispatchedCounter;
    }
    
    public long getEnqueueCounter() {
        return enqueueCounter;
    }
    
    public void setEnqueueCounter(long enqueueCounter) {
        this.enqueueCounter = enqueueCounter;
    }
    
    public long getDequeueCounter() {
        return dequeueCounter;
    }
    
    public void setDequeueCounter(long dequeueCounter) {
        this.dequeueCounter = dequeueCounter;
    }
    
    public long getConsumedCount() {
        return consumedCount;
    }
    
    public void setConsumedCount(long consumedCount) {
        this.consumedCount = consumedCount;
    }
    
    public int getPrefetchSize() {
        return prefetchSize;
    }
    
    public void setPrefetchSize(int prefetchSize) {
        this.prefetchSize = prefetchSize;
    }
    
    public boolean isRetroactive() {
        return retroactive;
    }
    
    public void setRetroactive(boolean retroactive) {
        this.retroactive = retroactive;
    }
    
    public boolean isExclusive() {
        return exclusive;
    }
    
    public void setExclusive(boolean exclusive) {
        this.exclusive = exclusive;
    }
    
    public boolean isDurable() {
        return durable;
    }
    
    public void setDurable(boolean durable) {
        this.durable = durable;
    }
    
    public boolean isNoLocal() {
        return noLocal;
    }
    
    public void setNoLocal(boolean noLocal) {
        this.noLocal = noLocal;
    }
    
    public boolean isDispatchAsync() {
        return dispatchAsync;
    }
    
    public void setDispatchAsync(boolean dispatchAsync) {
        this.dispatchAsync = dispatchAsync;
    }
    
    public int getMaximumPendingMessageLimit() {
        return maximumPendingMessageLimit;
    }
    
    public void setMaximumPendingMessageLimit(int maximumPendingMessageLimit) {
        this.maximumPendingMessageLimit = maximumPendingMessageLimit;
    }
    
    public byte getPriority() {
        return priority;
    }
    
    public void setPriority(byte priority) {
        this.priority = priority;
    }
    
    public String getSubscriptionName() {
        return subscriptionName;
    }
    
    public void setSubscriptionName(String subscriptionName) {
        this.subscriptionName = subscriptionName;
    }
    
    public boolean isSlowConsumer() {
        return slowConsumer;
    }
    
    public void setSlowConsumer(boolean slowConsumer) {
        this.slowConsumer = slowConsumer;
    }
    
    public String getUserName() {
        return userName;
    }
    
    public void setUserName(String userName) {
        this.userName = userName;
    }
}
