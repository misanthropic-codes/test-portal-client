# Test Portal - Backend API Specification v1.0

**Document Version:** 1.0  
**Last Updated:** December 14, 2024  
**Target Audience:** Backend Developers  
**Client Version:** React/Next.js 16  

---

## Table of Contents

1. [Overview](#overview)
2. [Base Configuration](#base-configuration)
3. [Authentication](#authentication)
4. [API Endpoints](#api-endpoints)
   - [Auth & User Management](#1-authentication--user-management)
   - [Test Management](#2-test-management)
   - [Test Taking](#3-test-taking)
   - [Results & Analytics](#4-results--analytics)
   - [Dashboard & History](#5-dashboard--history)
   - [Leaderboard](#6-leaderboard-optional)
5. [Data Models](#data-models)
6. [Error Handling](#error-handling)
7. [Best Practices](#best-practices)
8. [Integration Guide](#integration-guide)

---

## Overview

This document specifies the RESTful API endpoints required for the Test Portal frontend application. The API follows standard REST conventions and uses JSON for request/response payloads.

### Key Requirements
- RESTful architecture
- JSON request/response format
- JWT-based authentication
- ISO 8601 datetime format
- Pagination for list endpoints
- LaTeX support for mathematical content

---

## Base Configuration

### Production Environment
```
Base URL: https://api.testportal.com/v1
WebSocket: wss://api.testportal.com/v1/ws
```

### Development Environment
```
Base URL: http://localhost:8000/api/v1
WebSocket: ws://localhost:8000/api/v1/ws
```

### Common Headers
```http
Content-Type: application/json
Accept: application/json
Authorization: Bearer <jwt_token>  // For authenticated requests
```

### Status Codes
- `200 OK` - Successful GET/PATCH/DELETE
- `201 Created` - Successful POST
- `204 No Content` - Successful DELETE with no response body
- `400 Bad Request` - Validation error
- `401 Unauthorized` - Missing or invalid authentication
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource doesn't exist
- `409 Conflict` - Duplicate resource
- `422 Unprocessable Entity` - Semantic errors
- `429 Too Many Requests` - Rate limit exceeded
- `500 Internal Server Error` - Server error
- `503 Service Unavailable` - Temporary unavailability

---

## Authentication

All authenticated endpoints require a valid JWT token in the Authorization header.

### Token Structure
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Token Payload (Recommended)
```json
{
  "userId": "string",
  "email": "string",
  "role": "STUDENT | ADMIN",
  "iat": 1702554600,
  "exp": 1702641000
}
```

### Token Lifecycle
- **Access Token**: Expires in 24 hours
- **Refresh Token**: Expires in 30 days
- Store refresh token securely (httpOnly cookie recommended)

---

## API Endpoints

## 1. Authentication & User Management

### 1.1 Register New User

Create a new user account.

**Endpoint:** `POST /auth/register`  
**Authentication:** Not Required

**Request Body:**
```json
{
  "name": "Rahul Sharma",
  "email": "rahul.sharma@example.com",
  "password": "SecurePass123!",
  "phone": "+91-9876543210",
  "dateOfBirth": "2005-03-15",
  "examTargets": ["JEE_MAIN", "JEE_ADVANCED"],
  "targetYear": 2025
}
```

**Field Validations:**
- `name`: Required, 3-100 characters
- `email`: Required, valid email format, unique
- `password`: Required, min 8 chars, must include uppercase, lowercase, number
- `phone`: Required, valid phone format
- `dateOfBirth`: Required, YYYY-MM-DD format, age 13-30
- `examTargets`: Required, array of valid exam types
- `targetYear`: Required, current year to current year + 5

**Success Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "usr_7xk2m9p4q1",
      "name": "Rahul Sharma",
      "email": "rahul.sharma@example.com",
      "phone": "+91-9876543210",
      "profilePicture": "https://cdn.testportal.com/avatars/default.png",
      "dateOfBirth": "2005-03-15",
      "examTargets": ["JEE_MAIN", "JEE_ADVANCED"],
      "targetYear": 2025,
      "role": "STUDENT",
      "isEmailVerified": false,
      "stats": {
        "testsAttempted": 0,
        "averageScore": 0,
        "bestRank": 0,
        "totalStudyHours": 0
      },
      "createdAt": "2024-12-14T10:30:00Z",
      "updatedAt": "2024-12-14T10:30:00Z"
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "expiresIn": 86400
    }
  }
}
```

**Error Response:** `400 Bad Request`
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": {
      "email": ["Email already exists"],
      "password": ["Password must include at least one uppercase letter"]
    }
  },
  "timestamp": "2024-12-14T10:30:00Z"
}
```

---

### 1.2 User Login

Authenticate user and receive access token.

**Endpoint:** `POST /auth/login`  
**Authentication:** Not Required

**Request Body:**
```json
{
  "email": "rahul.sharma@example.com",
  "password": "SecurePass123!"
}
```

**Success Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "usr_7xk2m9p4q1",
      "name": "Rahul Sharma",
      "email": "rahul.sharma@example.com",
      "phone": "+91-9876543210",
      "profilePicture": "https://cdn.testportal.com/avatars/usr_7xk2m9p4q1.jpg",
      "dateOfBirth": "2005-03-15",
      "examTargets": ["JEE_MAIN", "JEE_ADVANCED"],
      "targetYear": 2025,
      "role": "STUDENT",
      "isEmailVerified": true,
      "stats": {
        "testsAttempted": 45,
        "averageScore": 245.5,
        "bestRank": 123,
        "totalStudyHours": 450
      },
      "createdAt": "2024-01-15T05:30:00Z",
      "updatedAt": "2024-12-14T10:30:00Z"
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "expiresIn": 86400
    }
  }
}
```

**Error Response:** `401 Unauthorized`
```json
{
  "success": false,
  "error": {
    "code": "INVALID_CREDENTIALS",
    "message": "Invalid email or password"
  },
  "timestamp": "2024-12-14T10:30:00Z"
}
```

---

### 1.3 Refresh Access Token

Get a new access token using refresh token.

**Endpoint:** `POST /auth/refresh`  
**Authentication:** Not Required (uses refresh token)

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Success Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 86400
  }
}
```

---

### 1.4 Get Current User

Retrieve authenticated user's profile.

**Endpoint:** `GET /auth/me`  
**Authentication:** Required

**Success Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "user": {
      // Same user object as login response
    }
  }
}
```

---

### 1.5 Update User Profile

Update user profile information.

**Endpoint:** `PATCH /auth/profile`  
**Authentication:** Required

**Request Body:**
```json
{
  "name": "Rahul Kumar Sharma",
  "phone": "+91-9876543211",
  "examTargets": ["JEE_MAIN", "JEE_ADVANCED", "BITSAT"],
  "targetYear": 2026
}
```

**Success Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "user": {
      // Updated user object
    }
  }
}
```

---

### 1.6 Upload Profile Picture

Upload user profile picture.

**Endpoint:** `POST /auth/profile/picture`  
**Authentication:** Required  
**Content-Type:** `multipart/form-data`

**Request:**
```
Form Data:
- file: (binary) // Max 5MB, jpg/png/webp
```

**Success Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "profilePicture": "https://cdn.testportal.com/avatars/usr_7xk2m9p4q1.jpg"
  }
}
```

---

### 1.7 Logout

Invalidate user's refresh token.

**Endpoint:** `POST /auth/logout`  
**Authentication:** Required

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Success Response:** `204 No Content`

---

## 2. Test Management

### 2.1 Get All Tests

Retrieve paginated list of tests with filtering.

**Endpoint:** `GET /tests`  
**Authentication:** Required

**Query Parameters:**
| Parameter | Type | Required | Description | Example |
|-----------|------|----------|-------------|---------|
| page | integer | No | Page number (default: 1) | `?page=2` |
| limit | integer | No | Items per page (default: 20, max: 100) | `?limit=50` |
| examType | string | No | Filter by exam type | `?examType=JEE_MAIN` |
| testType | string | No | Filter by test type | `?testType=MOCK` |
| difficulty | string | No | Filter by difficulty | `?difficulty=MEDIUM` |
| subject | string | No | Filter by subject | `?subject=PHYSICS` |
| status | string | No | Filter by status | `?status=LIVE` |
| search | string | No | Search in title/description | `?search=advanced` |

**Valid Enum Values:**
- `examType`: `JEE_MAIN`, `JEE_ADVANCED`, `NEET`, `BITSAT`, `COMEDK`, `VITEEE`, `SRMJEEE`, `KIITEE`
- `testType`: `MOCK`, `PRACTICE`, `PREVIOUS_YEAR`, `TOPIC_WISE`, `CHAPTER_WISE`, `FULL_LENGTH`, `PART_TEST`
- `difficulty`: `EASY`, `MEDIUM`, `HARD`
- `subject`: `PHYSICS`, `CHEMISTRY`, `MATHEMATICS`, `BIOLOGY`
- `status`: `UPCOMING`, `LIVE`, `COMPLETED`, `SCHEDULED`

**Success Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "tests": [
      {
        "id": "test_abc123",
        "title": "JEE Main 2024 Mock Test 15",
        "description": "Full syllabus mock test based on latest JEE Main pattern",
        "examType": "JEE_MAIN",
        "testType": "MOCK",
        "difficulty": "MEDIUM",
        "duration": 180,
        "totalMarks": 300,
        "totalQuestions": 75,
        "subjects": ["PHYSICS", "CHEMISTRY", "MATHEMATICS"],
        "thumbnail": "https://cdn.testportal.com/thumbnails/test_abc123.jpg",
        "scheduledAt": null,
        "startTime": null,
        "endTime": null,
        "status": "LIVE",
        "isPaid": false,
        "price": 0,
        "instructions": "<p>Read all instructions carefully...</p>",
        "sections": [
          {
            "id": "sec_phys1",
            "name": "Physics",
            "subject": "PHYSICS",
            "duration": 60,
            "questionCount": 25,
            "marks": 100,
            "isTimed": true
          },
          {
            "id": "sec_chem1",
            "name": "Chemistry",
            "subject": "CHEMISTRY",
            "duration": 60,
            "questionCount": 25,
            "marks": 100,
            "isTimed": true
          },
          {
            "id": "sec_math1",
            "name": "Mathematics",
            "subject": "MATHEMATICS",
            "duration": 60,
            "questionCount": 25,
            "marks": 100,
            "isTimed": true
          }
        ],
        "markingScheme": {
          "correctMarks": 4,
          "incorrectMarks": -1,
          "unattemptedMarks": 0
        },
        "syllabus": ["Electrostatics", "Thermodynamics", "Calculus", "Organic Chemistry"],
        "prerequisites": "Complete syllabus coverage recommended",
        "attemptCount": 1245,
        "isAttempted": false,
        "userAttempts": [],
        "stats": {
          "totalAttempts": 1245,
          "averageScore": 185.5,
          "highestScore": 295,
          "lowestScore": 45
        },
        "createdAt": "2024-12-01T00:00:00Z",
        "updatedAt": "2024-12-14T05:30:00Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 10,
      "totalTests": 200,
      "pageSize": 20,
      "hasNext": true,
      "hasPrevious": false
    }
  }
}
```

---

### 2.2 Get Test by ID

Retrieve detailed information about a specific test.

**Endpoint:** `GET /tests/:testId`  
**Authentication:** Required

**URL Parameters:**
- `testId`: Test identifier

**Success Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "test": {
      // Full test object (same structure as 2.1)
      "id": "test_abc123",
      "title": "JEE Main 2024 Mock Test 15",
      // ... all fields from above
      "isAttempted": true,
      "userAttempts": [
        {
          "attemptId": "attempt_xyz789",
          "score": 265,
          "rank": 150,
          "percentile": 88.5,
          "completedAt": "2024-12-10T14:30:00Z"
        }
      ]
    }
  }
}
```

**Error Response:** `404 Not Found`
```json
{
  "success": false,
  "error": {
    "code": "TEST_NOT_FOUND",
    "message": "Test with ID 'test_abc123' not found"
  },
  "timestamp": "2024-12-14T10:30:00Z"
}
```

---

## 3. Test Taking

### 3.1 Start Test

Initialize a new test attempt.

**Endpoint:** `POST /tests/:testId/start`  
**Authentication:** Required

**URL Parameters:**
- `testId`: Test identifier

**Success Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "attempt": {
      "attemptId": "attempt_xyz789",
      "testId": "test_abc123",
      "userId": "usr_7xk2m9p4q1",
      "startTime": "2024-12-14T10:30:00Z",
      "endTime": "2024-12-14T13:30:00Z",
      "duration": 180,
      "status": "IN_PROGRESS",
      "sections": [
        {
          "sectionId": "sec_phys1",
          "name": "Physics",
          "subject": "PHYSICS",
          "duration": 60,
          "startTime": null,
          "questions": [
            {
              "id": "q_phys_001",
              "questionNumber": 1,
              "type": "MCQ_SINGLE",
              "questionText": "A particle of mass 2kg is moving with velocity $\\vec{v} = 3\\hat{i} + 4\\hat{j}$ m/s. What is the magnitude of its momentum?",
              "images": [],
              "options": [
                {
                  "id": "opt_001_a",
                  "text": "10 kg·m/s",
                  "image": null
                },
                {
                  "id": "opt_001_b",
                  "text": "14 kg·m/s",
                  "image": null
                },
                {
                  "id": "opt_001_c",
                  "text": "6 kg·m/s",
                  "image": null
                },
                {
                  "id": "opt_001_d",
                  "text": "8 kg·m/s",
                  "image": null
                }
              ],
              "marks": 4,
              "negativeMarks": -1,
              "isAnswered": false,
              "isMarkedForReview": false,
              "savedAnswer": null,
              "language": "ENGLISH",
              "difficulty": "MEDIUM",
              "tags": ["Mechanics", "Momentum", "Vectors"]
            },
            {
              "id": "q_phys_002",
              "questionNumber": 2,
              "type": "NUMERICAL",
              "questionText": "Calculate the electric field at a distance of 5cm from a charge of 10μC. (Answer in N/C, round to 2 decimal places)",
              "images": [],
              "options": null,
              "marks": 4,
              "negativeMarks": 0,
              "isAnswered": false,
              "isMarkedForReview": false,
              "savedAnswer": null,
              "language": "ENGLISH",
              "difficulty": "MEDIUM",
              "tags": ["Electrostatics", "Electric Field"]
            }
          ]
        }
      ],
      "canResume": true
    }
  }
}
```

**Error Responses:**

`400 Bad Request` - Already started
```json
{
  "success": false,
  "error": {
    "code": "TEST_ALREADY_STARTED",
    "message": "You have already started this test. Resume your attempt.",
    "details": {
      "attemptId": "attempt_xyz789"
    }
  },
  "timestamp": "2024-12-14T10:30:00Z"
}
```

`403 Forbidden` - Payment required
```json
{
  "success": false,
  "error": {
    "code": "PAYMENT_REQUIRED",
    "message": "This is a paid test. Please complete payment to start."
  },
  "timestamp": "2024-12-14T10:30:00Z"
}
```

---

### 3.2 Save Answer

Save user's answer to a question.

**Endpoint:** `POST /attempts/:attemptId/answers`  
**Authentication:** Required

**URL Parameters:**
- `attemptId`: Test attempt identifier

**Request Body (MCQ):**
```json
{
  "questionId": "q_phys_001",
  "answer": {
    "selectedOptions": ["opt_001_a"]
  },
  "isMarkedForReview": false,
  "timeSpent": 120
}
```

**Request Body (NUMERICAL):**
```json
{
  "questionId": "q_phys_002",
  "answer": {
    "numericalAnswer": 3.6e6
  },
  "isMarkedForReview": true,
  "timeSpent": 180
}
```

**Field Details:**
- `questionId`: Required
- `answer`: Required, object with `selectedOptions` (array) OR `numericalAnswer` (number)
- `isMarkedForReview`: Optional, boolean (default: false)
- `timeSpent`: Optional, integer (seconds spent on question)

**Success Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "saved": true,
    "questionStatus": "ANSWERED"
  }
}
```

**Error Response:** `400 Bad Request`
```json
{
  "success": false,
  "error": {
    "code": "ATTEMPT_ALREADY_SUBMITTED",
    "message": "Cannot modify answers for a submitted attempt"
  },
  "timestamp": "2024-12-14T10:30:00Z"
}
```

---

### 3.3 Get Attempt Status

Retrieve current status of test attempt.

**Endpoint:** `GET /attempts/:attemptId/status`  
**Authentication:** Required

**URL Parameters:**
- `attemptId`: Test attempt identifier

**Success Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "attemptId": "attempt_xyz789",
    "testId": "test_abc123",
    "userId": "usr_7xk2m9p4q1",
    "status": "IN_PROGRESS",
    "startTime": "2024-12-14T10:30:00Z",
    "endTime": "2024-12-14T13:30:00Z",
    "remainingTime": 5400,
    "currentSection": {
      "sectionId": "sec_phys1",
      "name": "Physics",
      "remainingTime": 1800
    },
    "progress": {
      "totalQuestions": 75,
      "answeredCount": 25,
      "notAnsweredCount": 10,
      "markedForReviewCount": 5,
      "answeredAndMarkedCount": 3,
      "notVisitedCount": 32
    },
    "answers": {
      "q_phys_001": {
        "selectedOptions": ["opt_001_a"],
        "isMarkedForReview": false,
        "timeSpent": 120,
        "answeredAt": "2024-12-14T10:32:00Z"
      }
    }
  }
}
```

