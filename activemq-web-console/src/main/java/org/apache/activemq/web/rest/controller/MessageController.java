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
package org.apache.activemq.web.rest.controller;

import org.apache.activemq.web.rest.dto.MessageDTO;
import org.apache.activemq.web.rest.dto.PagedResponse;
import org.apache.activemq.web.rest.dto.SendMessageRequest;
import org.apache.activemq.web.rest.service.MessageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

/**
 * REST controller for message operations
 */
@RestController
@RequestMapping("/v1/messages")
public class MessageController {
    
    @Autowired
    private MessageService messageService;
    
    /**
     * Browse messages in a queue
     * GET /api/v1/messages/queue/{name}
     */
    @GetMapping("/queue/{name}")
    public ResponseEntity<PagedResponse<MessageDTO>> browseMessages(
            @PathVariable String name,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int pageSize) {
        
        PagedResponse<MessageDTO> response = messageService.browseMessages(name, page, pageSize);
        return ResponseEntity.ok(response);
    }
    
    /**
     * Get a specific message by ID
     * GET /api/v1/messages/{queueName}/{messageId}
     */
    @GetMapping("/{queueName}/{messageId}")
    public ResponseEntity<MessageDTO> getMessage(
            @PathVariable String queueName,
            @PathVariable String messageId) {
        
        MessageDTO message = messageService.getMessage(queueName, messageId);
        return ResponseEntity.ok(message);
    }
    
    /**
     * Send a message to a destination
     * POST /api/v1/messages/send
     */
    @PostMapping("/send")
    public ResponseEntity<Map<String, String>> sendMessage(@RequestBody SendMessageRequest request) {
        messageService.sendMessage(request);
        
        Map<String, String> response = new HashMap<>();
        response.put("status", "success");
        response.put("message", "Message sent successfully");
        
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
    
    /**
     * Delete a message from a queue
     * DELETE /api/v1/messages/{queueName}/{messageId}
     */
    @DeleteMapping("/{queueName}/{messageId}")
    public ResponseEntity<Map<String, String>> deleteMessage(
            @PathVariable String queueName,
            @PathVariable String messageId) {
        
        messageService.deleteMessage(queueName, messageId);
        
        Map<String, String> response = new HashMap<>();
        response.put("status", "success");
        response.put("message", "Message deleted successfully");
        
        return ResponseEntity.ok(response);
    }
    
    /**
     * Move a message to another destination
     * POST /api/v1/messages/{queueName}/{messageId}/move
     */
    @PostMapping("/{queueName}/{messageId}/move")
    public ResponseEntity<Map<String, String>> moveMessage(
            @PathVariable String queueName,
            @PathVariable String messageId,
            @RequestBody Map<String, String> request) {
        
        String targetDestination = request.get("targetDestination");
        if (targetDestination == null || targetDestination.isEmpty()) {
            Map<String, String> error = new HashMap<>();
            error.put("status", "error");
            error.put("message", "targetDestination is required");
            return ResponseEntity.badRequest().body(error);
        }
        
        messageService.moveMessage(queueName, messageId, targetDestination);
        
        Map<String, String> response = new HashMap<>();
        response.put("status", "success");
        response.put("message", "Message moved successfully");
        
        return ResponseEntity.ok(response);
    }
    
    /**
     * Copy a message to another destination
     * POST /api/v1/messages/{queueName}/{messageId}/copy
     */
    @PostMapping("/{queueName}/{messageId}/copy")
    public ResponseEntity<Map<String, String>> copyMessage(
            @PathVariable String queueName,
            @PathVariable String messageId,
            @RequestBody Map<String, String> request) {
        
        String targetDestination = request.get("targetDestination");
        if (targetDestination == null || targetDestination.isEmpty()) {
            Map<String, String> error = new HashMap<>();
            error.put("status", "error");
            error.put("message", "targetDestination is required");
            return ResponseEntity.badRequest().body(error);
        }
        
        messageService.copyMessage(queueName, messageId, targetDestination);
        
        Map<String, String> response = new HashMap<>();
        response.put("status", "success");
        response.put("message", "Message copied successfully");
        
        return ResponseEntity.ok(response);
    }
}
