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
import org.apache.activemq.ActiveMQPrefetchPolicy;
import org.junit.Before;
import org.junit.Test;

import java.lang.reflect.Field;
import java.lang.reflect.Method;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;

/**
 * Unit tests for the enhanced ProducerCommand with connection configuration options.
 */
public class ProducerCommandTest {

    private ProducerCommand command;

    @Before
    public void setUp() {
        command = new ProducerCommand();
    }

    @Test
    public void testDefaultConnectionConfigurationValues() {
        // Verify default values
        assertEquals(0, command.getConnectResponseTimeout());
        assertEquals(false, command.isUseCompression());
        assertEquals(false, command.isAlwaysSyncSend());
        assertEquals(true, command.isDispatchAsync());
        assertEquals(15000, command.getCloseTimeout());
        
        // Verify default prefetch values
        assertEquals(1000, command.getQueuePrefetch());
        assertEquals(1000, command.getTopicPrefetch());
        assertEquals(100, command.getDurableTopicPrefetch());
        assertEquals(500, command.getQueueBrowserPrefetch());
    }

    @Test
    public void testSetConnectionConfigurationOptions() {
        // Set connection configuration options
        command.setConnectResponseTimeout(5000);
        command.setUseCompression(true);
        command.setAlwaysSyncSend(true);
        command.setDispatchAsync(false);
        command.setCloseTimeout(30000);
        
        // Verify values were set correctly
        assertEquals(5000, command.getConnectResponseTimeout());
        assertEquals(true, command.isUseCompression());
        assertEquals(true, command.isAlwaysSyncSend());
        assertEquals(false, command.isDispatchAsync());
        assertEquals(30000, command.getCloseTimeout());
    }

    @Test
    public void testSetPrefetchPolicyOptions() {
        // Set prefetch policy options
        command.setQueuePrefetch(500);
        command.setTopicPrefetch(2000);
        command.setDurableTopicPrefetch(200);
        command.setQueueBrowserPrefetch(300);
        
        // Verify values were set correctly
        assertEquals(500, command.getQueuePrefetch());
        assertEquals(2000, command.getTopicPrefetch());
        assertEquals(200, command.getDurableTopicPrefetch());
        assertEquals(300, command.getQueueBrowserPrefetch());
    }

    @Test
    public void testConfigureConnectionFactory() throws Exception {
        // Set connection configuration options
        command.setConnectResponseTimeout(5000);
        command.setUseCompression(true);
        command.setAlwaysSyncSend(true);
        command.setDispatchAsync(false);
        command.setCloseTimeout(30000);
        
        // Set prefetch policy options
        command.setQueuePrefetch(500);
        command.setTopicPrefetch(2000);
        command.setDurableTopicPrefetch(200);
        command.setQueueBrowserPrefetch(300);
        
        // Create a connection factory
        ActiveMQConnectionFactory factory = new ActiveMQConnectionFactory("vm://localhost");
        
        // Invoke the configureConnectionFactory method using reflection
        Method configureMethod = ProducerCommand.class.getDeclaredMethod("configureConnectionFactory", ActiveMQConnectionFactory.class);
        configureMethod.setAccessible(true);
        configureMethod.invoke(command, factory);
        
        // Verify connection factory settings
        assertEquals(5000, factory.getConnectResponseTimeout());
        assertEquals(true, factory.isUseCompression());
        assertEquals(true, factory.isAlwaysSyncSend());
        assertEquals(false, factory.isDispatchAsync());
        assertEquals(30000, factory.getCloseTimeout());
        
        // Verify prefetch policy settings
        ActiveMQPrefetchPolicy prefetchPolicy = factory.getPrefetchPolicy();
        assertEquals(500, prefetchPolicy.getQueuePrefetch());
        assertEquals(2000, prefetchPolicy.getTopicPrefetch());
        assertEquals(200, prefetchPolicy.getDurableTopicPrefetch());
        assertEquals(300, prefetchPolicy.getQueueBrowserPrefetch());
    }
}