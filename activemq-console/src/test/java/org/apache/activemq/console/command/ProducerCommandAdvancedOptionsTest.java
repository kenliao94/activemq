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
package org.apache.activemq.console.command;

import org.apache.activemq.ActiveMQConnectionFactory;
import org.apache.activemq.util.ProducerThread;
import org.junit.Before;
import org.junit.Test;

import jakarta.jms.Session;
import java.lang.reflect.Field;
import java.lang.reflect.Method;
import java.util.concurrent.CountDownLatch;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;

/**
 * Unit tests for the enhanced ProducerCommand with advanced producer options.
 */
public class ProducerCommandAdvancedOptionsTest {

    private ProducerCommand command;

    @Before
    public void setUp() {
        command = new ProducerCommand();
    }

    @Test
    public void testDefaultProducerOptionValues() {
        // Verify default values for producer-specific options
        assertEquals(0, command.getProducerWindowSize());
        assertEquals(false, command.isUseAsyncSend());
        assertEquals(0, command.getSendTimeout());
        assertEquals(true, command.isCopyMessageOnSend());
        assertEquals(false, command.isRunIndefinitely());
        assertEquals(0L, command.getDeliveryDelay());
    }

    @Test
    public void testSetProducerOptions() {
        // Set producer-specific options
        command.setProducerWindowSize(1024);
        command.setUseAsyncSend(true);
        command.setSendTimeout(5000);
        command.setCopyMessageOnSend(false);
        command.setRunIndefinitely(true);
        command.setDeliveryDelay(1000L);
        
        // Verify values were set correctly
        assertEquals(1024, command.getProducerWindowSize());
        assertEquals(true, command.isUseAsyncSend());
        assertEquals(5000, command.getSendTimeout());
        assertEquals(false, command.isCopyMessageOnSend());
        assertEquals(true, command.isRunIndefinitely());
        assertEquals(1000L, command.getDeliveryDelay());
    }

    @Test
    public void testConfigureConnectionFactory() throws Exception {
        // Set producer-specific options
        command.setProducerWindowSize(1024);
        command.setUseAsyncSend(true);
        command.setSendTimeout(5000);
        command.setCopyMessageOnSend(false);
        
        // Create a connection factory
        ActiveMQConnectionFactory factory = new ActiveMQConnectionFactory("vm://localhost");
        
        // Invoke the configureConnectionFactory method using reflection
        Method configureMethod = ProducerCommand.class.getDeclaredMethod("configureConnectionFactory", ActiveMQConnectionFactory.class);
        configureMethod.setAccessible(true);
        configureMethod.invoke(command, factory);
        
        // Verify connection factory settings
        assertEquals(1024, factory.getProducerWindowSize());
        assertEquals(true, factory.isUseAsyncSend());
        assertEquals(5000, factory.getSendTimeout());
        assertEquals(false, factory.isCopyMessageOnSend());
    }

    @Test
    public void testConfigureProducerThread() throws Exception {
        // Set producer-specific options
        command.setMessageCount(500);
        command.setSleep(10);
        command.setMsgTTL(5000L);
        command.setPersistent(false);
        command.setTransactionBatchSize(100);
        command.setRunIndefinitely(true);
        command.setDeliveryDelay(1000L);
        
        // Create a mock session
        Session mockSession = mock(Session.class);
        
        // Create a producer thread with the mock session
        ProducerThread producer = new ProducerThread(mockSession, null);
        
        // Invoke the configureProducerThread method using reflection
        Method configureMethod = ProducerCommand.class.getDeclaredMethod("configureProducerThread", ProducerThread.class);
        configureMethod.setAccessible(true);
        configureMethod.invoke(command, producer);
        
        // Verify producer thread settings
        assertEquals(500, producer.getMessageCount());
        assertEquals(10, producer.getSleep());
        assertEquals(5000L, producer.getMsgTTL());
        assertEquals(false, producer.isPersistent());
        assertEquals(100, producer.getTransactionBatchSize());
        assertEquals(true, producer.isRunIndefinitely());
        
        // Note: deliveryDelay is not directly accessible in ProducerThread
        // It would be applied at the message level when sending
    }
}