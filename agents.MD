# AGENTS.md

## 1. Project Overview

### Project Name

**Cooperative Labour Service Marketplace**

### Objective

Build a cooperative-owned digital service marketplace that connects verified skilled workers from Labour Cooperative Federations/Societies with households and institutions requiring services.

The platform must prioritize:

* Verified workers
* Fair and transparent worker earnings
* Worker welfare
* Consumer trust
* Location-based matching
* Reliable booking and scheduling
* Digital payments and invoicing
* Cooperative administration
* AI-based demand forecasting and workforce allocation
* Multilingual accessibility

The system should be built as a **working MVP first**, with advanced features added incrementally.

---

# 2. Core Product Concept

The platform has four primary roles:

```text
CUSTOMER
    ↓
Search service
    ↓
Find nearby verified workers
    ↓
Book worker
    ↓
Track service
    ↓
Pay
    ↓
Rate worker
```

```text
WORKER
    ↓
Register
    ↓
Submit verification details
    ↓
Add skills/certifications
    ↓
Set availability
    ↓
Receive booking
    ↓
Accept/reject
    ↓
Complete service
    ↓
Receive earnings
```

```text
SOCIETY ADMIN
    ↓
Manage workers
    ↓
Verify workers
    ↓
Manage services
    ↓
Monitor bookings
    ↓
Monitor worker welfare
```

```text
FEDERATION ADMIN
    ↓
Monitor multiple societies
    ↓
View workforce
    ↓
View demand
    ↓
View revenue
    ↓
AI demand forecast
    ↓
AI workforce allocation
```

---

# 3. Development Philosophy

## Priority Order

Always implement features in this order:

```text
1. Correctness
2. Core business workflow
3. Security
4. Database consistency
5. User experience
6. Performance
7. Advanced AI/features
8. Visual polish
```

Do not build advanced features while the basic booking workflow is broken.

### Golden Rule

> One customer must be able to successfully book one verified worker and complete the entire service lifecycle before advanced features are prioritized.

---

# 4. MVP Scope

## Must-Have Features

### Authentication

* Customer registration/login
* Worker registration/login
* Admin login
* Role-based access control
* JWT authentication
* Password hashing
* Protected APIs

### Worker Management

* Worker profile
* Profile photo
* Contact information
* Experience
* Skills
* Certifications
* Service categories
* Availability
* Location
* Verification status
* Rating
* Earnings

### Worker Verification

Worker status:

```text
PENDING
    ↓
UNDER_REVIEW
    ↓
VERIFIED
```

or:

```text
PENDING
    ↓
REJECTED
```

Only verified workers should appear in normal customer search results.

### Customer Features

* Browse services
* Search workers
* Filter by service
* Filter by distance
* View worker profile
* View rating
* View certification
* View availability
* Book service
* Cancel booking
* Track booking status
* Make payment
* View invoice
* Submit rating/review

### Booking

Booking lifecycle:

```text
REQUESTED
    ↓
ACCEPTED
    ↓
ON_THE_WAY
    ↓
IN_PROGRESS
    ↓
COMPLETED
    ↓
PAID
    ↓
REVIEWED
```

Invalid state transitions must be rejected by the backend.

### Geo Matching

Match workers using:

1. Required skill
2. Worker verification
3. Availability
4. Distance
5. Rating
6. Experience

Initial matching score:

```text
Match Score =
    40% Skill Match
  + 25% Distance
  + 20% Availability
  + 10% Rating
  + 5% Experience
```

The weights must be configurable rather than hard-coded throughout the application.

### Payments

For the MVP:

* Implement payment abstraction
* Support mock payment for development/demo
* Generate payment record
* Generate invoice
* Track worker earnings

If real payment integration is available, implement it behind the same payment interface.

Never store raw card information.

### Ratings

After a completed booking:

* Customer can rate worker
* Customer can submit review
* Worker average rating is recalculated
* Rating must belong to a completed booking
* Prevent duplicate reviews for the same booking

---

# 5. Advanced Features

Implement these only after the MVP is stable.

## Emergency Booking

Customer can mark:

```text
Emergency = TRUE
```

Emergency matching prioritizes:

```text
Availability
+
Distance
+
Required Skill
```

