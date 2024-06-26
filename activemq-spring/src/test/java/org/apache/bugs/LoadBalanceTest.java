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
package org.apache.bugs;

import static org.junit.Assert.assertTrue;
import static org.junit.Assert.fail;

import java.util.concurrent.Callable;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicInteger;

import jakarta.jms.JMSException;
import jakarta.jms.Message;
import jakarta.jms.MessageListener;
import jakarta.jms.Session;
import jakarta.jms.TextMessage;

import org.apache.activemq.ActiveMQConnectionFactory;
import org.apache.activemq.broker.BrokerRegistry;
import org.apache.activemq.broker.BrokerService;
import org.apache.activemq.command.ActiveMQQueue;
import org.apache.activemq.network.NetworkConnector;
import org.apache.activemq.store.memory.MemoryPersistenceAdapter;
import org.junit.Ignore;
import org.junit.Test;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.jms.connection.CachingConnectionFactory;
import org.springframework.jms.connection.SingleConnectionFactory;
import org.springframework.jms.core.JmsTemplate;
import org.springframework.jms.core.MessageCreator;
import org.springframework.jms.listener.DefaultMessageListenerContainer;

public class LoadBalanceTest {
    private static final Logger LOG = LoggerFactory.getLogger(LoadBalanceTest.class);
    private static final String TESTING_QUEUE = "testingqueue";
    private static int networkBridgePrefetch = 1000;

