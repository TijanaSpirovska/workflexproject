package com.example.project.exception;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class ErrorMessage {

    @JsonProperty("code")
    private String code;

    @JsonProperty("message")
    private String message;

    @Getter
    @Setter
    @NoArgsConstructor
    public static class ErrorResponse {

        private String code;
        private String description;
        private String error;

        @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "dd-MM-yyyy HH:mm:ss")
        private LocalDateTime timestamp;

        public ErrorResponse(String code, String description, String error) {
            this.code = code;
            this.description = description;
            this.error = error;
            this.timestamp = LocalDateTime.now(); // Ensure timestamp is initialized
        }

        public ErrorResponse(String code, String description) {
            this(code, description, null); // Fallback to main constructor
        }
    }
}
