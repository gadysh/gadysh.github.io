# Security and full organizational control (data governance)

## The core principle: it runs inside your own network (self-hosted / on-premises)

PowOrg's platform is built on a simple premise: enterprise organizations can't afford to send sensitive data, customer history, or confidential documents outside their own firewall. Our architecture is designed to give you full confidence, the kind required in financial, defense, and healthcare settings.

---

## Secure internal network architecture

### 1. Runs fully inside your own network (your firewall / VPC)
* **The orchestration engine**: every AI assistant, all context handling, short and long-term memory, and the task-breakdown logic run as internal containers inside your organization's own private cloud (VPC) or on your own servers (on-premises).
* **Local connections to your core systems**: integration with your CRM (like an internal Salesforce), your ERP (like SAP), and your organizational databases (PostgreSQL, SQL Server) all happen strictly inside your internal network. No data from your databases leaves for processing or search elsewhere.

### 2. A private language-model connection (the one and only exit point)
* **A private, secured channel**: the only connection leaving your organization's network is to the language model itself, through a private VPN, Google Cloud's Private Service Connect (for Vertex AI), or the equivalent private connections on AWS and Azure, depending on your cloud environment.
* **Enterprise-grade security**: we work exclusively with dedicated enterprise-tier models. The platform currently runs fully on Google Cloud's Vertex AI, while staying flexible enough to work with any of the major cloud providers (Google, Amazon, Microsoft) depending on your organization's own cloud environment. Model providers commit, contractually and technically, to:
  * **Zero data retention**: requests and responses are not stored on the provider's servers.
  * **No training on your data, ever**: your organization's information is never used to train external models, under any circumstance.

---

## Built-in protection mechanisms

### 1. A data-masking layer
Before any internal query is sent to the language model, the engine performs local anonymization:
* Automatic detection of personal information (ID numbers, email addresses, phone numbers).
* Masking of credit card numbers and other sensitive financial data.
* Data is replaced with anonymous internal tokens, and restored only once the response comes back inside your organization's network.

### 2. A smart local cache
* A local memory layer that stores common queries and approved answers.
* Avoids sending the same data out repeatedly, cutting API costs by up to 40% and minimizing exposure to the outside network.

### 3. Access control and identity management
* Native, local integration with your organization's existing SSO (Active Directory, Okta, Ping Identity).
* Fine-grained, role-based access control, so an AI assistant acting on behalf of a specific employee only ever sees the data that employee is allowed to see.

---

## Logging and full oversight

* **Detailed audit logs**: every action an assistant takes, every tool call, and every decision made by the orchestrator is recorded in a secure internal log.
* **SIEM integration**: logs export automatically to your organization's monitoring systems (like Splunk or Elastic), for anomaly detection, compliance review, and ongoing security monitoring.
* **Usage limits**: full support for setting budget and rate limits, so internal systems are never overloaded.

---

## Compliance

The platform is built to meet strict regulatory standards:
* **GDPR & CCPA**: full support for the right to privacy and data deletion.
* **SOC 2 Type II**: suited for deployment in environments under strict security audits.
* **Israeli Privacy Protection Authority guidelines**: full compliance with Israeli data-security regulation, including isolated data stores and preventing uncontrolled transfer of medical or personal information.

---

**Want to see the full VPC architecture diagram?** [Get in touch](../index.html#contact) to schedule a technical session with a solutions architect.