---

### 3.4 Submit Test

Submit test attempt for evaluation.

**Endpoint:** `POST /attempts/:attemptId/submit`  
**Authentication:** Required

**URL Parameters:**
- `attemptId`: Test attempt identifier

**Success Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "attemptId": "attempt_xyz789",
    "status": "SUBMITTED",
    "submittedAt": "2024-12-14T11:45:00Z",
    "resultId": "result_pqr456"
  }
}
```

**Error Response:** `400 Bad Request`
```json
{
  "success": false,
  "error": {
    "code": "ATTEMPT_ALREADY_SUBMITTED",
    "message": "This attempt has already been submitted"
  },
  "timestamp": "2024-12-14T10:30:00Z"
}
```

---

## 4. Results & Analytics

### 4.1 Get Test Result

Retrieve detailed results for a submitted test attempt.

**Endpoint:** `GET /results/:attemptId`  
**Authentication:** Required

**URL Parameters:**
- `attemptId`: Test attempt identifier

**Success Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "result": {
      "attemptId": "attempt_xyz789",
      "testId": "test_abc123",
      "testTitle": "JEE Main 2024 Mock Test 15",
      "userId": "usr_7xk2m9p4q1",
      "score": 156,
      "totalMarks": 300,
      "percentage": 52.00,
      "rank": 450,
      "totalAttempts": 2340,
      "percentile": 80.77,
      "timeTaken": 165,
      "startedAt": "2024-12-14T10:30:00Z",
      "submittedAt": "2024-12-14T13:15:00Z",
      "sectionWise": [
        {
          "sectionId": "sec_phys1",
          "sectionName": "Physics",
          "subject": "PHYSICS",
          "score": 52,
          "totalMarks": 100,
          "accuracy": 65.0,
          "correctAnswers": 14,
          "incorrectAnswers": 3,
          "unattempted": 8,
          "timeTaken": 3300
        },
        {
          "sectionId": "sec_chem1",
          "sectionName": "Chemistry",
          "subject": "CHEMISTRY",
          "score": 48,
          "totalMarks": 100,
          "accuracy": 60.0,
          "correctAnswers": 13,
          "incorrectAnswers": 4,
          "unattempted": 8,
          "timeTaken": 3200
        },
        {
          "sectionId": "sec_math1",
          "sectionName": "Mathematics",
          "subject": "MATHEMATICS",
          "score": 56,
          "totalMarks": 100,
          "accuracy": 70.0,
          "correctAnswers": 15,
          "incorrectAnswers": 2,
          "unattempted": 8,
          "timeTaken": 3400
        }
      ],
      "subjectWise": [
        {
          "subject": "PHYSICS",
          "score": 52,
          "totalMarks": 100,
          "accuracy": 65.0,
          "correctAnswers": 14,
          "incorrectAnswers": 3,
          "unattempted": 8,
          "timeTaken": 3300
        }
      ],
      "difficultyWise": {
        "easy": {
          "correct": 12,
          "incorrect": 1,
          "unattempted": 2,
          "accuracy": 92.3
        },
        "medium": {
          "correct": 22,
          "incorrect": 6,
          "unattempted": 12,
          "accuracy": 78.6
        },
        "hard": {
          "correct": 8,
          "incorrect": 2,
          "unattempted": 10,
          "accuracy": 80.0
        }
      },
      "speedAccuracy": {
        "speed": 0.454,
        "accuracy": 77.78
      },
      "comparison": {
        "averageScore": 125.5,
        "topperScore": 295,
        "yourScore": 156
      },
      "topicWise": [
        {
          "topic": "Mechanics",
          "subject": "PHYSICS",
          "correct": 8,
          "incorrect": 1,
          "unattempted": 1,
          "accuracy": 88.9
        }
      ]
    }
  }
}
```

