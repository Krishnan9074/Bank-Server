# Introduction
- Purpose: Outline the design of a bank service API.
- Scope: Features include listing banks and balances, retrieving transactions with filters.
# System Architecture
- Monolithic architecture using Express.js, PostgreSQL, and Zod.
- Authentication and Authorization: JWT (JSON Web Tokens).
# API Endpoints
## List Banks and Balances
- **Endpoint**: `GET /api/banks` 
- **Description**: Returns a list of banks and their balances for the authenticated user.
- **Response**: JSON array of banks with balance.
- **Error Handling**: 401 Unauthorized, 500 Internal Server Error.
## List Transactions
- **Endpoint**: `GET /api/banks/:bankId/transactions` 
- **Description**: Returns a list of transactions for a specified bank.
- **Filters**:
    - Type: Credit or Debit
    - Amount: Minimum or Maximum
    - Duration: Last 3 months, Last 6 months
- **Response**: JSON array of transactions.
- **Error Handling**: 400 Bad Request, 401 Unauthorized, 404 Not Found, 500 Internal Server Error.
# Data Validation
- **Schema Validation**: Using Zod for request payloads.
- **Input Sanitization**: Ensuring clean and safe inputs.
- **Type Checking**: Enforcing correct data types.
- **Business Rule Validation**: Ensuring logical consistency.
# Error Handling
- **Custom Error Classes**: For different error types.
- **Centralized Error Handling Middleware**: For consistent error responses.
- **Logging**: Errors logged to a file or external service.
- **Standardized Error Responses**: Consistent error messages and status codes.
# Testing
- **Unit Tests**: For individual components and functions.
# Deployment
- **Docker Containers**: For consistent deployment environments.
# Logging and Monitoring
- **Application Logs**: Capturing application-level events.
- **API Request/Response Logs**: Tracking API interactions.
- **Performance Monitoring**: Monitoring system performance.
- **Error Tracking**: Capturing and analyzing errors.
# Sequence Diagram
[View on Eraser![](https://app.eraser.io/workspace/08N54fRnjixYZPRZjnLl/preview?elements=5PdlvklwkPksaJ0AtCZIuQ&type=embed)](https://app.eraser.io/workspace/08N54fRnjixYZPRZjnLl?elements=5PdlvklwkPksaJ0AtCZIuQ)
# Testing on Postman
![image](https://github.com/Krishnan9074/Bank-Server/assets/114993913/443653b3-535d-4d1b-a11e-a92071112390)

![image](https://github.com/Krishnan9074/Bank-Server/assets/114993913/cc631bc1-6f22-414f-827f-5a7efe403182)

![image](https://github.com/Krishnan9074/Bank-Server/assets/114993913/c2dfa51f-7fb9-4fb4-a046-ba9175ece50b)

![image](https://github.com/Krishnan9074/Bank-Server/assets/114993913/8ed9f603-e667-4ccc-95db-de983f3bc60f)

![image](https://github.com/Krishnan9074/Bank-Server/assets/114993913/0e56ce05-3799-4cd4-a584-4104027dfc49)


