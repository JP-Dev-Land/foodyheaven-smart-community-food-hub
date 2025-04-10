package com.jpdevland.foodyheaven.backend.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * Custom exception for operations that are invalid due to business logic constraints
 * (e.g., attempting to order an unavailable item, placing an empty order).
 *
 * Maps to HTTP 400 Bad Request by default.
 */
@ResponseStatus(value = HttpStatus.BAD_REQUEST) // Return 400 Bad Request status
public class InvalidOperationException extends RuntimeException {

    public InvalidOperationException(String message) {
        super(message);
    }

    public InvalidOperationException(String message, Throwable cause) {
        super(message, cause);
    }
}