---

### 4.2 Get Answer Key & Solutions

Retrieve detailed solutions for all questions.

**Endpoint:** `GET /results/:attemptId/solutions`  
**Authentication:** Required

**URL Parameters:**
- `attemptId`: Test attempt identifier

**Success Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "solutions": [
      {
        "questionId": "q_phys_001",
        "questionNumber": 1,
        "questionText": "A particle of mass 2kg is moving with velocity $\\vec{v} = 3\\hat{i} + 4\\hat{j}$ m/s.",
        "type": "MCQ_SINGLE",
        "correctAnswer": {
          "selectedOptions": ["opt_001_a"]
        },
        "userAnswer": {
          "selectedOptions": ["opt_001_a"]
        },
        "isCorrect": true,
        "marksAwarded": 4,
        "solution": "<p>Momentum = mass × velocity</p><p>Magnitude = $m\\sqrt{v_x^2 + v_y^2} = 2\\sqrt{9+16} = 10$ kg·m/s</p>",
        "solutionVideo": "https://cdn.testportal.com/solutions/q_phys_001.mp4",
        "difficulty": "MEDIUM",
        "tags": ["Mechanics", "Momentum"],
        "timeSpent": 120
      },
      {
        "questionId": "q_phys_002",
        "questionNumber": 2,
        "questionText": "Calculate the electric field...",
        "type": "NUMERICAL",
        "correctAnswer": {
          "numericalAnswer": 3600000,
          "tolerance": 1000
        },
        "userAnswer": {
          "numericalAnswer": 3620000
        },
        "isCorrect": true,
        "marksAwarded": 4,
        "solution": "<p>Using formula: $E = \\frac{kq}{r^2}$</p>",
        "solutionVideo": null,
        "difficulty": "MEDIUM",
        "tags": ["Electrostatics"],
        "timeSpent": 180
      }
    ]
  }
}
```

---

### 4.3 Get User Analytics

Retrieve comprehensive performance analytics.

**Endpoint:** `GET /analytics/user`  
**Authentication:** Required

**Query Parameters:**
- `period`: `week | month | year | all` (default: all)

**Success Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "analytics": {
      "totalTests": 45,
      "averageScore": 245.5,
      "averagePercentile": 78.5,
      "bestRank": 123,
      "totalStudyHours": 450,
      "strengths": ["Calculus", "Mechanics", "Organic Chemistry"],
      "weaknesses": ["Thermodynamics", "Probability", "Atomic Structure"],
      "subjectWise": [
        {
          "subject": "PHYSICS",
          "testsAttempted": 15,
          "averageScore": 68.5,
          "accuracy": 70.2,
          "timeSpent": 32400,
          "trend": "IMPROVING"
        },
        {
          "subject": "CHEMISTRY",
          "testsAttempted": 15,
          "averageScore": 72.3,
          "accuracy": 75.8,
          "timeSpent": 29700,
          "trend": "STABLE"
        },
        {
          "subject": "MATHEMATICS",
          "testsAttempted": 15,
          "averageScore": 75.1,
          "accuracy": 78.5,
          "timeSpent": 35100,
          "trend": "IMPROVING"
        }
      ],
      "progressChart": [
        {
          "date": "2024-12-01",
          "score": 220,
          "percentile": 75.5,
          "rank": 450
        },
        {
          "date": "2024-12-05",
          "score": 235,
          "percentile": 78.2,
          "rank": 380
        },
        {
          "date": "2024-12-10",
          "score": 265,
          "percentile": 85.1,
          "rank": 280
        }
      ],
      "topicWise": [
        {
          "topic": "Calculus",
          "subject": "MATHEMATICS",
          "questionsAttempted": 150,
          "accuracy": 85.5,
          "averageTime": 120,
          "strength": "HIGH"
        },
        {
          "topic": "Thermodynamics",
          "subject": "PHYSICS",
          "questionsAttempted": 120,
          "accuracy": 55.2,
          "averageTime": 150,
          "strength": "LOW"
        }
      ],
      "recentTests": [
        {
          "testId": "test_abc123",
          "testTitle": "JEE Main Mock 15",
          "score": 265,
          "rank": 150,
          "percentile": 88.5,
          "completedAt": "2024-12-10T14:30:00Z"
        }
      ],
      "averageTimePerQuestion": 135,
      "mostAttemptedSubject": "PHYSICS",
      "leastAttemptedSubject": "BIOLOGY"
    }
  }
}
```

