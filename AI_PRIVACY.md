# SAUCER AI — PRIVACY, DATA PROCESSING & TERMS DISCLOSURE

This document provides the mandatory legal and privacy disclosure regarding **Google's Unpaid API Service Data Processing Terms** and outlines the customer-facing privacy safeguards for **Saucer AI**.

---

## 1. Legal Review: Google AI Studio Unpaid Service Terms

When using the **Google Gemini API** through **Google AI Studio without paid billing enabled**, the service operates under Google's standard Unpaid Services Terms of Service.

### 1.1 The Critical Distinction: Paid vs. Unpaid Data Handling
- **Paid Tier (Google Cloud Vertex AI / Billed AI Studio)**: Google commits that customer data is not used for model training, is not logged for human review, and complies with enterprise confidentiality agreements.
- **Unpaid Tier (Google AI Studio Free API)**: Google's terms explicitly state that:
  1. **Data May Be Reviewed by Humans**: Prompts, input text, uploaded media, and generated outputs may be sampled and reviewed by trained human reviewers to improve service quality.
  2. **Data Is Used for Machine Learning Training**: Google may use submitted data, prompts, and responses to train, tune, and improve Google products, services, and machine learning models.
  3. **No Enterprise Confidentiality Guarantee**: The unpaid tier does **not** provide business confidentiality, HIPAA compliance, or zero-data-retention guarantees.

> [!WARNING]
> Because Saucer operates strictly on Google's unpaid free tier with zero budget, **Saucer AI must never be advertised or described as confidential, private, or suitable for sensitive enterprise data**.

---

## 2. Customer-Facing Disclosure Requirements

Saucer must be completely transparent with users. Customers must understand how their prompts are processed before they submit content to Saucer AI.

### 2.1 In-App Modal Disclosure Banner
Whenever a user opens the Saucer AI Content Studio or invokes the in-editor rewrite tool, a prominent, permanent disclosure banner is rendered at the base of the interface:

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│ ℹ️ Saucer AI Privacy Notice                                                      │
│ Saucer AI is powered by Google's free-tier Gemini API. To keep this feature free,│
│ prompts and generated content may be processed by Google to improve its models.  │
│ Please do not submit confidential information, passwords, personal data, or      │
│ trade secrets.                                                                   │
└──────────────────────────────────────────────────────────────────────────────────┘
```

### 2.2 First-Time User Consent Acknowledgment
Before a user can execute their first AI generation on Saucer, a one-time acknowledgment modal is displayed:

> **Welcome to Saucer AI**  
> Saucer provides AI-powered social media generation free of charge using Google's public AI tier.  
> 
> By proceeding, you acknowledge that:
> - You will not submit sensitive personal data (PII), proprietary business secrets, or regulated information.
> - Data submitted to the AI assistant is processed in accordance with [Google's Terms of Service](https://policies.google.com/terms).
> - Saucer is not liable for proprietary information submitted to public AI models.
> 
> `[ x ] I understand and agree to the AI usage terms`  
> `[ Button: Enable Saucer AI ]`

The user's acceptance is recorded in the `User` table as `aiTermsAcceptedAt: DateTime`.

---

## 3. Data Sanitization & Pre-Processing Safeguards

To actively reduce accidental transmission of sensitive data:
1. **No Workspace Metadata Ingestion**: Saucer's AI system prompts strictly pass the user's specific text prompt or topic. The backend **never** passes internal database IDs, user email addresses, API tokens, organization names, or customer payment identifiers to the LLM.
2. **Account Token Stripping**: If a user attempts to include OAuth tokens or environment strings in a prompt, server-side regex filters sanitize common token formats (`sk_...`, `ey...`, `ghp_...`) before dispatch.
3. **Opt-Out Control**: Workspace administrators can disable Saucer AI for their entire workspace in **Settings > Organization > AI Controls**, ensuring enterprise teams with strict compliance policies can prevent team members from using public models.

---

## 4. Master Terms of Service Addition

The following clause must be incorporated into Saucer's commercial Terms of Service:

> **Section 9: AI Services & Third-Party Processing**  
> *"Saucer offers artificial intelligence features ('Saucer AI') powered by third-party model providers, including Google AI Studio's unpaid service tier. You acknowledge that Saucer does not own or operate these underlying models. When using Saucer AI, you agree not to submit any confidential, proprietary, or regulated data (including Protected Health Information or payment card data). You acknowledge that content submitted to free-tier AI services may be utilized by the upstream provider in accordance with their applicable terms. Saucer disclaims all liability arising from the disclosure of confidential information submitted to AI features in violation of these terms."*

