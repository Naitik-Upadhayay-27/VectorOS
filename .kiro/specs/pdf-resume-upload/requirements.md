# Requirements Document

## Introduction

This feature adds PDF resume upload and auto-fill to the onboarding flow. When a user selects "Upload Resume" in Step 1 of onboarding, they pick a PDF file. The backend extracts the raw text using `pdf-parse`, sends it to Gemini (`gemini-2.5-flash-lite`) with a strict JSON schema prompt, validates the response with Zod, and returns structured resume data. The frontend resets the `templateResumeStore` with the parsed data so the live template preview updates instantly. The raw extracted text is also stored in a Zustand store so the chat panel can pass it as `resumeContext` to `/api/ai/chat`.

No new pages or complex pipelines are introduced. The implementation wires up the existing upload button, existing backend AI routes pattern, existing store, and existing chat context mechanism.

---

## Glossary

- **PDF_Parser**: The backend service that uses `pdf-parse` to extract plain text from an uploaded PDF file.
- **Resume_Extractor**: The backend service that sends extracted text to Gemini and receives structured JSON conforming to the resume schema.
- **Resume_Validator**: The Zod-based validation layer that ensures the Gemini response matches the expected schema before returning it to the frontend.
- **Upload_Endpoint**: The Express route `POST /api/resume/parse` that accepts a PDF file upload and returns structured resume JSON.
- **Resume_Store**: The frontend `templateResumeStore` Zustand store that holds the structured resume data driving the live template preview.
- **Resume_Context_Store**: The frontend `resumeUploadStore` Zustand store that holds the raw extracted resume text for use as chat context.
- **Chat_Panel**: The `ChatPanel.tsx` component that sends messages and `resumeContext` to `/api/ai/chat`.
- **Onboarding_Flow**: The multi-step onboarding modal (`OnboardingFlow.tsx`) where Step 1 presents the upload or scratch choice.
- **TemplateResumeData**: The TypeScript interface defining the full resume schema: `personalInfo`, `summary`, `experience`, `education`, `skills`, `projects`, `certificates`, `awards`, `languages`, `volunteer`.

---

## Requirements

### Requirement 1: PDF File Upload Trigger

**User Story:** As a new user, I want to upload my existing PDF resume in Step 1 of onboarding, so that I don't have to manually re-enter all my information.

#### Acceptance Criteria

1. WHEN a user clicks the "Upload Resume" button in `StepStart`, THE `Onboarding_Flow` SHALL open a file picker restricted to `.pdf` files only.
2. WHEN a user selects a `.pdf` file, THE `Onboarding_Flow` SHALL display a loading indicator and disable further interaction with the upload button until parsing completes.
3. IF a user selects a file that is not a `.pdf`, THEN THE `Onboarding_Flow` SHALL display an inline error message stating the file type is not supported and SHALL NOT proceed with the upload.
4. IF the selected PDF file exceeds 10 MB, THEN THE `Onboarding_Flow` SHALL display an inline error message stating the file is too large and SHALL NOT proceed with the upload.

---

### Requirement 2: Backend PDF Text Extraction

**User Story:** As a developer, I want the backend to extract plain text from uploaded PDFs, so that the text can be sent to Gemini for structured parsing.

#### Acceptance Criteria

1. WHEN a PDF file is received at `POST /api/resume/parse`, THE `PDF_Parser` SHALL extract all readable plain text from the file using `pdf-parse`.
2. WHEN the PDF contains no extractable text (e.g., a scanned image-only PDF), THE `PDF_Parser` SHALL return a 422 response with the message `"No readable text found in PDF"`.
3. IF `pdf-parse` throws an error during extraction, THEN THE `Upload_Endpoint` SHALL return a 500 response with a descriptive error message and SHALL NOT forward the request to Gemini.
4. THE `Upload_Endpoint` SHALL accept multipart form-data with a single field named `resume` containing the PDF file.
5. THE `Upload_Endpoint` SHALL limit accepted file size to 10 MB and return a 413 response if the limit is exceeded.

---

### Requirement 3: Gemini Structured Resume Parsing

**User Story:** As a developer, I want the backend to use Gemini to map extracted PDF text to a strict resume JSON schema, so that the frontend can auto-fill the resume store without additional transformation.

#### Acceptance Criteria

