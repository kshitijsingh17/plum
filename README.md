# AI Appointment Scheduler Backend

A Node.js/Express backend API to process appointment requests via text or images.  
Supports OCR, entity extraction, normalization, and appointment creation with guardrails for ambiguous or invalid input.

Hosted: [https://appointment-scheduler-backend-teal.vercel.app](https://appointment-scheduler-backend-teal.vercel.app)

---

## Table of Contents

- [Features](#features)  
- [API Endpoints](#api-endpoints)  
  - [Process Endpoint](#process-endpoint)  
  - [OCR Endpoint](#ocr-endpoint)  
  - [Entity Extraction Endpoint](#entity-extraction-endpoint)  
  - [Normalization Endpoint](#normalization-endpoint)  
- [Guardrails](#guardrails)  
- [Services & Controllers](#services--controllers)  
- [Technical Details](#technical-details)  
- [Setup & Deployment](#setup--deployment)  
- [License](#license)  

---

## Features

- Accepts **JSON text** or **image input** for appointment requests.  
- Performs **OCR** on images to extract text.  
- Extracts entities: department, date, and time.  
- Normalizes dates/times to ISO format.  
- Creates and persists appointments in MongoDB.  
- Includes **guardrails** for missing, ambiguous, or invalid input.  
- Hosted on **Vercel** for serverless deployment.

---

## API Endpoints

### Process Endpoint

**POST** `/api/process`  
Accepts JSON text or image and returns a structured appointment.

**Example: JSON Input**
```bash
curl -X POST https://appointment-scheduler-backend-teal.vercel.app/api/process \
-H "Content-Type: application/json" \
-d '{"input": "Book dentist next Friday at 3pm"}'
