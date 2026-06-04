const DB_NAME = 'notes-offline'
const STORE_NAME = 'queue'
const DB_VERSION = 1

function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION)
    req.onupgradeneeded = (e) => {
      e.target.result.createObjectStore(STORE_NAME, { autoIncrement: true })
    }
    req.onsuccess = (e) => resolve(e.target.result)
    req.onerror = (e) => reject(e.target.error)
  })
}

export async function enqueue(operation) {
  try {
    const db = await openDB()
    const tx = db.transaction(STORE_NAME, 'readwrite')
    const store = tx.objectStore(STORE_NAME)
    return new Promise((resolve, reject) => {
      const req = store.add({ ...operation, queuedAt: Date.now() })
      req.onsuccess = () => resolve(req.result)
      req.onerror = () => reject(req.error)
    })
  } catch (err) {
    console.error('Failed to enqueue operation:', err.message)
    throw err
  }
}

export async function dequeue(key) {
  try {
    const db = await openDB()
    const tx = db.transaction(STORE_NAME, 'readwrite')
    const store = tx.objectStore(STORE_NAME)
    return new Promise((resolve, reject) => {
      const req = store.delete(key)
      req.onsuccess = () => resolve(undefined)
      req.onerror = () => reject(req.error)
    })
  } catch (err) {
    console.error('Failed to dequeue operation:', err.message)
    throw err
  }
}

export async function getAllQueued() {
  try {
    const db = await openDB()
    const tx = db.transaction(STORE_NAME, 'readonly')
    const store = tx.objectStore(STORE_NAME)
    return new Promise((resolve, reject) => {
      const items = []
      const req = store.openCursor()
      req.onsuccess = (e) => {
        const cursor = e.target.result
        if (cursor) {
          items.push({ key: cursor.key, ...cursor.value })
          cursor.continue()
        } else {
          resolve(items)
        }
      }
      req.onerror = () => reject(req.error)
    })
  } catch (err) {
    console.error('Failed to read queue:', err.message)
    throw err
  }
}
