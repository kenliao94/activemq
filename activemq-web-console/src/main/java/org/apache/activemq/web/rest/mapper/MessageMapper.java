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

import org.apache.activemq.web.rest.dto.MessageDTO;
import org.springframework.stereotype.Component;

import javax.management.openmbean.CompositeData;
import java.util.HashMap;
import java.util.Map;

/**
 * Mapper for converting JMX CompositeData to MessageDTO
 */
@Component
public class MessageMapper {
    
    private static final int PREVIEW_LENGTH = 200;
    
    /**
     * Convert CompositeData to MessageDTO
     */
    public MessageDTO toMessageDTO(CompositeData compositeData) {
        if (compositeData == null) {
            return null;
        }
        
        MessageDTO dto = new MessageDTO();
        
        // Extract message properties from CompositeData
        dto.setId(getStringValue(compositeData, "JMSMessageID"));
        dto.setMessageId(getStringValue(compositeData, "JMSMessageID"));
        dto.setDestination(getStringValue(compositeData, "JMSDestination"));
        dto.setTimestamp(getLongValue(compositeData, "JMSTimestamp"));
        dto.setExpiration(getLongValue(compositeData, "JMSExpiration"));
        dto.setPriority(getIntValue(compositeData, "JMSPriority"));
        dto.setRedelivered(getBooleanValue(compositeData, "JMSRedelivered"));
        dto.setCorrelationId(getStringValue(compositeData, "JMSCorrelationID"));
        dto.setType(getStringValue(compositeData, "JMSType"));
        
        // Get delivery mode (1 = non-persistent, 2 = persistent)
        int deliveryMode = getIntValue(compositeData, "JMSDeliveryMode");
        dto.setPersistent(deliveryMode == 2);
        
        // Get redelivery counter if available
        dto.setRedeliveryCounter(getIntValue(compositeData, "JMSXDeliveryCount"));
        
        // Extract custom properties
        Map<String, Object> properties = new HashMap<>();
        CompositeData propertiesData = (CompositeData) compositeData.get("PropertiesText");
        if (propertiesData != null) {
            for (String key : propertiesData.getCompositeType().keySet()) {
                properties.put(key, propertiesData.get(key));
            }
        }
        dto.setProperties(properties);
        
        // Get message body
        String body = getStringValue(compositeData, "Text");
        if (body == null) {
            body = getStringValue(compositeData, "BodyPreview");
        }
        dto.setBody(body);
        
        // Create body preview
        dto.setBodyPreview(createBodyPreview(body));
        
        // Get message size
        dto.setSize(getLongValue(compositeData, "Size"));
        
        return dto;
    }
    
    /**
     * Create a preview of the message body
     */
    private String createBodyPreview(String body) {
        if (body == null || body.isEmpty()) {
            return "";
        }
        
        if (body.length() <= PREVIEW_LENGTH) {
            return body;
        }
        
        return body.substring(0, PREVIEW_LENGTH) + "...";
    }
    
    /**
     * Format message body for display (JSON/XML formatting)
     */
    public String formatMessageBody(String body, String contentType) {
        if (body == null || body.isEmpty()) {
            return body;
        }
        
        // Check if it's JSON
        if (isJson(body) || (contentType != null && contentType.contains("json"))) {
            return formatJson(body);
        }
        
        // Check if it's XML
        if (isXml(body) || (contentType != null && contentType.contains("xml"))) {
            return formatXml(body);
        }
        
        return body;
    }
    
    /**
     * Check if string is JSON
     */
    private boolean isJson(String str) {
        if (str == null || str.isEmpty()) {
            return false;
        }
        String trimmed = str.trim();
        return (trimmed.startsWith("{") && trimmed.endsWith("}")) ||
               (trimmed.startsWith("[") && trimmed.endsWith("]"));
    }
    
    /**
     * Check if string is XML
     */
    private boolean isXml(String str) {
        if (str == null || str.isEmpty()) {
            return false;
        }
        String trimmed = str.trim();
        return trimmed.startsWith("<") && trimmed.endsWith(">");
    }
    
    /**
     * Format JSON string (basic formatting)
     */
    private String formatJson(String json) {
        // Basic JSON formatting - in production, use a JSON library
        return json;
    }
    
    /**
     * Format XML string (basic formatting)
     */
    private String formatXml(String xml) {
        // Basic XML formatting - in production, use an XML library
        return xml;
    }
    
    private String getStringValue(CompositeData data, String key) {
        try {
            Object value = data.get(key);
            return value != null ? value.toString() : null;
        } catch (Exception e) {
            return null;
        }
    }
    
    private long getLongValue(CompositeData data, String key) {
        try {
            Object value = data.get(key);
            if (value instanceof Number) {
                return ((Number) value).longValue();
            }
            return 0;
        } catch (Exception e) {
            return 0;
        }
    }
    
    private int getIntValue(CompositeData data, String key) {
        try {
            Object value = data.get(key);
            if (value instanceof Number) {
                return ((Number) value).intValue();
            }
            return 0;
        } catch (Exception e) {
            return 0;
        }
    }
    
    private boolean getBooleanValue(CompositeData data, String key) {
        try {
            Object value = data.get(key);
            if (value instanceof Boolean) {
                return (Boolean) value;
            }
            return false;
        } catch (Exception e) {
            return false;
        }
    }
}
