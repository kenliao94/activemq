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
import org.apache.activemq.command.ActiveMQDestination;
import org.apache.activemq.util.ProducerThread;
import org.apache.activemq.console.command.EnhancedProducerThread;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import jakarta.jms.Connection;
import jakarta.jms.Session;
import java.util.List;
import java.util.concurrent.CountDownLatch;

import static jakarta.jms.Message.DEFAULT_PRIORITY;

public class ProducerCommand extends AbstractCommand {
    private static final Logger LOG = LoggerFactory.getLogger(ProducerCommand.class);
    
    // Import the validator
    private org.apache.activemq.console.command.validator.ProducerCommandValidator validator;

    String brokerUrl = ActiveMQConnectionFactory.DEFAULT_BROKER_URL;
    String user = ActiveMQConnectionFactory.DEFAULT_USER;
    String password = ActiveMQConnectionFactory.DEFAULT_PASSWORD;
    String destination = "queue://TEST";
    int messageCount = 1000;
    int sleep = 0;
    boolean persistent = true;
    String message = null;
    String payloadUrl = null;
    int messageSize = 0;
    int textMessageSize;
    long msgTTL = 0L;
    String msgGroupID=null;
    int transactionBatchSize;
    private int parallelThreads = 1;
    int priority = DEFAULT_PRIORITY;
    boolean disableMessageTimestamp = false;
    
    // Connection Configuration Options
    private int connectResponseTimeout = 0;
    private boolean useCompression = false;
    private boolean alwaysSyncSend = false;
    private boolean dispatchAsync = true;
    private int closeTimeout = 15000;
    
    // Prefetch Policy Settings
    private int queuePrefetch = 1000;
    private int topicPrefetch = 1000;
    private int durableTopicPrefetch = 100;
    private int queueBrowserPrefetch = 500;
    
    // Producer-specific Options
    private int producerWindowSize = 0;
    private boolean useAsyncSend = false;
    private int sendTimeout = 0;
    private boolean copyMessageOnSend = true;
    private boolean runIndefinitely = false;
    private long deliveryDelay = 0L;

    @Override
    protected void validateOptions() throws IllegalArgumentException {
        if (validator == null) {
            validator = new org.apache.activemq.console.command.validator.ProducerCommandValidator(this);
        }
        validator.validate();
    }

    @Override
    protected void runTask(List<String> tokens) throws Exception {
        LOG.info("Connecting to URL: " + brokerUrl + " as user: " + user);
        LOG.info("Producing messages to " + destination);
        LOG.info("Using " + (persistent ? "persistent" : "non-persistent") + " messages");
        LOG.info("Sleeping between sends " + sleep + " ms");
        LOG.info("Running " + parallelThreads + " parallel threads");
        if (runIndefinitely) {
            LOG.info("Running indefinitely until stopped");
        } else {
            LOG.info("Sending " + messageCount + " messages");
        }

        ActiveMQConnectionFactory factory = new ActiveMQConnectionFactory(brokerUrl);
        configureConnectionFactory(factory);
        Connection conn = null;
        try {
            conn = factory.createConnection(user, password);
            conn.start();

            CountDownLatch active = new CountDownLatch(parallelThreads);

            for (int i = 1; i <= parallelThreads; i++) {
                Session sess;
                if (transactionBatchSize != 0) {
                    sess = conn.createSession(true, Session.SESSION_TRANSACTED);
                } else {
                    sess = conn.createSession(false, Session.AUTO_ACKNOWLEDGE);
                }
                
                // Use EnhancedProducerThread if delivery delay is set, otherwise use standard ProducerThread
                ProducerThread producer;
                if (deliveryDelay > 0) {
                    EnhancedProducerThread enhancedProducer = new EnhancedProducerThread(sess, ActiveMQDestination.createDestination(destination, ActiveMQDestination.QUEUE_TYPE));
                    enhancedProducer.setDeliveryDelay(deliveryDelay);
                    producer = enhancedProducer;
                } else {
                    producer = new ProducerThread(sess, ActiveMQDestination.createDestination(destination, ActiveMQDestination.QUEUE_TYPE));
                }
                producer.setName("producer-" + i);
                configureProducerThread(producer);
                producer.start();
            }

            active.await();
        } finally {
            if (conn != null) {
                conn.close();
            }
        }
    }