    @Test(timeout=120000)
    public void does_load_balance_between_consumers() throws Exception {
        BrokerService brokerService1 = null;
        BrokerService brokerService2 = null;
        final int total = 100;
        final AtomicInteger broker1Count = new AtomicInteger(0);
        final AtomicInteger broker2Count = new AtomicInteger(0);
        final CountDownLatch startProducer = new CountDownLatch(1);
        final CountDownLatch consumer1Started = new CountDownLatch(1);
        final CountDownLatch consumer2Started = new CountDownLatch(1);

        String broker1Uri;
        String broker2Uri;

        try {
            brokerService1 = new BrokerService();
            brokerService1.setBrokerName("one");
            brokerService1.setUseJmx(false);
            brokerService1.setPersistenceAdapter(new MemoryPersistenceAdapter());
            broker1Uri = brokerService1.addConnector("nio://0.0.0.0:0").getPublishableConnectString();

            brokerService2 = new BrokerService();
            brokerService2.setBrokerName("two");
            brokerService2.setUseJmx(false);
            brokerService2.setPersistenceAdapter(new MemoryPersistenceAdapter());
            broker2Uri = brokerService2.addConnector("nio://0.0.0.0:0").getPublishableConnectString();

            final NetworkConnector network1 = brokerService1.addNetworkConnector("static:("+broker2Uri+")");
            network1.setName("network1");
            network1.setDynamicOnly(true);
            network1.setNetworkTTL(3);
            network1.setPrefetchSize(networkBridgePrefetch);
            network1.setConduitSubscriptions(false);
            network1.setDecreaseNetworkConsumerPriority(false);
            network1.setDispatchAsync(false);

            final NetworkConnector network2 = brokerService2.addNetworkConnector("static:("+broker1Uri+")");
            network2.setName("network1");
            network2.setDynamicOnly(true);
            network2.setNetworkTTL(3);
            network2.setPrefetchSize(networkBridgePrefetch);
            network2.setConduitSubscriptions(false);
            network2.setDecreaseNetworkConsumerPriority(false);
            network2.setDispatchAsync(false);

            brokerService1.start();
            brokerService2.start();

            final ExecutorService pool = Executors.newSingleThreadExecutor();
            final ActiveMQConnectionFactory connectionFactory1 = new ActiveMQConnectionFactory("vm://one");
            final SingleConnectionFactory singleConnectionFactory1 = new SingleConnectionFactory(connectionFactory1);
            singleConnectionFactory1.setReconnectOnException(true);
            final DefaultMessageListenerContainer container1 = new DefaultMessageListenerContainer();
            container1.setConnectionFactory(singleConnectionFactory1);
            container1.setMaxConcurrentConsumers(1);
            container1.setDestination(new ActiveMQQueue("testingqueue"));
            container1.setMessageListener(new MessageListener() {

                @Override
                public void onMessage(final Message message) {
                    broker1Count.incrementAndGet();
                }
            });
            container1.afterPropertiesSet();
            container1.start();
            consumer1Started.countDown();
            pool.submit(new Callable<Object>() {

                @Override
                public Object call() throws Exception {
                    try {
                        final ActiveMQConnectionFactory connectionFactory2 = new ActiveMQConnectionFactory(
                                "vm://two");
                        final SingleConnectionFactory singleConnectionFactory2 = new SingleConnectionFactory(
                                connectionFactory2);
                        singleConnectionFactory2.setReconnectOnException(true);
                        final DefaultMessageListenerContainer container2 = new DefaultMessageListenerContainer();
                        container2
                                .setConnectionFactory(singleConnectionFactory2);
                        container2.setMaxConcurrentConsumers(1);
                        container2.setDestination(new ActiveMQQueue(
                                "testingqueue"));
                        container2.setMessageListener(new MessageListener() {

                            @Override
                            public void onMessage(final Message message) {
                                broker2Count.incrementAndGet();
                            }
                        });
                        container2.afterPropertiesSet();
                        container2.start();
                        consumer2Started.countDown();

                        assertTrue("wait for start signal", startProducer.await(20, TimeUnit.SECONDS));

                        final CachingConnectionFactory cachingConnectionFactory = new CachingConnectionFactory(
                                singleConnectionFactory2);
                        final JmsTemplate template = new JmsTemplate(
                                cachingConnectionFactory);
                        final ActiveMQQueue queue = new ActiveMQQueue(
                                "testingqueue");
                        for (int i = 0; i < total; i++) {
                            template.send(queue, new MessageCreator() {

                                @Override
                                public Message createMessage(
                                        final Session session)
                                        throws JMSException {
                                    final TextMessage message = session
                                            .createTextMessage();
                                    message.setText("Hello World!");
                                    return message;
                                }
                            });
                        }
                        // give spring time to scale back again
                        while (container2.getActiveConsumerCount() > 1) {
                            System.out.println("active consumer count: "
                                    + container2.getActiveConsumerCount());
                            System.out.println("concurrent consumer count: "
                                    + container2.getConcurrentConsumers());
                            Thread.sleep(1000);
                        }
                        cachingConnectionFactory.destroy();
                        container2.destroy();
                    } catch (final Throwable t) {
                        t.printStackTrace();
                    }
                    return null;
                }
            });

            waitForBridgeFormation();
            startProducer.countDown();
            consumer1Started.await();
            consumer2Started.await();

            pool.shutdown();
            pool.awaitTermination(20, TimeUnit.SECONDS);
            LOG.info("broker1Count " + broker1Count.get() + ", broker2Count " + broker2Count.get());

            int count = 0;
            // give it 10 seconds
            while (count++ < 10
                    && broker1Count.get() + broker2Count.get() != total) {
                LOG.info("broker1Count " + broker1Count.get() + ", broker2Count " + broker2Count.get());
                Thread.sleep(1000);
            }
            container1.destroy();
        } finally {
            try {
                if (brokerService1 != null) {
                    brokerService1.stop();
                    brokerService1.waitUntilStopped();
                }
            } catch (final Throwable t) {
                t.printStackTrace();
            }
            try {
                if (brokerService2 != null) {
                    brokerService2.stop();
                    brokerService2.waitUntilStopped();
                }
            } catch (final Throwable t) {
                t.printStackTrace();
            }
        }

        if (broker1Count.get() < 25 || broker2Count.get() < 25) {
            fail("Each broker should have gotten at least 25 messages but instead broker1 got "
                    + broker1Count.get()
                    + " and broker2 got "
                    + broker2Count.get());
        }
    }

