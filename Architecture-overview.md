Banking System Microservice Architecture

This document outlines the design of a banking system utilizing a microservice architecture. The system is composed of several key services, including Customer, Transaction, Notification, and Account Services. Each service is responsible for specific functionalities, ensuring a modular and scalable approach to banking operations. This architecture allows for efficient handling of user registrations, account management, transactions, and notifications.

Architecture Overview

The banking system architecture is structured around an API Gateway that acts as the entry point for client requests. The following services are integrated into the architecture:





Customer Service: Manages user registration, login, profile management, and Know Your Customer (KYC) processes.



Account Service: Handles account creation, account details retrieval, and balance inquiries.



Transaction Service: Facilitates deposit, withdrawal, internal transfer, and external transfer operations.



Notification Service: Sends notifications via email, SMS, or in-app messages.

Service Interaction Flow





Register





Flow: Client → API Gateway → Customer Service



Description: The client initiates a registration request, which is processed by the Customer Service.





Login





Flow: Client → API Gateway → Customer Service → JWT



Description: Upon successful login, the Customer Service generates a JSON Web Token (JWT) for authentication.





Create Bank Account





Flow: Client → API Gateway → Account Service





Validation: Account Service validates the customer via Customer Service.



Description: The client requests to create a bank account, which is validated and processed.





Check Balance





Flow: Client → API Gateway → Account Service



Description: The client can check their account balance through the Account Service.





Transfer Money





Flow: Client → API Gateway → Transaction Service





Validation: Transaction Service interacts with Account Service to validate sender and receiver accounts.



Operations:





Debit from sender's account



Credit to receiver's account



Save transaction details



Publish event to Kafka for further processing



Notify users via Notification Service



Description: The client initiates a money transfer, which involves multiple validations and operations.

Detailed Service Responsibilities

#### Customer Service





Register: Handles new user registrations.



Login: Authenticates users and issues JWTs.



Profile Management: Allows users to update their personal information.



KYC: Facilitates the KYC process to verify user identities.

#### Account Service





Create Account: Validates customer information and creates a new bank account.



Account Details: Provides information about the user's accounts.



Balance Inquiry: Allows users to check their account balances.

#### Transaction Service





Deposit: Processes deposits into user accounts.



Withdraw: Handles withdrawal requests from user accounts.



Internal Transfer: Manages transfers between accounts within the same bank.



External Transfer: Facilitates transfers to accounts in other banks.



Transaction Management:





Validates sender and receiver accounts.



Debits and credits accounts accordingly.



Publishes transaction events to Kafka for asynchronous processing.



Interacts with the Mock Central Bank for transaction validation.

#### Notification Service





Email Notifications: Sends transaction confirmations and alerts via email.



SMS Notifications: Sends important updates and alerts via SMS.



In-App Notifications: Provides real-time notifications within the banking application.

Transaction Flow Example





Initiate Transfer





The client requests a transfer through the API Gateway.





Transaction Service Validation





The Transaction Service validates the sender's and receiver's accounts by querying the Account Service.





Debit and Credit Operations





Upon successful validation, the Transaction Service debits the sender's account and credits the receiver's account.





Save Transaction





The transaction details are saved in the database for record-keeping.





Publish Event





The Transaction Service publishes an event to Kafka, notifying other services of the completed transaction.





Notification





The Notification Service sends alerts to both the sender and receiver regarding the transaction status.





Central Bank Interaction





The Transaction Service interacts with the Mock Central Bank to validate the transaction.



Success: Completes the transaction.



Failure: Initiates a compensation or refund process.

Conclusion

The proposed microservice architecture for the banking system provides a robust framework for managing customer interactions, account operations, and transactions. By leveraging services that are independently deployable and scalable, the system can efficiently handle a variety of banking operations while ensuring a seamless user experience. This architecture not only enhances maintainability but also allows for future scalability and integration of additional services as needed.