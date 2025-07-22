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

import org.apache.activemq.console.command.ProducerCommand;

/**
 * Validator for ProducerCommand options.
 * Validates that all options have valid values and combinations.
 */
public class ProducerCommandValidator {
    
    private final ProducerCommand command;
    
    public ProducerCommandValidator(ProducerCommand command) {
        this.command = command;
    }
    
    /**
     * Validates all command options.
     * 
     * @throws IllegalArgumentException if any option is invalid
     */
    public void validate() {
        validateBasicOptions();
        validateConnectionOptions();
        validateProducerOptions();
    }
    
    /**
     * Validates basic command options.
     * 
     * @throws IllegalArgumentException if any option is invalid
     */
    private void validateBasicOptions() {
        // Validate message count
        ValidationUtils.validateNonNegative(command.getMessageCount(), 
            ValidationErrors.NEGATIVE_MESSAGE_COUNT);
        
        // Validate sleep time
        ValidationUtils.validateNonNegative(command.getSleep(), 
            ValidationErrors.NEGATIVE_SLEEP);
        
        // Validate transaction batch size
        ValidationUtils.validateNonNegative(command.getTransactionBatchSize(), 
            ValidationErrors.NEGATIVE_TRANSACTION_BATCH_SIZE);
        
        // Validate parallel threads
        ValidationUtils.validatePositive(command.getParallelThreads(), 
            ValidationErrors.INVALID_PARALLEL_THREADS);
        
        // Validate broker URL
        ValidationUtils.validateUrl(command.getBrokerUrl());
        
        // Validate destination
        ValidationUtils.validateDestination(command.getDestination());
    }
    
    /**
     * Validates connection configuration options.
     * 
     * @throws IllegalArgumentException if any option is invalid
     */
    private void validateConnectionOptions() {
        // Validate connect response timeout
        ValidationUtils.validateNonNegative(command.getConnectResponseTimeout(), 
            ValidationErrors.NEGATIVE_CONNECT_RESPONSE_TIMEOUT);
        
        // Validate close timeout
        ValidationUtils.validateNonNegative(command.getCloseTimeout(), 
            ValidationErrors.NEGATIVE_CLOSE_TIMEOUT);
        
        // Validate prefetch values
        ValidationUtils.validateNonNegative(command.getQueuePrefetch(), 
            ValidationErrors.NEGATIVE_QUEUE_PREFETCH);
        ValidationUtils.validateNonNegative(command.getTopicPrefetch(), 
            ValidationErrors.NEGATIVE_TOPIC_PREFETCH);
        ValidationUtils.validateNonNegative(command.getDurableTopicPrefetch(), 
            ValidationErrors.NEGATIVE_DURABLE_TOPIC_PREFETCH);
        ValidationUtils.validateNonNegative(command.getQueueBrowserPrefetch(), 
            ValidationErrors.NEGATIVE_QUEUE_BROWSER_PREFETCH);
    }
    
    /**
     * Validates producer-specific options.
     * 
     * @throws IllegalArgumentException if any option is invalid
     */
    private void validateProducerOptions() {
        // Validate producer window size
        ValidationUtils.validateNonNegative(command.getProducerWindowSize(), 
            ValidationErrors.NEGATIVE_PRODUCER_WINDOW_SIZE);
        
        // Validate send timeout
        ValidationUtils.validateNonNegative(command.getSendTimeout(), 
            ValidationErrors.NEGATIVE_SEND_TIMEOUT);
        
        // Validate delivery delay
        ValidationUtils.validateNonNegative((int)command.getDeliveryDelay(), 
            ValidationErrors.NEGATIVE_DELIVERY_DELAY);
        
        // Validate message count and runIndefinitely are not both specified
        if (command.isRunIndefinitely() && command.getMessageCount() != 1000) {
            throw new IllegalArgumentException(ValidationErrors.INCOMPATIBLE_RUN_INDEFINITELY_AND_MESSAGE_COUNT);
        }
    }
}