
// Mock Firebase implementation (no external dependencies needed)
// This simulates Firebase functionality using localStorage and in-memory state

const MESSAGES_KEY = "supportCircle_messages";
const REPORTS_KEY = "supportCircle_reports";

// Mock Firestore
class MockFirestore {
  constructor() {
    this.listeners = new Map();
  }

  collection(path) {
    return new MockCollection(path, this);
  }

  // Notifies all listeners whose path matches the changed path
  notifyListeners(path) {
    this.listeners.forEach((listener, key) => {
      // Check if the listener's path is the same as, or a sub-path of, the changed path
      // Or if the changed path is a sub-path of the listener's path (for single doc listeners)
      // For simplicity, we trigger all collection listeners associated with the path.
      // A more robust mock might distinguish between document and collection listeners.
      if (listener.path === path || path.startsWith(listener.path + '/') || listener.path.startsWith(path + '/')) {
        listener.callback();
      }
    });
  }
}

class MockCollection {
  constructor(path, db) {
    this.path = path;
    this.db = db;
  }

  doc(id) {
    return new MockDocument(`${this.path}/${id}`, this.db);
  }

  async add(data) {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    const fullPath = this.path;
    
    const stored = JSON.parse(localStorage.getItem(fullPath) || '[]');
    const newDoc = {
      id,
      ...data,
      createdAt: data.createdAt === 'SERVER_TIMESTAMP' ? new Date().toISOString() : data.createdAt
    };
    stored.push(newDoc);
    localStorage.setItem(fullPath, JSON.stringify(stored));
    
    // Trigger listeners
    this.db.notifyListeners(fullPath);
    
    return { id };
  }
}

class MockDocument {
  constructor(path, db) {
    this.path = path; // e.g., 'messages/docId123'
    this.db = db;
    
    // Extract collection path and document ID
    const pathParts = path.split('/');
    this.id = pathParts[pathParts.length - 1];
    this.collectionPath = pathParts.slice(0, pathParts.length - 1).join('/');
  }

  collection(subPath) {
    return new MockCollection(`${this.path}/${subPath}`, this.db);
  }

  async update(data) {
    let collectionData = JSON.parse(localStorage.getItem(this.collectionPath) || '[]');
    const docIndex = collectionData.findIndex(doc => doc.id === this.id);

    if (docIndex > -1) {
      const existingDoc = collectionData[docIndex];
      const updatedDoc = { ...existingDoc, ...data };
      
      // Handle SERVER_TIMESTAMP for update
      for (const key in updatedDoc) {
        if (updatedDoc[key] === 'SERVER_TIMESTAMP') {
          updatedDoc[key] = new Date().toISOString();
        }
      }

      collectionData[docIndex] = updatedDoc;
      localStorage.setItem(this.collectionPath, JSON.stringify(collectionData));
      this.db.notifyListeners(this.collectionPath);
    } else {
      console.warn(`Mock Firestore: Document with id ${this.id} not found in collection ${this.collectionPath} for update.`);
    }
  }

  async delete() {
    let collectionData = JSON.parse(localStorage.getItem(this.collectionPath) || '[]');
    const initialLength = collectionData.length;
    collectionData = collectionData.filter(doc => doc.id !== this.id);

    if (collectionData.length < initialLength) {
      localStorage.setItem(this.collectionPath, JSON.stringify(collectionData));
      this.db.notifyListeners(this.collectionPath);
    } else {
      console.warn(`Mock Firestore: Document with id ${this.id} not found in collection ${this.collectionPath} for deletion.`);
    }
  }
}

class MockQuery {
  constructor(collectionPath, db) {
    this.collectionPath = collectionPath;
    this.db = db;
    this._orderBy = null;
    this._limit = null;
    this._where = [];
  }

  orderBy(field, direction = 'asc') {
    this._orderBy = { field, direction };
    return this;
  }

  limit(count) {
    this._limit = count;
    return this;
  }

  where(field, operator, value) {
    this._where.push({ field, operator, value });
    return this;
  }