---

## 5. Dashboard & History

### 5.1 Get Dashboard Stats

Retrieve user dashboard statistics and data.

**Endpoint:** `GET /dashboard/stats`  
**Authentication:** Required

**Success Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "stats": {
      "todayStudyTime": 120,
      "weekStudyTime": 650,
      "monthStudyTime": 2400,
      "testsThisWeek": 5,
      "testsThisMonth": 18,
      "averageScoreThisWeek": 245.5,
      "averageScoreThisMonth": 238.2,
      "bestRankThisWeek": 123,
      "bestRankThisMonth": 85,
      "upcomingTests": [
        {
          "testId": "test_def456",
          "title": "JEE Advanced 2024 Mock Test 5",
          "examType": "JEE_ADVANCED",
          "scheduledAt": "2024-12-20T09:00:00Z",
          "duration": 180,
          "totalQuestions": 54,
          "isRegistered": true,
          "thumbnail": "https://cdn.testportal.com/thumbnails/test_def456.jpg"
        }
      ],
      "recentActivity": [
        {
          "type": "TEST_COMPLETED",
          "testId": "test_abc123",
          "testTitle": "JEE Main Mock 15",
          "score": 265,
          "rank": 150,
          "timestamp": "2024-12-14T13:15:00Z"
        },
        {
          "type": "TEST_STARTED",
          "testId": "test_ghi789",
          "testTitle": "NEET Mock Test 8",
          "timestamp": "2024-12-13T10:30:00Z"
        }
      ],
      "recommendations": [
        {
          "testId": "test_jkl012",
          "title": "Physics Advanced Topics Test",
          "reason": "Based on your performance in Physics",
          "thumbnail": "https://cdn.testportal.com/thumbnails/test_jkl012.jpg"
        }
      ],
      "currentStreak": 7,
      "longestStreak": 15,
      "totalTestsCompleted": 45
    }
  }
}
```

---

### 5.2 Get Test History

Retrieve user's test attempt history.

**Endpoint:** `GET /history`  
**Authentication:** Required

**Query Parameters:**
- `page`: number (default: 1)
- `limit`: number (default: 20)
- `examType`: filter by exam type
- `status`: `IN_PROGRESS | SUBMITTED | EXPIRED`

**Success Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "attempts": [
      {
        "attemptId": "attempt_xyz789",
        "test": {
          "id": "test_abc123",
          "title": "JEE Main 2024 Mock Test 15",
          "examType": "JEE_MAIN",
          "testType": "MOCK",
          "duration": 180,
          "totalQuestions": 75,
          "thumbnail": "https://cdn.testportal.com/thumbnails/test_abc123.jpg"
        },
        "status": "SUBMITTED",
        "score": 265,
        "totalMarks": 300,
        "percentage": 88.33,
        "rank": 150,
        "percentile": 93.6,
        "timeTaken": 165,
        "startedAt": "2024-12-10T10:30:00Z",
        "completedAt": "2024-12-10T13:15:00Z"
      },
      {
        "attemptId": "attempt_mno345",
        "test": {
          "id": "test_def456",
          "title": "NEET Mock Test 8",
          "examType": "NEET",
          "testType": "MOCK",
          "duration": 180,
          "totalQuestions": 180,
          "thumbnail": "https://cdn.testportal.com/thumbnails/test_def456.jpg"
        },
        "status": "IN_PROGRESS",
        "score": null,
        "totalMarks": 720,
        "percentage": null,
        "rank": null,
        "percentile": null,
        "timeTaken": null,
        "startedAt": "2024-12-14T09:00:00Z",
        "completedAt": null
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 3,
      "totalAttempts": 45,
      "pageSize": 20,
      "hasNext": true,
      "hasPrevious": false
    }
  }
}
```

