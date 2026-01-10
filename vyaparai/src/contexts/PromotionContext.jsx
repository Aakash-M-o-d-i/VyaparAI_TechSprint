/**
 * Promotion Context
 * Manages the promotion creation workflow and data
 */
import { createContext, useContext, useState, useCallback } from 'react';
import { collection, addDoc, query, where, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from './AuthContext';

const PromotionContext = createContext();

export function usePromotion() {
    return useContext(PromotionContext);
}

export function PromotionProvider({ children }) {
    const { currentUser } = useAuth();

    // Current promotion being created
    const [promotionData, setPromotionData] = useState({
        rawInput: '',
        product: '',
        price: '',
        offer: '',
        businessType: '',
        language: 'en',
        style: 'friendly',
        posterImageUrl: '',
        captions: {
            whatsapp: '',
            instagram: '',
            facebook: ''
        }
    });

    // User's past promotions
    const [pastPromotions, setPastPromotions] = useState([]);
    const [loadingPromotions, setLoadingPromotions] = useState(false);

    // Update promotion data during workflow
    const updatePromotionData = useCallback((updates) => {
        setPromotionData(prev => ({ ...prev, ...updates }));
    }, []);

    // Reset promotion data for new promotion
    const resetPromotion = useCallback(() => {
        setPromotionData({
            rawInput: '',
            product: '',
            price: '',
            offer: '',
            businessType: '',
            language: 'en',
            style: 'friendly',
            posterImageUrl: '',
            captions: {
                whatsapp: '',
                instagram: '',
                facebook: ''
            }
        });
    }, []);

    // Save promotion to Firestore
    const savePromotion = async (posterData = null) => {
        if (!currentUser) return null;

        try {
            // Don't store the full base64 image in Firestore (too large, 1MB limit)
            // Instead, store just the metadata and a flag that poster was generated
            const promotionToSave = {
                product: promotionData.product || '',
                price: promotionData.price || '',
                offer: promotionData.offer || '',
                businessType: promotionData.businessType || '',
                language: promotionData.language || 'en',
                style: promotionData.style || 'friendly',
                // Store captions
                captions: posterData?.captions || promotionData.captions || {},
                // Don't store full image - just mark that it was generated
                posterGenerated: true,
                // Keep a small version for display (first 1000 chars only as preview indicator)
                posterPreview: posterData?.posterImageUrl?.substring(0, 100) || '',
                userId: currentUser.uid,
                createdAt: new Date().toISOString(),
                shared: false,
                sharedTo: []
            };

            const docRef = await addDoc(collection(db, 'promotions'), promotionToSave);

            // Also save to local state with the full image for current session
            const savedPromotion = {
                id: docRef.id,
                ...promotionToSave,
                posterImageUrl: posterData?.posterImageUrl || promotionData.posterImageUrl
            };

            // Add to past promotions immediately
            setPastPromotions(prev => [savedPromotion, ...prev]);

            return savedPromotion;
        } catch (error) {
            console.error('Error saving promotion:', error);
            throw error;
        }
    };

    // Fetch past promotions for current user
    const fetchPastPromotions = async () => {
        if (!currentUser) return [];

        setLoadingPromotions(true);
        try {
            // Simple query without orderBy to avoid index requirement
            const q = query(
                collection(db, 'promotions'),
                where('userId', '==', currentUser.uid)
            );

            const snapshot = await getDocs(q);
            const promotions = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            // Sort client-side instead
            promotions.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

            setPastPromotions(promotions);
            return promotions;
        } catch (error) {
            console.error('Error fetching promotions:', error);
            return [];
        } finally {
            setLoadingPromotions(false);
        }
    };

    // Mark promotion as shared
    const markAsShared = async (promotionId, platform) => {
        if (!currentUser) return;

        try {
            const promotionRef = doc(db, 'promotions', promotionId);
            await updateDoc(promotionRef, {
                shared: true,
                sharedTo: [...(pastPromotions.find(p => p.id === promotionId)?.sharedTo || []), platform],
                sharedAt: new Date().toISOString()
            });

            // Update local state
            setPastPromotions(prev =>
                prev.map(p =>
                    p.id === promotionId
                        ? { ...p, shared: true, sharedTo: [...(p.sharedTo || []), platform] }
                        : p
                )
            );
        } catch (error) {
            console.error('Error marking as shared:', error);
        }
    };

    // Delete a promotion
    const deletePromotion = async (promotionId) => {
        if (!currentUser || !promotionId) return;

        try {
            // Delete from Firestore
            const promotionRef = doc(db, 'promotions', promotionId);
            await deleteDoc(promotionRef);

            // Remove from local state
            setPastPromotions(prev => prev.filter(p => p.id !== promotionId));
        } catch (error) {
            console.error('Error deleting promotion:', error);
            throw error;
        }
    };

    // Get today's promotion count (all created today)
    const getTodayCount = () => {
        const today = new Date().toDateString();
        return pastPromotions.filter(p => {
            const promotionDate = new Date(p.createdAt).toDateString();
            return promotionDate === today;
        }).length;
    };

    const value = {
        promotionData,
        updatePromotionData,
        resetPromotion,
        savePromotion,
        pastPromotions,
        loadingPromotions,
        fetchPastPromotions,
        markAsShared,
        deletePromotion,
        getTodayCount
    };

    return (
        <PromotionContext.Provider value={value}>
            {children}
        </PromotionContext.Provider>
    );
}
