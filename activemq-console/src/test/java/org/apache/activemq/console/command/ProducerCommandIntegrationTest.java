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
import org.apache.activemq.broker.BrokerService;
import org.apache.activemq.command.ActiveMQQueue;
import org.junit.After;
import org.junit.Before;
import org.junit.Test;

import jakarta.jms.Connection;
import jakarta.jms.MessageConsumer;
import jakarta.jms.Session;
import jakarta.jms.TextMessage;

import java.util.ArrayList;
import java.util.List;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;

/**
 * Integration tests for the enhanced ProducerCommand with advanced producer options.
 */
public class ProducerCommandIntegrationTest {

    private BrokerService broker;
    private String brokerUrl = "tcp://localhost:61616";
    private String queueName = "TEST.QUEUE";
    private String fullQueueName = "queue://" + queueName;

    @Before
    public void setUp() throws Exception {
        // Start an embedded broker
        broker = new BrokerService();
        broker.setPersistent(false);
        broker.setUseJmx(false);
        broker.addConnector(brokerUrl);
        broker.start();
        broker.waitUntilStarted();
    }

    @After
    public void tearDown() throws Exception {
        if (broker != null) {
            broker.stop();
            broker.waitUntilStopped();
        }
    }

    @Test
    public void testProducerWithBasicOptions() throws Exception {
        // Create and configure the producer command
        ProducerCommand command = new ProducerCommand();
        command.setBrokerUrl(brokerUrl);
        command.setDestination(fullQueueName);
        command.setMessageCount(10);
        command.setMessage("Test Message");
        
        // Run the command
        List<String> tokens = new ArrayList<>();
        command.runTask(tokens);
        
        // Verify messages were sent
        verifyMessageCount(10);
    }

    @Test
    public void testProducerWithWindowSize() throws Exception {
        // Create and configure the producer command
        ProducerCommand command = new ProducerCommand();
        command.setBrokerUrl(brokerUrl);
        command.setDestination(fullQueueName);
        command.setMessageCount(10);
        command.setMessage("Test Message with Window Size");
        command.setProducerWindowSize(1024);
        
        // Run the command
        List<String> tokens = new ArrayList<>();
        command.runTask(tokens);
        
        // Verify messages were sent
        verifyMessageCount(10);
    }

    @Test
    public void testProducerWithAsyncSend() throws Exception {
        // Create and configure the producer command
        ProducerCommand command = new ProducerCommand();
        command.setBrokerUrl(brokerUrl);
        command.setDestination(fullQueueName);
        command.setMessageCount(10);
        command.setMessage("Test Message with Async Send");
        command.setUseAsyncSend(true);
        
        // Run the command
        List<String> tokens = new ArrayList<>();
        command.runTask(tokens);
        
        // Verify messages were sent
        verifyMessageCount(10);
    }

    @Test
    public void testProducerWithSendTimeout() throws Exception {
        // Create and configure the producer command
        ProducerCommand command = new ProducerCommand();
        command.setBrokerUrl(brokerUrl);
        command.setDestination(fullQueueName);
        command.setMessageCount(10);
        command.setMessage("Test Message with Send Timeout");
        command.setSendTimeout(5000);
        
        // Run the command
        List<String> tokens = new ArrayList<>();
        command.runTask(tokens);
        
        // Verify messages were sent
        verifyMessageCount(10);
    }

    @Test
    public void testProducerWithCopyMessageOnSend() throws Exception {
        // Create and configure the producer command
        ProducerCommand command = new ProducerCommand();
        command.setBrokerUrl(brokerUrl);
        command.setDestination(fullQueueName);
        command.setMessageCount(10);
        command.setMessage("Test Message with Copy Message On Send");
        command.setCopyMessageOnSend(false);
        
        // Run the command
        List<String> tokens = new ArrayList<>();
        command.runTask(tokens);
        
        // Verify messages were sent
        verifyMessageCount(10);
    }

    @Test
    public void testProducerWithDeliveryDelay() throws Exception {
        // Create and configure the producer command
        ProducerCommand command = new ProducerCommand();
        command.setBrokerUrl(brokerUrl);
        command.setDestination(fullQueueName);
        command.setMessageCount(5);
        command.setMessage("Test Message with Delivery Delay");
        command.setDeliveryDelay(1000); // 1 second delay
        
        // Record start time
        long startTime = System.currentTimeMillis();
        
        // Run the command
        List<String> tokens = new ArrayList<>();
        command.runTask(tokens);
        
        // Verify messages were sent with delay
        verifyMessageCount(5);
        
        // Verify that it took at least the delivery delay time
        // Note: This is not a precise test as there are other factors that affect timing
        long endTime = System.currentTimeMillis();
        long duration = endTime - startTime;
        assertTrue("Expected delivery delay of at least 1000ms, but was " + duration + "ms", 
                  duration >= 1000);
    }

    @Test
    public void testProducerWithMultipleOptions() throws Exception {
        // Create and configure the producer command with multiple options
        ProducerCommand command = new ProducerCommand();
        command.setBrokerUrl(brokerUrl);
        command.setDestination(fullQueueName);
        command.setMessageCount(10);
        command.setMessage("Test Message with Multiple Options");
        command.setProducerWindowSize(1024);
        command.setUseAsyncSend(true);
        command.setSendTimeout(5000);
        command.setCopyMessageOnSend(false);
        
        // Run the command
        List<String> tokens = new ArrayList<>();
        command.runTask(tokens);
        
        // Verify messages were sent
        verifyMessageCount(10);
    }

    /**
     * Helper method to verify the number of messages in the queue
     */
    private void verifyMessageCount(int expectedCount) throws Exception {
        ActiveMQConnectionFactory factory = new ActiveMQConnectionFactory(brokerUrl);
        Connection connection = factory.createConnection();
        try {
            connection.start();
            Session session = connection.createSession(false, Session.AUTO_ACKNOWLEDGE);
            MessageConsumer consumer = session.createConsumer(new ActiveMQQueue(queueName));
            
            int count = 0;
            while (consumer.receive(1000) != null) {
                count++;
            }
            
            assertEquals("Expected " + expectedCount + " messages in the queue", expectedCount, count);
        } finally {
            connection.close();
        }
    }
}