Emergency bookings should be visually distinguished in the admin dashboard.

---

# 6. Worker Welfare

Create a worker welfare module containing:

* Insurance status
* Insurance provider
* Policy information
* Coverage status
* Expiry date
* Welfare contributions
* Health/benefit information
* Leave information
* Worker earnings
* Working hours

Example statuses:

```text
ACTIVE
EXPIRING_SOON
EXPIRED
NOT_ENROLLED
```

Do not expose sensitive welfare information to customers.

---

# 7. AI Demand Forecasting

## Objective

Predict future demand for different services in different areas/time periods.

### Input Features

Potential features:

```text
date
day_of_week
month
area
service_type
hour
historical_booking_count
emergency_booking_count
```

Additional features may be added after evaluating the dataset.

### Output

Example:

```text
Tomorrow

Area A

Plumbing       18 bookings
Electrical     12 bookings
Cleaning        8 bookings
Carpentry       6 bookings
```

### Initial Model

Start with simple models:

* Linear Regression
* Random Forest
* Gradient Boosting

Evaluate models using appropriate regression metrics.

Do not introduce deep learning unless the dataset justifies it.

### Important

The AI module must have a fallback.

If the model is unavailable:

```text
AI unavailable
      ↓
Historical average / rule-based prediction
```

The application must continue functioning.

---

# 8. AI Workforce Allocation

Use predicted demand + available workforce.

Example:

```text
Predicted demand:

Plumbing       18
Electrical     12
Cleaning        8
```

Available:

```text
Plumbers        7
Electricians    5
Cleaners       10
```

Generate recommendations such as:

```text
Area A:
5 plumbers
3 electricians
3 cleaners
```

Allocation should consider:

* Skill
* Availability
* Distance
* Current workload
* Predicted demand
* Worker working-hour limits

Do not claim that the allocation is AI if it is only a simple rule-based algorithm. Clearly separate:

```text
ML Forecast
+
Optimization/Scoring Allocation
```

---

# 9. Multilingual Support

Initial supported languages:

```text
English
Hindi
One regional language
```

Do not hard-code translated text throughout components.

Use a centralized translation system.

Example:

```text
translations/
    en.json
    hi.json
    regional.json
```

The language should be changeable without restarting the application.

---

# 10. Admin Dashboard

The federation dashboard should display:

### Workforce

```text
Total Workers
Verified Workers
Pending Verification
Active Workers
Workers by Skill
Workers by Society
```

### Bookings

```text
Total Bookings
Pending
Accepted
Completed
Cancelled
Emergency
```

### Financial

```text
Total Revenue
Worker Earnings
Cooperative Earnings
Completed Payments
```

### Analytics

```text
Bookings by Service
Bookings by Location
Worker Utilization
Average Rating
Demand Trends
```

### AI

```text
Demand Forecast
High-Demand Areas
Recommended Workforce Allocation
```

### Welfare

```text
Active Insurance
Expiring Insurance
Expired Insurance
Workers Requiring Welfare Attention
```

---

# 11. Technology Stack

## Frontend

Use:

```text
React Native
Expo
TypeScript
```

Use one application with role-based screens rather than maintaining separate applications initially.

Suggested structure:

```text
mobile/
    src/
        components/
        screens/
        navigation/
        services/
        hooks/
        context/
        utils/
        types/
        i18n/
```

## Backend

Use:

```text
Python
FastAPI
Pydantic
SQLAlchemy
Alembic
JWT
```

Suggested structure:

```text
backend/
    app/
        main.py

        api/
            auth.py
            workers.py
            services.py
            bookings.py
            matching.py
            payments.py
            reviews.py
            welfare.py
            ai.py
            admin.py

        models/
        schemas/
        services/
        repositories/
        core/
        db/
        utils/

    tests/
```

Do not put business logic directly inside route handlers.

---

# 12. Database

Use:

```text
PostgreSQL
PostGIS
```

Core entities:

```text
users
workers
cooperatives
societies
skills
worker_skills
certifications
worker_certifications
services
bookings
booking_status_history
payments
invoices
reviews
locations
worker_availability
worker_welfare
insurance
notifications
demand_data
forecast_results
```

Important relationships:

