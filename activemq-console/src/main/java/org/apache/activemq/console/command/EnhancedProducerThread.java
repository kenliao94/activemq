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

import org.apache.activemq.util.ProducerThread;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import jakarta.jms.Destination;
import jakarta.jms.Message;
import jakarta.jms.MessageProducer;
import jakarta.jms.Session;

/**
 * Enhanced version of ProducerThread that supports additional producer options
 * like delivery delay.
 */
public class EnhancedProducerThread extends ProducerThread {
    
    private static final Logger LOG = LoggerFactory.getLogger(EnhancedProducerThread.class);
    
    private long deliveryDelay = 0L;
    
    public EnhancedProducerThread(Session session, Destination destination) {
        super(session, destination);
    }
    
    /**
     * Override the sendMessage method to apply delivery delay if set
     */
    @Override
    protected void sendMessage(MessageProducer producer, String threadName) throws Exception {
        Message message = createMessage(getSentCount());
        
        // Apply delivery delay if set
        if (deliveryDelay > 0) {
            producer.setDeliveryDelay(deliveryDelay);
        }
        
        producer.send(message);
        
        if (LOG.isDebugEnabled()) {
            LOG.debug(threadName + " Sent: " + (message instanceof jakarta.jms.TextMessage ? 
                ((jakarta.jms.TextMessage) message).getText() : message.getJMSMessageID()));
        }

        if (getTransactionBatchSize() > 0 && getSentCount() > 0 && getSentCount() % getTransactionBatchSize() == 0) {
            LOG.info(threadName + " Committing transaction: " + getTransactions());
            getSession().commit();
            incrementTransactions();
        }

        if (getSleep() > 0) {
            Thread.sleep(getSleep());
        }
    }
    
    /**
     * Get the current transaction count
     */
    private int getTransactions() {
        try {
            java.lang.reflect.Field field = ProducerThread.class.getDeclaredField("transactions");
            field.setAccessible(true);
            return field.getInt(this);
        } catch (Exception e) {
            LOG.warn("Could not access transactions field", e);
            return 0;
        }
    }
    
    /**
     * Increment the transaction count
     */
    private void incrementTransactions() {
        try {
            java.lang.reflect.Field field = ProducerThread.class.getDeclaredField("transactions");
            field.setAccessible(true);
            int currentValue = field.getInt(this);
            field.setInt(this, currentValue + 1);
        } catch (Exception e) {
            LOG.warn("Could not increment transactions field", e);
        }
    }
    
    /**
     * Get the session
     */
    private Session getSession() {
        try {
            java.lang.reflect.Field field = ProducerThread.class.getDeclaredField("session");
            field.setAccessible(true);
            return (Session) field.get(this);
        } catch (Exception e) {
            LOG.warn("Could not access session field", e);
            return null;
        }
    }
    
    /**
     * Set the delivery delay for messages
     * 
     * @param deliveryDelay The delivery delay in milliseconds
     */
    public void setDeliveryDelay(long deliveryDelay) {
        this.deliveryDelay = deliveryDelay;
    }
    
    /**
     * Get the delivery delay for messages
     * 
     * @return The delivery delay in milliseconds
     */
    public long getDeliveryDelay() {
        return deliveryDelay;
    }
}