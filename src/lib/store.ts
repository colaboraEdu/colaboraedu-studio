/**
 * Global State Management with Zustand
 * Modern, type-safe state management with persistence and middleware
 * Part of colaboraEDU integrated development plan
 */

import { create, StateCreator } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import type { 
  User, 
  UserRole, 
  DashboardStats, 
  RecentActivity,
  ApiError 
} from './api-client';

// ============================================================================
// STATE SLICES TYPES
// ============================================================================

// Authentication State
export interface AuthSlice {
  // State
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearAuth: () => void;
  initializeAuth: () => void;
}

// Dashboard State
export interface DashboardSlice {
  // State
  stats: DashboardStats | null;
  recentActivity: RecentActivity[];
  isLoadingStats: boolean;
  isLoadingActivity: boolean;
  lastUpdated: number | null;

  // Actions
  setStats: (stats: DashboardStats) => void;
  setRecentActivity: (activity: RecentActivity[]) => void;
  setLoadingStats: (loading: boolean) => void;
  setLoadingActivity: (loading: boolean) => void;
  clearDashboard: () => void;
  updateLastUpdated: () => void;
}

// Users Management State
export interface UsersSlice {
  // State
  users: User[];
  selectedUser: User | null;
  isLoading: boolean;
  error: string | null;
  filters: {
    role?: UserRole;
    search: string;
    page: number;
    limit: number;
  };
  total: number;

  // Actions
  setUsers: (users: User[]) => void;
  addUser: (user: User) => void;
  updateUser: (id: number, updates: Partial<User>) => void;
  removeUser: (id: number) => void;
  setSelectedUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setFilters: (filters: Partial<UsersSlice['filters']>) => void;
  setTotal: (total: number) => void;
  clearUsers: () => void;
}

// UI State
export interface UISlice {
  // State
  sidebarOpen: boolean;
  theme: 'light' | 'dark' | 'system';
  notifications: Array<{
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message?: string;
    timestamp: number;
    read: boolean;
  }>;
  modals: {
    createUser: boolean;
    editUser: boolean;
    deleteConfirm: boolean;
  };

  // Actions
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  setTheme: (theme: UISlice['theme']) => void;
  addNotification: (notification: Omit<UISlice['notifications'][0], 'id' | 'timestamp' | 'read'>) => void;
  markNotificationRead: (id: string) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
  openModal: (modal: keyof UISlice['modals']) => void;
  closeModal: (modal: keyof UISlice['modals']) => void;
  toggleModal: (modal: keyof UISlice['modals']) => void;
}

// Combined Store Type
export type AppStore = AuthSlice & DashboardSlice & UsersSlice & UISlice;

// ============================================================================
// SLICE CREATORS
// ============================================================================

// Authentication Slice
const createAuthSlice: StateCreator<
  AppStore,
  [['zustand/immer', never], ['zustand/persist', unknown], ['zustand/devtools', never]],
  [],
  AuthSlice
> = (set, get) => ({
  // Initial State
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  // Actions
  setUser: (user) =>
    set(
      (state) => {
        state.user = user;
        state.isAuthenticated = !!user;
        if (user) {
          state.error = null;
        }
      },
      undefined,
      'auth/setUser'
    ),

  setToken: (token) =>
    set(
      (state) => {
        state.token = token;
      },
      undefined,
      'auth/setToken'
    ),

  setLoading: (loading) =>
    set(
      (state) => {
        state.isLoading = loading;
      },
      undefined,
      'auth/setLoading'
    ),

  setError: (error) =>
    set(
      (state) => {
        state.error = error;
        if (error) {
          state.isLoading = false;
        }
      },
      undefined,
      'auth/setError'
    ),

  clearAuth: () =>
    set(
      (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.error = null;
        state.isLoading = false;
      },
      undefined,
      'auth/clearAuth'
    ),

  initializeAuth: () => {
    const token = localStorage.getItem('auth_token');
    const userData = localStorage.getItem('user_data');
    
    console.log('Store: Initializing auth with:', { token: !!token, userData: !!userData });
    
    if (token && userData) {
      try {
        const user = JSON.parse(userData);
        console.log('Store: Parsed user data:', user);
        set(
          (state) => {
            state.token = token;
            state.user = user;
            state.isAuthenticated = true;
            state.isLoading = false;
            state.error = null;
          },
          undefined,
          'auth/initializeAuth'
        );
        console.log('Store: Auth state updated successfully');
      } catch (error) {
        console.error('Store: Error parsing user data:', error);
        // Clear corrupted data
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_data');
        set(
          (state) => {
            state.user = null;
            state.token = null;
            state.isAuthenticated = false;
            state.isLoading = false;
            state.error = 'Dados corrompidos removidos';
          },
          undefined,
          'auth/initializeAuth/error'
        );
      }
    } else {
      console.log('Store: No auth data found, staying unauthenticated');
      set(
        (state) => {
          state.user = null;
          state.token = null;
          state.isAuthenticated = false;
          state.isLoading = false;
          state.error = null;
        },
        undefined,
        'auth/initializeAuth/noData'
      );
    }
  },
});