1. WHEN extracted text is available, THE `Resume_Extractor` SHALL send the text to Gemini (`gemini-2.5-flash-lite`) with a prompt that instructs it to return ONLY valid JSON conforming to the `TemplateResumeData` schema.
2. THE `Resume_Extractor` SHALL include the full target JSON schema in the prompt so Gemini can map fields accurately.
3. WHEN Gemini returns a response, THE `Resume_Extractor` SHALL strip any markdown code fences (` ```json ` / ` ``` `) before parsing.
4. IF Gemini returns a response that cannot be parsed as JSON, THEN THE `Resume_Extractor` SHALL return a 502 response with the message `"AI returned invalid JSON"`.
5. FOR ALL valid resume texts, parsing the same text twice with the same prompt SHALL produce structurally equivalent JSON objects (same top-level keys present).

---

### Requirement 4: Zod Schema Validation

**User Story:** As a developer, I want the Gemini response validated against the resume schema before it reaches the frontend, so that the frontend store is never populated with malformed data.

#### Acceptance Criteria

1. WHEN Gemini returns parsed JSON, THE `Resume_Validator` SHALL validate it against the `TemplateResumeData` Zod schema.
2. WHEN validation passes, THE `Upload_Endpoint` SHALL return a 200 response containing the validated structured resume data and the raw extracted text.
3. IF validation fails, THEN THE `Resume_Validator` SHALL return a 422 response with a message listing the first validation error encountered.
4. THE `Resume_Validator` SHALL treat all fields in `TemplateResumeData` as optional so that partial resumes (e.g., missing `projects` or `awards`) pass validation without error.

---

### Requirement 5: Frontend Auto-fill of Resume Store

**User Story:** As a user, I want my uploaded resume to instantly populate the live template preview, so that I can see my real data in the chosen template without manual entry.

#### Acceptance Criteria

1. WHEN the `Upload_Endpoint` returns a 200 response, THE `Onboarding_Flow` SHALL call `useTemplateResumeStore.getState().reset(parsedData)` (or equivalent bulk-set) to replace all store data with the parsed resume.
2. WHEN the store is updated, THE `Resume_Store` SHALL reflect the new data immediately so the live template preview re-renders with the parsed content.
3. WHEN auto-fill completes, THE `Onboarding_Flow` SHALL advance to the next onboarding step (`template` step) automatically.
4. IF the `Upload_Endpoint` returns an error response, THEN THE `Onboarding_Flow` SHALL display the error message to the user and SHALL remain on the `start` step.
5. FOR ALL valid parsed resume objects, resetting the store with the same data twice SHALL produce an identical store state (idempotent reset).

---

### Requirement 6: Resume Context Store for Chat

**User Story:** As a user, I want the AI chat panel to have access to my uploaded resume content, so that it can answer specific questions about my background and give personalized advice.

#### Acceptance Criteria

1. WHEN the `Upload_Endpoint` returns a 200 response, THE `Resume_Context_Store` SHALL store the raw extracted resume text returned in the response.
2. WHEN the `Chat_Panel` sends a message, THE `Chat_Panel` SHALL read the raw resume text from `Resume_Context_Store` and include it as `resumeContext` in the request body to `POST /api/ai/chat`.
3. WHILE resume text is stored in `Resume_Context_Store`, THE `Chat_Panel` SHALL pass the same text as `resumeContext` on every subsequent message in the session.
4. THE `Resume_Context_Store` SHALL expose a `setResumeText(text: string)` action and a `resumeText` state field.
5. FOR ALL sessions where a resume has been uploaded, the `resumeContext` value passed to `/api/ai/chat` SHALL equal the text stored in `Resume_Context_Store` (no transformation or truncation by the frontend).

---

### Requirement 7: Error Handling and User Feedback

**User Story:** As a user, I want clear feedback when my resume upload fails, so that I understand what went wrong and can take corrective action.

#### Acceptance Criteria

1. WHEN the upload or parsing fails for any reason, THE `Onboarding_Flow` SHALL display a human-readable error message within the `StepStart` UI.
2. WHEN an error is displayed, THE `Onboarding_Flow` SHALL re-enable the upload button so the user can retry.
3. IF the network request to `POST /api/resume/parse` times out after 30 seconds, THEN THE `Onboarding_Flow` SHALL display the message `"Upload timed out. Please try again."`.
4. THE `Onboarding_Flow` SHALL clear any previous error message when the user initiates a new upload attempt.
