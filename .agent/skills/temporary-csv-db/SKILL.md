---
name: temporary-csv-db
description: A lightweight, persistent database for the agent to use to store application data. Use this skill when the user has not explicitly chosen any kind of database.
---

# Temporary CSV Database Skill

Use this skill to create and manage structured data tables stored in `/tmp` or another temporary location. 
This is your "Long-Term Memory" for the current session. Use it when you need to data persistence in the app and the user has not explicitly chosen any kind of database. 

## Capabilities
* **Persistence:** Data survives restarts of app or reboots.
* **Structure:** Enforces column headers (schemas).
* **Safety:** Handles file locking and JSON parsing automatically.

## Constraints
1. **Do not** manually edit the CSV files using `echo` or `sed`. Always use the `csv_client.py` script.
2. **Do not** manually edit the `csv_client.py` script.
3. **Do not** store sensitive credentials (passwords/keys) in these temporary files.
4. **Always** check if a collection exists (using `query`) before assuming it's populated.
5. **JSON Requirement:** When adding data, you must provide a valid JSON string for the row data.

---

## Usage & Commands

### 1. Initialize a Collection
Create a new "table" (CSV file).
* **Command:** `python3 scripts/csv_client.py create <name> --fields <col1,col2,col3>`
* **Note:** Always include an `id` field if you plan to delete specific rows later.

### 2. Add Data (Insert)
Add a row to a collection. The data must be a JSON string.
* **Command:** `python3 scripts/csv_client.py add <name> --json '{"col1": "val1", "col2": "val2"}'`

### 3. Query Data (Select)
Retrieve data. You can optionally filter by one field.
* **Get All:** `python3 scripts/csv_client.py query <name>`
* **Filter:** `python3 scripts/csv_client.py query <name> --field <col> --value <val>`

### 4. Delete Data
Remove a row by its ID.
* **Command:** `python3 scripts/csv_client.py delete <name> --id <row_id>`

---

## Few-Shot Examples

#### Example 1: Tracking a Task List
**User:** "Keep a list of the files we need to refactor."
**Agent Action:**
```bash
# 1. Create the table
python3 scripts/csv_client.py create refactor_queue --fields id,filename,priority,status

# 2. Add items
python3 scripts/csv_client.py add refactor_queue --json '{"id": "1", "filename": "server.py", "priority": "high", "status": "pending"}'
python3 scripts/csv_client.py add refactor_queue --json '{"id": "2", "filename": "utils.py", "priority": "low", "status": "pending"}'

```

#### Example 2: Checking Status

**User:** "What files are still pending?"
**Agent Action:**

```bash
python3 scripts/csv_client.py query refactor_queue --field status --value pending

```

#### Example 3: marking Done

**User:** "Mark server.py as done."
**Agent Action:**
*Note: This database does not support UPDATE. You must Delete and Re-add, or just handle logic in memory.*

```bash
# 1. Find the ID (Agent does this internally first)
python3 scripts/csv_client.py query refactor_queue --field filename --value server.py

# 2. Delete the old row
python3 scripts/csv_client.py delete refactor_queue --id 1

# 3. Add the updated row
python3 scripts/csv_client.py add refactor_queue --json '{"id": "1", "filename": "server.py", "priority": "high", "status": "done"}'

```