  onSnapshot(callback, errorCallback) {
    const listenerKey = `${this.collectionPath}_query_${Date.now()}`;
    
    const update = () => {
      try {
        let data = JSON.parse(localStorage.getItem(this.collectionPath) || '[]');
        
        // Apply where filters
        this._where.forEach(({ field, operator, value }) => {
          data = data.filter(doc => {
            const docValue = doc[field];
            if (docValue === undefined || docValue === null) return false;
            
            // Attempt to convert to comparable format if it might be a date string
            let comparableDocValue = docValue;
            let comparableValue = value;

            try {
              const dateDoc = new Date(docValue);
              const dateValue = value instanceof Date ? value : new Date(value);
              // Only use date comparison if both are valid dates
              if (!isNaN(dateDoc.getTime()) && !isNaN(dateValue.getTime())) {
                comparableDocValue = dateDoc.getTime();
                comparableValue = dateValue.getTime();
              }
            } catch (e) { /* Not a date, proceed with original values */ }
            
            switch (operator) {
              case '>':
                return comparableDocValue > comparableValue;
              case '>=':
                return comparableDocValue >= comparableValue;
              case '<':
                return comparableDocValue < comparableValue;
              case '<=':
                return comparableDocValue <= comparableValue;
              case '==':
                return comparableDocValue === comparableValue;
              case '!=':
                return comparableDocValue !== comparableValue;
              case 'array-contains':
                return Array.isArray(comparableDocValue) && comparableDocValue.includes(comparableValue);
              case 'in':
                return Array.isArray(comparableValue) && comparableValue.includes(comparableDocValue);
              default:
                return true;
            }
          });
        });
        
        let sorted = [...data];
        if (this._orderBy) {
          sorted.sort((a, b) => {
            const aVal = a[this._orderBy.field];
            const bVal = b[this._orderBy.field];
            
            // Handle date strings for sorting
            let comparableA = aVal;
            let comparableB = bVal;
            try {
              const dateA = new Date(aVal);
              const dateB = new Date(bVal);
              if (!isNaN(dateA.getTime()) && !isNaN(dateB.getTime())) {
                comparableA = dateA.getTime();
                comparableB = dateB.getTime();
              }
            } catch (e) { /* Not a date, proceed with original values */ }

            const comparison = comparableA < comparableB ? -1 : comparableA > comparableB ? 1 : 0;
            return this._orderBy.direction === 'desc' ? -comparison : comparison;
          });
        }
        
        if (this._limit) {
          sorted = sorted.slice(0, this._limit);
        }
        
        const snapshot = {
          size: sorted.length,
          empty: sorted.length === 0,
          docs: sorted.map(doc => ({
            id: doc.id,
            data: () => {
              const { id, ...rest } = doc;
              return {
                ...rest,
                createdAt: rest.createdAt ? {
                  toDate: () => new Date(rest.createdAt)
                } : null
              };
            }
          }))
        };
        
        callback(snapshot);
      } catch (error) {
        if (errorCallback) errorCallback(error);
      }
    };
    
    // Store listener
    this.db.listeners.set(listenerKey, { path: this.collectionPath, callback: update });
    
    // Initial call
    update();
    
    // Return unsubscribe function
    return () => {
      this.db.listeners.delete(listenerKey);
    };
  }
}

// Mock Timestamp
export const Timestamp = {
  fromDate: (date) => date,
  fromMillis: (millis) => new Date(millis),
  now: () => new Date(),
};

// Mock Auth
class MockAuth {
  constructor() {
    this.currentUser = null;
    this.listeners = [];
  }

  onAuthStateChanged(callback) {
    this.listeners.push(callback);
    // Call immediately with current state
    callback(this.currentUser);
    
    return () => {
      const index = this.listeners.indexOf(callback);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  async signInAnonymously() {
    const uid = localStorage.getItem('anon_uid') || ('anon_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9));
    localStorage.setItem('anon_uid', uid);
    
    this.currentUser = {
      uid,
      isAnonymous: true
    };
    
    // Notify listeners
    this.listeners.forEach(callback => callback(this.currentUser));
    
    return { user: this.currentUser };
  }
}

// Create singleton instances
export const db = new MockFirestore();
export const auth = new MockAuth();

// Helper functions for Firestore operations
export function collection(dbInstance, ...pathSegments) {
  return dbInstance.collection(pathSegments.join('/'));
}

export function query(collectionRef, ...constraints) {
  if (!(collectionRef instanceof MockCollection)) {
    throw new Error('query expects a CollectionReference (from `collection` function).');
  }
  const q = new MockQuery(collectionRef.path, collectionRef.db);
  constraints.forEach(constraint => {
    if (constraint.type === 'orderBy') {
      q.orderBy(constraint.field, constraint.direction);
    } else if (constraint.type === 'limit') {
      q.limit(constraint.count);
    } else if (constraint.type === 'where') {
      q.where(constraint.field, constraint.operator, constraint.value);
    }
  });
  return q;
}

export function where(field, operator, value) {
  return { type: 'where', field, operator, value };
}

export function orderBy(field, direction = 'asc') {
  return { type: 'orderBy', field, direction };
}

export function limit(count) {
  return { type: 'limit', count };
}

export function onSnapshot(queryOrDocRef, callback, errorCallback) {
  if (queryOrDocRef instanceof MockQuery) {
    return queryOrDocRef.onSnapshot(callback, errorCallback);
  } 
  // Future: Implement onSnapshot for single document reference
  // For now, if you need single doc snapshot, fetch via query with where('id', '==', docId) and limit(1)
  throw new Error('onSnapshot only implemented for queries in this mock. Use query(collectionRef).where("id", "==", docId).limit(1) for single doc-like snapshots.');
}

export async function addDoc(collectionRef, data) {
  if (!(collectionRef instanceof MockCollection)) {
    throw new Error('addDoc expects a CollectionReference (from `collection` function).');
  }
  return collectionRef.add(data);
}

export function serverTimestamp() {
  return 'SERVER_TIMESTAMP';
}

// New helper functions for document manipulation
export function doc(dbInstance, collectionPath, docId) {
  return new MockDocument(`${collectionPath}/${docId}`, dbInstance);
}

export async function updateDoc(docRef, data) {
  if (!(docRef instanceof MockDocument)) {
    throw new Error('updateDoc expects a DocumentReference (from `doc` function).');
  }
  return docRef.update(data);
}

export async function deleteDoc(docRef) {
  if (!(docRef instanceof MockDocument)) {
    throw new Error('deleteDoc expects a DocumentReference (from `doc` function).');
  }
  return docRef.delete();
}

// Ensure anonymous authentication
export async function ensureAnonAuth() {
  return new Promise((resolve, reject) => {
    let unsubscribeFn;
    
    unsubscribeFn = auth.onAuthStateChanged(async (user) => {
      // Unsubscribe immediately after the first call, to avoid multiple executions
      if (unsubscribeFn) {
        unsubscribeFn();
      }
      
      if (user) {
        resolve(user);
      } else {
        try {
          const result = await auth.signInAnonymously();
          resolve(result.user);
        } catch (error) {
          reject(error);
        }
      }
    });
  });
}
