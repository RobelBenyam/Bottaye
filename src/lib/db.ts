import {
  query,
  where,
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  doc,
  increment,
  setDoc,
  getDoc,
} from "firebase/firestore";
import { db } from "./firebase";

const getNextId = async (collectionName: string): Promise<number> => {
  const counterRef = doc(db, "counters", collectionName);
  const counterDoc = await getDoc(counterRef);

  if (counterDoc.exists()) {
    // Increment the counter
    await updateDoc(counterRef, { value: increment(1) });
    return counterDoc.data().value + 1;
  } else {
    // Initialize the counter
    await setDoc(counterRef, { value: 1 });
    return 1;
  }
};

/**
 * Create a new document in a Firestore collection.
 * @param collectionName - The name of the Firestore collection.
 * @param data - The data to be added to the collection.
 * @returns The created document reference.
 */
export const createDocument = async (
  collectionName: string,
  data: Record<string, any>,
  useIncrementalId: boolean = false
) => {
  try {
    if (useIncrementalId) {
      const nextId = await getNextId(collectionName);
      console.log("Next ID for collection", collectionName, "is", nextId);
      data.id = nextId;
      console.log("data is", data);
    }
    Object.keys(data).forEach((key) => {
      if (data[key] === undefined) {
        data[key] = "";
      }
    });
    const docRef = await addDoc(collection(db, collectionName), data);
    return docRef;
  } catch (error) {
    console.error("Error adding document: ", error);
    throw error;
  }
};

/**
 * Update an existing document in a Firestore collection.
 * @param collectionName - The name of the Firestore collection.
 * @param docId - The ID of the document to update.
 * @param data - The data to update in the document.
 */
export const updateDocument = async (
  collectionName: string,
  docId: string,
  data: Record<string, any>
) => {
  Object.keys(data).forEach((key) => {
    if (data[key] === undefined) {
      data[key] = "";
    }
  });
  console.log(collectionName, docId, data);
  try {
    const docRef = doc(db, collectionName, String(docId));
    await updateDoc(docRef, data);
    console.log("Document updated with ID: ", docId);
  } catch (error) {
    console.error("Error updating document: ", error);
    throw error;
  }
};

/**
 * Delete a document from a Firestore collection.
 * @param collectionName - The name of the Firestore collection.
 * @param docId - The ID of the document to delete.
 */
export const deleteDocument = async (collectionName: string, docId: string) => {
  try {
    const docRef = doc(db, collectionName, docId);
    await deleteDoc(docRef);
    console.log("Document deleted with ID: ", docId);
  } catch (error) {
    console.error("Error deleting document: ", error);
    throw error;
  }
};

/**
 * Read all documents from a Firestore collection.
 * @param collectionName - The name of the Firestore collection.
 * @returns An array of documents from the collection.
 */
export const readAllDocuments = async (collectionName: string) => {
  try {
    const querySnapshot = await getDocs(collection(db, collectionName));
    const documents = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    console.log("Documents fetched: ", documents);
    return documents;
  } catch (error) {
    console.error("Error reading documents: ", error);
    throw error;
  }
};

/**
 * Read documents from a Firestore collection with advanced filtering.
 * @param collectionName - The name of the Firestore collection.
 * @param filters - An array of filter objects: { field, op, value }
 * @returns An array of matching documents.
 */
export const readDocumentsByAdvancedFilters = async (
  collectionName: string,
  filters: { field: string; op: "==" | ">" | ">=" | "<" | "<="; value: any }[]
) => {
  try {
    let q: any = collection(db, collectionName);

    if (filters.length > 0) {
      const wheres = filters.map(({ field, op, value }) =>
        where(field, op, value)
      );
      q = query(q, ...wheres);
    }

    const querySnapshot = await getDocs(q);
    const documents = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() || {}),
    }));

    return documents;
  } catch (error) {
    console.error("Error fetching documents:", error);
    throw error;
  }
};
