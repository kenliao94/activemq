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
package org.apache.activemq.jaas;

import org.jasypt.encryption.pbe.StandardPBEStringEncryptor;
import org.jasypt.encryption.pbe.config.EnvironmentStringPBEConfig;
import org.jasypt.properties.PropertyValueEncryptionUtils;
import org.jasypt.iv.RandomIvGenerator;
import org.jasypt.util.password.ConfigurablePasswordEncryptor;

import java.util.ArrayList;
import java.util.Properties;

/**
 * Holds utility methods used work with encrypted values.
 */
public class EncryptionSupport {
    static private final String HASH_DELIMITER = ":";

    static public void decrypt(Properties props, String algorithm) {
        StandardPBEStringEncryptor encryptor = createEncryptor(algorithm);
        for (Object k : new ArrayList(props.keySet())) {
            String key = (String) k;
            String value = props.getProperty(key);
            if (PropertyValueEncryptionUtils.isEncryptedValue(value)) {
                value = PropertyValueEncryptionUtils.decrypt(value, encryptor);
                props.setProperty(key, value);
            }
        }

    }
    public static StandardPBEStringEncryptor createEncryptor(String algorithm) {
        StandardPBEStringEncryptor encryptor = new StandardPBEStringEncryptor();
        EnvironmentStringPBEConfig config = new EnvironmentStringPBEConfig();
        if (algorithm != null) {
            encryptor.setAlgorithm(algorithm);
            // From Jasypt: for PBE-AES-based algorithms, the IV generator is MANDATORY"
            if (algorithm.startsWith("PBE") && algorithm.contains("AES")) {
                encryptor.setIvGenerator(new RandomIvGenerator());
            }
        }
        config.setPasswordEnvName("ACTIVEMQ_ENCRYPTION_PASSWORD");
        encryptor.setConfig(config);
        return encryptor;
    }

    public static boolean comparePassword(String inputPassword, String encodedPassword) {
        if (!isPasswordHashed(encodedPassword)) {
            return inputPassword.equals(encodedPassword);
        }
        String algorithm = extractAlgorithm(encodedPassword);
        String hashedPassword = extractPasswordHash(encodedPassword);
        ConfigurablePasswordEncryptor passwordEncryptor = new ConfigurablePasswordEncryptor();
        passwordEncryptor.setAlgorithm(algorithm);
        passwordEncryptor.setPlainDigest(true);
        return passwordEncryptor.checkPassword(inputPassword, hashedPassword);
    }

    private static String extractAlgorithm(String encodedPassword) {
        int delimiter = encodedPassword.indexOf(HASH_DELIMITER);
        return encodedPassword.substring(0, delimiter);
    }

    private static String extractPasswordHash(String encodedPassword) {
        int delimiter = encodedPassword.indexOf(HASH_DELIMITER);
        return encodedPassword.substring(delimiter + HASH_DELIMITER.length());
    }

    private static boolean isPasswordHashed(String encodedPassword) {
        int delimiter = encodedPassword.indexOf(HASH_DELIMITER);
        return delimiter != -1 && delimiter != 0;
    }
}
