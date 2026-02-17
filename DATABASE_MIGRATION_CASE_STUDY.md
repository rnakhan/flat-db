# Postponing Database Decisions: A Case Study in Agile Architecture

This document outlines the motivation, execution, and benefits of deferring concrete database decisions in early-stage application development, using a React application as a case study. We evolved a simple in-memory Todo app into a multi-relational application backed by CSV files, and eventually performed a seamless, single-prompt migration to Cloud Firestore.

## The Motivation: Why Defer Database Choice?

At the nascent stages of application development, the complete shape of the data is rarely known. Features evolve, relationships between entities shift, and new requirements rapidly emerge.

1. **Avoid Early Optimization:** Choosing a rigid database technology (SQL or NoSQL) too early forces the developer to make assumptions about data structures that will likely change.
2. **Feature Agility:** Relational schemas and database migrations can slow down iteration. A simple file-based data layer allows the developer to rapidly add features and change "schemas" by simply adding columns or files.
3. **Reduced Cognitive Load:** Without needing to manage connection pools, ORMs, or local database daemons, developers can focus purely on business logic and the user interface.

By accepting that the first database is just a "draft," developers can rapidly build out the application until the schema naturally reveals itself. Once the application's features are nearly complete, an informed decision can be made on the Production database to adopt.

---

## How We Accomplished This

We executed this philosophy through a sequence of steps, directly visible in our Git history:

### Phase 1: The Vanilla Prototype
- **Commit `6736302` (Basic in memory TODO React app):**
  The application began as a simple React application with in-memory state. This allowed for immediate validation of the core UI components without any persistence layer complexity.

### Phase 2: The Temporary Database Strategy
- **Commit `b2c9e41` (Added a new skill for temporary CSV database):**
  We introduced the `temporary-csv-db` skill. Inspired by OpenCSV, this skill provides the AI agent with a protocol for utilizing simple CSV files as a local persistency layer.
- **Commit `1648902` (Using new CSV skill):**
  Instead of defaulting to `localStorage`, the application was prompted to use a more robust, file-backed local persistence. The agent utilized the new CSV skill to generate a Node.js/Express backend reading from and writing to `server/db.csv`.

### Phase 3: Iterative Feature Expansion
Because the "database" was merely a set of CSV files, adding entire new relational concepts in subsequent prompts was trivial, with zero need for complex database migration scripts:
- **Commit `0f057dc` (Added User "table" and upgraded the app to use task assignment to users):**
  A `users.csv` file was effortlessly added, and relations were established.
- **Commit `bd7b17a` (feat: implement priority management with dedicated UI, context, and API endpoints, and link priorities to todo items):**
  A `priorities.csv` file was naturally incorporated into the data strategy. The schema evolved organically based on the immediate needs of the UI.

### Phase 4: The Final Migration to Cloud
Once the application was feature-complete and the schema was well-understood, it was time to move to an enterprise-grade database. We chose Firebase Firestore.
- **Commit `0043516` (feat: add skill documentation for migrating CSV data to Firestore):**
  A new AI skill (`migrate-csv-firestore`) was created  detailing the steps to migrate our specific CSV flavor directly into a NoSQL environment.
- **Commit `c8a1580` & `629bef2` (Migration commit after agent migration to Firestore / Now moved everything to the real cloud firestore):**
  Leveraging the new migration skill alongside the Firebase Model Context Protocol (MCP) server, we achieved a powerful milestone: **A single-prompt migration from CSV files to a live Google Cloud Firestore database**. The agent automatically:
  1. Spun up the new Firebase Web App config.
  2. Created a script (`scripts/migrate.js`) translating CSV records to Firestore documents.
  3. Uploaded the raw data seamlessly to the cloud.
  4. Refactored the entire React codebase, ripping out the Express server and replacing local `fetch()` calls with live `onSnapshot` Firestore listeners.

---

## Why This is Useful

The "Temporary CSV Database" methodology is highly effective for AI-assisted development:
1. **Schema Discovery:** By writing out features without rigid database boundaries, you discover your true generic constraints.
2. **AI Synergy:** File-based operations (like parsing CSV via Express) are extremely low-complexity tasks for AI agents. They can easily manipulate CSV columns.
3. **Painless Transitions:** Paired with specialized Migration Skills and MCP Integrations, what used to be a daunting multi-day database rewrite becomes an automated, single-prompt transition once the schema solidifies.

This case study proves that you do not need to choose your production database on Day 1. By leveraging simple text-based data stores initially, you maximize feature velocity and retain the flexibility to choose the perfect cloud infrastructure only when you are truly ready.
