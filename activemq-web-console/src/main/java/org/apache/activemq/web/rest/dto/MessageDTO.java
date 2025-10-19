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

import java.util.Map;

/**
 * Data Transfer Object for message information
 */
public class MessageDTO {
    
    private String id;
    private String messageId;
    private String destination;
    private long timestamp;
    private long expiration;
    private int priority;
    private boolean redelivered;
    private int redeliveryCounter;
    private String correlationId;
    private String type;
    private boolean persistent;
    private Map<String, Object> properties;
    private String body;
    private String bodyPreview;
    private long size;
    
    public MessageDTO() {
    }
    
    public String getId() {
        return id;
    }
    
    public void setId(String id) {
        this.id = id;
    }
    
    public String getMessageId() {
        return messageId;
    }
    
    public void setMessageId(String messageId) {
        this.messageId = messageId;
    }
    
    public String getDestination() {
        return destination;
    }
    
    public void setDestination(String destination) {
        this.destination = destination;
    }
    
    public long getTimestamp() {
        return timestamp;
    }
    
    public void setTimestamp(long timestamp) {
        this.timestamp = timestamp;
    }
    
    public long getExpiration() {
        return expiration;
    }
    
    public void setExpiration(long expiration) {
        this.expiration = expiration;
    }
    
    public int getPriority() {
        return priority;
    }
    
    public void setPriority(int priority) {
        this.priority = priority;
    }
    
    public boolean isRedelivered() {
        return redelivered;
    }
    
    public void setRedelivered(boolean redelivered) {
        this.redelivered = redelivered;
    }
    
    public int getRedeliveryCounter() {
        return redeliveryCounter;
    }
    
    public void setRedeliveryCounter(int redeliveryCounter) {
        this.redeliveryCounter = redeliveryCounter;
    }
    
    public String getCorrelationId() {
        return correlationId;
    }
    
    public void setCorrelationId(String correlationId) {
        this.correlationId = correlationId;
    }
    
    public String getType() {
        return type;
    }
    
    public void setType(String type) {
        this.type = type;
    }
    
    public boolean isPersistent() {
        return persistent;
    }
    
    public void setPersistent(boolean persistent) {
        this.persistent = persistent;
    }
    
    public Map<String, Object> getProperties() {
        return properties;
    }
    
    public void setProperties(Map<String, Object> properties) {
        this.properties = properties;
    }
    
    public String getBody() {
        return body;
    }
    
    public void setBody(String body) {
        this.body = body;
    }
    
    public String getBodyPreview() {
        return bodyPreview;
    }
    
    public void setBodyPreview(String bodyPreview) {
        this.bodyPreview = bodyPreview;
    }
    
    public long getSize() {
        return size;
    }
    
    public void setSize(long size) {
        this.size = size;
    }
}