    public String getBrokerUrl() {
        return brokerUrl;
    }

    public void setBrokerUrl(String brokerUrl) {
        this.brokerUrl = brokerUrl;
    }

    public String getDestination() {
        return destination;
    }

    public void setDestination(String destination) {
        this.destination = destination;
    }

    public int getMessageCount() {
        return messageCount;
    }

    public void setMessageCount(int messageCount) {
        this.messageCount = messageCount;
    }

    public int getSleep() {
        return sleep;
    }

    public void setSleep(int sleep) {
        this.sleep = sleep;
    }

    public boolean isPersistent() {
        return persistent;
    }

    public void setPersistent(boolean persistent) {
        this.persistent = persistent;
    }

    public int getMessageSize() {
        return messageSize;
    }

    public void setMessageSize(int messageSize) {
        this.messageSize = messageSize;
    }

    public int getTextMessageSize() {
        return textMessageSize;
    }

    public void setTextMessageSize(int textMessageSize) {
        this.textMessageSize = textMessageSize;
    }

    public long getMsgTTL() {
        return msgTTL;
    }

    public void setMsgTTL(long msgTTL) {
        this.msgTTL = msgTTL;
    }

    public String getMsgGroupID() {
        return msgGroupID;
    }

    public void setMsgGroupID(String msgGroupID) {
        this.msgGroupID = msgGroupID;
    }

    public int getTransactionBatchSize() {
        return transactionBatchSize;
    }

    public void setTransactionBatchSize(int transactionBatchSize) {
        this.transactionBatchSize = transactionBatchSize;
    }

    public String getUser() {
        return user;
    }

