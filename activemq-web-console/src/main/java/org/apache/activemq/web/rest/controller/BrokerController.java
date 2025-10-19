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
import org.apache.activemq.web.rest.dto.BrokerInfoDTO;
import org.apache.activemq.web.rest.service.BrokerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

/**
 * REST controller for broker operations
 */
@RestController
@RequestMapping("/v1/broker")
public class BrokerController {
    
    @Autowired
    private BrokerService brokerService;
    
    /**
     * Get broker information
     * GET /api/v1/broker/info
     */
    @GetMapping("/info")
    public ResponseEntity<ApiResponse<BrokerInfoDTO>> getBrokerInfo() {
        BrokerInfoDTO brokerInfo = brokerService.getBrokerInfo();
        return ResponseEntity.ok(ApiResponse.success(brokerInfo));
    }
    
    /**
     * Get broker statistics
     * GET /api/v1/broker/statistics
     */
    @GetMapping("/statistics")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getBrokerStatistics() {
        Map<String, Object> statistics = brokerService.getBrokerStatistics();
        return ResponseEntity.ok(ApiResponse.success(statistics));
    }
    
    /**
     * Get broker health status
     * GET /api/v1/broker/health
     */
    @GetMapping("/health")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getBrokerHealth() {
        Map<String, Object> health = brokerService.getBrokerHealth();
        return ResponseEntity.ok(ApiResponse.success(health));
    }
}
