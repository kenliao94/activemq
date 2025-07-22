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

import org.apache.activemq.console.command.ConsumerCommand;

/**
 * Validator for ConsumerCommand options and configurations.
 */
public class ConsumerCommandValidator extends AbstractCommandValidator {
    
    private final ConsumerCommand consumerCommand;
    
    /**
     * Constructor.
     * 
     * @param consumerCommand The consumer command to validate
     */
    public ConsumerCommandValidator(ConsumerCommand consumerCommand) {
        super(consumerCommand);
        this.consumerCommand = consumerCommand;
    }
    
    /**
     * Validates all consumer command options.
     * 
     * @throws IllegalArgumentException if validation fails
     */
    @Override
    public void validate() throws IllegalArgumentException {
        validateCommonOptions();
        validateConsumerSpecificOptions();
    }
    
    /**
     * Validates consumer-specific options.
     * 
     * @throws IllegalArgumentException if validation fails
     */
    private void validateConsumerSpecificOptions() {
        // Validate message count
        if (consumerCommand.getMessageCount() < 0) {
            throw new IllegalArgumentException(
                String.format(ValidationErrors.INVALID_MESSAGE_COUNT, consumerCommand.getMessageCount()));
        }
        
        // Validate sleep time
        if (consumerCommand.getSleep() < 0) {
            throw new IllegalArgumentException(
                String.format(ValidationErrors.NEGATIVE_TIMEOUT, consumerCommand.getSleep()));
        }
        
        // Validate batch size
        if (consumerCommand.getBatchSize() <= 0) {
            throw new IllegalArgumentException(
                String.format(ValidationErrors.INVALID_BATCH_SIZE, consumerCommand.getBatchSize()));
        }
        
        // Validate parallel threads
        if (consumerCommand.getParallelThreads() <= 0) {
            throw new IllegalArgumentException(
                String.format(ValidationErrors.INVALID_THREAD_COUNT, consumerCommand.getParallelThreads()));
        }
        
        // Validate broker URL
        validateBrokerUrl(consumerCommand.getBrokerUrl());
        
        // Validate destination
        validateDestination(consumerCommand.getDestination());
        
        // Validate durable subscription requires clientId
        if (consumerCommand.isDurable()) {
            String clientId = consumerCommand.getClientId();
            if (clientId == null || clientId.isEmpty() || "null".equals(clientId)) {
                throw new IllegalArgumentException(
                    String.format(ValidationErrors.REQUIRED_OPTION_MISSING, "durable", "clientId"));
            }
        }
    }
}