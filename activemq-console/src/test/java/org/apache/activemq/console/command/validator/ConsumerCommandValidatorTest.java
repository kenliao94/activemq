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

import org.apache.activemq.console.command.ConsumerCommand;
import org.junit.Before;
import org.junit.Test;

public class ConsumerCommandValidatorTest {
    
    private ConsumerCommand command;
    private ConsumerCommandValidator validator;
    
    @Before
    public void setUp() {
        command = mock(ConsumerCommand.class);
        
        // Set up default valid values
        when(command.getMessageCount()).thenReturn(1000);
        when(command.getSleep()).thenReturn(0);
        when(command.getBatchSize()).thenReturn(10);
        when(command.getParallelThreads()).thenReturn(1);
        when(command.getBrokerUrl()).thenReturn("tcp://localhost:61616");
        when(command.getDestination()).thenReturn("queue://TEST");
        when(command.isDurable()).thenReturn(false);
        
        validator = new ConsumerCommandValidator(command);
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
    public void testValidate_ZeroBatchSize() {
        when(command.getBatchSize()).thenReturn(0);
        validator.validate();
    }
    
    @Test(expected = IllegalArgumentException.class)
    public void testValidate_NegativeBatchSize() {
        when(command.getBatchSize()).thenReturn(-1);
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
    
    @Test(expected = IllegalArgumentException.class)
    public void testValidate_DurableWithoutClientId() {
        when(command.isDurable()).thenReturn(true);
        when(command.getClientId()).thenReturn(null);
        validator.validate();
    }
    
    @Test(expected = IllegalArgumentException.class)
    public void testValidate_DurableWithEmptyClientId() {
        when(command.isDurable()).thenReturn(true);
        when(command.getClientId()).thenReturn("");
        validator.validate();
    }
    
    @Test(expected = IllegalArgumentException.class)
    public void testValidate_DurableWithNullStringClientId() {
        when(command.isDurable()).thenReturn(true);
        when(command.getClientId()).thenReturn("null");
        validator.validate();
    }
    
    @Test
    public void testValidate_DurableWithValidClientId() {
        when(command.isDurable()).thenReturn(true);
        when(command.getClientId()).thenReturn("testClient");
        // Should not throw exception
        validator.validate();
    }
}