// Dashboard Slice
const createDashboardSlice: StateCreator<
  AppStore,
  [['zustand/immer', never], ['zustand/persist', unknown], ['zustand/devtools', never]],
  [],
  DashboardSlice
> = (set) => ({
  // Initial State
  stats: null,
  recentActivity: [],
  isLoadingStats: false,
  isLoadingActivity: false,
  lastUpdated: null,

  // Actions
  setStats: (stats) =>
    set(
      (state) => {
        state.stats = stats;
        state.isLoadingStats = false;
        state.lastUpdated = Date.now();
      },
      undefined,
      'dashboard/setStats'
    ),

  setRecentActivity: (activity) =>
    set(
      (state) => {
        state.recentActivity = activity;
        state.isLoadingActivity = false;
      },
      undefined,
      'dashboard/setRecentActivity'
    ),

  setLoadingStats: (loading) =>
    set(
      (state) => {
        state.isLoadingStats = loading;
      },
      undefined,
      'dashboard/setLoadingStats'
    ),

  setLoadingActivity: (loading) =>
    set(
      (state) => {
        state.isLoadingActivity = loading;
      },
      undefined,
      'dashboard/setLoadingActivity'
    ),

  clearDashboard: () =>
    set(
      (state) => {
        state.stats = null;
        state.recentActivity = [];
        state.isLoadingStats = false;
        state.isLoadingActivity = false;
        state.lastUpdated = null;
      },
      undefined,
      'dashboard/clearDashboard'
    ),

  updateLastUpdated: () =>
    set(
      (state) => {
        state.lastUpdated = Date.now();
      },
      undefined,
      'dashboard/updateLastUpdated'
    ),
});

// Users Management Slice
const createUsersSlice: StateCreator<
  AppStore,
  [['zustand/immer', never], ['zustand/persist', unknown], ['zustand/devtools', never]],
  [],
  UsersSlice
> = (set) => ({
  // Initial State
  users: [],
  selectedUser: null,
  isLoading: false,
  error: null,
  filters: {
    search: '',
    page: 1,
    limit: 10,
  },
  total: 0,

  // Actions
  setUsers: (users) =>
    set(
      (state) => {
        state.users = users;
        state.isLoading = false;
        state.error = null;
      },
      undefined,
      'users/setUsers'
    ),

  addUser: (user) =>
    set(
      (state) => {
        state.users.unshift(user); // Add to beginning
        state.total += 1;
      },
      undefined,
      'users/addUser'
    ),

  updateUser: (id, updates) =>
    set(
      (state) => {
        const index = state.users.findIndex(user => user.id === id);
        if (index !== -1) {
          state.users[index] = { ...state.users[index], ...updates };
        }
        if (state.selectedUser?.id === id) {
          state.selectedUser = { ...state.selectedUser, ...updates };
        }
      },
      undefined,
      'users/updateUser'
    ),

  removeUser: (id) =>
    set(
      (state) => {
        state.users = state.users.filter(user => user.id !== id);
        if (state.selectedUser?.id === id) {
          state.selectedUser = null;
        }
        state.total -= 1;
      },
      undefined,
      'users/removeUser'
    ),

  setSelectedUser: (user) =>
    set(
      (state) => {
        state.selectedUser = user;
      },
      undefined,
      'users/setSelectedUser'
    ),

  setLoading: (loading) =>
    set(
      (state) => {
        state.isLoading = loading;
      },
      undefined,
      'users/setLoading'
    ),

  setError: (error) =>
    set(
      (state) => {
        state.error = error;
        if (error) {
          state.isLoading = false;
        }
      },
      undefined,
      'users/setError'
    ),

  setFilters: (filters) =>
    set(
      (state) => {
        state.filters = { ...state.filters, ...filters };
      },
      undefined,
      'users/setFilters'
    ),

  setTotal: (total) =>
    set(
      (state) => {
        state.total = total;
      },
      undefined,
      'users/setTotal'
    ),

  clearUsers: () =>
    set(
      (state) => {
        state.users = [];
        state.selectedUser = null;
        state.error = null;
        state.total = 0;
        state.filters = {
          search: '',
          page: 1,
          limit: 10,
        };
      },
      undefined,
      'users/clearUsers'
    ),
});

