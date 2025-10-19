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

import org.apache.activemq.web.rest.dto.ApiResponse;
import org.apache.activemq.web.rest.dto.SubscriberDTO;
import org.apache.activemq.web.rest.service.SubscriberService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST controller for subscriber/consumer operations
 */
@RestController
@RequestMapping("/v1/subscribers")
public class SubscriberController {
    
    @Autowired
    private SubscriberService subscriberService;
    
    /**
     * Get all subscribers
     * GET /api/v1/subscribers
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<SubscriberDTO>>> getSubscribers() {
        List<SubscriberDTO> subscribers = subscriberService.getSubscribers();
        return ResponseEntity.ok(ApiResponse.success(subscribers));
    }
    
    /**
     * Get a specific subscriber by ID
     * GET /api/v1/subscribers/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<SubscriberDTO>> getSubscriber(@PathVariable String id) {
        SubscriberDTO subscriber = subscriberService.getSubscriber(id);
        return ResponseEntity.ok(ApiResponse.success(subscriber));
    }
    
    /**
     * Delete/close a subscriber
     * DELETE /api/v1/subscribers/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteSubscriber(@PathVariable String id) {
        subscriberService.deleteSubscriber(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Subscriber deleted successfully"));
    }
}