    @Test
    @Ignore("Does not work")
    public void does_xml_multicast_load_balance_between_consumers() throws Exception {
        final int total = 100;
        final AtomicInteger broker1Count = new AtomicInteger(0);
        final AtomicInteger broker2Count = new AtomicInteger(0);
        final ExecutorService pool = Executors.newSingleThreadExecutor();
        final CountDownLatch startProducer = new CountDownLatch(1);
        final String xmlConfig = getClass().getPackage().getName().replace('.','/') + "/loadbalancetest.xml";
        System.setProperty("lbt.networkBridgePrefetch", String.valueOf(networkBridgePrefetch));
        System.setProperty("lbt.brokerName", "one");
        final ActiveMQConnectionFactory connectionFactory1 = new ActiveMQConnectionFactory(
                "vm://one?brokerConfig=xbean:" + xmlConfig);
        final SingleConnectionFactory singleConnectionFactory1 = new SingleConnectionFactory(
                connectionFactory1);
        singleConnectionFactory1.setReconnectOnException(true);
        final DefaultMessageListenerContainer container1 = new DefaultMessageListenerContainer();
        container1.setConnectionFactory(singleConnectionFactory1);
        container1.setMaxConcurrentConsumers(1);
        container1.setDestination(new ActiveMQQueue(TESTING_QUEUE));
        container1.setMessageListener(new MessageListener() {

            @Override
            public void onMessage(final Message message) {
                broker1Count.incrementAndGet();
            }
        });
        container1.afterPropertiesSet();
        container1.start();
        pool.submit(new Callable<Object>() {

            @Override
            public Object call() throws Exception {
                System.setProperty("lbt.brokerName", "two");
                final ActiveMQConnectionFactory connectionFactory2 = new ActiveMQConnectionFactory(
                        "vm://two?brokerConfig=xbean:" + xmlConfig);
                final SingleConnectionFactory singleConnectionFactory2 = new SingleConnectionFactory(
                        connectionFactory2);
                singleConnectionFactory2.setReconnectOnException(true);
                final DefaultMessageListenerContainer container2 = new DefaultMessageListenerContainer();
                container2.setConnectionFactory(singleConnectionFactory2);
                container2.setMaxConcurrentConsumers(1);
                container2.setDestination(new ActiveMQQueue(TESTING_QUEUE));
                container2.setMessageListener(new MessageListener() {

                    @Override
                    public void onMessage(final Message message) {
                        broker2Count.incrementAndGet();
                    }
                });
                container2.afterPropertiesSet();
                container2.start();


                assertTrue("wait for start signal", startProducer.await(20, TimeUnit.SECONDS));

                final CachingConnectionFactory cachingConnectionFactory = new CachingConnectionFactory(
                        singleConnectionFactory2);
                final JmsTemplate template = new JmsTemplate(
                        cachingConnectionFactory);
                final ActiveMQQueue queue = new ActiveMQQueue(TESTING_QUEUE);
                for (int i = 0; i < total; i++) {
                    template.send(queue, new MessageCreator() {

                        @Override
                        public Message createMessage(final Session session)
                                throws JMSException {
                            final TextMessage message = session
                                    .createTextMessage();
                            message.setText("Hello World!");
                            return message;
                        }
                    });
                }
                return null;
            }
        });

        // give network a chance to build, needs advisories
        waitForBridgeFormation();
        startProducer.countDown();

        pool.shutdown();
        pool.awaitTermination(10, TimeUnit.SECONDS);

        LOG.info("broker1Count " + broker1Count.get() + ", broker2Count " + broker2Count.get());

        int count = 0;
        // give it 10 seconds
        while (count++ < 10 && broker1Count.get() + broker2Count.get() != total) {
            LOG.info("broker1Count " + broker1Count.get() + ", broker2Count " + broker2Count.get());
            Thread.sleep(1000);
        }
        if (broker1Count.get() < 25 || broker2Count.get() < 25) {
            fail("Each broker should have gotten at least 25 messages but instead broker1 got "
                    + broker1Count.get()
                    + " and broker2 got "
                    + broker2Count.get());
        }


        BrokerService broker = BrokerRegistry.getInstance().lookup("one");
        broker.stop();
        broker = BrokerRegistry.getInstance().lookup("two");
        broker.stop();
    }

    // need to ensure broker bridge is alive before starting the consumer
    // peeking at the internals will give us this info
    private void waitForBridgeFormation() throws Exception {
        long done = System.currentTimeMillis() + 30000;
        while (done > System.currentTimeMillis()) {
            if (hasBridge("one") && hasBridge("two")) {
                return;
            }
            Thread.sleep(1000);
        }
    }

    private boolean hasBridge(String name) {
        boolean result = false;
        BrokerService broker = BrokerRegistry.getInstance().lookup(name);
            if (broker != null && !broker.getNetworkConnectors().isEmpty()) {
                 if (!broker.getNetworkConnectors().get(0).activeBridges().isEmpty()) {
                    result = true;
                 }
            }
        return result;
    }
}