// UI Slice
const createUISlice: StateCreator<
  AppStore,
  [['zustand/immer', never], ['zustand/persist', unknown], ['zustand/devtools', never]],
  [],
  UISlice
> = (set) => ({
  // Initial State
  sidebarOpen: true,
  theme: 'system',
  notifications: [],
  modals: {
    createUser: false,
    editUser: false,
    deleteConfirm: false,
  },

  // Actions
  setSidebarOpen: (open) =>
    set(
      (state) => {
        state.sidebarOpen = open;
      },
      undefined,
      'ui/setSidebarOpen'
    ),

  toggleSidebar: () =>
    set(
      (state) => {
        state.sidebarOpen = !state.sidebarOpen;
      },
      undefined,
      'ui/toggleSidebar'
    ),

  setTheme: (theme) =>
    set(
      (state) => {
        state.theme = theme;
      },
      undefined,
      'ui/setTheme'
    ),

  addNotification: (notification) =>
    set(
      (state) => {
        const newNotification = {
          ...notification,
          id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          timestamp: Date.now(),
          read: false,
        };
        state.notifications.unshift(newNotification);
        
        // Keep only last 50 notifications
        if (state.notifications.length > 50) {
          state.notifications = state.notifications.slice(0, 50);
        }
      },
      undefined,
      'ui/addNotification'
    ),

  markNotificationRead: (id) =>
    set(
      (state) => {
        const notification = state.notifications.find(n => n.id === id);
        if (notification) {
          notification.read = true;
        }
      },
      undefined,
      'ui/markNotificationRead'
    ),

  removeNotification: (id) =>
    set(
      (state) => {
        state.notifications = state.notifications.filter(n => n.id !== id);
      },
      undefined,
      'ui/removeNotification'
    ),

  clearNotifications: () =>
    set(
      (state) => {
        state.notifications = [];
      },
      undefined,
      'ui/clearNotifications'
    ),

  openModal: (modal) =>
    set(
      (state) => {
        state.modals[modal] = true;
      },
      undefined,
      'ui/openModal'
    ),

  closeModal: (modal) =>
    set(
      (state) => {
        state.modals[modal] = false;
      },
      undefined,
      'ui/closeModal'
    ),

  toggleModal: (modal) =>
    set(
      (state) => {
        state.modals[modal] = !state.modals[modal];
      },
      undefined,
      'ui/toggleModal'
    ),
});

// ============================================================================
// STORE CONFIGURATION
// ============================================================================

// Persistence configuration
const persistConfig = {
  name: 'colaboraedu-store',
  storage: createJSONStorage(() => localStorage),
  partialize: (state: AppStore) => ({
    // Persist only necessary data
    user: state.user,
    token: state.token,
    isAuthenticated: state.isAuthenticated,
    sidebarOpen: state.sidebarOpen,
    theme: state.theme,
    filters: state.filters, // User preferences
  }),
  version: 1,
  migrate: (persistedState: any, version: number) => {
    // Handle state migrations between versions
    if (version === 0) {
      // Migration from v0 to v1
      return {
        ...persistedState,
        theme: persistedState.theme || 'system',
      };
    }
    return persistedState;
  },
};

// ============================================================================
// MAIN STORE
// ============================================================================

export const useAppStore = create<AppStore>()(
  devtools(
    persist(
      immer((...args) => ({
        ...createAuthSlice(...args),
        ...createDashboardSlice(...args),
        ...createUsersSlice(...args),
        ...createUISlice(...args),
      })),
      persistConfig
    ),
    {
      name: 'colaboraEDU-store', // Redux DevTools name
      enabled: process.env.NODE_ENV === 'development',
    }
  )
);

// ============================================================================
// SELECTOR HOOKS (Auto-generated)
// ============================================================================

type WithSelectors<S> = S extends { getState: () => infer T }
  ? S & { use: { [K in keyof T]: () => T[K] } }
  : never;

const createSelectors = <S extends { getState: () => object }>(store: S) => {
  const storeWithSelectors = store as WithSelectors<typeof store>;
  storeWithSelectors.use = {} as any;
  
  for (const k of Object.keys(store.getState())) {
    (storeWithSelectors.use as any)[k] = () => 
      (store as any)((s: any) => s[k as keyof typeof s]);
  }

  return storeWithSelectors;
};

export const useStore = createSelectors(useAppStore);

// ============================================================================
// CONVENIENCE HOOKS
// ============================================================================