    public void setUser(String user) {
        this.user = user;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public int getParallelThreads() {
        return parallelThreads;
    }

    public void setParallelThreads(int parallelThreads) {
        this.parallelThreads = parallelThreads;
    }

    public String getPayloadUrl() {
        return payloadUrl;
    }

    public void setPayloadUrl(String payloadUrl) {
        this.payloadUrl = payloadUrl;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public void setMessagePriority(int priority) {
        this.priority = priority;
    }

    public void setDisableMessageTimestamp(boolean disableMessageTimestamp) {
        this.disableMessageTimestamp = disableMessageTimestamp;
    }
    
    /**
     * Configures the ActiveMQConnectionFactory with the connection-related options.
     * 
     * @param factory The connection factory to configure
     */
    private void configureConnectionFactory(ActiveMQConnectionFactory factory) {
        // Configure connection settings
        factory.setConnectResponseTimeout(connectResponseTimeout);
        factory.setUseCompression(useCompression);
        factory.setAlwaysSyncSend(alwaysSyncSend);
        factory.setDispatchAsync(dispatchAsync);
        factory.setCloseTimeout(closeTimeout);
        
        // Configure producer-specific settings
        factory.setProducerWindowSize(producerWindowSize);
        factory.setUseAsyncSend(useAsyncSend);
        factory.setSendTimeout(sendTimeout);
        factory.setCopyMessageOnSend(copyMessageOnSend);
        
        // Configure prefetch policy
        ActiveMQPrefetchPolicy prefetchPolicy = new ActiveMQPrefetchPolicy();
        prefetchPolicy.setQueuePrefetch(queuePrefetch);
        prefetchPolicy.setTopicPrefetch(topicPrefetch);
        prefetchPolicy.setDurableTopicPrefetch(durableTopicPrefetch);
        prefetchPolicy.setQueueBrowserPrefetch(queueBrowserPrefetch);
        factory.setPrefetchPolicy(prefetchPolicy);
    }
    
    /**
     * Configures the ProducerThread with all the producer-specific options.
     * 
     * @param producer The producer thread to configure
     */
    private void configureProducerThread(ProducerThread producer) {
        producer.setMessageCount(messageCount);
        producer.setSleep(sleep);
        producer.setMsgTTL(msgTTL);
        producer.setPersistent(persistent);
        producer.setTransactionBatchSize(transactionBatchSize);
        producer.setMessage(message);
        producer.setPayloadUrl(payloadUrl);
        producer.setMessageSize(messageSize);
        producer.setMsgGroupID(msgGroupID);
        producer.setTextMessageSize(textMessageSize);
        producer.setFinished(new CountDownLatch(parallelThreads));
        producer.setMessagePriority(priority);
        producer.setDisableMessageTimestamp(disableMessageTimestamp);
        
        // Set advanced producer options
        producer.setRunIndefinitely(runIndefinitely);
        
        // Apply delivery delay if using EnhancedProducerThread
        if (deliveryDelay > 0 && producer instanceof EnhancedProducerThread) {
            ((EnhancedProducerThread) producer).setDeliveryDelay(deliveryDelay);
            LOG.info("Delivery delay set to " + deliveryDelay + " ms");
        }
    }
    
    // Connection Configuration Getters and Setters
    public int getConnectResponseTimeout() {
        return connectResponseTimeout;
    }

    public void setConnectResponseTimeout(int connectResponseTimeout) {
        this.connectResponseTimeout = connectResponseTimeout;
    }

    public boolean isUseCompression() {
        return useCompression;
    }

    public void setUseCompression(boolean useCompression) {
        this.useCompression = useCompression;
    }

    public boolean isAlwaysSyncSend() {
        return alwaysSyncSend;
    }

    public void setAlwaysSyncSend(boolean alwaysSyncSend) {
        this.alwaysSyncSend = alwaysSyncSend;
    }

    public boolean isDispatchAsync() {
        return dispatchAsync;
    }

    public void setDispatchAsync(boolean dispatchAsync) {
        this.dispatchAsync = dispatchAsync;
    }

    public int getCloseTimeout() {
        return closeTimeout;
    }

    public void setCloseTimeout(int closeTimeout) {
        this.closeTimeout = closeTimeout;
    }
    
    // Prefetch Policy Getters and Setters
    public int getQueuePrefetch() {
        return queuePrefetch;
    }

    public void setQueuePrefetch(int queuePrefetch) {
        this.queuePrefetch = queuePrefetch;
    }

    public int getTopicPrefetch() {
        return topicPrefetch;
    }

    public void setTopicPrefetch(int topicPrefetch) {
        this.topicPrefetch = topicPrefetch;
    }

    public int getDurableTopicPrefetch() {
        return durableTopicPrefetch;
    }

    public void setDurableTopicPrefetch(int durableTopicPrefetch) {
        this.durableTopicPrefetch = durableTopicPrefetch;
    }

    public int getQueueBrowserPrefetch() {
        return queueBrowserPrefetch;
    }

    public void setQueueBrowserPrefetch(int queueBrowserPrefetch) {
        this.queueBrowserPrefetch = queueBrowserPrefetch;
    }
    
    // Producer-specific Getters and Setters
    public int getProducerWindowSize() {
        return producerWindowSize;
    }

    public void setProducerWindowSize(int producerWindowSize) {
        this.producerWindowSize = producerWindowSize;
    }

    public boolean isUseAsyncSend() {
        return useAsyncSend;
    }

    public void setUseAsyncSend(boolean useAsyncSend) {
        this.useAsyncSend = useAsyncSend;
    }

    public int getSendTimeout() {
        return sendTimeout;
    }

    public void setSendTimeout(int sendTimeout) {
        this.sendTimeout = sendTimeout;
    }

    public boolean isCopyMessageOnSend() {
        return copyMessageOnSend;
    }

    public void setCopyMessageOnSend(boolean copyMessageOnSend) {
        this.copyMessageOnSend = copyMessageOnSend;
    }

    public boolean isRunIndefinitely() {
        return runIndefinitely;
    }

    public void setRunIndefinitely(boolean runIndefinitely) {
        this.runIndefinitely = runIndefinitely;
    }

    public long getDeliveryDelay() {
        return deliveryDelay;
    }

    public void setDeliveryDelay(long deliveryDelay) {
        this.deliveryDelay = deliveryDelay;
    }

    @Override
    protected void printHelp() {
        printHelpFromFile();
    }

    @Override
    public String getName() {
        return "producer";
    }

    @Override
    public String getOneLineDescription() {
        return "Sends messages to the broker";
    }
}
