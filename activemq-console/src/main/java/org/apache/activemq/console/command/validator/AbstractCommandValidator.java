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

import org.apache.activemq.console.command.AbstractCommand;

/**
 * Base validator class for common validations between different command types.
 */
public abstract class AbstractCommandValidator implements CommandValidator {
    
    protected final AbstractCommand command;
    
    /**
     * Constructor.
     * 
     * @param command The command to validate
     */
    public AbstractCommandValidator(AbstractCommand command) {
        this.command = command;
    }
    
    /**
     * Validates common options shared by multiple command types.
     * 
     * @throws IllegalArgumentException if validation fails
     */
    protected void validateCommonOptions() throws IllegalArgumentException {
        // This method can be extended with common validations as needed
    }
    
    /**
     * Validates SSL configuration options.
     * 
     * @param sslKeyStore The keyStore path
     * @param sslTrustStore The trustStore path
     * @throws IllegalArgumentException if validation fails
     */
    protected void validateSslOptions(String sslKeyStore, String sslTrustStore) {
        ValidationUtils.validateSslConfig(sslKeyStore, sslTrustStore);
    }
    
    /**
     * Validates timeout values.
     * 
     * @param connectResponseTimeout The connect response timeout
     * @param closeTimeout The close timeout
     * @throws IllegalArgumentException if validation fails
     */
    protected void validateTimeoutOptions(int connectResponseTimeout, int closeTimeout) {
        ValidationUtils.validateNonNegative(connectResponseTimeout, ValidationErrors.NEGATIVE_TIMEOUT);
        ValidationUtils.validateNonNegative(closeTimeout, ValidationErrors.NEGATIVE_TIMEOUT);
    }
    
    /**
     * Validates thread-related options.
     * 
     * @param maxThreadPoolSize The maximum thread pool size
     * @throws IllegalArgumentException if validation fails
     */
    protected void validateThreadOptions(int maxThreadPoolSize) {
        if (maxThreadPoolSize != 0) { // 0 means use default
            ValidationUtils.validatePositive(maxThreadPoolSize, ValidationErrors.INVALID_THREAD_COUNT);
        }
    }
    
    /**
     * Validates broker URL format.
     * 
     * @param brokerUrl The broker URL
     * @throws IllegalArgumentException if validation fails
     */
    protected void validateBrokerUrl(String brokerUrl) {
        ValidationUtils.validateUrl(brokerUrl);
    }
    
    /**
     * Validates destination format.
     * 
     * @param destination The destination
     * @throws IllegalArgumentException if validation fails
     */
    protected void validateDestination(String destination) {
        ValidationUtils.validateDestination(destination);
    }
}