```text
User
 ├── Customer
 └── Worker

Worker
 ├── Skills
 ├── Certifications
 ├── Availability
 ├── Welfare
 └── Location

Customer
 └── Bookings

Booking
 ├── Customer
 ├── Worker
 ├── Service
 ├── Payment
 ├── Invoice
 └── Review
```

Use foreign keys and database constraints wherever appropriate.

---

# 13. API Design

Use REST APIs.

Example:

```text
POST   /api/v1/auth/register
POST   /api/v1/auth/login

GET    /api/v1/services
GET    /api/v1/services/{id}

GET    /api/v1/workers
GET    /api/v1/workers/{id}
POST   /api/v1/workers/profile
PUT    /api/v1/workers/profile

POST   /api/v1/bookings
GET    /api/v1/bookings
GET    /api/v1/bookings/{id}
PATCH  /api/v1/bookings/{id}/status

GET    /api/v1/matching/workers

POST   /api/v1/payments
GET    /api/v1/invoices/{id}

POST   /api/v1/reviews

GET    /api/v1/welfare
PUT    /api/v1/welfare

GET    /api/v1/admin/dashboard
GET    /api/v1/admin/workers
PATCH  /api/v1/admin/workers/{id}/verify

GET    /api/v1/ai/forecast
GET    /api/v1/ai/allocation
```

All APIs must have proper:

* Validation
* Authentication
* Authorization
* Error handling
* HTTP status codes

---

# 14. Security Rules

Never:

* Store plaintext passwords
* Store payment card details
* Expose private worker information
* Trust role information sent directly by clients
* Allow customers to access admin APIs
* Allow workers to modify their verification status
* Allow customers to modify payment status
* Accept arbitrary database IDs without authorization checks

Use:

```text
Password hashing
JWT
Role-based authorization
Input validation
Database constraints
Environment variables
```

Secrets must never be committed to Git.

Use:

```text
.env
```

and provide:

```text
.env.example
```

---

# 15. Environment Configuration

Never hard-code:

```text
DATABASE_URL
JWT_SECRET
PAYMENT_API_KEY
MAP_API_KEY
FIREBASE_CONFIG
```

Use environment variables.

Example:

```text
DATABASE_URL=
JWT_SECRET=
MAP_API_KEY=
PAYMENT_API_KEY=
```

`.env` must be included in `.gitignore`.

---

# 16. Error Handling

Backend should return consistent errors.

Example:

```json
{
  "success": false,
  "error": {
    "code": "WORKER_NOT_AVAILABLE",
    "message": "The selected worker is no longer available."
  }
}
```

Frontend must display user-friendly messages.

Never expose stack traces or internal database errors to users.

---

# 17. Booking Concurrency

Booking conflicts must be prevented.

Example:

```text
Worker available
     ↓
Customer A books worker
     ↓
Worker becomes unavailable
     ↓
Customer B attempts same time
     ↓
Backend rejects booking
```

Availability must be checked on the backend at booking time.

Never rely only on frontend availability.

---

# 18. Notification System

Design notification abstraction so it can later support:

```text
Push notifications
SMS
Email
```

Important events:

```text
New booking
Booking accepted
Booking rejected
Worker arriving
Service completed
Payment completed
Review submitted
Insurance expiring
Emergency booking
```

For the MVP, push notifications or in-app notifications are sufficient.

---

# 19. UI Requirements

The UI should be:

* Mobile-first
* Simple
* Accessible
* Multilingual
* Easy for users with limited technical literacy

Avoid unnecessary animations and complicated navigation.

Customer home:

```text
Search services

Plumbing
Electrical
Carpentry
Painting
Cleaning
Driving
Gardening
Caregiving
Technician
Domestic Help
```

Worker home:

```text
Today's Jobs
Availability
Earnings
Rating
Profile
Skills
Welfare
```

Admin home:

```text
Workers
Bookings
Revenue
Analytics
Forecast
Welfare
Verification
```

---

# 20. Project Development Phases

## Phase 0 — Planning

Before coding:

* Define user flows
* Define database schema
* Define API contracts
* Define folder structure
* Define MVP
* Create GitHub repository
* Create development branches

Do not begin with UI design alone.

---

## Phase 1 — Backend Foundation

Implement:

