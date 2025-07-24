package com.example.project.exception;

import org.springframework.http.HttpStatus;

public enum StatusErrorResponse {

  GENERIC_ERROR("D-151", "INTERNAL SERVER ERROR", HttpStatus.INTERNAL_SERVER_ERROR),
  INVALID_CREDENTIALS("AUTH-001", "INVALID CREDENTIALS", HttpStatus.UNAUTHORIZED),
  ILLEGAL_ARGUMENT("D-152", "ILLEGAL ARGUMENT", HttpStatus.BAD_REQUEST),
  ENTITY_NOT_FOUND("D-153", "ENTITY NOT FOUND", HttpStatus.NOT_FOUND),
  DELETE_NOT_ALLOWED("D-156", "CANNOT DELETE ENTITY", HttpStatus.BAD_REQUEST),
  UPDATE_NOT_ALLOWED("D-157", "CANNOT UPDATE ENTITY", HttpStatus.BAD_REQUEST),
  DUPLICATE_RESOURCE("D-160", "DUPLICATE RESOURCE", HttpStatus.CONFLICT),
  ACCOUNT_EXPIRED("AUTH-002", "ACCOUNT EXPIRED", HttpStatus.UNAUTHORIZED),
  ACCOUNT_LOCKED("AUTH-003", "ACCOUNT LOCKED", HttpStatus.UNAUTHORIZED),
  CREDENTIALS_EXPIRED("AUTH-004", "CREDENTIALS EXPIRED", HttpStatus.UNAUTHORIZED),
  ACCOUNT_DISABLED("AUTH-005", "ACCOUNT DISABLED", HttpStatus.UNAUTHORIZED);

  private final String code;
  private final String message;
  private final HttpStatus status;

  StatusErrorResponse(String code, String message, HttpStatus status) {
    this.code = code;
    this.message = message;
    this.status = status;
  }

  public ErrorMessage.ErrorResponse toResponse(String errorDetail) {
    return new ErrorMessage.ErrorResponse(code, message, errorDetail);
  }

  public ErrorMessage.ErrorResponse toResponse() {
    return new ErrorMessage.ErrorResponse(code, message);
  }

  public HttpStatus getStatus() {
    return status;
  }

  public String getCode() {
    return code;
  }

  public String getDescription() {
    return message;
  }
}
