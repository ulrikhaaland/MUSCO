# Firebase Exercise Upload

This guide explains how to upload all exercise data to Firebase Firestore.

## Prerequisites

1. **Firebase Project**: You need a Firebase project with Firestore enabled.

2. **Environment Variables**: The script uses Firebase Admin SDK credentials from your `.env.local` file. Ensure it has the following variables set:
   ```
   FIREBASE_CLIENT_EMAIL=your-service-account@project-id.iam.gserviceaccount.com
   FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
   ```

3. **Required npm packages**: Make sure you have the required packages installed:
   ```bash
   npm install firebase-admin dotenv
   ```

## Usage

### Upload All Exercise Files

To upload all exercise files from the `scripts/output` directory:

```bash
./scripts/run-upload.sh
```

This command will:
- Process all `.ts` files in the `scripts/output` directory
- Extract the exercises from each file
- Upload them to Firestore in batches
- Save a log file in the `logs` directory

### Upload a Specific File

To upload a specific exercise file:

```bash
./scripts/run-upload.sh scripts/output/abs.ts
```

Replace `scripts/output/abs.ts` with the path to your specific file.

## Downloading Exercises from Firestore

The system also provides a way to download exercises from Firestore to JSON files.

### Prerequisites

- Firebase project with Firestore enabled
- Environment variables set in `.env.local` file (same as for upload)
- Required npm packages: `firebase-admin` and `dotenv`

### Usage

#### Download All Exercise Files

To download all exercise files from Firestore:

```bash
# Make the script executable (only needed once)
chmod +x scripts/run-download.sh

# Run the download script
./scripts/run-download.sh
```

#### Download a Specific Body Part

To download exercises for a specific body part:

```bash
./scripts/run-download.sh abs
```

### Output

Downloaded exercises are saved as JSON files in the `scripts/downloads` directory. Each file follows this structure:

```json
{
  "bodyPart": "abs",
  "exercises": [
    {
      "id": "exercise-id",
      "name": "Exercise Name",
      "description": "Exercise description",
      // ...all other exercise properties
    },
    // ...more exercises
  ]
}
```

## Firestore Structure

Exercises are stored in Firestore with the following structure:

```
exercises (collection)
  |
  └── abs (document - body part name)
  |    |
  |    └── exercises (subcollection)
  |         |
  |         └── abs-1 (document - exercise ID)
  |         |    |
  |         |    └── id: "abs-1"
  |         |    └── name: "Lying Floor Leg Raise"
  |         |    └── ... (other exercise properties)
  |         |
  |         └── abs-2 (document - exercise ID)
  |              |
  |              └── ... (exercise properties)
  |
  └── shoulders (document - body part name)
       |
       └── ... (similar structure)
```

## Error Handling

- If the upload process encounters an error, it will log the details and continue with the next exercise.
- Check the log files in the `logs` directory for detailed information about any issues.

## Safety Note

The script uses a safe parsing approach to convert TypeScript to JSON. However, be aware that it falls back to using the Function constructor as a last resort, which can potentially execute code. This should be safe when processing your own generated files, but exercise caution when working with untrusted data. 