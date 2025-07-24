package com.example.project.exception;

import lombok.Getter;

@Getter
public class EntityNotFoundException extends RuntimeException {
    private static final long serialVersionUID = 1L;
    private final StatusErrorResponse status;

    public EntityNotFoundException() {
        super(StatusErrorResponse.ENTITY_NOT_FOUND.getDescription());
        this.status = StatusErrorResponse.ENTITY_NOT_FOUND;
    }

    public EntityNotFoundException(StatusErrorResponse status, String message) {
        super(message);
        this.status = status;
    }

    public EntityNotFoundException(StatusErrorResponse status) {
        super(status.getDescription());
        this.status = status;
    }

    public EntityNotFoundException(StatusErrorResponse status, Exception exception) {
        super(status.getDescription(), exception);
        this.status = status;
    }

}
