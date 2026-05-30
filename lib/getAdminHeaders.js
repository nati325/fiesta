export function getAdminHeaders(includeJson = true) {
    const headers = {};
    if (includeJson) {
        headers['Content-Type'] = 'application/json';
    }

    if (typeof window !== 'undefined') {
        const token = localStorage.getItem('token');
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
    }

    return headers;
}