---

## 6. Leaderboard (Optional)

### 6.1 Get Test Leaderboard

Retrieve test-specific leaderboard.

**Endpoint:** `GET /tests/:testId/leaderboard`  
**Authentication:** Required

**URL Parameters:**
- `testId`: Test identifier

**Query Parameters:**
- `page`: number (default: 1)
- `limit`: number (default: 50)

**Success Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "leaderboard": {
      "testId": "test_abc123",
      "testTitle": "JEE Main 2024 Mock Test 15",
      "totalParticipants": 2340,
      "topRankers": [
        {
          "rank": 1,
          "userId": "usr_topranker1",
          "userName": "Aditya Verma",
          "profilePicture": "https://cdn.testportal.com/avatars/usr_topranker1.jpg",
          "score": 295,
          "percentage": 98.33,
          "timeTaken": 170,
          "accuracy": 98.7
        },
        {
          "rank": 2,
          "userId": "usr_topranker2",
          "userName": "Priya Sharma",
          "profilePicture": "https://cdn.testportal.com/avatars/usr_topranker2.jpg",
          "score": 290,
          "percentage": 96.67,
          "timeTaken": 165,
          "accuracy": 96.5
        }
      ],
      "yourRank": {
        "rank": 450,
        "userId": "usr_7xk2m9p4q1",
        "userName": "Rahul Sharma",
        "profilePicture": "https://cdn.testportal.com/avatars/usr_7xk2m9p4q1.jpg",
        "score": 156,
        "percentage": 52.00,
        "timeTaken": 165,
        "accuracy": 77.8
      }
    },
    "pagination": {
      "currentPage": 1,
      "totalPages": 47,
      "pageSize": 50,
      "hasNext": true,
      "hasPrevious": false
    }
  }
}
```

---

## Data Models

### User Model
```typescript
{
  id: string;
  name: string;
  email: string;
  phone: string;
  profilePicture: string;
  dateOfBirth: string; // YYYY-MM-DD
  examTargets: ExamType[];
  targetYear: number;
  role: "STUDENT" | "ADMIN";
  isEmailVerified: boolean;
  stats: {
    testsAttempted: number;
    averageScore: number;
    bestRank: number;
    totalStudyHours: number;
  };
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
}
```

### Test Model
```typescript
{
  id: string;
  title: string;
  description: string;
  examType: ExamType;
  testType: TestType;
  difficulty: Difficulty;
  duration: number; // minutes
  totalMarks: number;
  totalQuestions: number;
  subjects: Subject[];
  thumbnail: string; // URL
  scheduledAt: string | null; // ISO 8601
  startTime: string | null; // ISO 8601
  endTime: string | null; // ISO 8601
  status: TestStatus;
  isPaid: boolean;
  price: number;
 instructions: string; // HTML
  sections: Section[];
  markingScheme: MarkingScheme;
  syllabus: string[];
  prerequisites: string;
  attemptCount: number;
  isAttempted: boolean;
  userAttempts: UserAttempt[];
  stats: TestStats;
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
}
```

### Question Model
```typescript
{
  id: string;
  questionNumber: number;
  type: QuestionType;
  questionText: string; // Supports LaTeX
  images: string[]; // URLs
  options: Option[] | null; // For MCQ
  marks: number;
  negativeMarks: number;
  isAnswered: boolean;
  isMarkedForReview: boolean;
  savedAnswer: Answer | null;
  language: "ENGLISH" | "HINDI";
  difficulty: Difficulty;
  tags: string[];
}
```

---

## Error Handling

### Standard Error Response Format
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {} // Optional additional context
  },
  "timestamp": "2024-12-14T10:30:00Z"
}
```

