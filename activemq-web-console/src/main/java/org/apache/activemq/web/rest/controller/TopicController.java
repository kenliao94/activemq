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
import org.apache.activemq.web.rest.dto.PagedResponse;
import org.apache.activemq.web.rest.dto.TopicDTO;
import org.apache.activemq.web.rest.service.DestinationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * REST controller for topic operations
 */
@RestController
@RequestMapping("/v1/topics")
public class TopicController {
    
    @Autowired
    private DestinationService destinationService;
    
    /**
     * Get all topics with pagination
     * GET /api/v1/topics?page=0&pageSize=20
     */
    @GetMapping
    public ResponseEntity<ApiResponse<PagedResponse<TopicDTO>>> getTopics(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int pageSize) {
        PagedResponse<TopicDTO> topics = destinationService.getTopics(page, pageSize);
        return ResponseEntity.ok(ApiResponse.success(topics));
    }
    
    /**
     * Get a specific topic by name
     * GET /api/v1/topics/{name}
     */
    @GetMapping("/{name}")
    public ResponseEntity<ApiResponse<TopicDTO>> getTopic(@PathVariable String name) {
        TopicDTO topic = destinationService.getTopic(name);
        return ResponseEntity.ok(ApiResponse.success(topic));
    }
    
    /**
     * Create a new topic
     * POST /api/v1/topics
     */
    @PostMapping
    public ResponseEntity<ApiResponse<Void>> createTopic(@RequestParam String name) {
        destinationService.createTopic(name);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(null, "Topic created successfully"));
    }
    
    /**
     * Delete a topic
     * DELETE /api/v1/topics/{name}
     */
    @DeleteMapping("/{name}")
    public ResponseEntity<ApiResponse<Void>> deleteTopic(@PathVariable String name) {
        destinationService.deleteTopic(name);
        return ResponseEntity.ok(ApiResponse.success(null, "Topic deleted successfully"));
    }
}
