export const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(price);
};

// Helper function for clearer date formatting
export const formatDate = (dateString: string): string => {
    try {
        return new Date(dateString).toLocaleDateString(undefined, { // Use user's locale
            year: 'numeric', month: 'short', day: 'numeric'
        });
    } catch (e) {
        return 'Invalid Date';
    }
};