// Authentication hooks
export const useAuth = () => {
  const user = useAppStore(state => state.user);
  const isAuthenticated = useAppStore(state => state.isAuthenticated);
  const isLoading = useAppStore(state => state.isLoading);
  const error = useAppStore(state => state.error);
  const token = useAppStore(state => state.token);

  const actions = {
    setUser: useAppStore(state => state.setUser),
    setToken: useAppStore(state => state.setToken),
    setLoading: useAppStore(state => state.setLoading),
    setError: useAppStore(state => state.setError),
    clearAuth: useAppStore(state => state.clearAuth),
    initializeAuth: useAppStore(state => state.initializeAuth),
  };

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    token,
    ...actions,
  };
};

// Dashboard hooks
export const useDashboard = () => {
  const stats = useAppStore(state => state.stats);
  const recentActivity = useAppStore(state => state.recentActivity);
  const isLoadingStats = useAppStore(state => state.isLoadingStats);
  const isLoadingActivity = useAppStore(state => state.isLoadingActivity);
  const lastUpdated = useAppStore(state => state.lastUpdated);

  const actions = {
    setStats: useAppStore(state => state.setStats),
    setRecentActivity: useAppStore(state => state.setRecentActivity),
    setLoadingStats: useAppStore(state => state.setLoadingStats),
    setLoadingActivity: useAppStore(state => state.setLoadingActivity),
    clearDashboard: useAppStore(state => state.clearDashboard),
    updateLastUpdated: useAppStore(state => state.updateLastUpdated),
  };

  return {
    stats,
    recentActivity,
    isLoadingStats,
    isLoadingActivity,
    lastUpdated,
    ...actions,
  };
};

// Users management hooks
export const useUsers = () => {
  const users = useAppStore(state => state.users);
  const selectedUser = useAppStore(state => state.selectedUser);
  const isLoading = useAppStore(state => state.isLoading);
  const error = useAppStore(state => state.error);
  const filters = useAppStore(state => state.filters);
  const total = useAppStore(state => state.total);

  const actions = {
    setUsers: useAppStore(state => state.setUsers),
    addUser: useAppStore(state => state.addUser),
    updateUser: useAppStore(state => state.updateUser),
    removeUser: useAppStore(state => state.removeUser),
    setSelectedUser: useAppStore(state => state.setSelectedUser),
    setLoading: useAppStore(state => state.setLoading),
    setError: useAppStore(state => state.setError),
    setFilters: useAppStore(state => state.setFilters),
    setTotal: useAppStore(state => state.setTotal),
    clearUsers: useAppStore(state => state.clearUsers),
  };

  return {
    users,
    selectedUser,
    isLoading,
    error,
    filters,
    total,
    ...actions,
  };
};

// UI hooks
export const useUI = () => {
  const sidebarOpen = useAppStore(state => state.sidebarOpen);
  const theme = useAppStore(state => state.theme);
  const notifications = useAppStore(state => state.notifications);
  const modals = useAppStore(state => state.modals);

  const actions = {
    setSidebarOpen: useAppStore(state => state.setSidebarOpen),
    toggleSidebar: useAppStore(state => state.toggleSidebar),
    setTheme: useAppStore(state => state.setTheme),
    addNotification: useAppStore(state => state.addNotification),
    markNotificationRead: useAppStore(state => state.markNotificationRead),
    removeNotification: useAppStore(state => state.removeNotification),
    clearNotifications: useAppStore(state => state.clearNotifications),
    openModal: useAppStore(state => state.openModal),
    closeModal: useAppStore(state => state.closeModal),
    toggleModal: useAppStore(state => state.toggleModal),
  };

  return {
    sidebarOpen,
    theme,
    notifications,
    modals,
    ...actions,
  };
};

// ============================================================================
// STORE UTILITIES
// ============================================================================

// Reset store to initial state (useful for logout)
export const resetStore = () => {
  useAppStore.setState((state) => ({
    // Auth
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,

    // Dashboard
    stats: null,
    recentActivity: [],
    isLoadingStats: false,
    isLoadingActivity: false,
    lastUpdated: null,

    // Users
    users: [],
    selectedUser: null,
    total: 0,
    filters: {
      search: '',
      page: 1,
      limit: 10,
    },

    // UI (keep some preferences but reset notifications and modals)
    notifications: [],
    modals: {
      createUser: false,
      editUser: false,
      deleteConfirm: false,
    },
    
    // Keep sidebar and theme preferences
    sidebarOpen: state.sidebarOpen,
    theme: state.theme,
  }));
};

// Get store state snapshot
export const getStoreSnapshot = () => useAppStore.getState();

// Subscribe to store changes
export const subscribeToStore = (
  callback: (state: AppStore, previousState: AppStore) => void
) => useAppStore.subscribe(callback);

export default useAppStore;