---
name: migrate-csv-firestore
description: Migrates a CSV-based database created via temporary-csv-db to Firebase Firestore, providing an end-to-end migration path.
---

# Migrate CSV to Firestore Skill

This skill guides you through migrating an application's data layer from a local CSV database (created using the `temporary-csv-db` skill) to a managed Firebase Firestore database.

## Prerequisites
Before starting the migration, verify the following:
1. **Dependency Check**: Ensure the `firebase-firestore-basics` skill is installed and available in the workspace. If it is not present, halt the process and prompt the user to install it, as it is a required dependency for configuring Firestore correctly.
2. **Data Availability**: Ensure the `temporary-csv-db` skill was used and the corresponding CSV database files exist.

## Migration Steps

Follow these steps precisely to perform the migration:

### 1. Review Existing CSV Data and App Usage
- Locate and read the CSV database files currently used by the application.
- Analyze the structure of the CSV files, including columns, relationships, and implicit data types.
- Review the application codebase (e.g., API routes, server controllers, or frontend state services) to understand how the app currently reads, writes, and manipulates the CSV files. 

### 2. Create an Equivalent Firestore Schema
- Using the knowledge gathered in Step 1, design an equivalent or improved NoSQL schema for Firestore.
- Define the necessary Collections, Documents, and Fields.
- Document this proposed schema and ask the user to confirm it before proceeding.

### 3. Setup Firestore
- Use the `firebase-firestore-basics` skill to walk the user through provisioning a new Firebase project and Firestore database.
- Assist the user with creating and applying foundational security rules relevant to the new schema.
- Add the necessary Firebase SDK packages to the project (`firebase` for the frontend or `firebase-admin` for a Node.js backend).
- Create the initialization and configuration files for Firestore so the application can connect to the database.

### 4. Transfer Data
- Write a one-time data migration script (e.g., in Node.js, Python, or a frontend utility path) that connects to both the CSV files and the newly provisioned Firestore database.
- Execute the script or guide the user to run it so that all records from the CSV files are accurately transferred to the corresponding Firestore collections.
- Validate the data format (e.g., ensuring numbers and timestamps are converted correctly, rather than staying as strings).

### 5. Convert Application to use Firestore
- Refactor the existing application code to replace all CSV read/write operations with Firestore database calls.
- Integrate CRUD operations (Create, Read, Update, Delete) using the Firebase SDK.
- Clean up any old CSV connection code, unused helper scripts, or leftover references to `temporary-csv-db`. 

### 6. Verification and Testing
- Start the application and manually test the primary user flows.
- Ensure that all screens and pages that rely on data load correctly and operate without any issues.
- Confirm that data mutation (creating/updating/deleting records) reflects instantly in the app and saves properly in the Firestore database.
