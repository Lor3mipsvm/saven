// Mock implementation for @react-native-async-storage/async-storage
// This will be used as a fallback if the polyfill doesn't work

if (typeof global !== 'undefined') {
    global.AsyncStorage = {
        getItem: async (key) => {
            if (typeof window !== 'undefined' && window.localStorage) {
                return window.localStorage.getItem(key);
            }
            return null;
        },

        setItem: async (key, value) => {
            if (typeof window !== 'undefined' && window.localStorage) {
                window.localStorage.setItem(key, value);
            }
        },

        removeItem: async (key) => {
            if (typeof window !== 'undefined' && window.localStorage) {
                window.localStorage.removeItem(key);
            }
        },

        clear: async () => {
            if (typeof window !== 'undefined' && window.localStorage) {
                window.localStorage.clear();
            }
        },

        getAllKeys: async () => {
            if (typeof window !== 'undefined' && window.localStorage) {
                return Object.keys(window.localStorage);
            }
            return [];
        },

        multiGet: async (keys) => {
            if (typeof window !== 'undefined' && window.localStorage) {
                return keys.map(key => [key, window.localStorage.getItem(key)]);
            }
            return [];
        },

        multiSet: async (keyValuePairs) => {
            if (typeof window !== 'undefined' && window.localStorage) {
                keyValuePairs.forEach(([key, value]) => {
                    window.localStorage.setItem(key, value);
                });
            }
        },

        multiRemove: async (keys) => {
            if (typeof window !== 'undefined' && window.localStorage) {
                keys.forEach(key => {
                    window.localStorage.removeItem(key);
                });
            }
        }
    };
}