```text
FastAPI
PostgreSQL
SQLAlchemy
Alembic
Authentication
JWT
Role-based access
```

Deliverable:

> Users can register, login, and access role-specific APIs.

---

## Phase 2 — Worker System

Implement:

```text
Worker profile
Skills
Certifications
Availability
Location
Verification
```

Deliverable:

> Admin can verify a worker and the worker becomes eligible for marketplace matching.

---

## Phase 3 — Customer Marketplace

Implement:

```text
Service categories
Worker search
Worker profiles
Filtering
Location
Availability
```

Deliverable:

> Customer can discover verified workers.

---

## Phase 4 — Booking Engine

Implement:

```text
Create booking
Accept/reject
Status updates
Cancellation
Completion
Booking history
```

Deliverable:

> Customer can complete an end-to-end service booking.

This is the first major milestone.

---

## Phase 5 — Payment + Invoice + Review

Implement:

```text
Payment
Invoice
Worker earnings
Rating
Review
```

Deliverable:

> Complete service → payment → invoice → review.

---

## Phase 6 — Geo Matching

Implement:

```text
PostGIS
Nearby search
Distance calculation
Matching score
Map visualization
```

Deliverable:

> System recommends nearby verified workers.

---

## Phase 7 — Admin Dashboard

Implement:

```text
Worker management
Booking management
Financial analytics
Service analytics
Welfare dashboard
```

Deliverable:

> Cooperative federation can manage and monitor the platform.

---

## Phase 8 — AI

Implement:

```text
Data collection
Data preprocessing
Demand forecasting
Model evaluation
Forecast API
Workforce allocation
```

Deliverable:

> Admin can view predicted demand and recommended workforce allocation.

---

## Phase 9 — Differentiators

Implement:

```text
Emergency booking
Multilingual UI
Worker welfare
Notifications
Advanced analytics
```

---

## Phase 10 — Deployment

Deploy:

```text
Frontend
Backend
Database
AI service
```

Set up:

```text
Production environment
HTTPS
Environment variables
Logging
Error monitoring
Database backups
```

---

# 21. Git Workflow

Use:

```text
main
develop
feature/*
bugfix/*
```

Example:

```text
feature/auth
feature/worker-profile
feature/booking
feature/matching
feature/payments
feature/ai-forecast
feature/admin-dashboard
```

Do not commit directly to `main`.

Every feature should:

1. Be developed on its own branch
2. Be tested
3. Be reviewed
4. Be merged into `develop`
5. Be integrated into `main` after validation

Commit messages should be clear:

```text
feat: add worker registration
feat: implement booking lifecycle
fix: prevent duplicate booking
feat: add geo-based worker matching
```

---

# 22. Testing Requirements

Backend:

```text
Unit tests
API tests
Authentication tests
Authorization tests
Booking lifecycle tests
Matching tests
Payment tests
```

Important scenarios:

```text
Unverified worker cannot receive normal booking
Customer cannot access admin API
Worker cannot modify verification status
Completed booking cannot become requested
Already-booked worker cannot be double-booked
Customer cannot review incomplete booking
Customer cannot review same booking twice
```

AI:

```text
Train/test split
Baseline comparison
Model evaluation
Prediction validation
Fallback testing
```

---

# 23. Demo Dataset

Do not depend entirely on live users during the demonstration.

Create realistic seed data:

```text
50+ workers
10+ services
5+ locations
100+ historical bookings
Multiple cooperatives
Different skill categories
Different worker ratings
Historical demand
```

Seed data must look realistic but must not contain real people's sensitive information.

---

# 24. Demo Scenario

The final demonstration should follow one complete story.

### Customer

```text
Login
 ↓
Select Electrical
 ↓
Current Location
 ↓
View nearby verified workers
 ↓
Select worker
 ↓
Book
```

### Worker

```text
Receive booking
 ↓
Accept
 ↓
Start service
 ↓
Complete
```

### Customer

```text
Pay
 ↓
Receive invoice
 ↓
Give rating
```

### Admin

```text
Dashboard updates
 ↓
Worker earnings update
 ↓
Booking statistics update
 ↓
Demand forecast
 ↓
Workforce recommendation
```

### Emergency Demo

Also demonstrate:

