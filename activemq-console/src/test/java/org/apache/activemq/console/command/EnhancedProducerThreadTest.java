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

import static org.junit.Assert.assertEquals;
import static org.mockito.Mockito.*;

import jakarta.jms.Destination;
import jakarta.jms.Message;
import jakarta.jms.MessageProducer;
import jakarta.jms.Session;
import jakarta.jms.TextMessage;

import org.junit.Before;
import org.junit.Test;
import org.mockito.ArgumentCaptor;

/**
 * Unit tests for the EnhancedProducerThread class.
 */
public class EnhancedProducerThreadTest {

    private Session mockSession;
    private Destination mockDestination;
    private MessageProducer mockProducer;
    private TextMessage mockMessage;
    private EnhancedProducerThread producerThread;

    @Before
    public void setUp() throws Exception {
        mockSession = mock(Session.class);
        mockDestination = mock(Destination.class);
        mockProducer = mock(MessageProducer.class);
        mockMessage = mock(TextMessage.class);

        when(mockSession.createProducer(mockDestination)).thenReturn(mockProducer);
        when(mockSession.createTextMessage(anyString())).thenReturn(mockMessage);

        producerThread = new EnhancedProducerThread(mockSession, mockDestination);
        producerThread.setMessageCount(1); // Just send one message for testing
        producerThread.setMessage("Test message");
    }

    @Test
    public void testDeliveryDelayIsApplied() throws Exception {
        // Set delivery delay
        long deliveryDelay = 5000L;
        producerThread.setDeliveryDelay(deliveryDelay);
        
        // Run the producer thread
        producerThread.run();
        
        // Verify that setDeliveryDelay was called on the producer with the correct value
        verify(mockProducer).setDeliveryDelay(deliveryDelay);
        
        // Verify that send was called with the message
        verify(mockProducer).send(mockMessage);
    }

    @Test
    public void testNoDeliveryDelayByDefault() throws Exception {
        // Run the producer thread with default delivery delay (0)
        producerThread.run();
        
        // Verify that setDeliveryDelay was not called on the producer
        verify(mockProducer, never()).setDeliveryDelay(anyLong());
        
        // Verify that send was called with the message
        verify(mockProducer).send(mockMessage);
    }

    @Test
    public void testGetterAndSetter() {
        // Test the getter and setter for deliveryDelay
        long deliveryDelay = 10000L;
        producerThread.setDeliveryDelay(deliveryDelay);
        assertEquals(deliveryDelay, producerThread.getDeliveryDelay());
    }
}