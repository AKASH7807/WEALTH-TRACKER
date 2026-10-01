/**
 * MongoDB Standalone Data Restore Script
 * ========================================================
 * Database: wealth
 * Restores 100% of data from Supabase CSV exports:
 *   - Users: 2 records
 *   - Accounts: 3 records
 *   - Budgets: 1 records
 *   - Transactions: 61 records
 * 
 * How to run:
 * 1. Open MongoDB Compass or mongosh CLI connected to your MongoDB cluster:
 *      mongosh "<your-mongodb-connection-string>"
 * 2. Copy and paste this entire script and press Enter.
 *    (All inserts use bulkWrite with upsert: true, making it 100% idempotent and safe to run multiple times).
 * ========================================================
 */

(function restoreToMongo() {
  const targetDb = typeof db !== 'undefined' ? (db.getSiblingDB ? db.getSiblingDB('wealth') : db) : null;
  if (!targetDb) {
    throw new Error('Please run this script inside mongosh or MongoDB Compass');
  }

  print("=================================================");
  print("Starting Data Restore into MongoDB: " + targetDb.getName());
  print("=================================================");

  // 1. Ensure Collections Exist
  const requiredCollections = ["users", "accounts", "budgets", "transactions"];
  const existingCollections = targetDb.getCollectionNames();

  requiredCollections.forEach(colName => {
    if (!existingCollections.includes(colName)) {
      targetDb.createCollection(colName);
      print("✔ Created collection: " + colName);
    } else {
      print("✔ Found existing collection: " + colName);
    }
  });

  // 2. Remove conflicting test users before creating unique indexes
  const validUserIds = ["64c55368-dfd3-4f84-9628-8deb7828e157","db63319e-d86b-4f7a-83fb-1fef8bb77392"];
  const validClerkIds = ["user_2uU40lVWdzsNrPBRR6WHMjD05DV","user_3GWsCYV3AqUaEEtTOOxX2clFPwi"];
  targetDb.users.deleteMany({
    clerkUserId: { $in: validClerkIds },
    _id: { $nin: validUserIds }
  });

  // 3. Ensure Prisma-compatible Indexes
  print("\n--> Creating collection indexes...");
  try {
    targetDb.users.createIndex({ clerkUserId: 1 }, { unique: true });
    targetDb.users.createIndex({ email: 1 }, { unique: true });
    targetDb.accounts.createIndex({ userId: 1 });
    targetDb.budgets.createIndex({ userId: 1 }, { unique: true });
    targetDb.transactions.createIndex({ userId: 1 });
    targetDb.transactions.createIndex({ accountId: 1 });
    print("✔ All indexes verified/created successfully.");
  } catch (err) {
    print("⚠ Notice when creating indexes: " + err.message);
  }

  // 4. Upsert Users
  print("\n--> Restoring Users (2 records)...");
  const usersOps = [
    {
      updateOne: {
        filter: { _id: "64c55368-dfd3-4f84-9628-8deb7828e157" },
        update: {
          $set: {
            _id: "64c55368-dfd3-4f84-9628-8deb7828e157",
            clerkUserId: "user_2uU40lVWdzsNrPBRR6WHMjD05DV",
            email: "itzmeaktech@gmail.com",
            name: "ᴀᴋᴀꜱʜ Ɱ",
            imageUrl: "https://img.clerk.com/eyJ0eXBlIjoicHJveHkiLCJzcmMiOiJodHRwczovL2ltYWdlcy5jbGVyay5kZXYvb2F1dGhfZ29vZ2xlL2ltZ18ydVU0MGxZV3lWUG1rbmF5NDhWWUUzWTc1WlIifQ",
            createdAt: ISODate("2025-12-26T06:43:13.306Z"),
            updatedAt: ISODate("2025-12-26T06:43:13.306Z")
          }
        },
        upsert: true
      }
    },
    {
      updateOne: {
        filter: { _id: "db63319e-d86b-4f7a-83fb-1fef8bb77392" },
        update: {
          $set: {
            _id: "db63319e-d86b-4f7a-83fb-1fef8bb77392",
            clerkUserId: "user_3GWsCYV3AqUaEEtTOOxX2clFPwi",
            email: "chansoun471@gmail.com",
            name: "Chandru S",
            imageUrl: "https://img.clerk.com/eyJ0eXBlIjoicHJveHkiLCJzcmMiOiJodHRwczovL2ltYWdlcy5jbGVyay5kZXYvb2F1dGhfZ29vZ2xlL2ltZ18zR1dzQ1lRODZvOEI4Qm5BeWtHYzNkTHZObjMifQ",
            createdAt: ISODate("2026-07-26T13:44:56.112Z"),
            updatedAt: ISODate("2026-07-26T13:44:56.112Z")
          }
        },
        upsert: true
      }
    },
  ];
  const usersResult = targetDb.users.bulkWrite(usersOps);
  print("✔ Users upserted. Matched: " + usersResult.matchedCount + ", Upserted: " + usersResult.upsertedCount);

  // 4. Upsert Accounts
  print("\n--> Restoring Accounts (3 records)...");
  const accountsOps = [
    {
      updateOne: {
        filter: { _id: "946fcefa-930e-4913-b1c2-e1a7ad010eb6" },
        update: {
          $set: {
            _id: "946fcefa-930e-4913-b1c2-e1a7ad010eb6",
            name: "Salary",
            type: "CURRENT",
            balance: 30000,
            isDefault: true,
            userId: "db63319e-d86b-4f7a-83fb-1fef8bb77392",
            createdAt: ISODate("2026-07-26T13:45:39.037Z"),
            updatedAt: ISODate("2026-07-26T13:45:39.037Z")
          }
        },
        upsert: true
      }
    },
    {
      updateOne: {
        filter: { _id: "b8d8bc37-90aa-42fe-97cb-842f908c6994" },
        update: {
          $set: {
            _id: "b8d8bc37-90aa-42fe-97cb-842f908c6994",
            name: "Main",
            type: "CURRENT",
            balance: -9721.99,
            isDefault: false,
            userId: "64c55368-dfd3-4f84-9628-8deb7828e157",
            createdAt: ISODate("2025-12-26T06:45:26.754Z"),
            updatedAt: ISODate("2026-06-13T17:50:37.098Z")
          }
        },
        upsert: true
      }
    },
    {
      updateOne: {
        filter: { _id: "eefc981a-878a-46d5-8f69-0e7708266013" },
        update: {
          $set: {
            _id: "eefc981a-878a-46d5-8f69-0e7708266013",
            name: "Work",
            type: "SAVINGS",
            balance: 10830,
            isDefault: true,
            userId: "64c55368-dfd3-4f84-9628-8deb7828e157",
            createdAt: ISODate("2026-03-27T17:55:12.909Z"),
            updatedAt: ISODate("2026-07-27T16:16:21.896Z")
          }
        },
        upsert: true
      }
    },
  ];
  const accountsResult = targetDb.accounts.bulkWrite(accountsOps);
  print("✔ Accounts upserted. Matched: " + accountsResult.matchedCount + ", Upserted: " + accountsResult.upsertedCount);

  // 5. Upsert Budgets
  print("\n--> Restoring Budgets (1 records)...");
  const budgetsOps = [
    {
      updateOne: {
        filter: { _id: "6400f249-fa63-4c7a-a5a4-f2c0b63da801" },
        update: {
          $set: {
            _id: "6400f249-fa63-4c7a-a5a4-f2c0b63da801",
            amount: 25000,
            lastAlertSent: ISODate("2026-03-11T18:01:05.936Z"),
            userId: "64c55368-dfd3-4f84-9628-8deb7828e157",
            createdAt: ISODate("2026-01-11T18:19:18.168Z"),
            updatedAt: ISODate("2026-06-13T17:51:40.217Z")
          }
        },
        upsert: true
      }
    },
  ];
  const budgetsResult = targetDb.budgets.bulkWrite(budgetsOps);
  print("✔ Budgets upserted. Matched: " + budgetsResult.matchedCount + ", Upserted: " + budgetsResult.upsertedCount);

  // 6. Upsert Transactions
  print("\n--> Restoring Transactions (61 records)...");
  const transactionsOps = [
    {
      updateOne: {
        filter: { _id: "00824a6a-0422-4827-aea9-22769cb26480" },
        update: {
          $set: {
            _id: "00824a6a-0422-4827-aea9-22769cb26480",
            type: "EXPENSE",
            amount: 3300,
            description: "SRM Sem2 Exam Fee",
            date: ISODate("2026-05-23T18:30:00.000Z"),
            category: "education",
            receiptUrl: null,
            isRecurring: false,
            recurringInterval: null,
            nextRecurringDate: null,
            lastProcessed: null,
            status: "COMPLETED",
            userId: "64c55368-dfd3-4f84-9628-8deb7828e157",
            accountId: "eefc981a-878a-46d5-8f69-0e7708266013",
            createdAt: ISODate("2026-06-13T17:40:33.663Z"),
            updatedAt: ISODate("2026-06-13T17:40:33.663Z")
          }
        },
        upsert: true
      }
    },
    {
      updateOne: {
        filter: { _id: "0aac5f4f-035f-4456-8174-d0eb53796e58" },
        update: {
          $set: {
            _id: "0aac5f4f-035f-4456-8174-d0eb53796e58",
            type: "EXPENSE",
            amount: 2000,
            description: "soniya transfer",
            date: ISODate("2026-05-05T18:30:00.000Z"),
            category: "housing",
            receiptUrl: null,
            isRecurring: false,
            recurringInterval: null,
            nextRecurringDate: null,
            lastProcessed: null,
            status: "COMPLETED",
            userId: "64c55368-dfd3-4f84-9628-8deb7828e157",
            accountId: "eefc981a-878a-46d5-8f69-0e7708266013",
            createdAt: ISODate("2026-05-13T18:02:30.480Z"),
            updatedAt: ISODate("2026-05-13T18:02:30.480Z")
          }
        },
        upsert: true
      }
    },
    {
      updateOne: {
        filter: { _id: "0f29b697-6961-4b90-9fa4-fb83296b19ff" },
        update: {
          $set: {
            _id: "0f29b697-6961-4b90-9fa4-fb83296b19ff",
            type: "EXPENSE",
            amount: 500,
            description: "sandals - foot",
            date: ISODate("2026-04-05T14:59:46.047Z"),
            category: "shopping",
            receiptUrl: null,
            isRecurring: false,
            recurringInterval: null,
            nextRecurringDate: null,
            lastProcessed: null,
            status: "COMPLETED",
            userId: "64c55368-dfd3-4f84-9628-8deb7828e157",
            accountId: "eefc981a-878a-46d5-8f69-0e7708266013",
            createdAt: ISODate("2026-04-05T15:06:25.784Z"),
            updatedAt: ISODate("2026-04-05T15:06:25.784Z")
          }
        },
        upsert: true
      }
    },
    {
      updateOne: {
        filter: { _id: "11d0a4ae-56f6-4e00-9f4b-653ba4250834" },
        update: {
          $set: {
            _id: "11d0a4ae-56f6-4e00-9f4b-653ba4250834",
            type: "EXPENSE",
            amount: 2500,
            description: "kumaran wedding expense",
            date: ISODate("2026-05-03T18:30:00.000Z"),
            category: "gifts",
            receiptUrl: null,
            isRecurring: false,
            recurringInterval: null,
            nextRecurringDate: null,
            lastProcessed: null,
            status: "COMPLETED",
            userId: "64c55368-dfd3-4f84-9628-8deb7828e157",
            accountId: "eefc981a-878a-46d5-8f69-0e7708266013",
            createdAt: ISODate("2026-05-13T18:00:29.569Z"),
            updatedAt: ISODate("2026-05-13T18:00:29.569Z")
          }
        },
        upsert: true
      }
    },
    {
      updateOne: {
        filter: { _id: "11d231b3-bc8a-4fae-b5d2-81a99858f7ea" },
        update: {
          $set: {
            _id: "11d231b3-bc8a-4fae-b5d2-81a99858f7ea",
            type: "EXPENSE",
            amount: 267,
            description: "Shoe Flipkart",
            date: ISODate("2026-02-14T18:30:00.000Z"),
            category: "shopping",
            receiptUrl: null,
            isRecurring: false,
            recurringInterval: null,
            nextRecurringDate: null,
            lastProcessed: null,
            status: "COMPLETED",
            userId: "64c55368-dfd3-4f84-9628-8deb7828e157",
            accountId: "b8d8bc37-90aa-42fe-97cb-842f908c6994",
            createdAt: ISODate("2026-02-16T15:35:40.726Z"),
            updatedAt: ISODate("2026-02-16T15:35:40.726Z")
          }
        },
        upsert: true
      }
    },
    {
      updateOne: {
        filter: { _id: "151ff7c9-40d1-4161-98b1-7011ecb8932a" },
        update: {
          $set: {
            _id: "151ff7c9-40d1-4161-98b1-7011ecb8932a",
            type: "EXPENSE",
            amount: 2000,
            description: "March Food Hotel",
            date: ISODate("2026-03-14T18:30:00.000Z"),
            category: "food",
            receiptUrl: null,
            isRecurring: false,
            recurringInterval: null,
            nextRecurringDate: null,
            lastProcessed: null,
            status: "COMPLETED",
            userId: "64c55368-dfd3-4f84-9628-8deb7828e157",
            accountId: "b8d8bc37-90aa-42fe-97cb-842f908c6994",
            createdAt: ISODate("2026-04-02T18:56:40.429Z"),
            updatedAt: ISODate("2026-04-02T18:56:40.429Z")
          }
        },
        upsert: true
      }
    },
    {
      updateOne: {
        filter: { _id: "15d02e46-bb57-489d-b22a-a6866048f412" },
        update: {
          $set: {
            _id: "15d02e46-bb57-489d-b22a-a6866048f412",
            type: "INCOME",
            amount: 15000,
            description: "First month salary",
            date: ISODate("2026-03-16T18:30:00.000Z"),
            category: "salary",
            receiptUrl: null,
            isRecurring: false,
            recurringInterval: null,
            nextRecurringDate: null,
            lastProcessed: null,
            status: "COMPLETED",
            userId: "64c55368-dfd3-4f84-9628-8deb7828e157",
            accountId: "eefc981a-878a-46d5-8f69-0e7708266013",
            createdAt: ISODate("2026-03-27T17:56:56.904Z"),
            updatedAt: ISODate("2026-03-27T17:56:56.904Z")
          }
        },
        upsert: true
      }
    },
    {
      updateOne: {
        filter: { _id: "18f121d5-fcb5-4a1d-bed7-297a1abfdf91" },
        update: {
          $set: {
            _id: "18f121d5-fcb5-4a1d-bed7-297a1abfdf91",
            type: "EXPENSE",
            amount: 1400,
            description: "may month gang expense",
            date: ISODate("2026-06-01T18:30:00.000Z"),
            category: "entertainment",
            receiptUrl: null,
            isRecurring: false,
            recurringInterval: null,
            nextRecurringDate: null,
            lastProcessed: null,
            status: "COMPLETED",
            userId: "64c55368-dfd3-4f84-9628-8deb7828e157",
            accountId: "eefc981a-878a-46d5-8f69-0e7708266013",
            createdAt: ISODate("2026-06-13T17:45:01.897Z"),
            updatedAt: ISODate("2026-06-13T17:45:01.897Z")
          }
        },
        upsert: true
      }
    },
    {
      updateOne: {
        filter: { _id: "1932687c-bd1d-44c1-9df8-9720c59ba6e3" },
        update: {
          $set: {
            _id: "1932687c-bd1d-44c1-9df8-9720c59ba6e3",
            type: "EXPENSE",
            amount: 1000,
            description: "barrow - exam fee",
            date: ISODate("2026-05-31T18:30:00.000Z"),
            category: "other-expense",
            receiptUrl: null,
            isRecurring: false,
            recurringInterval: null,
            nextRecurringDate: null,
            lastProcessed: null,
            status: "COMPLETED",
            userId: "64c55368-dfd3-4f84-9628-8deb7828e157",
            accountId: "eefc981a-878a-46d5-8f69-0e7708266013",
            createdAt: ISODate("2026-06-14T14:43:34.924Z"),
            updatedAt: ISODate("2026-06-14T14:44:02.146Z")
          }
        },
        upsert: true
      }
    },
    {
      updateOne: {
        filter: { _id: "1d39c2e6-f019-4d3d-800a-9a3861aa1381" },
        update: {
          $set: {
            _id: "1d39c2e6-f019-4d3d-800a-9a3861aa1381",
            type: "INCOME",
            amount: 5000,
            description: "Web Project - phonebooking",
            date: ISODate("2026-02-01T18:30:00.000Z"),
            category: "freelance",
            receiptUrl: null,
            isRecurring: false,
            recurringInterval: null,
            nextRecurringDate: null,
            lastProcessed: null,
            status: "COMPLETED",
            userId: "64c55368-dfd3-4f84-9628-8deb7828e157",
            accountId: "b8d8bc37-90aa-42fe-97cb-842f908c6994",
            createdAt: ISODate("2026-02-06T09:12:48.302Z"),
            updatedAt: ISODate("2026-02-13T16:55:09.027Z")
          }
        },
        upsert: true
      }
    },
    {
      updateOne: {
        filter: { _id: "2b480b91-54af-4c47-bf21-8d89618f7bcc" },
        update: {
          $set: {
            _id: "2b480b91-54af-4c47-bf21-8d89618f7bcc",
            type: "EXPENSE",
            amount: 1100,
            description: "Vicky mass gainer",
            date: ISODate("2026-03-24T18:30:00.000Z"),
            category: "healthcare",
            receiptUrl: null,
            isRecurring: false,
            recurringInterval: null,
            nextRecurringDate: null,
            lastProcessed: null,
            status: "COMPLETED",
            userId: "64c55368-dfd3-4f84-9628-8deb7828e157",
            accountId: "b8d8bc37-90aa-42fe-97cb-842f908c6994",
            createdAt: ISODate("2026-04-02T18:53:46.447Z"),
            updatedAt: ISODate("2026-04-02T18:53:46.447Z")
          }
        },
        upsert: true
      }
    },
    {
      updateOne: {
        filter: { _id: "302f59bb-d652-498d-b3a4-677a58966f3c" },
        update: {
          $set: {
            _id: "302f59bb-d652-498d-b3a4-677a58966f3c",
            type: "EXPENSE",
            amount: 250,
            description: "T nagar purchase",
            date: ISODate("2026-02-13T18:30:00.000Z"),
            category: "shopping",
            receiptUrl: null,
            isRecurring: false,
            recurringInterval: null,
            nextRecurringDate: null,
            lastProcessed: null,
            status: "COMPLETED",
            userId: "64c55368-dfd3-4f84-9628-8deb7828e157",
            accountId: "b8d8bc37-90aa-42fe-97cb-842f908c6994",
            createdAt: ISODate("2026-02-16T15:36:39.069Z"),
            updatedAt: ISODate("2026-02-16T15:36:39.069Z")
          }
        },
        upsert: true
      }
    },
    {
      updateOne: {
        filter: { _id: "37b6334b-b4c1-4dcb-a8d6-f89f16f780d5" },
        update: {
          $set: {
            _id: "37b6334b-b4c1-4dcb-a8d6-f89f16f780d5",
            type: "EXPENSE",
            amount: 1400,
            description: "june split expense",
            date: ISODate("2026-06-29T18:30:00.000Z"),
            category: "entertainment",
            receiptUrl: null,
            isRecurring: false,
            recurringInterval: null,
            nextRecurringDate: null,
            lastProcessed: null,
            status: "COMPLETED",
            userId: "64c55368-dfd3-4f84-9628-8deb7828e157",
            accountId: "eefc981a-878a-46d5-8f69-0e7708266013",
            createdAt: ISODate("2026-07-27T16:09:50.616Z"),
            updatedAt: ISODate("2026-07-27T16:09:50.616Z")
          }
        },
        upsert: true
      }
    },
    {
      updateOne: {
        filter: { _id: "3941237b-fa0d-4a5b-a88a-f3518c8befc1" },
        update: {
          $set: {
            _id: "3941237b-fa0d-4a5b-a88a-f3518c8befc1",
            type: "INCOME",
            amount: 22900,
            description: "May month salary",
            date: ISODate("2026-05-29T18:30:00.000Z"),
            category: "salary",
            receiptUrl: null,
            isRecurring: false,
            recurringInterval: null,
            nextRecurringDate: null,
            lastProcessed: null,
            status: "COMPLETED",
            userId: "64c55368-dfd3-4f84-9628-8deb7828e157",
            accountId: "eefc981a-878a-46d5-8f69-0e7708266013",
            createdAt: ISODate("2026-06-13T17:57:31.835Z"),
            updatedAt: ISODate("2026-06-13T17:57:31.835Z")
          }
        },
        upsert: true
      }
    },
    {
      updateOne: {
        filter: { _id: "3b830b7c-8f06-4636-be01-fdb941879847" },
        update: {
          $set: {
            _id: "3b830b7c-8f06-4636-be01-fdb941879847",
            type: "EXPENSE",
            amount: 500,
            description: "yalagiri trip",
            date: ISODate("2026-06-27T18:30:00.000Z"),
            category: "travel",
            receiptUrl: null,
            isRecurring: false,
            recurringInterval: null,
            nextRecurringDate: null,
            lastProcessed: null,
            status: "COMPLETED",
            userId: "64c55368-dfd3-4f84-9628-8deb7828e157",
            accountId: "eefc981a-878a-46d5-8f69-0e7708266013",
            createdAt: ISODate("2026-07-27T16:05:24.788Z"),
            updatedAt: ISODate("2026-07-27T16:06:23.562Z")
          }
        },
        upsert: true
      }
    },
    {
      updateOne: {
        filter: { _id: "3f1750c8-89d2-462c-82d5-c255eba03cbd" },
        update: {
          $set: {
            _id: "3f1750c8-89d2-462c-82d5-c255eba03cbd",
            type: "EXPENSE",
            amount: 250,
            description: "Mobile recharge",
            date: ISODate("2026-04-18T18:30:00.000Z"),
            category: "bills",
            receiptUrl: null,
            isRecurring: false,
            recurringInterval: null,
            nextRecurringDate: null,
            lastProcessed: null,
            status: "COMPLETED",
            userId: "64c55368-dfd3-4f84-9628-8deb7828e157",
            accountId: "eefc981a-878a-46d5-8f69-0e7708266013",
            createdAt: ISODate("2026-04-23T12:25:13.706Z"),
            updatedAt: ISODate("2026-04-23T12:25:51.845Z")
          }
        },
        upsert: true
      }
    },
    {
      updateOne: {
        filter: { _id: "42aa60a4-14a9-4384-bca5-748ed49702ae" },
        update: {
          $set: {
            _id: "42aa60a4-14a9-4384-bca5-748ed49702ae",
            type: "EXPENSE",
            amount: 150,
            description: "Food",
            date: ISODate("2026-06-19T18:30:00.000Z"),
            category: "food",
            receiptUrl: null,
            isRecurring: false,
            recurringInterval: null,
            nextRecurringDate: null,
            lastProcessed: null,
            status: "COMPLETED",
            userId: "64c55368-dfd3-4f84-9628-8deb7828e157",
            accountId: "eefc981a-878a-46d5-8f69-0e7708266013",
            createdAt: ISODate("2026-07-27T16:04:40.905Z"),
            updatedAt: ISODate("2026-07-27T16:04:40.905Z")
          }
        },
        upsert: true
      }
    },
    {
      updateOne: {
        filter: { _id: "44384f5e-2eab-4784-b05c-97efa0676c6a" },
        update: {
          $set: {
            _id: "44384f5e-2eab-4784-b05c-97efa0676c6a",
            type: "EXPENSE",
            amount: 900,
            description: "Mass Gainer",
            date: ISODate("2026-06-29T18:30:00.000Z"),
            category: "healthcare",
            receiptUrl: null,
            isRecurring: false,
            recurringInterval: null,
            nextRecurringDate: null,
            lastProcessed: null,
            status: "COMPLETED",
            userId: "64c55368-dfd3-4f84-9628-8deb7828e157",
            accountId: "eefc981a-878a-46d5-8f69-0e7708266013",
            createdAt: ISODate("2026-07-27T16:12:33.953Z"),
            updatedAt: ISODate("2026-07-27T16:12:33.953Z")
          }
        },
        upsert: true
      }
    },
    {
      updateOne: {
        filter: { _id: "464e2ba5-376d-4177-9856-20e5c8c6e95a" },
        update: {
          $set: {
            _id: "464e2ba5-376d-4177-9856-20e5c8c6e95a",
            type: "EXPENSE",
            amount: 2500,
            description: "Dress purchase",
            date: ISODate("2026-04-23T12:18:57.253Z"),
            category: "shopping",
            receiptUrl: null,
            isRecurring: false,
            recurringInterval: null,
            nextRecurringDate: null,
            lastProcessed: null,
            status: "COMPLETED",
            userId: "64c55368-dfd3-4f84-9628-8deb7828e157",
            accountId: "eefc981a-878a-46d5-8f69-0e7708266013",
            createdAt: ISODate("2026-04-23T12:19:25.742Z"),
            updatedAt: ISODate("2026-04-23T12:19:25.742Z")
          }
        },
        upsert: true
      }
    },
    {
      updateOne: {
        filter: { _id: "475decbb-a2b6-4d3d-8ecc-e10bc9557c27" },
        update: {
          $set: {
            _id: "475decbb-a2b6-4d3d-8ecc-e10bc9557c27",
            type: "EXPENSE",
            amount: 1000,
            description: "employee treat",
            date: ISODate("2026-07-01T18:30:00.000Z"),
            category: "food",
            receiptUrl: null,
            isRecurring: false,
            recurringInterval: null,
            nextRecurringDate: null,
            lastProcessed: null,
            status: "COMPLETED",
            userId: "64c55368-dfd3-4f84-9628-8deb7828e157",
            accountId: "eefc981a-878a-46d5-8f69-0e7708266013",
            createdAt: ISODate("2026-07-27T16:10:36.386Z"),
            updatedAt: ISODate("2026-07-27T16:10:36.386Z")
          }
        },
        upsert: true
      }
    },
    {
      updateOne: {
        filter: { _id: "4bf576e7-d80b-4575-a718-727cf9cca0f1" },
        update: {
          $set: {
            _id: "4bf576e7-d80b-4575-a718-727cf9cca0f1",
            type: "EXPENSE",
            amount: 2300,
            description: "Bajaj EMI",
            date: ISODate("2026-04-03T18:30:00.000Z"),
            category: "bills",
            receiptUrl: null,
            isRecurring: false,
            recurringInterval: null,
            nextRecurringDate: null,
            lastProcessed: null,
            status: "COMPLETED",
            userId: "64c55368-dfd3-4f84-9628-8deb7828e157",
            accountId: "eefc981a-878a-46d5-8f69-0e7708266013",
            createdAt: ISODate("2026-04-05T14:58:59.916Z"),
            updatedAt: ISODate("2026-04-05T14:58:59.916Z")
          }
        },
        upsert: true
      }
    },
    {
      updateOne: {
        filter: { _id: "4c145b63-169f-45ce-bcfa-c08acfb07998" },
        update: {
          $set: {
            _id: "4c145b63-169f-45ce-bcfa-c08acfb07998",
            type: "INCOME",
            amount: 2000,
            description: "Land Project Advance",
            date: ISODate("2026-05-21T18:30:00.000Z"),
            category: "freelance",
            receiptUrl: null,
            isRecurring: false,
            recurringInterval: null,
            nextRecurringDate: null,
            lastProcessed: null,
            status: "COMPLETED",
            userId: "64c55368-dfd3-4f84-9628-8deb7828e157",
            accountId: "eefc981a-878a-46d5-8f69-0e7708266013",
            createdAt: ISODate("2026-06-13T17:38:54.330Z"),
            updatedAt: ISODate("2026-06-14T14:42:00.985Z")
          }
        },
        upsert: true
      }
    },
    {
      updateOne: {
        filter: { _id: "544dacb9-5ce3-4ff8-b8f4-d8d23273957a" },
        update: {
          $set: {
            _id: "544dacb9-5ce3-4ff8-b8f4-d8d23273957a",
            type: "EXPENSE",
            amount: 20000,
            description: "Mother Savings",
            date: ISODate("2026-06-29T18:30:00.000Z"),
            category: "other-expense",
            receiptUrl: null,
            isRecurring: false,
            recurringInterval: null,
            nextRecurringDate: null,
            lastProcessed: null,
            status: "COMPLETED",
            userId: "64c55368-dfd3-4f84-9628-8deb7828e157",
            accountId: "eefc981a-878a-46d5-8f69-0e7708266013",
            createdAt: ISODate("2026-07-27T16:08:41.132Z"),
            updatedAt: ISODate("2026-07-27T16:08:41.132Z")
          }
        },
        upsert: true
      }
    },
    {
      updateOne: {
        filter: { _id: "5991caf4-47f4-4c69-976d-582d0153a100" },
        update: {
          $set: {
            _id: "5991caf4-47f4-4c69-976d-582d0153a100",
            type: "EXPENSE",
            amount: 90,
            description: "Biriyani ate",
            date: ISODate("2025-12-26T06:51:18.465Z"),
            category: "food",
            receiptUrl: null,
            isRecurring: false,
            recurringInterval: null,
            nextRecurringDate: null,
            lastProcessed: null,
            status: "COMPLETED",
            userId: "64c55368-dfd3-4f84-9628-8deb7828e157",
            accountId: "b8d8bc37-90aa-42fe-97cb-842f908c6994",
            createdAt: ISODate("2025-12-26T06:51:54.070Z"),
            updatedAt: ISODate("2025-12-26T06:51:54.070Z")
          }
        },
        upsert: true
      }
    },
    {
      updateOne: {
        filter: { _id: "5b089d55-fed0-4617-9349-eaf882db53b9" },
        update: {
          $set: {
            _id: "5b089d55-fed0-4617-9349-eaf882db53b9",
            type: "EXPENSE",
            amount: 7135,
            description: "January month rent",
            date: ISODate("2026-02-11T00:00:00.000Z"),
            category: "housing",
            receiptUrl: null,
            isRecurring: false,
            recurringInterval: null,
            nextRecurringDate: null,
            lastProcessed: null,
            status: "COMPLETED",
            userId: "64c55368-dfd3-4f84-9628-8deb7828e157",
            accountId: "b8d8bc37-90aa-42fe-97cb-842f908c6994",
            createdAt: ISODate("2026-02-13T16:50:23.997Z"),
            updatedAt: ISODate("2026-02-13T16:50:23.997Z")
          }
        },
        upsert: true
      }
    },
    {
      updateOne: {
        filter: { _id: "5c670aeb-6749-4752-b894-7922a1223046" },
        update: {
          $set: {
            _id: "5c670aeb-6749-4752-b894-7922a1223046",
            type: "EXPENSE",
            amount: 1415,
            description: "Accesories & food",
            date: ISODate("2026-01-31T18:30:00.000Z"),
            category: "other-expense",
            receiptUrl: null,
            isRecurring: false,
            recurringInterval: null,
            nextRecurringDate: null,
            lastProcessed: null,
            status: "COMPLETED",
            userId: "64c55368-dfd3-4f84-9628-8deb7828e157",
            accountId: "b8d8bc37-90aa-42fe-97cb-842f908c6994",
            createdAt: ISODate("2026-02-06T09:20:03.480Z"),
            updatedAt: ISODate("2026-02-09T16:12:31.275Z")
          }
        },
        upsert: true
      }
    },
    {
      updateOne: {
        filter: { _id: "62e97142-e04d-41fa-b529-b1ce9c9f8ae0" },
        update: {
          $set: {
            _id: "62e97142-e04d-41fa-b529-b1ce9c9f8ae0",
            type: "EXPENSE",
            amount: 200,
            description: "Briyani afternoon",
            date: ISODate("2026-04-23T12:19:34.432Z"),
            category: "food",
            receiptUrl: null,
            isRecurring: false,
            recurringInterval: null,
            nextRecurringDate: null,
            lastProcessed: null,
            status: "COMPLETED",
            userId: "64c55368-dfd3-4f84-9628-8deb7828e157",
            accountId: "eefc981a-878a-46d5-8f69-0e7708266013",
            createdAt: ISODate("2026-04-23T12:21:15.072Z"),
            updatedAt: ISODate("2026-04-23T12:21:15.072Z")
          }
        },
        upsert: true
      }
    },
    {
      updateOne: {
        filter: { _id: "66b4e2ad-2c84-49bc-9a29-60f8e09a9911" },
        update: {
          $set: {
            _id: "66b4e2ad-2c84-49bc-9a29-60f8e09a9911",
            type: "EXPENSE",
            amount: 500,
            description: "Exam Things (A4, pad, pen)",
            date: ISODate("2026-06-04T18:30:00.000Z"),
            category: "education",
            receiptUrl: null,
            isRecurring: false,
            recurringInterval: null,
            nextRecurringDate: null,
            lastProcessed: null,
            status: "COMPLETED",
            userId: "64c55368-dfd3-4f84-9628-8deb7828e157",
            accountId: "eefc981a-878a-46d5-8f69-0e7708266013",
            createdAt: ISODate("2026-06-14T14:38:33.274Z"),
            updatedAt: ISODate("2026-06-14T14:38:33.274Z")
          }
        },
        upsert: true
      }
    },
    {
      updateOne: {
        filter: { _id: "6950ad4d-c10d-4666-b76f-7619ade60ebb" },
        update: {
          $set: {
            _id: "6950ad4d-c10d-4666-b76f-7619ade60ebb",
            type: "INCOME",
            amount: 8892,
            description: "April Salary",
            date: ISODate("2026-04-29T18:30:00.000Z"),
            category: "salary",
            receiptUrl: null,
            isRecurring: false,
            recurringInterval: null,
            nextRecurringDate: null,
            lastProcessed: null,
            status: "COMPLETED",
            userId: "64c55368-dfd3-4f84-9628-8deb7828e157",
            accountId: "eefc981a-878a-46d5-8f69-0e7708266013",
            createdAt: ISODate("2026-05-01T18:27:32.997Z"),
            updatedAt: ISODate("2026-05-01T18:27:32.997Z")
          }
        },
        upsert: true
      }
    },
    {
      updateOne: {
        filter: { _id: "6e8ca3a8-5525-4ecc-b525-0cf395c195dc" },
        update: {
          $set: {
            _id: "6e8ca3a8-5525-4ecc-b525-0cf395c195dc",
            type: "EXPENSE",
            amount: 12000,
            description: "SNK New PG rent & Advance",
            date: ISODate("2026-03-11T17:54:34.853Z"),
            category: "housing",
            receiptUrl: null,
            isRecurring: false,
            recurringInterval: null,
            nextRecurringDate: null,
            lastProcessed: null,
            status: "COMPLETED",
            userId: "64c55368-dfd3-4f84-9628-8deb7828e157",
            accountId: "b8d8bc37-90aa-42fe-97cb-842f908c6994",
            createdAt: ISODate("2026-03-11T17:55:28.933Z"),
            updatedAt: ISODate("2026-03-11T17:55:28.933Z")
          }
        },
        upsert: true
      }
    },
    {
      updateOne: {
        filter: { _id: "79a312b7-86a2-4650-8578-7cfbd3978ace" },
        update: {
          $set: {
            _id: "79a312b7-86a2-4650-8578-7cfbd3978ace",
            type: "EXPENSE",
            amount: 1500,
            description: "Movie, food expense",
            date: ISODate("2026-03-31T18:30:00.000Z"),
            category: "entertainment",
            receiptUrl: null,
            isRecurring: false,
            recurringInterval: null,
            nextRecurringDate: null,
            lastProcessed: null,
            status: "COMPLETED",
            userId: "64c55368-dfd3-4f84-9628-8deb7828e157",
            accountId: "eefc981a-878a-46d5-8f69-0e7708266013",
            createdAt: ISODate("2026-04-02T18:52:30.866Z"),
            updatedAt: ISODate("2026-04-02T18:52:30.866Z")
          }
        },
        upsert: true
      }
    },
    {
      updateOne: {
        filter: { _id: "7d313f0d-ff9e-48d2-8089-ab4b405ba9aa" },
        update: {
          $set: {
            _id: "7d313f0d-ff9e-48d2-8089-ab4b405ba9aa",
            type: "EXPENSE",
            amount: 2500,
            description: "Family expense",
            date: ISODate("2026-03-28T18:30:00.000Z"),
            category: "other-expense",
            receiptUrl: null,
            isRecurring: false,
            recurringInterval: null,
            nextRecurringDate: null,
            lastProcessed: null,
            status: "COMPLETED",
            userId: "64c55368-dfd3-4f84-9628-8deb7828e157",
            accountId: "eefc981a-878a-46d5-8f69-0e7708266013",
            createdAt: ISODate("2026-04-02T18:48:27.270Z"),
            updatedAt: ISODate("2026-04-02T18:48:27.270Z")
          }
        },
        upsert: true
      }
    },
    {
      updateOne: {
        filter: { _id: "84926516-713d-4744-8dc5-8cff89d13d2a" },
        update: {
          $set: {
            _id: "84926516-713d-4744-8dc5-8cff89d13d2a",
            type: "INCOME",
            amount: 41000,
            description: "Mother sent for SRM fee",
            date: ISODate("2026-02-22T18:30:00.000Z"),
            category: "other-income",
            receiptUrl: null,
            isRecurring: false,
            recurringInterval: null,
            nextRecurringDate: null,
            lastProcessed: null,
            status: "COMPLETED",
            userId: "64c55368-dfd3-4f84-9628-8deb7828e157",
            accountId: "b8d8bc37-90aa-42fe-97cb-842f908c6994",
            createdAt: ISODate("2026-03-10T15:09:41.013Z"),
            updatedAt: ISODate("2026-03-10T15:10:23.179Z")
          }
        },
        upsert: true
      }
    },
    {
      updateOne: {
        filter: { _id: "934df506-8e0f-4927-97dd-fd383453588c" },
        update: {
          $set: {
            _id: "934df506-8e0f-4927-97dd-fd383453588c",
            type: "EXPENSE",
            amount: 250,
            description: "Jio Recharge",
            date: ISODate("2026-06-12T18:30:00.000Z"),
            category: "utilities",
            receiptUrl: null,
            isRecurring: false,
            recurringInterval: null,
            nextRecurringDate: null,
            lastProcessed: null,
            status: "COMPLETED",
            userId: "64c55368-dfd3-4f84-9628-8deb7828e157",
            accountId: "eefc981a-878a-46d5-8f69-0e7708266013",
            createdAt: ISODate("2026-06-14T14:45:18.652Z"),
            updatedAt: ISODate("2026-06-14T14:47:01.038Z")
          }
        },
        upsert: true
      }
    },
    {
      updateOne: {
        filter: { _id: "99f7ad1f-10ad-4072-8501-44ee2923cc96" },
        update: {
          $set: {
            _id: "99f7ad1f-10ad-4072-8501-44ee2923cc96",
            type: "EXPENSE",
            amount: 37500,
            description: "SRM sem 2 fee paid",
            date: ISODate("2026-02-25T18:30:00.000Z"),
            category: "education",
            receiptUrl: null,
            isRecurring: false,
            recurringInterval: null,
            nextRecurringDate: null,
            lastProcessed: null,
            status: "COMPLETED",
            userId: "64c55368-dfd3-4f84-9628-8deb7828e157",
            accountId: "b8d8bc37-90aa-42fe-97cb-842f908c6994",
            createdAt: ISODate("2026-03-10T15:11:12.494Z"),
            updatedAt: ISODate("2026-03-10T15:11:12.494Z")
          }
        },
        upsert: true
      }
    },
    {
      updateOne: {
        filter: { _id: "9dd62378-ed50-414b-9c0a-e0b5b76197d3" },
        update: {
          $set: {
            _id: "9dd62378-ed50-414b-9c0a-e0b5b76197d3",
            type: "EXPENSE",
            amount: 790,
            description: "Mass Gainer",
            date: ISODate("2026-05-01T18:25:19.463Z"),
            category: "shopping",
            receiptUrl: null,
            isRecurring: false,
            recurringInterval: null,
            nextRecurringDate: null,
            lastProcessed: null,
            status: "COMPLETED",
            userId: "64c55368-dfd3-4f84-9628-8deb7828e157",
            accountId: "eefc981a-878a-46d5-8f69-0e7708266013",
            createdAt: ISODate("2026-05-01T18:26:20.381Z"),
            updatedAt: ISODate("2026-05-01T18:26:20.381Z")
          }
        },
        upsert: true
      }
    },
    {
      updateOne: {
        filter: { _id: "a3b42efb-1842-493c-ac24-5a37acd2aab6" },
        update: {
          $set: {
            _id: "a3b42efb-1842-493c-ac24-5a37acd2aab6",
            type: "INCOME",
            amount: 6700,
            description: "Mother Gave",
            date: ISODate("2026-07-27T16:12:43.615Z"),
            category: "rental",
            receiptUrl: null,
            isRecurring: false,
            recurringInterval: null,
            nextRecurringDate: null,
            lastProcessed: null,
            status: "COMPLETED",
            userId: "64c55368-dfd3-4f84-9628-8deb7828e157",
            accountId: "eefc981a-878a-46d5-8f69-0e7708266013",
            createdAt: ISODate("2026-07-27T16:13:54.249Z"),
            updatedAt: ISODate("2026-07-27T16:13:54.249Z")
          }
        },
        upsert: true
      }
    },
    {
      updateOne: {
        filter: { _id: "ae6052d7-cf35-4a61-a725-8e21624ca46c" },
        update: {
          $set: {
            _id: "ae6052d7-cf35-4a61-a725-8e21624ca46c",
            type: "EXPENSE",
            amount: 700,
            description: "Daily expenses",
            date: ISODate("2026-01-31T18:30:00.000Z"),
            category: "other-expense",
            receiptUrl: null,
            isRecurring: false,
            recurringInterval: null,
            nextRecurringDate: null,
            lastProcessed: null,
            status: "COMPLETED",
            userId: "64c55368-dfd3-4f84-9628-8deb7828e157",
            accountId: "b8d8bc37-90aa-42fe-97cb-842f908c6994",
            createdAt: ISODate("2026-02-06T09:12:00.017Z"),
            updatedAt: ISODate("2026-02-06T09:12:00.017Z")
          }
        },
        upsert: true
      }
    },
    {
      updateOne: {
        filter: { _id: "b293e231-4418-4297-b42b-93609f2377f5" },
        update: {
          $set: {
            _id: "b293e231-4418-4297-b42b-93609f2377f5",
            type: "EXPENSE",
            amount: 10000,
            description: "Savings Mother",
            date: ISODate("2026-04-17T18:30:00.000Z"),
            category: "other-expense",
            receiptUrl: null,
            isRecurring: false,
            recurringInterval: null,
            nextRecurringDate: null,
            lastProcessed: null,
            status: "COMPLETED",
            userId: "64c55368-dfd3-4f84-9628-8deb7828e157",
            accountId: "eefc981a-878a-46d5-8f69-0e7708266013",
            createdAt: ISODate("2026-04-23T12:18:47.750Z"),
            updatedAt: ISODate("2026-04-23T12:18:47.750Z")
          }
        },
        upsert: true
      }
    },
    {
      updateOne: {
        filter: { _id: "b41fd6f4-014d-4fe0-acef-43a1f1dfdd38" },
        update: {
          $set: {
            _id: "b41fd6f4-014d-4fe0-acef-43a1f1dfdd38",
            type: "INCOME",
            amount: 22900,
            description: "June Salary",
            date: ISODate("2026-06-29T18:30:00.000Z"),
            category: "salary",
            receiptUrl: null,
            isRecurring: false,
            recurringInterval: null,
            nextRecurringDate: null,
            lastProcessed: null,
            status: "COMPLETED",
            userId: "64c55368-dfd3-4f84-9628-8deb7828e157",
            accountId: "eefc981a-878a-46d5-8f69-0e7708266013",
            createdAt: ISODate("2026-07-27T16:07:20.581Z"),
            updatedAt: ISODate("2026-07-27T16:07:46.273Z")
          }
        },
        upsert: true
      }
    },
    {
      updateOne: {
        filter: { _id: "b5f28501-be2f-4692-9e79-2da1802b9078" },
        update: {
          $set: {
            _id: "b5f28501-be2f-4692-9e79-2da1802b9078",
            type: "INCOME",
            amount: 12000,
            description: "Bala PG Shift Cash",
            date: ISODate("2026-03-11T17:52:54.119Z"),
            category: "other-income",
            receiptUrl: null,
            isRecurring: false,
            recurringInterval: null,
            nextRecurringDate: null,
            lastProcessed: null,
            status: "COMPLETED",
            userId: "64c55368-dfd3-4f84-9628-8deb7828e157",
            accountId: "b8d8bc37-90aa-42fe-97cb-842f908c6994",
            createdAt: ISODate("2026-03-11T17:54:18.082Z"),
            updatedAt: ISODate("2026-03-11T17:54:18.082Z")
          }
        },
        upsert: true
      }
    },
    {
      updateOne: {
        filter: { _id: "b6911bba-2e58-4e85-95d0-3e3f2ea8c88d" },
        update: {
          $set: {
            _id: "b6911bba-2e58-4e85-95d0-3e3f2ea8c88d",
            type: "INCOME",
            amount: 3000,
            description: "PG rent amount from Mother",
            date: ISODate("2026-05-12T18:30:00.000Z"),
            category: "other-income",
            receiptUrl: null,
            isRecurring: false,
            recurringInterval: null,
            nextRecurringDate: null,
            lastProcessed: null,
            status: "COMPLETED",
            userId: "64c55368-dfd3-4f84-9628-8deb7828e157",
            accountId: "eefc981a-878a-46d5-8f69-0e7708266013",
            createdAt: ISODate("2026-06-13T17:36:11.543Z"),
            updatedAt: ISODate("2026-06-13T17:36:11.543Z")
          }
        },
        upsert: true
      }
    },
    {
      updateOne: {
        filter: { _id: "b892e905-cd20-47e1-a68e-4c8cf1da9e5c" },
        update: {
          $set: {
            _id: "b892e905-cd20-47e1-a68e-4c8cf1da9e5c",
            type: "EXPENSE",
            amount: 160,
            description: "Food",
            date: ISODate("2026-06-13T18:30:00.000Z"),
            category: "food",
            receiptUrl: null,
            isRecurring: false,
            recurringInterval: null,
            nextRecurringDate: null,
            lastProcessed: null,
            status: "COMPLETED",
            userId: "64c55368-dfd3-4f84-9628-8deb7828e157",
            accountId: "eefc981a-878a-46d5-8f69-0e7708266013",
            createdAt: ISODate("2026-07-27T16:03:43.263Z"),
            updatedAt: ISODate("2026-07-27T16:03:43.263Z")
          }
        },
        upsert: true
      }
    },
    {
      updateOne: {
        filter: { _id: "c0044c76-a9b2-41c4-963c-1e2d2950c600" },
        update: {
          $set: {
            _id: "c0044c76-a9b2-41c4-963c-1e2d2950c600",
            type: "INCOME",
            amount: 1000,
            description: "Web Project - yuga",
            date: ISODate("2026-02-06T18:30:00.000Z"),
            category: "freelance",
            receiptUrl: null,
            isRecurring: false,
            recurringInterval: null,
            nextRecurringDate: null,
            lastProcessed: null,
            status: "COMPLETED",
            userId: "64c55368-dfd3-4f84-9628-8deb7828e157",
            accountId: "b8d8bc37-90aa-42fe-97cb-842f908c6994",
            createdAt: ISODate("2026-02-09T16:08:42.732Z"),
            updatedAt: ISODate("2026-02-13T16:54:37.433Z")
          }
        },
        upsert: true
      }
    },
    {
      updateOne: {
        filter: { _id: "c1a8bcbe-a627-46cd-9aaf-019669cdcb60" },
        update: {
          $set: {
            _id: "c1a8bcbe-a627-46cd-9aaf-019669cdcb60",
            type: "EXPENSE",
            amount: 45,
            description: "Lunch Food",
            date: ISODate("2026-01-10T18:30:00.000Z"),
            category: "food",
            receiptUrl: null,
            isRecurring: false,
            recurringInterval: null,
            nextRecurringDate: null,
            lastProcessed: null,
            status: "COMPLETED",
            userId: "64c55368-dfd3-4f84-9628-8deb7828e157",
            accountId: "b8d8bc37-90aa-42fe-97cb-842f908c6994",
            createdAt: ISODate("2026-01-11T18:44:24.779Z"),
            updatedAt: ISODate("2026-01-24T18:12:26.298Z")
          }
        },
        upsert: true
      }
    },
    {
      updateOne: {
        filter: { _id: "c2a2f1c0-dda5-4beb-8955-657deeaa127a" },
        update: {
          $set: {
            _id: "c2a2f1c0-dda5-4beb-8955-657deeaa127a",
            type: "EXPENSE",
            amount: 1910.99,
            description: "small expenses total",
            date: ISODate("2026-05-01T18:32:59.042Z"),
            category: "other-expense",
            receiptUrl: null,
            isRecurring: false,
            recurringInterval: null,
            nextRecurringDate: null,
            lastProcessed: null,
            status: "COMPLETED",
            userId: "64c55368-dfd3-4f84-9628-8deb7828e157",
            accountId: "b8d8bc37-90aa-42fe-97cb-842f908c6994",
            createdAt: ISODate("2026-05-01T18:33:21.689Z"),
            updatedAt: ISODate("2026-05-01T18:33:21.689Z")
          }
        },
        upsert: true
      }
    },
    {
      updateOne: {
        filter: { _id: "c2c30538-c9fa-491a-95f4-d80e8426ac36" },
        update: {
          $set: {
            _id: "c2c30538-c9fa-491a-95f4-d80e8426ac36",
            type: "EXPENSE",
            amount: 607,
            description: "Feb Month lunch cost",
            date: ISODate("2026-02-28T18:30:00.000Z"),
            category: "food",
            receiptUrl: null,
            isRecurring: false,
            recurringInterval: null,
            nextRecurringDate: null,
            lastProcessed: null,
            status: "COMPLETED",
            userId: "64c55368-dfd3-4f84-9628-8deb7828e157",
            accountId: "b8d8bc37-90aa-42fe-97cb-842f908c6994",
            createdAt: ISODate("2026-03-10T15:06:02.572Z"),
            updatedAt: ISODate("2026-03-10T15:12:01.104Z")
          }
        },
        upsert: true
      }
    },
    {
      updateOne: {
        filter: { _id: "c3522bc0-1c55-4621-81b7-0421316aa5db" },
        update: {
          $set: {
            _id: "c3522bc0-1c55-4621-81b7-0421316aa5db",
            type: "INCOME",
            amount: 300,
            description: "father gave",
            date: ISODate("2026-05-13T18:06:53.065Z"),
            category: "other-income",
            receiptUrl: null,
            isRecurring: false,
            recurringInterval: null,
            nextRecurringDate: null,
            lastProcessed: null,
            status: "COMPLETED",
            userId: "64c55368-dfd3-4f84-9628-8deb7828e157",
            accountId: "b8d8bc37-90aa-42fe-97cb-842f908c6994",
            createdAt: ISODate("2026-05-13T18:08:24.978Z"),
            updatedAt: ISODate("2026-05-13T18:08:24.978Z")
          }
        },
        upsert: true
      }
    },
    {
      updateOne: {
        filter: { _id: "c40d7f52-b6c4-4d99-a940-d2783ec293d8" },
        update: {
          $set: {
            _id: "c40d7f52-b6c4-4d99-a940-d2783ec293d8",
            type: "EXPENSE",
            amount: 350,
            description: "Vicky recharge",
            date: ISODate("2026-01-26T18:30:00.000Z"),
            category: "bills",
            receiptUrl: null,
            isRecurring: false,
            recurringInterval: null,
            nextRecurringDate: null,
            lastProcessed: null,
            status: "COMPLETED",
            userId: "64c55368-dfd3-4f84-9628-8deb7828e157",
            accountId: "b8d8bc37-90aa-42fe-97cb-842f908c6994",
            createdAt: ISODate("2026-01-29T05:18:58.463Z"),
            updatedAt: ISODate("2026-01-29T05:18:58.463Z")
          }
        },
        upsert: true
      }
    },
    {
      updateOne: {
        filter: { _id: "d1bfa8a5-93b3-487d-b1d7-d8b85faacd8e" },
        update: {
          $set: {
            _id: "d1bfa8a5-93b3-487d-b1d7-d8b85faacd8e",
            type: "INCOME",
            amount: 5000,
            description: "Web Project - Investnow",
            date: ISODate("2026-02-09T18:30:00.000Z"),
            category: "freelance",
            receiptUrl: null,
            isRecurring: false,
            recurringInterval: null,
            nextRecurringDate: null,
            lastProcessed: null,
            status: "COMPLETED",
            userId: "64c55368-dfd3-4f84-9628-8deb7828e157",
            accountId: "b8d8bc37-90aa-42fe-97cb-842f908c6994",
            createdAt: ISODate("2026-02-13T16:51:50.434Z"),
            updatedAt: ISODate("2026-02-13T16:52:15.712Z")
          }
        },
        upsert: true
      }
    },
    {
      updateOne: {
        filter: { _id: "d5f48772-db9b-4939-9943-bae704a51359" },
        update: {
          $set: {
            _id: "d5f48772-db9b-4939-9943-bae704a51359",
            type: "EXPENSE",
            amount: 1100,
            description: "Personal purchase",
            date: ISODate("2026-01-22T18:30:00.000Z"),
            category: "personal",
            receiptUrl: null,
            isRecurring: false,
            recurringInterval: null,
            nextRecurringDate: null,
            lastProcessed: null,
            status: "COMPLETED",
            userId: "64c55368-dfd3-4f84-9628-8deb7828e157",
            accountId: "b8d8bc37-90aa-42fe-97cb-842f908c6994",
            createdAt: ISODate("2026-01-29T05:18:12.265Z"),
            updatedAt: ISODate("2026-01-29T05:18:12.265Z")
          }
        },
        upsert: true
      }
    },
    {
      updateOne: {
        filter: { _id: "d65c87a6-a6cc-42e2-9f74-5b97c841698f" },
        update: {
          $set: {
            _id: "d65c87a6-a6cc-42e2-9f74-5b97c841698f",
            type: "EXPENSE",
            amount: 7200,
            description: "PG Rent",
            date: ISODate("2026-04-10T18:30:00.000Z"),
            category: "housing",
            receiptUrl: null,
            isRecurring: false,
            recurringInterval: null,
            nextRecurringDate: null,
            lastProcessed: null,
            status: "COMPLETED",
            userId: "64c55368-dfd3-4f84-9628-8deb7828e157",
            accountId: "eefc981a-878a-46d5-8f69-0e7708266013",
            createdAt: ISODate("2026-04-16T18:08:33.738Z"),
            updatedAt: ISODate("2026-04-16T18:08:33.738Z")
          }
        },
        upsert: true
      }
    },
    {
      updateOne: {
        filter: { _id: "d9edad8c-0569-4a8b-8c4a-cc4cb3910a30" },
        update: {
          $set: {
            _id: "d9edad8c-0569-4a8b-8c4a-cc4cb3910a30",
            type: "EXPENSE",
            amount: 760,
            description: "Home travel",
            date: ISODate("2026-04-27T18:30:00.000Z"),
            category: "transportation",
            receiptUrl: null,
            isRecurring: false,
            recurringInterval: null,
            nextRecurringDate: null,
            lastProcessed: null,
            status: "COMPLETED",
            userId: "64c55368-dfd3-4f84-9628-8deb7828e157",
            accountId: "eefc981a-878a-46d5-8f69-0e7708266013",
            createdAt: ISODate("2026-05-01T18:24:16.358Z"),
            updatedAt: ISODate("2026-05-01T18:24:16.358Z")
          }
        },
        upsert: true
      }
    },
    {
      updateOne: {
        filter: { _id: "de058cd1-6c95-49b4-adf8-439ba9ec94ba" },
        update: {
          $set: {
            _id: "de058cd1-6c95-49b4-adf8-439ba9ec94ba",
            type: "INCOME",
            amount: 2600,
            description: "Home savings",
            date: ISODate("2026-01-19T18:30:00.000Z"),
            category: "other-income",
            receiptUrl: null,
            isRecurring: false,
            recurringInterval: null,
            nextRecurringDate: null,
            lastProcessed: null,
            status: "COMPLETED",
            userId: "64c55368-dfd3-4f84-9628-8deb7828e157",
            accountId: "b8d8bc37-90aa-42fe-97cb-842f908c6994",
            createdAt: ISODate("2026-01-29T05:16:42.698Z"),
            updatedAt: ISODate("2026-01-29T05:16:42.698Z")
          }
        },
        upsert: true
      }
    },
    {
      updateOne: {
        filter: { _id: "e72d544f-278d-40cd-8153-a55b4905a192" },
        update: {
          $set: {
            _id: "e72d544f-278d-40cd-8153-a55b4905a192",
            type: "EXPENSE",
            amount: 1592,
            description: "mother birthday gifts",
            date: ISODate("2026-05-09T18:30:00.000Z"),
            category: "gifts",
            receiptUrl: null,
            isRecurring: false,
            recurringInterval: null,
            nextRecurringDate: null,
            lastProcessed: null,
            status: "COMPLETED",
            userId: "64c55368-dfd3-4f84-9628-8deb7828e157",
            accountId: "eefc981a-878a-46d5-8f69-0e7708266013",
            createdAt: ISODate("2026-05-13T18:04:02.570Z"),
            updatedAt: ISODate("2026-05-13T18:04:33.319Z")
          }
        },
        upsert: true
      }
    },
    {
      updateOne: {
        filter: { _id: "e9d805ce-9569-4065-83a5-2c88be8113e0" },
        update: {
          $set: {
            _id: "e9d805ce-9569-4065-83a5-2c88be8113e0",
            type: "EXPENSE",
            amount: 352,
            description: "Feb metro cost",
            date: ISODate("2026-02-28T18:30:00.000Z"),
            category: "travel",
            receiptUrl: null,
            isRecurring: false,
            recurringInterval: null,
            nextRecurringDate: null,
            lastProcessed: null,
            status: "COMPLETED",
            userId: "64c55368-dfd3-4f84-9628-8deb7828e157",
            accountId: "b8d8bc37-90aa-42fe-97cb-842f908c6994",
            createdAt: ISODate("2026-03-10T15:03:37.476Z"),
            updatedAt: ISODate("2026-03-10T15:12:26.605Z")
          }
        },
        upsert: true
      }
    },
    {
      updateOne: {
        filter: { _id: "f08d44bc-cb65-434e-b9af-8b77dbec2600" },
        update: {
          $set: {
            _id: "f08d44bc-cb65-434e-b9af-8b77dbec2600",
            type: "EXPENSE",
            amount: 7000,
            description: "PG Rent May-June",
            date: ISODate("2026-05-13T18:30:00.000Z"),
            category: "housing",
            receiptUrl: null,
            isRecurring: false,
            recurringInterval: null,
            nextRecurringDate: null,
            lastProcessed: null,
            status: "COMPLETED",
            userId: "64c55368-dfd3-4f84-9628-8deb7828e157",
            accountId: "eefc981a-878a-46d5-8f69-0e7708266013",
            createdAt: ISODate("2026-06-13T17:37:28.377Z"),
            updatedAt: ISODate("2026-06-13T18:00:07.853Z")
          }
        },
        upsert: true
      }
    },
    {
      updateOne: {
        filter: { _id: "f283245c-907a-4623-a1bd-0458594d146f" },
        update: {
          $set: {
            _id: "f283245c-907a-4623-a1bd-0458594d146f",
            type: "EXPENSE",
            amount: 10000,
            description: "Mother Savings",
            date: ISODate("2026-05-30T18:30:00.000Z"),
            category: "other-expense",
            receiptUrl: null,
            isRecurring: false,
            recurringInterval: null,
            nextRecurringDate: null,
            lastProcessed: null,
            status: "COMPLETED",
            userId: "64c55368-dfd3-4f84-9628-8deb7828e157",
            accountId: "eefc981a-878a-46d5-8f69-0e7708266013",
            createdAt: ISODate("2026-06-13T18:38:09.395Z"),
            updatedAt: ISODate("2026-06-13T18:39:18.035Z")
          }
        },
        upsert: true
      }
    },
    {
      updateOne: {
        filter: { _id: "f596e33e-d3e5-4b68-9397-1d047d0aefbb" },
        update: {
          $set: {
            _id: "f596e33e-d3e5-4b68-9397-1d047d0aefbb",
            type: "EXPENSE",
            amount: 6750,
            description: "PG rent june-july",
            date: ISODate("2026-06-09T18:30:00.000Z"),
            category: "bills",
            receiptUrl: null,
            isRecurring: false,
            recurringInterval: null,
            nextRecurringDate: null,
            lastProcessed: null,
            status: "COMPLETED",
            userId: "64c55368-dfd3-4f84-9628-8deb7828e157",
            accountId: "eefc981a-878a-46d5-8f69-0e7708266013",
            createdAt: ISODate("2026-06-13T17:55:28.616Z"),
            updatedAt: ISODate("2026-06-13T17:55:28.616Z")
          }
        },
        upsert: true
      }
    },
    {
      updateOne: {
        filter: { _id: "f6181c8b-8c63-48e3-a6af-0392a5abad98" },
        update: {
          $set: {
            _id: "f6181c8b-8c63-48e3-a6af-0392a5abad98",
            type: "INCOME",
            amount: 15000,
            description: "2nd month salary",
            date: ISODate("2026-04-16T18:30:00.000Z"),
            category: "salary",
            receiptUrl: null,
            isRecurring: false,
            recurringInterval: null,
            nextRecurringDate: null,
            lastProcessed: null,
            status: "COMPLETED",
            userId: "64c55368-dfd3-4f84-9628-8deb7828e157",
            accountId: "eefc981a-878a-46d5-8f69-0e7708266013",
            createdAt: ISODate("2026-04-23T12:14:32.232Z"),
            updatedAt: ISODate("2026-04-23T12:14:32.232Z")
          }
        },
        upsert: true
      }
    },
    {
      updateOne: {
        filter: { _id: "fb45fad8-0474-45d0-bdb1-f824500a15e7" },
        update: {
          $set: {
            _id: "fb45fad8-0474-45d0-bdb1-f824500a15e7",
            type: "EXPENSE",
            amount: 6660,
            description: "PG Rent July-August",
            date: ISODate("2026-07-09T18:30:00.000Z"),
            category: "bills",
            receiptUrl: null,
            isRecurring: false,
            recurringInterval: null,
            nextRecurringDate: null,
            lastProcessed: null,
            status: "COMPLETED",
            userId: "64c55368-dfd3-4f84-9628-8deb7828e157",
            accountId: "eefc981a-878a-46d5-8f69-0e7708266013",
            createdAt: ISODate("2026-07-27T16:15:30.925Z"),
            updatedAt: ISODate("2026-07-27T16:16:21.456Z")
          }
        },
        upsert: true
      }
    },
  ];
  const transactionsResult = targetDb.transactions.bulkWrite(transactionsOps);
  print("✔ Transactions upserted. Matched: " + transactionsResult.matchedCount + ", Upserted: " + transactionsResult.upsertedCount);

  // 7. Summary & Verification
  print("\n=================================================");
  print("RESTORE COMPLETE & VERIFIED:");
  print("  • Users count in DB:        " + targetDb.users.countDocuments());
  print("  • Accounts count in DB:     " + targetDb.accounts.countDocuments());
  print("  • Budgets count in DB:      " + targetDb.budgets.countDocuments());
  print("  • Transactions count in DB: " + targetDb.transactions.countDocuments());
  print("=================================================");
})();
