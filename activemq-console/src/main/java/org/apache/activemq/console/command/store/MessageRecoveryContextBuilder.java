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
package org.apache.activemq.console.command.store;

import org.apache.activemq.store.MessageRecoveryListener;

/**
 * A builder for MessageRecoveryContext to be used in the StoreBackup class.
 */
public class MessageRecoveryContextBuilder {
    private int offset;
    private int maxMessageCountReturned;
    private String startMessageId;
    private String endMessageId;
    private MessageRecoveryListener messageRecoveryListener;
    
    public MessageRecoveryContextBuilder offset(int offset) {
        this.offset = offset;
        return this;
    }
    
    public MessageRecoveryContextBuilder maxMessageCountReturned(int maxMessageCountReturned) {
        this.maxMessageCountReturned = maxMessageCountReturned;
        return this;
    }
    
    public MessageRecoveryContextBuilder startMessageId(String startMessageId) {
        this.startMessageId = startMessageId;
        return this;
    }
    
    public MessageRecoveryContextBuilder endMessageId(String endMessageId) {
        this.endMessageId = endMessageId;
        return this;
    }
    
    public MessageRecoveryContextBuilder messageRecoveryListener(MessageRecoveryListener messageRecoveryListener) {
        this.messageRecoveryListener = messageRecoveryListener;
        return this;
    }
    
    public MessageRecoveryListener build() {
        // Return the message recovery listener
        return messageRecoveryListener;
    }
}