```text
Emergency Electrical Request
        ↓
Nearby available workers
        ↓
Highest-priority matching
        ↓
Worker accepts
```

---

# 25. AI Demo Scenario

Prepare historical data before the presentation.

Show:

```text
Historical Demand
        ↓
ML Model
        ↓
Tomorrow's Forecast
        ↓
High Demand Areas
        ↓
Workforce Recommendation
```

Example:

```text
AI FORECAST

Tomorrow — 5 PM to 8 PM

Area A
Electrical: 18
Plumbing: 14
Cleaning: 9

Recommendation:

Deploy:
4 Electricians
3 Plumbers
2 Cleaners
```

The AI result must be explainable.

Show:

* What data was used
* What model was used
* Prediction
* Model performance
* How prediction affects workforce allocation

---

# 26. Definition of Done

A feature is complete only when:

```text
[ ] Backend API implemented
[ ] Database changes implemented
[ ] Authentication/authorization checked
[ ] Input validation implemented
[ ] Error handling implemented
[ ] Frontend integrated
[ ] Loading state implemented
[ ] Error state implemented
[ ] Tests written
[ ] Tested with realistic data
[ ] Documentation updated
```

Do not mark a feature complete merely because its UI exists.

---

# 27. Agent Coding Rules

When modifying the project:

1. Inspect the existing code before making changes.
2. Do not rewrite working modules unnecessarily.
3. Follow the existing architecture.
4. Reuse existing components/services where possible.
5. Do not duplicate business logic.
6. Keep business logic out of UI components.
7. Keep database queries out of route handlers where possible.
8. Validate all user input.
9. Add tests for important logic.
10. Do not introduce dependencies without a reason.
11. Never hard-code secrets.
12. Never commit `.env`.
13. Do not fake successful API responses in production code.
14. Keep mock services isolated from real services.
15. Update documentation when architecture changes.

---

# 28. AI Agent Workflow

Before implementing any feature, the coding agent should follow:

```text
UNDERSTAND
    ↓
Inspect repository
    ↓
Identify existing architecture
    ↓
Identify affected files
    ↓
PLAN
    ↓
Explain implementation
    ↓
IMPLEMENT
    ↓
Write code
    ↓
TEST
    ↓
Run tests/lint/type checks
    ↓
FIX
    ↓
Verify integration
    ↓
REPORT
```

Do not immediately start editing files after receiving a feature request.

---

# 29. Agent Restrictions

The coding agent must NOT:

* Delete existing functionality without approval
* Replace the entire project architecture unnecessarily
* Change the database schema without considering migrations
* Remove tests to make them pass
* Disable authentication to simplify development
* Put secrets into source code
* Use fake production data
* Claim an integration works without testing it
* Claim AI is implemented when only hard-coded output exists
* Introduce microservices unless there is a clear requirement

---

# 30. Architecture Principle

Start with a modular monolith.

```text
Mobile App
     ↓
FastAPI
     ↓
PostgreSQL
     ↓
AI Module
```

Do NOT start with:

```text
20 microservices
Kafka
Kubernetes
Multiple databases
Complex event architecture
```

The system should be easy to develop, debug, demonstrate, and deploy.

The architecture can be split into services later if required.

---

# 31. Final MVP Acceptance Criteria

The MVP is considered successful when the following complete workflow works without manual database intervention:

```text
Customer Registration
        ↓
Customer Login
        ↓
Select Service
        ↓
Location Detection
        ↓
Find Verified Workers
        ↓
View Worker Profile
        ↓
Book Worker
        ↓
Worker Receives Booking
        ↓
Worker Accepts
        ↓
Service Starts
        ↓
Service Completes
        ↓
Payment
        ↓
Invoice
        ↓
Rating
        ↓
Worker Earnings Updated
        ↓
Admin Dashboard Updated
```

Additionally:

```text
Admin verifies worker
        ↓
Worker becomes searchable
```

and:

```text
Historical booking data
        ↓
AI demand forecasting
        ↓
Workforce allocation recommendation
```

must work independently.

---

# 32. Primary Success Metric

The most important question during development is:

> **Can we demonstrate a complete real-world service transaction from customer request to worker payment while the cooperative administration and AI systems operate around it?**

If yes, the project has a strong working foundation.

Everything else should support this core workflow.
