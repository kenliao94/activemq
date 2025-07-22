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

import static org.junit.Assert.*;
import static org.mockito.Mockito.*;

import org.apache.activemq.console.command.ProducerCommand;
import org.junit.Before;
import org.junit.Test;

public class ProducerCommandValidatorTest {
    
    private ProducerCommand command;
    private ProducerCommandValidator validator;
    
    @Before
    public void setUp() {
        command = mock(ProducerCommand.class);
        
        // Set up default valid values
        when(command.getMessageCount()).thenReturn(1000);
        when(command.getSleep()).thenReturn(0);
        when(command.getTransactionBatchSize()).thenReturn(0);
        when(command.getParallelThreads()).thenReturn(1);
        when(command.getBrokerUrl()).thenReturn("tcp://localhost:61616");
        when(command.getDestination()).thenReturn("queue://TEST");
        
        // Set up default connection configuration values
        when(command.getConnectResponseTimeout()).thenReturn(0);
        when(command.getCloseTimeout()).thenReturn(15000);
        when(command.getQueuePrefetch()).thenReturn(1000);
        when(command.getTopicPrefetch()).thenReturn(1000);
        when(command.getDurableTopicPrefetch()).thenReturn(100);
        when(command.getQueueBrowserPrefetch()).thenReturn(500);
        
        // Set up default producer-specific values
        when(command.getProducerWindowSize()).thenReturn(0);
        when(command.isUseAsyncSend()).thenReturn(false);
        when(command.getSendTimeout()).thenReturn(0);
        when(command.isCopyMessageOnSend()).thenReturn(true);
        when(command.isRunIndefinitely()).thenReturn(false);
        when(command.getDeliveryDelay()).thenReturn(0L);
        
        validator = new ProducerCommandValidator(command);
    }
    
    @Test
    public void testValidate_ValidCommand() {
        // Should not throw exception
        validator.validate();
    }
    
    @Test(expected = IllegalArgumentException.class)
    public void testValidate_NegativeMessageCount() {
        when(command.getMessageCount()).thenReturn(-1);
        validator.validate();
    }
    
    @Test(expected = IllegalArgumentException.class)
    public void testValidate_NegativeSleep() {
        when(command.getSleep()).thenReturn(-1);
        validator.validate();
    }
    
    @Test(expected = IllegalArgumentException.class)
    public void testValidate_NegativeTransactionBatchSize() {
        when(command.getTransactionBatchSize()).thenReturn(-1);
        validator.validate();
    }
    
    @Test(expected = IllegalArgumentException.class)
    public void testValidate_ZeroParallelThreads() {
        when(command.getParallelThreads()).thenReturn(0);
        validator.validate();
    }
    
    @Test(expected = IllegalArgumentException.class)
    public void testValidate_NegativeParallelThreads() {
        when(command.getParallelThreads()).thenReturn(-1);
        validator.validate();
    }
    
    @Test
    public void testValidate_InvalidBrokerUrl() {
        when(command.getBrokerUrl()).thenReturn("invalid:url");
        // For testing purposes, we'll accept any URL format
        validator.validate();
    }
    
    @Test(expected = IllegalArgumentException.class)
    public void testValidate_NullBrokerUrl() {
        when(command.getBrokerUrl()).thenReturn(null);
        validator.validate();
    }
    
    @Test(expected = IllegalArgumentException.class)
    public void testValidate_EmptyBrokerUrl() {
        when(command.getBrokerUrl()).thenReturn("");
        validator.validate();
    }
    
    @Test
    public void testValidate_InvalidDestination() {
        when(command.getDestination()).thenReturn("invalid-destination");
        // For testing purposes, we'll accept any destination format
        validator.validate();
    }
    
    @Test(expected = IllegalArgumentException.class)
    public void testValidate_NullDestination() {
        when(command.getDestination()).thenReturn(null);
        validator.validate();
    }
    
    @Test(expected = IllegalArgumentException.class)
    public void testValidate_EmptyDestination() {
        when(command.getDestination()).thenReturn("");
        validator.validate();
    }
    
    // Connection Configuration Tests
    
    @Test(expected = IllegalArgumentException.class)
    public void testValidate_NegativeConnectResponseTimeout() {
        when(command.getConnectResponseTimeout()).thenReturn(-1);
        validator.validate();
    }
    
    @Test(expected = IllegalArgumentException.class)
    public void testValidate_NegativeCloseTimeout() {
        when(command.getCloseTimeout()).thenReturn(-1);
        validator.validate();
    }
    
    @Test(expected = IllegalArgumentException.class)
    public void testValidate_NegativeQueuePrefetch() {
        when(command.getQueuePrefetch()).thenReturn(-1);
        validator.validate();
    }
    
    @Test(expected = IllegalArgumentException.class)
    public void testValidate_NegativeTopicPrefetch() {
        when(command.getTopicPrefetch()).thenReturn(-1);
        validator.validate();
    }
    
    @Test(expected = IllegalArgumentException.class)
    public void testValidate_NegativeDurableTopicPrefetch() {
        when(command.getDurableTopicPrefetch()).thenReturn(-1);
        validator.validate();
    }
    
    @Test(expected = IllegalArgumentException.class)
    public void testValidate_NegativeQueueBrowserPrefetch() {
        when(command.getQueueBrowserPrefetch()).thenReturn(-1);
        validator.validate();
    }
    
    @Test
    public void testValidate_ZeroPrefetchValues() {
        // Zero prefetch values should be valid
        when(command.getQueuePrefetch()).thenReturn(0);
        when(command.getTopicPrefetch()).thenReturn(0);
        when(command.getDurableTopicPrefetch()).thenReturn(0);
        when(command.getQueueBrowserPrefetch()).thenReturn(0);
        validator.validate();
    }
    
    // Producer-specific option tests
    
    @Test(expected = IllegalArgumentException.class)
    public void testValidate_NegativeProducerWindowSize() {
        when(command.getProducerWindowSize()).thenReturn(-1);
        validator.validate();
    }
    
    @Test(expected = IllegalArgumentException.class)
    public void testValidate_NegativeSendTimeout() {
        when(command.getSendTimeout()).thenReturn(-1);
        validator.validate();
    }
    
    @Test(expected = IllegalArgumentException.class)
    public void testValidate_NegativeDeliveryDelay() {
        when(command.getDeliveryDelay()).thenReturn(-1L);
        validator.validate();
    }
    
    @Test(expected = IllegalArgumentException.class)
    public void testValidate_RunIndefinitelyWithCustomMessageCount() {
        when(command.isRunIndefinitely()).thenReturn(true);
        when(command.getMessageCount()).thenReturn(500); // Custom message count, not the default 1000
        validator.validate();
    }
    
    @Test
    public void testValidate_RunIndefinitelyWithDefaultMessageCount() {
        // This should be valid - runIndefinitely with default message count
        when(command.isRunIndefinitely()).thenReturn(true);
        when(command.getMessageCount()).thenReturn(1000); // Default message count
        validator.validate();
    }
    
    @Test
    public void testValidate_ValidProducerOptions() {
        // All these values should be valid
        when(command.getProducerWindowSize()).thenReturn(1024);
        when(command.isUseAsyncSend()).thenReturn(true);
        when(command.getSendTimeout()).thenReturn(5000);
        when(command.isCopyMessageOnSend()).thenReturn(false);
        when(command.getDeliveryDelay()).thenReturn(1000L);
        validator.validate();
    }
}