package com.example.project.exception;

import org.springframework.beans.TypeMismatchException;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.context.request.WebRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;


@ControllerAdvice
public class ExceptionHandlerController {

    private static final Logger logger = LoggerFactory.getLogger(ExceptionHandlerController.class);

    @ExceptionHandler(ApiException.class)
    public ResponseEntity<ErrorMessage.ErrorResponse> handleApiException(ApiException ex, WebRequest request) {
        logger.error("API Exception: {}", ex.getMessage(), ex);
        return ResponseEntity
                .status(ex.getStatus().getStatus())
                .body(ex.getStatus().toResponse(ex.getMessage()));
    }

    @ExceptionHandler(EntityNotFoundException.class)
    public ResponseEntity<ErrorMessage.ErrorResponse> handleEntityNotFoundException(EntityNotFoundException ex) {
        logger.warn("Entity Not Found: {}", ex.getMessage(), ex);
        return ResponseEntity
                .status(ex.getStatus().getStatus())
                .body(ex.getStatus().toResponse(ex.getMessage()));
    }

    @ExceptionHandler(TypeMismatchException.class)
    public ResponseEntity<ErrorMessage.ErrorResponse> handleTypeMismatchException(TypeMismatchException ex) {
        logger.warn("Type Mismatch: {}", ex.getMessage());

        assert ex.getRequiredType() != null;
        String message = String.format("Invalid value '%s' for '%s'. Expected type: %s.",
                ex.getValue(), ex.getPropertyName(), ex.getRequiredType().getSimpleName());

        return ResponseEntity
                .badRequest()
                .body(StatusErrorResponse.ILLEGAL_ARGUMENT.toResponse(message));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorMessage.ErrorResponse> handleGenericException(Exception ex) {
        logger.error("Unexpected error: {}", ex.getMessage(), ex);
        return ResponseEntity
                .status(StatusErrorResponse.GENERIC_ERROR.getStatus())
                .body(StatusErrorResponse.GENERIC_ERROR.toResponse(ex.getMessage()));
    }
}
