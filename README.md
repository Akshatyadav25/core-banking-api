Account Retrieval API
This API retrieves customer account details from our core banking system, designed for efficiency, security, and scalability.

Purpose
To provide a list of customer accounts or details of a specific account based on given parameters.

Key Features
Account Access: Retrieve accounts by customer or specific ID. Supports pagination and filtering by type/status.

Error Handling: Provides clear error responses for invalid inputs or system issues.

Data Integrity: Ensures real-time data, masks sensitive information, and includes currency with all monetary values.

Performance
Single Account: Less than 100ms

List (up to 100): Less than 500ms

Concurrency: Handles 100 requests per second.

Security
Authentication: Requires valid credentials (e.g., OAuth 2.0, API Key).

Authorization: Enforces access rules (e.g., 403 Forbidden).

Encryption: All communication uses TLS 1.2 or higher.

Scalability & Observability
Designed for horizontal scaling with cloud-native patterns. Includes detailed logging and real-time metrics.

Documentation
A comprehensive OpenAPI/Swagger specification is available with examples.
