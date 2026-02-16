import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import csvParser from 'csv-parser';
import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, connectFirestoreEmulator, collection } from "firebase/firestore";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure process.env gets VITE_ prefixed vars from .env
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY || "demo",
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN || "demo.firebaseapp.com",
  projectId: process.env.VITE_FIREBASE_PROJECT_ID || "demo-project",
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET || "demo.appspot.com",
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId: process.env.VITE_FIREBASE_APP_ID || "1:123456789:web:abcdef"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Use connectFirestoreEmulator for Web SDK
if (process.env.VITE_USE_FIREBASE_EMULATOR === 'true') {
  console.log("Connecting to local Firestore emulator...");
  connectFirestoreEmulator(db, '127.0.0.1', 8080);
} else {
  console.log(`Connecting to Firestore project: ${firebaseConfig.projectId}`);
}

const SERVER_DIR = path.join(__dirname, '..', 'server');

const readCSV = (filePath) => {
  return new Promise((resolve, reject) => {
    if (!fs.existsSync(filePath)) resolve([]);
    
    const results = [];
    fs.createReadStream(filePath)
      .pipe(csvParser())
      .on('data', (data) => {
        // Convert 'true'/'false' strings to boolean, and level to numbers.
        if (data.completed !== undefined) data.completed = data.completed === 'true';
        if (data.level !== undefined) data.level = parseInt(data.level, 10);
        
        // Exclude empty rows
        if (Object.keys(data).length > 0 && (data.id || data.text || data.name)) {
          results.push(data);
        }
      })
      .on('end', () => resolve(results))
      .on('error', (err) => reject(err));
  });
};

async function migrateCollection(csvFileName, collectionName) {
  const filePath = path.join(SERVER_DIR, csvFileName);
  console.log(`Reading ${filePath} ...`);
  
  const records = await readCSV(filePath);
  console.log(`Found ${records.length} records in ${csvFileName}. Uploading to Firestore collection '${collectionName}'...`);
  
  let successCount = 0;
  for (const record of records) {
    try {
      const docId = record.id;
      // Exclude 'id' from the document fields since it will be the document's ID itself
      const { id, ...data } = record;
      
      let docRef;
      if (docId) {
        docRef = doc(db, collectionName, docId);
      } else {
        docRef = doc(collection(db, collectionName));
      }
      
      await setDoc(docRef, data);
      successCount++;
    } catch (err) {
      console.error(`Failed to migrate record ${record.id}:`, err);
    }
  }
  
  console.log(`Migrated ${successCount}/${records.length} records into '${collectionName}'.`);
}

async function migrateAll() {
  try {
    await migrateCollection('users.csv', 'users');
    await migrateCollection('priorities.csv', 'priorities');
    await migrateCollection('db.csv', 'todos');
    
    console.log("Migration complete!");
    process.exit(0);
  } catch (err) {
    console.error("Migration failed:", err);
    process.exit(1);
  }
}

migrateAll();
