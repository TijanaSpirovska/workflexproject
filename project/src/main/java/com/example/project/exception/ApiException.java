package com.example.project.exception;

import lombok.Getter;
import java.io.Serial;

@Getter
public class ApiException extends RuntimeException {

    private final StatusErrorResponse status;

    @Serial
    private static final long serialVersionUID = 1L;

    public ApiException() {
        super(StatusErrorResponse.GENERIC_ERROR.getDescription());
        this.status = StatusErrorResponse.GENERIC_ERROR;
    }

    public ApiException(StatusErrorResponse status, String message) {
        super(message);
        this.status = status;
    }

    public ApiException(StatusErrorResponse status) {
        super(status.getDescription());
        this.status = status;
    }

    public ApiException(StatusErrorResponse status, Exception exception) {
        super(status.getDescription(), exception);
        this.status = status;
    }
}
