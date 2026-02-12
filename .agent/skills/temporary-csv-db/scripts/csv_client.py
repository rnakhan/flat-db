#!/usr/bin/env python3
"""
A lightweight, serverless CSV database engine for temporary agent memory.
Stores data in /tmp/agent_csv_db/ to persist across conversation turns 
but reset on reboot.
"""

import argparse
import csv
import json
import os
import fcntl  # specific to POSIX; ensures atomic writes
import shutil
import sys
from datetime import datetime

DB_ROOT = "/tmp/agent_csv_db"

def _get_path(collection):
    """Sanitizes collection name and returns path."""
    clean_name = "".join(x for x in collection if x.isalnum() or x in "_-")
    return os.path.join(DB_ROOT, f"{clean_name}.csv")

def _ensure_db():
    if not os.path.exists(DB_ROOT):
        os.makedirs(DB_ROOT, exist_ok=True)

def create_collection(collection, fields):
    """Creates a new CSV file with the given header fields."""
    _ensure_db()
    path = _get_path(collection)
    if os.path.exists(path):
        return {"status": "error", "message": f"Collection '{collection}' already exists."}
    
    with open(path, 'w', newline='') as f:
        writer = csv.writer(f)
        writer.writerow(fields)
    return {"status": "success", "message": f"Created collection '{collection}' with fields: {fields}"}

def add_document(collection, data):
    """Appends a row to the CSV."""
    path = _get_path(collection)
    if not os.path.exists(path):
        return {"status": "error", "message": f"Collection '{collection}' not found."}

    # Validate fields
    with open(path, 'r') as f:
        reader = csv.reader(f)
        headers = next(reader)
    
    # Auto-generate ID if not present
    if 'id' not in data and 'id' in headers:
        data['id'] = hex(abs(hash(str(datetime.now()) + str(data))))[2:10]

    row = []
    for h in headers:
        row.append(str(data.get(h, ""))) # Default to empty string if missing

    # Atomic Append
    with open(path, 'a', newline='') as f:
        fcntl.flock(f, fcntl.LOCK_EX)
        writer = csv.writer(f)
        writer.writerow(row)
        fcntl.flock(f, fcntl.LOCK_UN)
    
    return {"status": "success", "id": data.get('id', 'N/A')}

def query_collection(collection, where_field=None, where_value=None):
    """Selects rows, optionally filtering by strict equality."""
    path = _get_path(collection)
    if not os.path.exists(path):
        return {"status": "error", "message": f"Collection '{collection}' not found."}

    results = []
    with open(path, 'r') as f:
        reader = csv.DictReader(f)
        for row in reader:
            if where_field:
                if row.get(where_field) == str(where_value):
                    results.append(row)
            else:
                results.append(row)
    
    return {"status": "success", "count": len(results), "data": results}

def delete_document(collection, doc_id):
    """Deletes a row by ID (assumes 'id' column exists)."""
    path = _get_path(collection)
    if not os.path.exists(path):
        return {"status": "error", "message": f"Collection '{collection}' not found."}

    rows = []
    headers = []
    deleted = False

    # Read all
    with open(path, 'r') as f:
        reader = csv.DictReader(f)
        headers = reader.fieldnames
        for row in reader:
            if row.get('id') == str(doc_id):
                deleted = True
            else:
                rows.append(row)

    if not deleted:
        return {"status": "error", "message": f"ID {doc_id} not found."}

    # Rewrite
    with open(path, 'w', newline='') as f:
        fcntl.flock(f, fcntl.LOCK_EX)
        writer = csv.DictWriter(f, fieldnames=headers)
        writer.writeheader()
        writer.writerows(rows)
        fcntl.flock(f, fcntl.LOCK_UN)
        
    return {"status": "success", "message": f"Document {doc_id} deleted."}

def main():
    parser = argparse.ArgumentParser()
    subparsers = parser.add_subparsers(dest='command')

    # CREATE
    p_create = subparsers.add_parser('create')
    p_create.add_argument('collection')
    p_create.add_argument('--fields', required=True, help="Comma-separated headers")

    # ADD
    p_add = subparsers.add_parser('add')
    p_add.add_argument('collection')
    p_add.add_argument('--json', required=True, help="JSON string of data")

    # QUERY
    p_query = subparsers.add_parser('query')
    p_query.add_argument('collection')
    p_query.add_argument('--field', help="Field to filter by")
    p_query.add_argument('--value', help="Value to match")

    # DELETE
    p_del = subparsers.add_parser('delete')
    p_del.add_argument('collection')
    p_del.add_argument('--id', required=True)

    args = parser.parse_args()
    
    try:
        if args.command == 'create':
            print(json.dumps(create_collection(args.collection, args.fields.split(','))))
        elif args.command == 'add':
            print(json.dumps(add_document(args.collection, json.loads(args.json))))
        elif args.command == 'query':
            print(json.dumps(query_collection(args.collection, args.field, args.value), indent=2))
        elif args.command == 'delete':
            print(json.dumps(delete_document(args.collection, args.id)))
    except Exception as e:
        print(json.dumps({"status": "fatal_error", "error": str(e)}))

if __name__ == '__main__':
    main()
