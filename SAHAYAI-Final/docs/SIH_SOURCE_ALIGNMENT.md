# SAHAYAI AI — SIH Deck to Prototype Alignment

The final prototype was aligned to the submitted 8-page SIH 2026 SAHAYAI deck while preserving the expanded SAHAYAI AI concept.

## Core flow carried into the prototype

1. User selects a service / reports a problem.
2. User can provide text, voice and photo evidence.
3. AI analyses the report and estimates issue, severity, safety and indicative cost.
4. Low-risk cases can receive safe guidance; higher-risk cases are routed to professional help.
5. Nearby workers can be discovered using skill, rating, distance and availability.
6. User can select/book a worker and track the service.
7. Worker can receive commercial or government opportunities and accept them.
8. Government can manage civic incidents, route them to departments and verify resolution.
9. Digital Twin / Village Brain extends the same workflow into infrastructure intelligence and prediction.

## Technology mapping

- Frontend: React + Vite + responsive web UI
- Backend: Node.js + Express REST API
- AI: multimodal text + image analysis through configurable OpenAI Responses API
- Voice: browser SpeechRecognition + SpeechSynthesis fallback
- State: localStorage + in-memory API demo data
- Production path: PostgreSQL, object storage, maps/GIS, authentication and notifications

## SIH deck concepts represented

- AI-assisted household/service diagnosis
- Photo/voice/text input
- Safety classification
- Indicative cost range
- Verified/rated skilled workers
- Worker application/acceptance flow
- Admin/government dashboard
- Service monitoring and resolution verification
- Rural/low-connectivity friendly UX direction
- Skill-development/workforce ecosystem direction
- Analytics and future Digital Twin/predictive layer

## Important demo note

The prototype is intentionally runnable without an API key using deterministic demo AI. When `OPENAI_API_KEY` is configured on the server, the report analyzer sends the actual image (when provided) and text to the configured multimodal model for live analysis.
