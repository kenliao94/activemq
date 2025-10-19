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
import org.apache.activemq.web.rest.dto.QueueDTO;
import org.apache.activemq.web.rest.service.DestinationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * REST controller for queue operations
 */
@RestController
@RequestMapping("/v1/queues")
public class QueueController {
    
    @Autowired
    private DestinationService destinationService;
    
    /**
     * Get all queues with pagination
     * GET /api/v1/queues?page=0&pageSize=20
     */
    @GetMapping
    public ResponseEntity<ApiResponse<PagedResponse<QueueDTO>>> getQueues(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int pageSize) {
        PagedResponse<QueueDTO> queues = destinationService.getQueues(page, pageSize);
        return ResponseEntity.ok(ApiResponse.success(queues));
    }
    
    /**
     * Get a specific queue by name
     * GET /api/v1/queues/{name}
     */
    @GetMapping("/{name}")
    public ResponseEntity<ApiResponse<QueueDTO>> getQueue(@PathVariable String name) {
        QueueDTO queue = destinationService.getQueue(name);
        return ResponseEntity.ok(ApiResponse.success(queue));
    }
    
    /**
     * Create a new queue
     * POST /api/v1/queues
     */
    @PostMapping
    public ResponseEntity<ApiResponse<Void>> createQueue(@RequestParam String name) {
        destinationService.createQueue(name);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(null, "Queue created successfully"));
    }
    
    /**
     * Delete a queue
     * DELETE /api/v1/queues/{name}
     */
    @DeleteMapping("/{name}")
    public ResponseEntity<ApiResponse<Void>> deleteQueue(@PathVariable String name) {
        destinationService.deleteQueue(name);
        return ResponseEntity.ok(ApiResponse.success(null, "Queue deleted successfully"));
    }
    
    /**
     * Purge all messages from a queue
     * POST /api/v1/queues/{name}/purge
     */
    @PostMapping("/{name}/purge")
    public ResponseEntity<ApiResponse<Void>> purgeQueue(@PathVariable String name) {
        destinationService.purgeQueue(name);
        return ResponseEntity.ok(ApiResponse.success(null, "Queue purged successfully"));
    }
    
    /**
     * Pause a queue
     * POST /api/v1/queues/{name}/pause
     */
    @PostMapping("/{name}/pause")
    public ResponseEntity<ApiResponse<Void>> pauseQueue(@PathVariable String name) {
        destinationService.pauseQueue(name);
        return ResponseEntity.ok(ApiResponse.success(null, "Queue paused successfully"));
    }
    
    /**
     * Resume a paused queue
     * POST /api/v1/queues/{name}/resume
     */
    @PostMapping("/{name}/resume")
    public ResponseEntity<ApiResponse<Void>> resumeQueue(@PathVariable String name) {
        destinationService.resumeQueue(name);
        return ResponseEntity.ok(ApiResponse.success(null, "Queue resumed successfully"));
    }
}