### Error Codes Reference

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `UNAUTHORIZED` | 401 | Missing or invalid authentication token |
| `FORBIDDEN` | 403 | User lacks required permissions |
| `NOT_FOUND` | 404 | Requested resource doesn't exist |
| `VALIDATION_ERROR` | 400 | Request validation failed |
| `DUPLICATE_ENTRY` | 409 | Resource already exists |
| `TEST_NOT_FOUND` | 404 | Test ID doesn't exist |
| `TEST_ALREADY_STARTED` | 400 | User has active attempt |
| `TEST_EXPIRED` | 400 | Test time limit exceeded |
| `ATTEMPT_NOT_FOUND` | 404 | Attempt ID doesn't exist |
| `ATTEMPT_ALREADY_SUBMITTED` | 400 | Cannot modify submitted attempt |
| `INVALID_CREDENTIALS` | 401 | Login failed |
| `EMAIL_EXISTS` | 409 | Email already registered |
| `PAYMENT_REQUIRED` | 403 | Paid test not purchased |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests |
| `INTERNAL_ERROR` | 500 | Server error |
| `SERVICE_UNAVAILABLE` | 503 | Temporary service issue |

---

## Best Practices

### 1. LaTeX Content
- Store LaTeX content as-is in database
- Use delimiters: `$inline math$` or `$$display math$$`
- Don't convert to HTML on backend
- Client renders with KaTeX

