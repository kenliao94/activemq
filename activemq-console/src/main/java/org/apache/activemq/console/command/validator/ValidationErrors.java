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
package org.apache.activemq.console.command.validator;

/**
 * Constants for validation error messages.
 */
public class ValidationErrors {
    
    // Basic option validation errors
    public static final String NEGATIVE_MESSAGE_COUNT = 
        "Message count must be non-negative. Invalid value: %d";
    
    public static final String INVALID_MESSAGE_COUNT = 
        "Message count must be non-negative. Invalid value: %d";
    
    public static final String NEGATIVE_SLEEP = 
        "Sleep time must be non-negative. Invalid value: %d";
    
    public static final String NEGATIVE_TRANSACTION_BATCH_SIZE = 
        "Transaction batch size must be non-negative. Invalid value: %d";
    
    public static final String INVALID_BATCH_SIZE = 
        "Batch size must be non-negative. Invalid value: %d";
    
    public static final String INVALID_PARALLEL_THREADS = 
        "Parallel threads must be positive. Invalid value: %d";
    
    public static final String INVALID_THREAD_COUNT = 
        "Thread count must be positive. Invalid value: %d";
    
    public static final String NEGATIVE_TIMEOUT = 
        "Timeout value must be non-negative. Invalid value: %d";
    
    public static final String INVALID_URL_FORMAT = 
        "Invalid broker URL format: %s";
    
    public static final String INVALID_DESTINATION_FORMAT = 
        "Invalid destination format. Must not be empty.";
    
    // Connection configuration validation errors
    public static final String NEGATIVE_CONNECT_RESPONSE_TIMEOUT = 
        "Connect response timeout must be non-negative. Invalid value: %d";
    
    public static final String NEGATIVE_CLOSE_TIMEOUT = 
        "Close timeout must be non-negative. Invalid value: %d";
    
    public static final String NEGATIVE_QUEUE_PREFETCH = 
        "Queue prefetch must be non-negative. Invalid value: %d";
    
    public static final String NEGATIVE_TOPIC_PREFETCH = 
        "Topic prefetch must be non-negative. Invalid value: %d";
    
    public static final String NEGATIVE_DURABLE_TOPIC_PREFETCH = 
        "Durable topic prefetch must be non-negative. Invalid value: %d";
    
    public static final String NEGATIVE_QUEUE_BROWSER_PREFETCH = 
        "Queue browser prefetch must be non-negative. Invalid value: %d";
    
    // Producer-specific validation errors
    public static final String NEGATIVE_PRODUCER_WINDOW_SIZE = 
        "Producer window size must be non-negative. Invalid value: %d";
    
    public static final String NEGATIVE_SEND_TIMEOUT = 
        "Send timeout must be non-negative. Invalid value: %d";
    
    public static final String NEGATIVE_DELIVERY_DELAY = 
        "Delivery delay must be non-negative. Invalid value: %d";
    
    public static final String INCOMPATIBLE_RUN_INDEFINITELY_AND_MESSAGE_COUNT = 
        "Cannot specify both runIndefinitely=true and a custom messageCount. Either use runIndefinitely=true or set messageCount.";
    
    // SSL configuration validation errors
    public static final String SSL_INCOMPLETE = 
        "SSL configuration incomplete. When using SSL options, both keyStore and trustStore must be specified.";
    
    public static final String SSL_KEYSTORE_NOT_FOUND = 
        "SSL keyStore file not found: %s";
    
    public static final String SSL_TRUSTSTORE_NOT_FOUND = 
        "SSL trustStore file not found: %s";
    
    // Message properties validation errors
    public static final String INVALID_PROPERTY_FORMAT = 
        "Invalid message property format. Use: key1=value1,key2=value2";
    
    public static final String INVALID_PROPERTY_NAME = 
        "Invalid message property name: %s. Property names must contain only alphanumeric characters, underscores, hyphens, and dots.";
    
    // Option combination validation errors
    public static final String INCOMPATIBLE_OPTIONS = 
        "Options %s and %s cannot be used together.";
    
    public static final String REQUIRED_OPTION_MISSING = 
        "When using %s, you must also specify %s.";
}