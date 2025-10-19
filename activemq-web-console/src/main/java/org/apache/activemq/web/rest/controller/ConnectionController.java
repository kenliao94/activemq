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
import org.apache.activemq.web.rest.dto.ConnectionDTO;
import org.apache.activemq.web.rest.service.ConnectionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST controller for connection operations
 */
@RestController
@RequestMapping("/v1/connections")
public class ConnectionController {
    
    @Autowired
    private ConnectionService connectionService;
    
    /**
     * Get all connections
     * GET /api/v1/connections
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<ConnectionDTO>>> getConnections() {
        List<ConnectionDTO> connections = connectionService.getConnections();
        return ResponseEntity.ok(ApiResponse.success(connections));
    }
    
    /**
     * Get a specific connection by ID
     * GET /api/v1/connections/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ConnectionDTO>> getConnection(@PathVariable String id) {
        ConnectionDTO connection = connectionService.getConnection(id);
        return ResponseEntity.ok(ApiResponse.success(connection));
    }
    
    /**
     * Close a connection
     * DELETE /api/v1/connections/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> closeConnection(@PathVariable String id) {
        connectionService.closeConnection(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Connection closed successfully"));
    }
}