**Example:**
```
"questionText": "Calculate $\\frac{d}{dx}(x^2 + 3x)$"
```

### 2. Timestamps
- Always use UTC timezone
- Store as ISO 8601 format
- Include timezone indicator (Z)

**Example:**
```
"createdAt": "2024-12-14T10:30:00Z"
```

### 3. Pagination
- Include full pagination metadata
- Support `page` and `limit` params
- Default limit: 20, max: 100

**Example Response:**
```json
{
  "pagination": {
    "currentPage": 1,
    "totalPages": 10,
    "totalItems": 200,
    "pageSize": 20,
    "hasNext": true,
    "hasPrevious": false
  }
}
```

### 4. File Uploads
- Max size: 5MB for profile pictures
- Allowed formats: jpg, png, webp
- Return CDN URL in response
- Generate optimized versions (thumbnails)

### 5. Rate Limiting
- General: 100 requests/minute per user
- Answer saves: 10 requests/minute
- Login attempts: 5 per 15 minutes
- Return `429` with `Retry-After` header

### 6. Caching Strategy
- Test list: Cache for 5 minutes
- Test details: Cache for 10 minutes
- User profile: Cache for 1 hour
- Results: Cache for 24 hours
- Leaderboard: Cache for 1 minute

### 7. Security
- Validate all inputs
- Sanitize HTML content
- Use parameterized queries
- Hash passwords (bcrypt, min 10 rounds)
- Implement CORS properly
- Use HTTPS only in production
- Rotate JWT secrets regularly

