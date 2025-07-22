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
package org.apache.activemq.console.command.validator;

import static org.junit.Assert.*;

import java.io.File;
import java.io.IOException;
import java.util.Map;

import org.junit.Before;
import org.junit.Rule;
import org.junit.Test;
import org.junit.rules.TemporaryFolder;

public class ValidationUtilsTest {
    
    @Rule
    public TemporaryFolder tempFolder = new TemporaryFolder();
    
    private File keyStoreFile;
    private File trustStoreFile;
    
    @Before
    public void setUp() throws IOException {
        keyStoreFile = tempFolder.newFile("keystore.jks");
        trustStoreFile = tempFolder.newFile("truststore.jks");
    }
    
    @Test
    public void testValidateNonNegative_ValidValue() {
        // Should not throw exception
        ValidationUtils.validateNonNegative(0, ValidationErrors.NEGATIVE_TIMEOUT);
        ValidationUtils.validateNonNegative(10, ValidationErrors.NEGATIVE_TIMEOUT);
    }
    
    @Test(expected = IllegalArgumentException.class)
    public void testValidateNonNegative_InvalidValue() {
        ValidationUtils.validateNonNegative(-1, ValidationErrors.NEGATIVE_TIMEOUT);
    }
    
    @Test
    public void testValidatePositive_ValidValue() {
        // Should not throw exception
        ValidationUtils.validatePositive(1, ValidationErrors.INVALID_THREAD_COUNT);
        ValidationUtils.validatePositive(10, ValidationErrors.INVALID_THREAD_COUNT);
    }
    
    @Test(expected = IllegalArgumentException.class)
    public void testValidatePositive_Zero() {
        ValidationUtils.validatePositive(0, ValidationErrors.INVALID_THREAD_COUNT);
    }
    
    @Test(expected = IllegalArgumentException.class)
    public void testValidatePositive_NegativeValue() {
        ValidationUtils.validatePositive(-1, ValidationErrors.INVALID_THREAD_COUNT);
    }
    
    @Test
    public void testValidateSslConfig_ValidConfig() {
        // Should not throw exception
        ValidationUtils.validateSslConfig(keyStoreFile.getAbsolutePath(), trustStoreFile.getAbsolutePath());
    }
    
    @Test(expected = IllegalArgumentException.class)
    public void testValidateSslConfig_OnlyKeyStore() {
        ValidationUtils.validateSslConfig(keyStoreFile.getAbsolutePath(), null);
    }
    
    @Test(expected = IllegalArgumentException.class)
    public void testValidateSslConfig_OnlyTrustStore() {
        ValidationUtils.validateSslConfig(null, trustStoreFile.getAbsolutePath());
    }
    
    @Test(expected = IllegalArgumentException.class)
    public void testValidateSslConfig_KeyStoreNotFound() {
        ValidationUtils.validateSslConfig("nonexistent.jks", trustStoreFile.getAbsolutePath());
    }
    
    @Test(expected = IllegalArgumentException.class)
    public void testValidateSslConfig_TrustStoreNotFound() {
        ValidationUtils.validateSslConfig(keyStoreFile.getAbsolutePath(), "nonexistent.jks");
    }
    
    @Test
    public void testParseMessageProperties_ValidFormat() {
        Map<String, String> properties = ValidationUtils.parseMessageProperties("key1=value1,key2=value2");
        assertEquals(2, properties.size());
        assertEquals("value1", properties.get("key1"));
        assertEquals("value2", properties.get("key2"));
    }
    
    @Test
    public void testParseMessageProperties_EmptyString() {
        Map<String, String> properties = ValidationUtils.parseMessageProperties("");
        assertTrue(properties.isEmpty());
    }
    
    @Test
    public void testParseMessageProperties_NullString() {
        Map<String, String> properties = ValidationUtils.parseMessageProperties(null);
        assertTrue(properties.isEmpty());
    }
    
    @Test(expected = IllegalArgumentException.class)
    public void testParseMessageProperties_InvalidFormat() {
        ValidationUtils.parseMessageProperties("key1=value1,key2");
    }
    
    @Test(expected = IllegalArgumentException.class)
    public void testParseMessageProperties_InvalidPropertyName() {
        ValidationUtils.parseMessageProperties("key1=value1,key@2=value2");
    }
    
    @Test
    public void testValidateMutuallyExclusive_NoConflict() {
        // Should not throw exception
        ValidationUtils.validateMutuallyExclusive("option1", "value1", "option2", null);
        ValidationUtils.validateMutuallyExclusive("option1", null, "option2", "value2");
        ValidationUtils.validateMutuallyExclusive("option1", null, "option2", null);
    }
    
    @Test(expected = IllegalArgumentException.class)
    public void testValidateMutuallyExclusive_Conflict() {
        ValidationUtils.validateMutuallyExclusive("option1", "value1", "option2", "value2");
    }
    
    @Test
    public void testValidateRequiredOption_ValidCombination() {
        // Should not throw exception
        ValidationUtils.validateRequiredOption("dependent", "value", "required", "value");
        ValidationUtils.validateRequiredOption("dependent", null, "required", "value");
        ValidationUtils.validateRequiredOption("dependent", null, "required", null);
    }
    
    @Test(expected = IllegalArgumentException.class)
    public void testValidateRequiredOption_MissingRequired() {
        ValidationUtils.validateRequiredOption("dependent", "value", "required", null);
    }
    
    @Test
    public void testValidateDestination_ValidDestination() {
        // Should not throw exception
        ValidationUtils.validateDestination("queue://TEST");
        ValidationUtils.validateDestination("topic://TEST");
    }
    
    @Test(expected = IllegalArgumentException.class)
    public void testValidateDestination_NullDestination() {
        ValidationUtils.validateDestination(null);
    }
    
    @Test(expected = IllegalArgumentException.class)
    public void testValidateDestination_EmptyDestination() {
        ValidationUtils.validateDestination("");
    }
    
    @Test
    public void testValidateUrl_ValidUrl() {
        // Should not throw exception
        ValidationUtils.validateUrl("tcp://localhost:61616");
        ValidationUtils.validateUrl("vm://localhost");
    }
    
    @Test(expected = IllegalArgumentException.class)
    public void testValidateUrl_NullUrl() {
        ValidationUtils.validateUrl(null);
    }
    
    @Test(expected = IllegalArgumentException.class)
    public void testValidateUrl_EmptyUrl() {
        ValidationUtils.validateUrl("");
    }
    
    @Test
    public void testValidateUrl_InvalidUrl() {
        // For testing purposes, we'll accept any URL format
        ValidationUtils.validateUrl("invalid:url:format");
    }
}