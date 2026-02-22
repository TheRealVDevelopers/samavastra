import { useState, useEffect } from 'react';
import { db } from '../firebase';
import {
    collection, getDocs, addDoc, updateDoc, deleteDoc,
    doc, query, orderBy, where, onSnapshot, serverTimestamp
} from 'firebase/firestore';

/**
 * Generic hook for any Firestore collection
 * Usage: const { data, loading, add, update, remove } = useCollection('leads');
 */
export function useCollection(collectionName, queryConstraints = []) {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        setLoading(true);
        const q = queryConstraints.length > 0
            ? query(collection(db, collectionName), ...queryConstraints)
            : collection(db, collectionName);

        const unsubscribe = onSnapshot(q,
            (snapshot) => {
                const docs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
                setData(docs);
                setLoading(false);
            },
            (err) => {
                setError(err.message);
                setLoading(false);
            }
        );

        return () => unsubscribe();
    }, [collectionName]);

    const add = async (newDoc) => {
        return await addDoc(collection(db, collectionName), {
            ...newDoc,
            createdAt: new Date().toISOString(),
        });
    };

    const update = async (id, updates) => {
        return await updateDoc(doc(db, collectionName, id), {
            ...updates,
            updatedAt: new Date().toISOString(),
        });
    };

    const remove = async (id) => {
        return await deleteDoc(doc(db, collectionName, id));
    };

    return { data, loading, error, add, update, remove };
}