---

## Integration Guide

### Step 1: Environment Setup
```bash
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
NEXT_PUBLIC_WS_URL=ws://localhost:8000/api/v1/ws
```

### Step 2: API Client Configuration
The frontend uses Axios with interceptors. Backend should:
- Accept `Authorization: Bearer <token>`
- Return errors in standard format
- Support CORS from frontend domain

### Step 3: Authentication Flow
1. User logs in → Backend returns tokens
2. Frontend stores in localStorage
3. All requests include `Authorization` header
4. On 401 error, attempt refresh
5. On refresh fail, redirect to login

### Step 4: Test Flow
1. User starts test → `POST /tests/:id/start`
2. Backend creates attempt, returns questions
3. User answers → `POST /attempts/:id/answers`
4. Periodic status checks → `GET /attempts/:id/status`
5. Submit → `POST /attempts/:id/submit`
6. View results → `GET /results/:attemptId`

### Step 5: WebSocket (Future)
For real-time features:
```javascript
ws://api.testportal.com/v1/ws?token=<jwt_token>

// Messages
{
  "type": "TIME_UPDATE",
  "data": { "remainingTime": 5400 }
}
```

---

## Testing Checklist

Backend team should test:

- [ ] All endpoints return proper status codes
- [ ] Authentication works (login/register/refresh)
- [ ] Token validation and expiry
- [ ] Pagination works correctly
- [ ] Filtering and search work
- [ ] LaTeX content preserved
- [ ] File uploads work (size limits, formats)
- [ ] Error messages are clear
- [ ] Rate limiting enforced
- [ ] CORS configured
- [ ] SQL injection prevented
- [ ] XSS protection (HTML sanitization)
- [ ] Input validation on all fields
- [ ] DateTime handling (UTC)
- [ ] Concurrent answer saves
- [ ] Auto-submit on time expiry
- [ ] Leaderboard calculations
- [ ] Analytics aggregations

---

## Support & Questions

For questions or clarifications:
- **Frontend Team Lead**: [Your Name]
- **Documentation Issues**: Create GitHub issue
- **API Changes**: Submit PR to this document

---

**Document End**

_This specification is a living document and will be updated as the API evolves._
