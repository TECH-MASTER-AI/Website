/**
 * Real-world code snippets for immersive coding practice (80-150 lines).
 * Professional examples: backend servers, React components, algorithms, auth middleware, database models.
 * Designed for fullscreen, game-like coding experience.
 */
export const TYPING_CODE_SNIPPETS = {
  javascript: [
    `class ShoppingCart {
  constructor() {
    this.items = [];
    this.discountCode = null;
    this.taxRate = 0.08;
    this.shippingCost = 5.99;
    this.listeners = [];
  }

  addItem(product, quantity = 1) {
    const existingItem = this.items.find(item => item.id === product.id);
    
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      this.items.push({
        id: product.id,
        name: product.name,
        price: product.price,
        quantity: quantity,
        category: product.category,
        addedAt: new Date().toISOString()
      });
    }
    
    this.notifyListeners('itemAdded', { product, quantity });
    this.updateCartDisplay();
    this.saveToLocalStorage();
  }

  removeItem(productId) {
    const removedItem = this.items.find(item => item.id === productId);
    this.items = this.items.filter(item => item.id !== productId);
    
    if (removedItem) {
      this.notifyListeners('itemRemoved', { item: removedItem });
    }
    
    this.updateCartDisplay();
    this.saveToLocalStorage();
  }

  updateQuantity(productId, newQuantity) {
    const item = this.items.find(item => item.id === productId);
    
    if (item && newQuantity > 0) {
      const oldQuantity = item.quantity;
      item.quantity = newQuantity;
      this.notifyListeners('quantityChanged', { 
        item, 
        oldQuantity, 
        newQuantity 
      });
    } else if (item && newQuantity === 0) {
      this.removeItem(productId);
    }
    
    this.updateCartDisplay();
    this.saveToLocalStorage();
  }

  applyDiscountCode(code) {
    const validCodes = {
      'SAVE10': { discount: 0.10, minAmount: 50 },
      'WELCOME20': { discount: 0.20, minAmount: 100 },
      'STUDENT15': { discount: 0.15, minAmount: 25 },
      'HOLIDAY25': { discount: 0.25, minAmount: 75 },
      'FREESHIP': { discount: 0, freeShipping: true }
    };
    
    const codeData = validCodes[code.toUpperCase()];
    const subtotal = this.calculateSubtotal();
    
    if (codeData && subtotal >= (codeData.minAmount || 0)) {
      this.discountCode = {
        code: code.toUpperCase(),
        discount: codeData.discount,
        freeShipping: codeData.freeShipping || false,
        appliedAt: new Date().toISOString()
      };
      this.notifyListeners('discountApplied', { code: this.discountCode });
      return { success: true, message: 'Discount applied successfully!' };
    }
    
    return { 
      success: false, 
      message: codeData ? 
        \`Minimum order of $\${codeData.minAmount} required\` : 
        'Invalid discount code' 
    };
  }

  calculateSubtotal() {
    return this.items.reduce((total, item) => {
      return total + (item.price * item.quantity);
    }, 0);
  }

  calculateDiscount() {
    if (!this.discountCode) return 0;
    
    const subtotal = this.calculateSubtotal();
    return subtotal * this.discountCode.discount;
  }

  calculateTax() {
    const subtotal = this.calculateSubtotal();
    const discount = this.calculateDiscount();
    const taxableAmount = subtotal - discount;
    return Math.max(0, taxableAmount * this.taxRate);
  }

  calculateShipping() {
    if (this.items.length === 0) return 0;
    if (this.discountCode?.freeShipping) return 0;
    
    const subtotal = this.calculateSubtotal();
    return subtotal >= 75 ? 0 : this.shippingCost;
  }

  calculateTotal() {
    const subtotal = this.calculateSubtotal();
    const discount = this.calculateDiscount();
    const tax = this.calculateTax();
    const shipping = this.calculateShipping();
    
    return Math.max(0, subtotal - discount + tax + shipping);
  }

  getCartSummary() {
    return {
      itemCount: this.items.reduce((count, item) => count + item.quantity, 0),
      uniqueItems: this.items.length,
      subtotal: this.calculateSubtotal(),
      discount: this.calculateDiscount(),
      tax: this.calculateTax(),
      shipping: this.calculateShipping(),
      total: this.calculateTotal(),
      items: this.items.map(item => ({
        ...item,
        totalPrice: item.price * item.quantity
      })),
      discountCode: this.discountCode,
      isEmpty: this.items.length === 0
    };
  }

  addEventListener(event, callback) {
    this.listeners.push({ event, callback });
  }

  removeEventListener(event, callback) {
    this.listeners = this.listeners.filter(
      listener => !(listener.event === event && listener.callback === callback)
    );
  }

  notifyListeners(event, data) {
    this.listeners
      .filter(listener => listener.event === event)
      .forEach(listener => {
        try {
          listener.callback(data);
        } catch (error) {
          console.error('Cart listener error:', error);
        }
      });
  }

  saveToLocalStorage() {
    try {
      const cartData = {
        items: this.items,
        discountCode: this.discountCode,
        savedAt: new Date().toISOString()
      };
      localStorage.setItem('shopping_cart', JSON.stringify(cartData));
    } catch (error) {
      console.error('Failed to save cart to localStorage:', error);
    }
  }

  loadFromLocalStorage() {
    try {
      const saved = localStorage.getItem('shopping_cart');
      if (saved) {
        const cartData = JSON.parse(saved);
        this.items = cartData.items || [];
        this.discountCode = cartData.discountCode || null;
        this.updateCartDisplay();
        return true;
      }
    } catch (error) {
      console.error('Failed to load cart from localStorage:', error);
    }
    return false;
  }

  clearCart() {
    const itemCount = this.items.length;
    this.items = [];
    this.discountCode = null;
    
    this.notifyListeners('cartCleared', { itemCount });
    this.updateCartDisplay();
    this.saveToLocalStorage();
  }

  exportCart() {
    const summary = this.getCartSummary();
    return {
      ...summary,
      exportedAt: new Date().toISOString(),
      version: '1.0'
    };
  }
}`,

    `const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const cors = require('cors');
const { body, validationResult } = require('express-validator');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const SALT_ROUNDS = 12;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.'
  }
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // limit each IP to 5 auth requests per windowMs
  message: {
    error: 'Too many authentication attempts, please try again later.'
  }
});

app.use(limiter);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Mock database (replace with real database)
const users = new Map();
const posts = new Map();
let userIdCounter = 1;
let postIdCounter = 1;

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ 
      error: 'Access token required',
      code: 'TOKEN_MISSING'
    });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ 
        error: 'Invalid or expired token',
        code: 'TOKEN_INVALID'
      });
    }
    req.user = user;
    next();
  });
};

// Validation middleware
const validateRegistration = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),
  body('password')
    .isLength({ min: 8 })
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must be at least 8 characters with uppercase, lowercase, number, and special character'),
  body('username')
    .isLength({ min: 3, max: 30 })
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username must be 3-30 characters, alphanumeric and underscores only')
];

const validateLogin = [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty()
];

const validatePost = [
  body('title')
    .isLength({ min: 1, max: 200 })
    .trim()
    .withMessage('Title must be 1-200 characters'),
  body('content')
    .isLength({ min: 1, max: 5000 })
    .trim()
    .withMessage('Content must be 1-5000 characters'),
  body('tags')
    .optional()
    .isArray({ max: 10 })
    .withMessage('Maximum 10 tags allowed')
];

// Error handling middleware
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array()
    });
  }
  next();
};

// Routes
app.post('/api/auth/register', authLimiter, validateRegistration, handleValidationErrors, async (req, res) => {
  try {
    const { email, password, username } = req.body;

    // Check if user already exists
    const existingUser = Array.from(users.values()).find(
      user => user.email === email || user.username === username
    );

    if (existingUser) {
      return res.status(409).json({
        error: 'User already exists',
        code: 'USER_EXISTS'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    // Create user
    const user = {
      id: userIdCounter++,
      email,
      username,
      password: hashedPassword,
      createdAt: new Date().toISOString(),
      isActive: true,
      profile: {
        displayName: username,
        bio: '',
        avatar: null
      }
    };

    users.set(user.id, user);

    // Generate JWT
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email,
        username: user.username 
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        profile: user.profile
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      error: 'Internal server error',
      code: 'REGISTRATION_FAILED'
    });
  }
});`,

    `import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { debounce } from 'lodash';
import { toast } from 'react-hot-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface User {
  id: number;
  name: string;
  email: string;
  avatar?: string;
  role: 'admin' | 'user' | 'moderator';
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
}

interface UserFilters {
  search: string;
  role: string;
  status: string;
  sortBy: 'name' | 'email' | 'createdAt' | 'lastLogin';
  sortOrder: 'asc' | 'desc';
  page: number;
  limit: number;
}

const UserManagement: React.FC = () => {
  const [filters, setFilters] = useState<UserFilters>({
    search: '',
    role: 'all',
    status: 'all',
    sortBy: 'createdAt',
    sortOrder: 'desc',
    page: 1,
    limit: 20
  });

  const [selectedUsers, setSelectedUsers] = useState<Set<number>>(new Set());
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const queryClient = useQueryClient();

  // Debounced search to avoid excessive API calls
  const debouncedSearch = useCallback(
    debounce((searchTerm: string) => {
      setFilters(prev => ({ ...prev, search: searchTerm, page: 1 }));
    }, 300),
    []
  );

  // Fetch users with filters
  const {
    data: usersData,
    isLoading,
    isError,
    error
  } = useQuery({
    queryKey: ['users', filters],
    queryFn: async () => {
      const params = new URLSearchParams({
        search: filters.search,
        role: filters.role,
        status: filters.status,
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder,
        page: filters.page.toString(),
        limit: filters.limit.toString()
      });

      const response = await fetch(\`/api/users?\${params}\`);
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }
      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 3
  });

  // Update user mutation
  const updateUserMutation = useMutation({
    mutationFn: async (userData: Partial<User> & { id: number }) => {
      const response = await fetch(\`/api/users/\${userData.id}\`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData)
      });

      if (!response.ok) {
        throw new Error('Failed to update user');
      }

      return response.json();
    },
    onSuccess: (updatedUser) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success(\`User \${updatedUser.name} updated successfully\`);
      setIsEditModalOpen(false);
      setEditingUser(null);
    },
    onError: (error) => {
      toast.error(\`Failed to update user: \${error.message}\`);
    }
  });

  // Delete users mutation
  const deleteUsersMutation = useMutation({
    mutationFn: async (userIds: number[]) => {
      const response = await fetch('/api/users/batch-delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userIds })
      });

      if (!response.ok) {
        throw new Error('Failed to delete users');
      }

      return response.json();
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success(\`Successfully deleted \${result.deletedCount} users\`);
      setSelectedUsers(new Set());
    },
    onError: (error) => {
      toast.error(\`Failed to delete users: \${error.message}\`);
    }
  });

  // Computed values
  const totalUsers = usersData?.total || 0;
  const users = usersData?.users || [];
  const totalPages = Math.ceil(totalUsers / filters.limit);
  const hasSelectedUsers = selectedUsers.size > 0;

  // Event handlers
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    debouncedSearch(value);
  };

  const handleFilterChange = (key: keyof UserFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: key !== 'page' ? 1 : value
    }));
  };

  const handleUserSelect = (userId: number, isSelected: boolean) => {
    setSelectedUsers(prev => {
      const newSet = new Set(prev);
      if (isSelected) {
        newSet.add(userId);
      } else {
        newSet.delete(userId);
      }
      return newSet;
    });
  };

  const handleSelectAll = (isSelected: boolean) => {
    if (isSelected) {
      setSelectedUsers(new Set(users.map(user => user.id)));
    } else {
      setSelectedUsers(new Set());
    }
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setIsEditModalOpen(true);
  };

  const handleDeleteSelected = () => {
    if (hasSelectedUsers && window.confirm(\`Delete \${selectedUsers.size} selected users?\`)) {
      deleteUsersMutation.mutate(Array.from(selectedUsers));
    }
  };

  const handleUpdateUser = (userData: Partial<User>) => {
    if (editingUser) {
      updateUserMutation.mutate({ ...userData, id: editingUser.id });
    }
  };

  // Memoized filter options
  const roleOptions = useMemo(() => [
    { value: 'all', label: 'All Roles' },
    { value: 'admin', label: 'Admin' },
    { value: 'moderator', label: 'Moderator' },
    { value: 'user', label: 'User' }
  ], []);

  const statusOptions = useMemo(() => [
    { value: 'all', label: 'All Status' },
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' }
  ], []);

  // Loading and error states
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading users...</span>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <h3 className="text-red-800 font-medium">Error loading users</h3>
        <p className="text-red-600 text-sm mt-1">
          {error instanceof Error ? error.message : 'An unexpected error occurred'}
        </p>
        <button
          onClick={() => queryClient.invalidateQueries({ queryKey: ['users'] })}
          className="mt-2 px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
        <div className="flex items-center space-x-3">
          {hasSelectedUsers && (
            <button
              onClick={handleDeleteSelected}
              disabled={deleteUsersMutation.isPending}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
            >
              Delete Selected ({selectedUsers.size})
            </button>
          )}
          <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
            Add User
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search
            </label>
            <input
              type="text"
              placeholder="Search users..."
              onChange={handleSearchChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Role
            </label>
            <select
              value={filters.role}
              onChange={(e) => handleFilterChange('role', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {roleOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {statusOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sort By
            </label>
            <select
              value={\`\${filters.sortBy}-\${filters.sortOrder}\`}
              onChange={(e) => {
                const [sortBy, sortOrder] = e.target.value.split('-');
                handleFilterChange('sortBy', sortBy);
                handleFilterChange('sortOrder', sortOrder);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="createdAt-desc">Newest First</option>
              <option value="createdAt-asc">Oldest First</option>
              <option value="name-asc">Name A-Z</option>
              <option value="name-desc">Name Z-A</option>
              <option value="lastLogin-desc">Last Login</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;`,

    `class AdvancedDataStructures {
  // Trie (Prefix Tree) for efficient string operations
  static createTrie() {
    class TrieNode {
      constructor() {
        this.children = new Map();
        this.isEndOfWord = false;
        this.frequency = 0;
        this.data = null;
      }
    }

    class Trie {
      constructor() {
        this.root = new TrieNode();
        this.wordCount = 0;
      }

      insert(word, data = null) {
        let current = this.root;
        
        for (const char of word.toLowerCase()) {
          if (!current.children.has(char)) {
            current.children.set(char, new TrieNode());
          }
          current = current.children.get(char);
        }
        
        if (!current.isEndOfWord) {
          this.wordCount++;
        }
        
        current.isEndOfWord = true;
        current.frequency++;
        current.data = data;
      }

      search(word) {
        let current = this.root;
        
        for (const char of word.toLowerCase()) {
          if (!current.children.has(char)) {
            return null;
          }
          current = current.children.get(char);
        }
        
        return current.isEndOfWord ? {
          found: true,
          frequency: current.frequency,
          data: current.data
        } : null;
      }

      startsWith(prefix) {
        let current = this.root;
        
        for (const char of prefix.toLowerCase()) {
          if (!current.children.has(char)) {
            return [];
          }
          current = current.children.get(char);
        }
        
        const results = [];
        this._collectWords(current, prefix.toLowerCase(), results);
        return results.sort((a, b) => b.frequency - a.frequency);
      }

      _collectWords(node, prefix, results) {
        if (node.isEndOfWord) {
          results.push({
            word: prefix,
            frequency: node.frequency,
            data: node.data
          });
        }
        
        for (const [char, childNode] of node.children) {
          this._collectWords(childNode, prefix + char, results);
        }
      }

      delete(word) {
        const deleted = this._deleteHelper(this.root, word.toLowerCase(), 0);
        if (deleted) {
          this.wordCount--;
        }
        return deleted;
      }

      _deleteHelper(node, word, index) {
        if (index === word.length) {
          if (!node.isEndOfWord) return false;
          
          node.isEndOfWord = false;
          node.frequency = 0;
          node.data = null;
          
          return node.children.size === 0;
        }
        
        const char = word[index];
        const childNode = node.children.get(char);
        
        if (!childNode) return false;
        
        const shouldDeleteChild = this._deleteHelper(childNode, word, index + 1);
        
        if (shouldDeleteChild) {
          node.children.delete(char);
          return node.children.size === 0 && !node.isEndOfWord;
        }
        
        return false;
      }

      getAllWords() {
        const words = [];
        this._collectWords(this.root, '', words);
        return words;
      }

      getStats() {
        return {
          totalWords: this.wordCount,
          totalNodes: this._countNodes(this.root),
          averageDepth: this._calculateAverageDepth()
        };
      }

      _countNodes(node) {
        let count = 1;
        for (const child of node.children.values()) {
          count += this._countNodes(child);
        }
        return count;
      }

      _calculateAverageDepth() {
        const depths = [];
        this._collectDepths(this.root, 0, depths);
        return depths.length > 0 ? 
          depths.reduce((sum, depth) => sum + depth, 0) / depths.length : 0;
      }

      _collectDepths(node, depth, depths) {
        if (node.isEndOfWord) {
          depths.push(depth);
        }
        
        for (const child of node.children.values()) {
          this._collectDepths(child, depth + 1, depths);
        }
      }
    }

    return new Trie();
  }

  // LRU Cache implementation
  static createLRUCache(capacity) {
    class LRUNode {
      constructor(key, value) {
        this.key = key;
        this.value = value;
        this.prev = null;
        this.next = null;
        this.accessCount = 0;
        this.lastAccessed = Date.now();
      }
    }

    class LRUCache {
      constructor(capacity) {
        this.capacity = capacity;
        this.cache = new Map();
        this.head = new LRUNode(0, 0);
        this.tail = new LRUNode(0, 0);
        this.head.next = this.tail;
        this.tail.prev = this.head;
        this.hits = 0;
        this.misses = 0;
      }

      get(key) {
        if (this.cache.has(key)) {
          const node = this.cache.get(key);
          node.accessCount++;
          node.lastAccessed = Date.now();
          this.hits++;
          
          // Move to head (most recently used)
          this._removeNode(node);
          this._addToHead(node);
          
          return node.value;
        }
        
        this.misses++;
        return -1;
      }

      put(key, value) {
        if (this.cache.has(key)) {
          // Update existing
          const node = this.cache.get(key);
          node.value = value;
          node.accessCount++;
          node.lastAccessed = Date.now();
          
          this._removeNode(node);
          this._addToHead(node);
        } else {
          // Add new
          const newNode = new LRUNode(key, value);
          
          if (this.cache.size >= this.capacity) {
            // Remove least recently used
            const tail = this.tail.prev;
            this._removeNode(tail);
            this.cache.delete(tail.key);
          }
          
          this.cache.set(key, newNode);
          this._addToHead(newNode);
        }
      }

      _addToHead(node) {
        node.prev = this.head;
        node.next = this.head.next;
        this.head.next.prev = node;
        this.head.next = node;
      }

      _removeNode(node) {
        node.prev.next = node.next;
        node.next.prev = node.prev;
      }

      delete(key) {
        if (this.cache.has(key)) {
          const node = this.cache.get(key);
          this._removeNode(node);
          this.cache.delete(key);
          return true;
        }
        return false;
      }

      clear() {
        this.cache.clear();
        this.head.next = this.tail;
        this.tail.prev = this.head;
        this.hits = 0;
        this.misses = 0;
      }

      getStats() {
        const hitRate = this.hits + this.misses > 0 ? 
          (this.hits / (this.hits + this.misses)) * 100 : 0;
        
        return {
          size: this.cache.size,
          capacity: this.capacity,
          hits: this.hits,
          misses: this.misses,
          hitRate: hitRate.toFixed(2) + '%',
          utilizationRate: ((this.cache.size / this.capacity) * 100).toFixed(2) + '%'
        };
      }

      getKeys() {
        const keys = [];
        let current = this.head.next;
        
        while (current !== this.tail) {
          keys.push({
            key: current.key,
            accessCount: current.accessCount,
            lastAccessed: new Date(current.lastAccessed).toISOString()
          });
          current = current.next;
        }
        
        return keys;
      }
    }

    return new LRUCache(capacity);
  }
}`,
  ],
  typescript: [
    `interface DatabaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  version: number;
}

interface User extends DatabaseEntity {
  email: string;
  username: string;
  profile: UserProfile;
  preferences: UserPreferences;
  roles: Role[];
}

interface UserProfile {
  firstName: string;
  lastName: string;
  avatar?: string;
  bio?: string;
  location?: string;
  website?: string;
  socialLinks: Record<string, string>;
}

interface UserPreferences {
  theme: 'light' | 'dark' | 'auto';
  language: string;
  timezone: string;
  notifications: NotificationSettings;
  privacy: PrivacySettings;
}

interface NotificationSettings {
  email: boolean;
  push: boolean;
  sms: boolean;
  frequency: 'immediate' | 'daily' | 'weekly' | 'never';
  types: NotificationType[];
}

interface PrivacySettings {
  profileVisibility: 'public' | 'friends' | 'private';
  showEmail: boolean;
  showLocation: boolean;
  allowSearchEngineIndexing: boolean;
}

type NotificationType = 
  | 'comment' 
  | 'like' 
  | 'follow' 
  | 'mention' 
  | 'message' 
  | 'system';

type Role = 'admin' | 'moderator' | 'user' | 'guest';

// Generic Repository Pattern
abstract class BaseRepository<T extends DatabaseEntity> {
  protected abstract tableName: string;
  protected abstract db: Database;

  async findById(id: string): Promise<T | null> {
    try {
      const query = \`SELECT * FROM \${this.tableName} WHERE id = ? AND deleted_at IS NULL\`;
      const result = await this.db.query<T>(query, [id]);
      return result.rows[0] || null;
    } catch (error) {
      throw new RepositoryError(\`Failed to find \${this.tableName} by id: \${id}\`, error);
    }
  }

  async findMany(options: FindManyOptions<T> = {}): Promise<PaginatedResult<T>> {
    const {
      where = {},
      orderBy = { createdAt: 'desc' },
      limit = 20,
      offset = 0,
      include = []
    } = options;

    try {
      const whereClause = this.buildWhereClause(where);
      const orderClause = this.buildOrderClause(orderBy);
      const includeClause = this.buildIncludeClause(include);

      const countQuery = \`
        SELECT COUNT(*) as total 
        FROM \${this.tableName} 
        \${whereClause}
      \`;

      const dataQuery = \`
        SELECT \${this.getSelectFields(include)}
        FROM \${this.tableName}
        \${includeClause}
        \${whereClause}
        \${orderClause}
        LIMIT ? OFFSET ?
      \`;

      const [countResult, dataResult] = await Promise.all([
        this.db.query<{ total: number }>(countQuery, this.getWhereValues(where)),
        this.db.query<T>(dataQuery, [...this.getWhereValues(where), limit, offset])
      ]);

      const total = countResult.rows[0]?.total || 0;
      const totalPages = Math.ceil(total / limit);
      const currentPage = Math.floor(offset / limit) + 1;

      return {
        data: dataResult.rows,
        pagination: {
          total,
          totalPages,
          currentPage,
          limit,
          offset,
          hasNext: currentPage < totalPages,
          hasPrev: currentPage > 1
        }
      };
    } catch (error) {
      throw new RepositoryError(\`Failed to find many \${this.tableName}\`, error);
    }
  }

  async create(data: Omit<T, keyof DatabaseEntity>): Promise<T> {
    const now = new Date();
    const entity: T = {
      ...data,
      id: this.generateId(),
      createdAt: now,
      updatedAt: now,
      version: 1
    } as T;

    try {
      const fields = Object.keys(entity);
      const placeholders = fields.map(() => '?').join(', ');
      const values = Object.values(entity);

      const query = \`
        INSERT INTO \${this.tableName} (\${fields.join(', ')})
        VALUES (\${placeholders})
      \`;

      await this.db.query(query, values);
      return entity;
    } catch (error) {
      throw new RepositoryError(\`Failed to create \${this.tableName}\`, error);
    }
  }

  async update(id: string, data: Partial<Omit<T, keyof DatabaseEntity>>): Promise<T | null> {
    const existing = await this.findById(id);
    if (!existing) {
      return null;
    }

    const updatedEntity: T = {
      ...existing,
      ...data,
      updatedAt: new Date(),
      version: existing.version + 1
    };

    try {
      const updateFields = Object.keys(data);
      const setClause = updateFields.map(field => \`\${field} = ?\`).join(', ');
      const values = [...Object.values(data), new Date(), existing.version + 1, id, existing.version];

      const query = \`
        UPDATE \${this.tableName}
        SET \${setClause}, updated_at = ?, version = ?
        WHERE id = ? AND version = ?
      \`;

      const result = await this.db.query(query, values);
      
      if (result.affectedRows === 0) {
        throw new OptimisticLockError(\`Entity was modified by another process\`);
      }

      return updatedEntity;
    } catch (error) {
      if (error instanceof OptimisticLockError) {
        throw error;
      }
      throw new RepositoryError(\`Failed to update \${this.tableName} with id: \${id}\`, error);
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      const query = \`
        UPDATE \${this.tableName}
        SET deleted_at = ?, updated_at = ?
        WHERE id = ? AND deleted_at IS NULL
      \`;

      const now = new Date();
      const result = await this.db.query(query, [now, now, id]);
      return result.affectedRows > 0;
    } catch (error) {
      throw new RepositoryError(\`Failed to delete \${this.tableName} with id: \${id}\`, error);
    }
  }

  protected abstract generateId(): string;
  protected abstract buildWhereClause(where: Record<string, any>): string;
  protected abstract buildOrderClause(orderBy: Record<string, 'asc' | 'desc'>): string;
  protected abstract buildIncludeClause(include: string[]): string;
  protected abstract getSelectFields(include: string[]): string;
  protected abstract getWhereValues(where: Record<string, any>): any[];
}

// User Repository Implementation
class UserRepository extends BaseRepository<User> {
  protected tableName = 'users';
  protected db: Database;

  constructor(database: Database) {
    super();
    this.db = database;
  }

  async findByEmail(email: string): Promise<User | null> {
    try {
      const query = \`
        SELECT * FROM \${this.tableName}
        WHERE email = ? AND deleted_at IS NULL
      \`;
      const result = await this.db.query<User>(query, [email]);
      return result.rows[0] || null;
    } catch (error) {
      throw new RepositoryError(\`Failed to find user by email: \${email}\`, error);
    }
  }

  async findByUsername(username: string): Promise<User | null> {
    try {
      const query = \`
        SELECT * FROM \${this.tableName}
        WHERE username = ? AND deleted_at IS NULL
      \`;
      const result = await this.db.query<User>(query, [username]);
      return result.rows[0] || null;
    } catch (error) {
      throw new RepositoryError(\`Failed to find user by username: \${username}\`, error);
    }
  }

  async updatePreferences(userId: string, preferences: Partial<UserPreferences>): Promise<User | null> {
    const user = await this.findById(userId);
    if (!user) return null;

    const updatedPreferences = {
      ...user.preferences,
      ...preferences
    };

    return this.update(userId, { preferences: updatedPreferences });
  }

  async updateProfile(userId: string, profile: Partial<UserProfile>): Promise<User | null> {
    const user = await this.findById(userId);
    if (!user) return null;

    const updatedProfile = {
      ...user.profile,
      ...profile
    };

    return this.update(userId, { profile: updatedProfile });
  }

  protected generateId(): string {
    return \`user_\${Date.now()}_\${Math.random().toString(36).substr(2, 9)}\`;
  }

  protected buildWhereClause(where: Record<string, any>): string {
    const conditions = ['deleted_at IS NULL'];
    
    Object.keys(where).forEach(key => {
      if (where[key] !== undefined) {
        conditions.push(\`\${key} = ?\`);
      }
    });

    return conditions.length > 1 ? \`WHERE \${conditions.join(' AND ')}\` : 'WHERE deleted_at IS NULL';
  }

  protected buildOrderClause(orderBy: Record<string, 'asc' | 'desc'>): string {
    const orderPairs = Object.entries(orderBy).map(([field, direction]) => 
      \`\${field} \${direction.toUpperCase()}\`
    );
    
    return orderPairs.length > 0 ? \`ORDER BY \${orderPairs.join(', ')}\` : '';
  }

  protected buildIncludeClause(include: string[]): string {
    // Implementation for JOIN clauses based on include array
    return '';
  }

  protected getSelectFields(include: string[]): string {
    return '*';
  }

  protected getWhereValues(where: Record<string, any>): any[] {
    return Object.values(where).filter(value => value !== undefined);
  }
}

// Utility Types and Interfaces
interface FindManyOptions<T> {
  where?: Partial<Record<keyof T, any>>;
  orderBy?: Partial<Record<keyof T, 'asc' | 'desc'>>;
  limit?: number;
  offset?: number;
  include?: string[];
}

interface PaginatedResult<T> {
  data: T[];
  pagination: {
    total: number;
    totalPages: number;
    currentPage: number;
    limit: number;
    offset: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

interface Database {
  query<T = any>(sql: string, params?: any[]): Promise<{ rows: T[]; affectedRows: number }>;
}

class RepositoryError extends Error {
  constructor(message: string, public cause?: Error) {
    super(message);
    this.name = 'RepositoryError';
  }
}

class OptimisticLockError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'OptimisticLockError';
  }
}

// Service Layer with Dependency Injection
class UserService {
  constructor(
    private userRepository: UserRepository,
    private emailService: EmailService,
    private cacheService: CacheService,
    private logger: Logger
  ) {}

  async createUser(userData: CreateUserRequest): Promise<ServiceResult<User>> {
    try {
      // Validate input
      const validation = await this.validateUserData(userData);
      if (!validation.isValid) {
        return {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid user data',
            details: validation.errors
          }
        };
      }

      // Check if user already exists
      const [existingByEmail, existingByUsername] = await Promise.all([
        this.userRepository.findByEmail(userData.email),
        this.userRepository.findByUsername(userData.username)
      ]);

      if (existingByEmail) {
        return {
          success: false,
          error: {
            code: 'EMAIL_EXISTS',
            message: 'User with this email already exists'
          }
        };
      }

      if (existingByUsername) {
        return {
          success: false,
          error: {
            code: 'USERNAME_EXISTS',
            message: 'Username is already taken'
          }
        };
      }

      // Create user
      const user = await this.userRepository.create({
        email: userData.email,
        username: userData.username,
        profile: {
          firstName: userData.firstName,
          lastName: userData.lastName,
          avatar: null,
          bio: '',
          location: userData.location || '',
          website: '',
          socialLinks: {}
        },
        preferences: {
          theme: 'auto',
          language: 'en',
          timezone: userData.timezone || 'UTC',
          notifications: {
            email: true,
            push: true,
            sms: false,
            frequency: 'immediate',
            types: ['comment', 'like', 'follow', 'mention', 'message']
          },
          privacy: {
            profileVisibility: 'public',
            showEmail: false,
            showLocation: false,
            allowSearchEngineIndexing: true
          }
        },
        roles: ['user']
      });

      // Send welcome email
      await this.emailService.sendWelcomeEmail(user.email, {
        firstName: user.profile.firstName,
        username: user.username
      });

      // Cache user data
      await this.cacheService.set(\`user:\${user.id}\`, user, 3600);

      this.logger.info('User created successfully', { userId: user.id, email: user.email });

      return {
        success: true,
        data: user
      };

    } catch (error) {
      this.logger.error('Failed to create user', { error, userData });
      return {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to create user'
        }
      };
    }
  }

  private async validateUserData(userData: CreateUserRequest): Promise<ValidationResult> {
    const errors: ValidationError[] = [];

    // Email validation
    if (!userData.email || !this.isValidEmail(userData.email)) {
      errors.push({
        field: 'email',
        message: 'Valid email address is required'
      });
    }

    // Username validation
    if (!userData.username || userData.username.length < 3 || userData.username.length > 30) {
      errors.push({
        field: 'username',
        message: 'Username must be between 3 and 30 characters'
      });
    }

    if (userData.username && !/^[a-zA-Z0-9_]+$/.test(userData.username)) {
      errors.push({
        field: 'username',
        message: 'Username can only contain letters, numbers, and underscores'
      });
    }

    // Name validation
    if (!userData.firstName || userData.firstName.trim().length === 0) {
      errors.push({
        field: 'firstName',
        message: 'First name is required'
      });
    }

    if (!userData.lastName || userData.lastName.trim().length === 0) {
      errors.push({
        field: 'lastName',
        message: 'Last name is required'
      });
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}

interface CreateUserRequest {
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  location?: string;
  timezone?: string;
}

interface ServiceResult<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

interface ValidationError {
  field: string;
  message: string;
}

interface EmailService {
  sendWelcomeEmail(email: string, data: { firstName: string; username: string }): Promise<void>;
}

interface CacheService {
  set(key: string, value: any, ttl: number): Promise<void>;
  get<T>(key: string): Promise<T | null>;
  delete(key: string): Promise<void>;
}

interface Logger {
  info(message: string, meta?: any): void;
  error(message: string, meta?: any): void;
  warn(message: string, meta?: any): void;
  debug(message: string, meta?: any): void;
}`,
  ],
  html: [
    `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="Modern web application with responsive design and accessibility features">
    <meta name="keywords" content="web app, responsive, accessibility, modern">
    <meta name="author" content="Your Name">
    <meta property="og:title" content="Modern Web Application">
    <meta property="og:description" content="A cutting-edge web application built with modern standards">
    <meta property="og:image" content="/images/og-image.jpg">
    <meta property="og:url" content="https://example.com">
    <meta name="twitter:card" content="summary_large_image">
    
    <title>Modern Web Application - Dashboard</title>
    
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="/css/main.css">
    <link rel="stylesheet" href="/css/components.css">
    <link rel="icon" type="image/x-icon" href="/favicon.ico">
    <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
    <link rel="manifest" href="/manifest.json">
    
    <style>
        :root {
            --primary-color: #3b82f6;
            --secondary-color: #64748b;
            --success-color: #10b981;
            --warning-color: #f59e0b;
            --error-color: #ef4444;
            --background-color: #ffffff;
            --surface-color: #f8fafc;
            --text-primary: #1e293b;
            --text-secondary: #64748b;
            --border-color: #e2e8f0;
            --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
            --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1);
            --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1);
        }

        @media (prefers-color-scheme: dark) {
            :root {
                --background-color: #0f172a;
                --surface-color: #1e293b;
                --text-primary: #f1f5f9;
                --text-secondary: #94a3b8;
                --border-color: #334155;
            }
        }

        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background-color: var(--background-color);
            color: var(--text-primary);
            line-height: 1.6;
            transition: background-color 0.3s ease, color 0.3s ease;
        }

        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 0 1rem;
        }

        .grid {
            display: grid;
            gap: 1.5rem;
        }

        .grid-cols-1 { grid-template-columns: repeat(1, minmax(0, 1fr)); }
        .grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        .grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
        .grid-cols-4 { grid-template-columns: repeat(4, minmax(0, 1fr)); }

        @media (max-width: 768px) {
            .grid-cols-2, .grid-cols-3, .grid-cols-4 {
                grid-template-columns: repeat(1, minmax(0, 1fr));
            }
        }

        @media (min-width: 769px) and (max-width: 1024px) {
            .grid-cols-3, .grid-cols-4 {
                grid-template-columns: repeat(2, minmax(0, 1fr));
            }
        }
    </style>
</head>
<body>
    <a href="#main-content" class="skip-link">Skip to main content</a>
    
    <header class="header" role="banner">
        <nav class="navbar" role="navigation" aria-label="Main navigation">
            <div class="container">
                <div class="navbar-brand">
                    <a href="/" class="logo" aria-label="Home">
                        <img src="/images/logo.svg" alt="Company Logo" width="40" height="40">
                        <span class="logo-text">WebApp</span>
                    </a>
                    
                    <button class="mobile-menu-toggle" 
                            type="button" 
                            aria-expanded="false" 
                            aria-controls="mobile-menu"
                            aria-label="Toggle mobile menu">
                        <span class="hamburger-line"></span>
                        <span class="hamburger-line"></span>
                        <span class="hamburger-line"></span>
                    </button>
                </div>
                
                <div class="navbar-menu" id="mobile-menu">
                    <ul class="navbar-nav" role="menubar">
                        <li role="none">
                            <a href="/dashboard" 
                               class="nav-link active" 
                               role="menuitem" 
                               aria-current="page">
                                Dashboard
                            </a>
                        </li>
                        <li role="none">
                            <a href="/projects" class="nav-link" role="menuitem">Projects</a>
                        </li>
                        <li role="none">
                            <a href="/analytics" class="nav-link" role="menuitem">Analytics</a>
                        </li>
                        <li role="none">
                            <a href="/settings" class="nav-link" role="menuitem">Settings</a>
                        </li>
                    </ul>
                    
                    <div class="navbar-actions">
                        <button type="button" 
                                class="theme-toggle" 
                                aria-label="Toggle dark mode"
                                title="Toggle dark mode">
                            <svg class="theme-icon sun-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <circle cx="12" cy="12" r="5"></circle>
                                <line x1="12" y1="1" x2="12" y2="3"></line>
                                <line x1="12" y1="21" x2="12" y2="23"></line>
                                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                                <line x1="1" y1="12" x2="3" y2="12"></line>
                                <line x1="21" y1="12" x2="23" y2="12"></line>
                                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
                            </svg>
                            <svg class="theme-icon moon-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                            </svg>
                        </button>
                        
                        <div class="user-menu">
                            <button type="button" 
                                    class="user-menu-trigger" 
                                    aria-expanded="false"
                                    aria-haspopup="true"
                                    aria-label="User menu">
                                <img src="/images/avatar.jpg" 
                                     alt="User avatar" 
                                     class="user-avatar"
                                     width="32" 
                                     height="32">
                                <span class="user-name">John Doe</span>
                                <svg class="chevron-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <polyline points="6,9 12,15 18,9"></polyline>
                                </svg>
                            </button>
                            
                            <div class="user-menu-dropdown" role="menu" aria-labelledby="user-menu-trigger">
                                <a href="/profile" class="dropdown-item" role="menuitem">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                        <circle cx="12" cy="7" r="4"></circle>
                                    </svg>
                                    Profile
                                </a>
                                <a href="/account" class="dropdown-item" role="menuitem">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <circle cx="12" cy="12" r="3"></circle>
                                        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1 1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                                    </svg>
                                    Account Settings
                                </a>
                                <hr class="dropdown-divider" role="separator">
                                <button type="button" class="dropdown-item logout-btn" role="menuitem">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                                        <polyline points="16,17 21,12 16,7"></polyline>
                                        <line x1="21" y1="12" x2="9" y2="12"></line>
                                    </svg>
                                    Sign Out
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    </header>

    <main id="main-content" class="main-content" role="main">
        <div class="container">
            <div class="page-header">
                <div class="page-title-section">
                    <h1 class="page-title">Dashboard</h1>
                    <p class="page-description">
                        Welcome back! Here's what's happening with your projects today.
                    </p>
                </div>
                
                <div class="page-actions">
                    <button type="button" class="btn btn-secondary">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                            <polyline points="7,10 12,15 17,10"></polyline>
                            <line x1="12" y1="15" x2="12" y2="3"></line>
                        </svg>
                        Export Data
                    </button>
                    <button type="button" class="btn btn-primary">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="12" y1="5" x2="12" y2="19"></line>
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                        </svg>
                        New Project
                    </button>
                </div>
            </div>

            <section class="stats-section" aria-labelledby="stats-heading">
                <h2 id="stats-heading" class="section-title visually-hidden">Statistics Overview</h2>
                
                <div class="grid grid-cols-4">
                    <div class="stat-card">
                        <div class="stat-icon stat-icon-primary">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
                            </svg>
                        </div>
                        <div class="stat-content">
                            <div class="stat-value">2,847</div>
                            <div class="stat-label">Total Users</div>
                            <div class="stat-change stat-change-positive">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <polyline points="23,6 13.5,15.5 8.5,10.5 1,18"></polyline>
                                    <polyline points="17,6 23,6 23,12"></polyline>
                                </svg>
                                +12.5%
                            </div>
                        </div>
                    </div>

                    <div class="stat-card">
                        <div class="stat-icon stat-icon-success">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                                <line x1="8" y1="21" x2="16" y2="21"></line>
                                <line x1="12" y1="17" x2="12" y2="21"></line>
                            </svg>
                        </div>
                        <div class="stat-content">
                            <div class="stat-value">$45,210</div>
                            <div class="stat-label">Revenue</div>
                            <div class="stat-change stat-change-positive">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <polyline points="23,6 13.5,15.5 8.5,10.5 1,18"></polyline>
                                    <polyline points="17,6 23,6 23,12"></polyline>
                                </svg>
                                +8.2%
                            </div>
                        </div>
                    </div>

                    <div class="stat-card">
                        <div class="stat-icon stat-icon-warning">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                                <circle cx="8.5" cy="7" r="4"></circle>
                                <line x1="20" y1="8" x2="20" y2="14"></line>
                                <line x1="23" y1="11" x2="17" y2="11"></line>
                            </svg>
                        </div>
                        <div class="stat-content">
                            <div class="stat-value">156</div>
                            <div class="stat-label">New Signups</div>
                            <div class="stat-change stat-change-negative">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <polyline points="23,18 13.5,8.5 8.5,13.5 1,6"></polyline>
                                    <polyline points="17,18 23,18 23,12"></polyline>
                                </svg>
                                -3.1%
                            </div>
                        </div>
                    </div>

                    <div class="stat-card">
                        <div class="stat-icon stat-icon-info">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path>
                            </svg>
                        </div>
                        <div class="stat-content">
                            <div class="stat-value">4.8</div>
                            <div class="stat-label">Avg Rating</div>
                            <div class="stat-change stat-change-positive">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <polyline points="23,6 13.5,15.5 8.5,10.5 1,18"></polyline>
                                    <polyline points="17,6 23,6 23,12"></polyline>
                                </svg>
                                +0.3
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    </main>

    <footer class="footer" role="contentinfo">
        <div class="container">
            <div class="footer-content">
                <div class="footer-section">
                    <div class="footer-brand">
                        <img src="/images/logo.svg" alt="Company Logo" width="32" height="32">
                        <span class="footer-brand-text">WebApp</span>
                    </div>
                    <p class="footer-description">
                        Building the future of web applications with modern technology and user-centered design.
                    </p>
                </div>
                
                <div class="footer-links">
                    <div class="footer-column">
                        <h3 class="footer-heading">Product</h3>
                        <ul class="footer-list">
                            <li><a href="/features" class="footer-link">Features</a></li>
                            <li><a href="/pricing" class="footer-link">Pricing</a></li>
                            <li><a href="/integrations" class="footer-link">Integrations</a></li>
                            <li><a href="/api" class="footer-link">API</a></li>
                        </ul>
                    </div>
                    
                    <div class="footer-column">
                        <h3 class="footer-heading">Company</h3>
                        <ul class="footer-list">
                            <li><a href="/about" class="footer-link">About</a></li>
                            <li><a href="/careers" class="footer-link">Careers</a></li>
                            <li><a href="/blog" class="footer-link">Blog</a></li>
                            <li><a href="/contact" class="footer-link">Contact</a></li>
                        </ul>
                    </div>
                    
                    <div class="footer-column">
                        <h3 class="footer-heading">Support</h3>
                        <ul class="footer-list">
                            <li><a href="/help" class="footer-link">Help Center</a></li>
                            <li><a href="/docs" class="footer-link">Documentation</a></li>
                            <li><a href="/status" class="footer-link">Status</a></li>
                            <li><a href="/community" class="footer-link">Community</a></li>
                        </ul>
                    </div>
                </div>
            </div>
            
            <div class="footer-bottom">
                <div class="footer-copyright">
                    <p>&copy; 2025 WebApp Inc. All rights reserved.</p>
                </div>
                <div class="footer-legal">
                    <a href="/privacy" class="footer-link">Privacy Policy</a>
                    <a href="/terms" class="footer-link">Terms of Service</a>
                    <a href="/cookies" class="footer-link">Cookie Policy</a>
                </div>
            </div>
        </div>
    </footer>

    <script src="/js/main.js" defer></script>
    <script src="/js/components.js" defer></script>
    
    <script>
        // Progressive Web App registration
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                navigator.serviceWorker.register('/sw.js')
                    .then(registration => {
                        console.log('SW registered: ', registration);
                    })
                    .catch(registrationError => {
                        console.log('SW registration failed: ', registrationError);
                    });
            });
        }

        // Theme toggle functionality
        const themeToggle = document.querySelector('.theme-toggle');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
        
        function updateTheme(theme) {
            document.documentElement.setAttribute('data-theme', theme);
            localStorage.setItem('theme', theme);
        }
        
        themeToggle?.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            updateTheme(newTheme);
        });
        
        // Initialize theme
        const savedTheme = localStorage.getItem('theme');
        const initialTheme = savedTheme || (prefersDark.matches ? 'dark' : 'light');
        updateTheme(initialTheme);
    </script>
</body>
</html>`,
  ],
  python: [
    `from django.contrib.auth.models import AbstractUser
from django.db import models
from django.core.validators import MinLengthValidator, EmailValidator
from django.utils import timezone
from rest_framework import serializers, viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from rest_framework.authtoken.views import ObtainAuthToken
from django.contrib.auth import authenticate
from django.core.cache import cache
from django.db.models import Q, Count, Avg
from django.utils.decorators import method_decorator
from django.views.decorators.cache import cache_page
from django.core.paginator import Paginator
import logging
import uuid
from datetime import datetime, timedelta

logger = logging.getLogger(__name__)

class User(AbstractUser):
    """Extended user model with additional fields"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(unique=True, validators=[EmailValidator()])
    phone_number = models.CharField(max_length=20, blank=True, null=True)
    date_of_birth = models.DateField(blank=True, null=True)
    profile_picture = models.ImageField(upload_to='profiles/', blank=True, null=True)
    bio = models.TextField(max_length=500, blank=True)
    location = models.CharField(max_length=100, blank=True)
    website = models.URLField(blank=True)
    is_verified = models.BooleanField(default=False)
    verification_token = models.CharField(max_length=100, blank=True, null=True)
    last_activity = models.DateTimeField(auto_now=True)
    preferences = models.JSONField(default=dict, blank=True)
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username', 'first_name', 'last_name']
    
    class Meta:
        db_table = 'auth_user'
        verbose_name = 'User'
        verbose_name_plural = 'Users'
        ordering = ['-date_joined']
    
    def __str__(self):
        return f"{self.get_full_name()} ({self.email})"
    
    def get_full_name(self):
        return f"{self.first_name} {self.last_name}".strip()
    
    def get_short_name(self):
        return self.first_name
    
    @property
    def is_online(self):
        """Check if user was active in the last 5 minutes"""
        if not self.last_activity:
            return False
        return timezone.now() - self.last_activity < timedelta(minutes=5)
    
    def update_last_activity(self):
        """Update the last activity timestamp"""
        self.last_activity = timezone.now()
        self.save(update_fields=['last_activity'])

class Post(models.Model):
    """Blog post model with rich features"""
    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('published', 'Published'),
        ('archived', 'Archived'),
    ]
    
    CATEGORY_CHOICES = [
        ('tech', 'Technology'),
        ('business', 'Business'),
        ('lifestyle', 'Lifestyle'),
        ('education', 'Education'),
        ('health', 'Health'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=200, validators=[MinLengthValidator(5)])
    slug = models.SlugField(max_length=250, unique=True)
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='posts')
    content = models.TextField(validators=[MinLengthValidator(50)])
    excerpt = models.TextField(max_length=300, blank=True)
    featured_image = models.ImageField(upload_to='posts/', blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES, default='tech')
    tags = models.JSONField(default=list, blank=True)
    meta_description = models.CharField(max_length=160, blank=True)
    read_time = models.PositiveIntegerField(default=0, help_text="Estimated read time in minutes")
    view_count = models.PositiveIntegerField(default=0)
    like_count = models.PositiveIntegerField(default=0)
    comment_count = models.PositiveIntegerField(default=0)
    is_featured = models.BooleanField(default=False)
    published_at = models.DateTimeField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'blog_posts'
        verbose_name = 'Post'
        verbose_name_plural = 'Posts'
        ordering = ['-published_at', '-created_at']
        indexes = [
            models.Index(fields=['status', 'published_at']),
            models.Index(fields=['author', 'status']),
            models.Index(fields=['category', 'status']),
        ]
    
    def __str__(self):
        return self.title
    
    def save(self, *args, **kwargs):
        if self.status == 'published' and not self.published_at:
            self.published_at = timezone.now()
        
        if not self.excerpt and self.content:
            # Auto-generate excerpt from content
            words = self.content.split()[:50]
            self.excerpt = ' '.join(words) + '...' if len(words) == 50 else ' '.join(words)
        
        if not self.read_time and self.content:
            # Calculate read time (average 200 words per minute)
            word_count = len(self.content.split())
            self.read_time = max(1, round(word_count / 200))
        
        super().save(*args, **kwargs)
    
    @property
    def is_published(self):
        return self.status == 'published' and self.published_at is not None
    
    def increment_view_count(self):
        """Increment view count atomically"""
        Post.objects.filter(id=self.id).update(view_count=models.F('view_count') + 1)
        self.refresh_from_db(fields=['view_count'])

class Comment(models.Model):
    """Comment model for posts"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='comments')
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='comments')
    parent = models.ForeignKey('self', on_delete=models.CASCADE, blank=True, null=True, related_name='replies')
    content = models.TextField(validators=[MinLengthValidator(10)])
    is_approved = models.BooleanField(default=True)
    like_count = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'blog_comments'
        verbose_name = 'Comment'
        verbose_name_plural = 'Comments'
        ordering = ['created_at']
        indexes = [
            models.Index(fields=['post', 'is_approved']),
            models.Index(fields=['author', 'created_at']),
        ]
    
    def __str__(self):
        return f"Comment by {self.author.get_full_name()} on {self.post.title}"
    
    @property
    def is_reply(self):
        return self.parent is not None

# Serializers
class UserSerializer(serializers.ModelSerializer):
    full_name = serializers.CharField(source='get_full_name', read_only=True)
    is_online = serializers.BooleanField(read_only=True)
    posts_count = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name', 'full_name',
            'phone_number', 'date_of_birth', 'profile_picture', 'bio', 'location',
            'website', 'is_verified', 'is_online', 'last_activity', 'date_joined',
            'posts_count'
        ]
        read_only_fields = ['id', 'is_verified', 'date_joined']
    
    def get_posts_count(self, obj):
        return obj.posts.filter(status='published').count()
    
    def validate_email(self, value):
        if User.objects.filter(email=value).exclude(id=self.instance.id if self.instance else None).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value

class PostSerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)
    author_id = serializers.UUIDField(write_only=True, required=False)
    comments_count = serializers.SerializerMethodField()
    is_liked = serializers.SerializerMethodField()
    reading_time = serializers.CharField(source='read_time', read_only=True)
    
    class Meta:
        model = Post
        fields = [
            'id', 'title', 'slug', 'author', 'author_id', 'content', 'excerpt',
            'featured_image', 'status', 'category', 'tags', 'meta_description',
            'read_time', 'reading_time', 'view_count', 'like_count', 'comment_count',
            'comments_count', 'is_featured', 'is_liked', 'published_at', 'created_at',
            'updated_at'
        ]
        read_only_fields = [
            'id', 'slug', 'view_count', 'like_count', 'comment_count',
            'published_at', 'created_at', 'updated_at'
        ]
    
    def get_comments_count(self, obj):
        return obj.comments.filter(is_approved=True).count()
    
    def get_is_liked(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            # This would require a Like model
            return False  # Placeholder
        return False
    
    def validate_title(self, value):
        if len(value.strip()) < 5:
            raise serializers.ValidationError("Title must be at least 5 characters long.")
        return value.strip()
    
    def create(self, validated_data):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            validated_data['author'] = request.user
        return super().create(validated_data)

class CommentSerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)
    replies = serializers.SerializerMethodField()
    replies_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Comment
        fields = [
            'id', 'post', 'author', 'parent', 'content', 'is_approved',
            'like_count', 'replies', 'replies_count', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'is_approved', 'like_count', 'created_at', 'updated_at']
    
    def get_replies(self, obj):
        if obj.replies.exists():
            return CommentSerializer(
                obj.replies.filter(is_approved=True),
                many=True,
                context=self.context
            ).data
        return []
    
    def get_replies_count(self, obj):
        return obj.replies.filter(is_approved=True).count()
    
    def create(self, validated_data):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            validated_data['author'] = request.user
        return super().create(validated_data)

# ViewSets
class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_permissions(self):
        if self.action == 'create':
            permission_classes = [permissions.AllowAny]
        elif self.action in ['update', 'partial_update', 'destroy']:
            permission_classes = [permissions.IsAuthenticated]
        else:
            permission_classes = [permissions.IsAuthenticatedOrReadOnly]
        
        return [permission() for permission in permission_classes]
    
    def get_queryset(self):
        queryset = User.objects.all()
        
        # Filter by search query
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(
                Q(username__icontains=search) |
                Q(first_name__icontains=search) |
                Q(last_name__icontains=search) |
                Q(email__icontains=search)
            )
        
        # Filter by verification status
        is_verified = self.request.query_params.get('is_verified', None)
        if is_verified is not None:
            queryset = queryset.filter(is_verified=is_verified.lower() == 'true')
        
        return queryset.order_by('-date_joined')
    
    @action(detail=True, methods=['post'])
    def follow(self, request, pk=None):
        """Follow/unfollow a user"""
        user_to_follow = self.get_object()
        current_user = request.user
        
        if user_to_follow == current_user:
            return Response(
                {'error': 'You cannot follow yourself'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # This would require a Follow model
        # Implementation depends on your follow system
        
        return Response({'message': 'Follow action completed'})
    
    @action(detail=True, methods=['get'])
    def posts(self, request, pk=None):
        """Get user's posts"""
        user = self.get_object()
        posts = user.posts.filter(status='published').order_by('-published_at')
        
        page = self.paginate_queryset(posts)
        if page is not None:
            serializer = PostSerializer(page, many=True, context={'request': request})
            return self.get_paginated_response(serializer.data)
        
        serializer = PostSerializer(posts, many=True, context={'request': request})
        return Response(serializer.data)

class PostViewSet(viewsets.ModelViewSet):
    serializer_class = PostSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    
    def get_queryset(self):
        queryset = Post.objects.select_related('author').prefetch_related('comments')
        
        # Filter by status (only published for non-authors)
        if not self.request.user.is_authenticated or not self.request.user.is_staff:
            queryset = queryset.filter(status='published')
        
        # Filter by category
        category = self.request.query_params.get('category', None)
        if category:
            queryset = queryset.filter(category=category)
        
        # Filter by tags
        tags = self.request.query_params.get('tags', None)
        if tags:
            tag_list = [tag.strip() for tag in tags.split(',')]
            for tag in tag_list:
                queryset = queryset.filter(tags__contains=[tag])
        
        # Search in title and content
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(
                Q(title__icontains=search) |
                Q(content__icontains=search) |
                Q(excerpt__icontains=search)
            )
        
        # Filter by author
        author = self.request.query_params.get('author', None)
        if author:
            queryset = queryset.filter(author__username=author)
        
        return queryset.order_by('-published_at', '-created_at')
    
    def retrieve(self, request, *args, **kwargs):
        """Override retrieve to increment view count"""
        instance = self.get_object()
        
        # Increment view count (with caching to prevent spam)
        cache_key = f"post_view_{instance.id}_{request.META.get('REMOTE_ADDR', 'unknown')}"
        if not cache.get(cache_key):
            instance.increment_view_count()
            cache.set(cache_key, True, 300)  # 5 minutes
        
        serializer = self.get_serializer(instance)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def like(self, request, pk=None):
        """Like/unlike a post"""
        post = self.get_object()
        
        # This would require a Like model
        # Implementation depends on your like system
        
        return Response({'message': 'Like action completed'})
    
    @method_decorator(cache_page(60 * 15))  # Cache for 15 minutes
    @action(detail=False, methods=['get'])
    def featured(self, request):
        """Get featured posts"""
        posts = self.get_queryset().filter(is_featured=True)[:5]
        serializer = self.get_serializer(posts, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def trending(self, request):
        """Get trending posts based on recent activity"""
        # Posts with high engagement in the last 7 days
        week_ago = timezone.now() - timedelta(days=7)
        posts = self.get_queryset().filter(
            published_at__gte=week_ago
        ).annotate(
            engagement_score=models.F('view_count') + models.F('like_count') * 2 + models.F('comment_count') * 3
        ).order_by('-engagement_score')[:10]
        
        serializer = self.get_serializer(posts, many=True)
        return Response(serializer.data)

# Custom Authentication
class CustomAuthToken(ObtainAuthToken):
    def post(self, request, *args, **kwargs):
        serializer = self.serializer_class(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        
        user = serializer.validated_data['user']
        token, created = Token.objects.get_or_create(user=user)
        
        # Update last activity
        user.update_last_activity()
        
        logger.info(f"User {user.email} logged in successfully")
        
        return Response({
            'token': token.key,
            'user': UserSerializer(user, context={'request': request}).data,
            'expires_in': 86400  # 24 hours in seconds
        })`,
  ],
  sql: [
    `-- E-commerce Database Schema with Advanced Features
CREATE DATABASE ecommerce_platform;
USE ecommerce_platform;

-- Users table with comprehensive profile information
CREATE TABLE users (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone_number VARCHAR(20),
    date_of_birth DATE,
    profile_picture_url TEXT,
    bio TEXT,
    location VARCHAR(255),
    website_url TEXT,
    is_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    email_verified_at TIMESTAMP NULL,
    phone_verified_at TIMESTAMP NULL,
    last_login_at TIMESTAMP NULL,
    last_activity_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    preferences JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    
    INDEX idx_users_email (email),
    INDEX idx_users_username (username),
    INDEX idx_users_active (is_active, deleted_at),
    INDEX idx_users_verified (is_verified),
    INDEX idx_users_created (created_at),
    FULLTEXT idx_users_search (first_name, last_name, username, bio)
);

-- User roles and permissions
CREATE TABLE roles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    permissions JSON,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE user_roles (
    user_id CHAR(36),
    role_id INT,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    assigned_by CHAR(36),
    expires_at TIMESTAMP NULL,
    
    PRIMARY KEY (user_id, role_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_by) REFERENCES users(id) ON DELETE SET NULL,
    
    INDEX idx_user_roles_expires (expires_at)
);

-- Product categories with hierarchical structure
CREATE TABLE categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    parent_id INT NULL,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    image_url TEXT,
    sort_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    seo_title VARCHAR(255),
    seo_description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE SET NULL,
    INDEX idx_categories_parent (parent_id),
    INDEX idx_categories_active (is_active),
    INDEX idx_categories_sort (sort_order)
);

-- Products with comprehensive information
CREATE TABLE products (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    sku VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    short_description TEXT,
    category_id INT,
    brand VARCHAR(100),
    model VARCHAR(100),
    price DECIMAL(10, 2) NOT NULL,
    compare_price DECIMAL(10, 2),
    cost_price DECIMAL(10, 2),
    weight DECIMAL(8, 3),
    dimensions JSON, -- {length, width, height, unit}
    stock_quantity INT DEFAULT 0,
    low_stock_threshold INT DEFAULT 10,
    track_inventory BOOLEAN DEFAULT TRUE,
    allow_backorders BOOLEAN DEFAULT FALSE,
    status ENUM('draft', 'active', 'inactive', 'archived') DEFAULT 'draft',
    visibility ENUM('visible', 'hidden', 'search_only') DEFAULT 'visible',
    featured BOOLEAN DEFAULT FALSE,
    digital BOOLEAN DEFAULT FALSE,
    requires_shipping BOOLEAN DEFAULT TRUE,
    tax_class VARCHAR(50),
    meta_title VARCHAR(255),
    meta_description TEXT,
    tags JSON,
    attributes JSON,
    images JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    published_at TIMESTAMP NULL,
    
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
    INDEX idx_products_sku (sku),
    INDEX idx_products_category (category_id),
    INDEX idx_products_status (status),
    INDEX idx_products_featured (featured),
    INDEX idx_products_price (price),
    INDEX idx_products_stock (stock_quantity),
    INDEX idx_products_published (published_at),
    FULLTEXT idx_products_search (name, description, short_description, brand, model)
);

-- Product variants for different options (size, color, etc.)
CREATE TABLE product_variants (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    product_id CHAR(36) NOT NULL,
    sku VARCHAR(100) UNIQUE NOT NULL,
    title VARCHAR(255),
    price DECIMAL(10, 2),
    compare_price DECIMAL(10, 2),
    cost_price DECIMAL(10, 2),
    weight DECIMAL(8, 3),
    stock_quantity INT DEFAULT 0,
    option1_name VARCHAR(50),
    option1_value VARCHAR(100),
    option2_name VARCHAR(50),
    option2_value VARCHAR(100),
    option3_name VARCHAR(50),
    option3_value VARCHAR(100),
    image_url TEXT,
    position INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    INDEX idx_variants_product (product_id),
    INDEX idx_variants_sku (sku),
    INDEX idx_variants_active (is_active),
    INDEX idx_variants_options (option1_value, option2_value, option3_value)
);

-- Shopping cart functionality
CREATE TABLE carts (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id CHAR(36),
    session_id VARCHAR(255),
    currency_code CHAR(3) DEFAULT 'USD',
    subtotal DECIMAL(10, 2) DEFAULT 0.00,
    tax_amount DECIMAL(10, 2) DEFAULT 0.00,
    shipping_amount DECIMAL(10, 2) DEFAULT 0.00,
    discount_amount DECIMAL(10, 2) DEFAULT 0.00,
    total_amount DECIMAL(10, 2) DEFAULT 0.00,
    discount_code VARCHAR(50),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    expires_at TIMESTAMP DEFAULT (CURRENT_TIMESTAMP + INTERVAL 30 DAY),
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_carts_user (user_id),
    INDEX idx_carts_session (session_id),
    INDEX idx_carts_expires (expires_at)
);

CREATE TABLE cart_items (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    cart_id CHAR(36) NOT NULL,
    product_id CHAR(36) NOT NULL,
    variant_id CHAR(36),
    quantity INT NOT NULL DEFAULT 1,
    unit_price DECIMAL(10, 2) NOT NULL,
    total_price DECIMAL(10, 2) GENERATED ALWAYS AS (quantity * unit_price) STORED,
    properties JSON, -- Custom properties like engraving text
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (cart_id) REFERENCES carts(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (variant_id) REFERENCES product_variants(id) ON DELETE CASCADE,
    
    UNIQUE KEY unique_cart_item (cart_id, product_id, variant_id),
    INDEX idx_cart_items_cart (cart_id),
    INDEX idx_cart_items_product (product_id)
);

-- Orders and order management
CREATE TABLE orders (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    order_number VARCHAR(50) UNIQUE NOT NULL,
    user_id CHAR(36),
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    status ENUM('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded') DEFAULT 'pending',
    payment_status ENUM('pending', 'paid', 'partially_paid', 'refunded', 'failed') DEFAULT 'pending',
    fulfillment_status ENUM('unfulfilled', 'partial', 'fulfilled') DEFAULT 'unfulfilled',
    
    -- Pricing
    currency_code CHAR(3) DEFAULT 'USD',
    subtotal DECIMAL(10, 2) NOT NULL,
    tax_amount DECIMAL(10, 2) DEFAULT 0.00,
    shipping_amount DECIMAL(10, 2) DEFAULT 0.00,
    discount_amount DECIMAL(10, 2) DEFAULT 0.00,
    total_amount DECIMAL(10, 2) NOT NULL,
    
    -- Addresses
    billing_address JSON,
    shipping_address JSON,
    
    -- Shipping
    shipping_method VARCHAR(100),
    tracking_number VARCHAR(100),
    tracking_url TEXT,
    
    -- Metadata
    notes TEXT,
    internal_notes TEXT,
    tags JSON,
    source VARCHAR(50) DEFAULT 'web',
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    confirmed_at TIMESTAMP NULL,
    shipped_at TIMESTAMP NULL,
    delivered_at TIMESTAMP NULL,
    cancelled_at TIMESTAMP NULL,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_orders_user (user_id),
    INDEX idx_orders_status (status),
    INDEX idx_orders_payment_status (payment_status),
    INDEX idx_orders_created (created_at),
    INDEX idx_orders_number (order_number)
);

-- Complex analytical queries
-- 1. Monthly sales report with growth comparison
SELECT 
    DATE_FORMAT(created_at, '%Y-%m') as month,
    COUNT(*) as total_orders,
    SUM(total_amount) as total_revenue,
    AVG(total_amount) as avg_order_value,
    COUNT(DISTINCT user_id) as unique_customers,
    
    -- Calculate month-over-month growth
    LAG(SUM(total_amount)) OVER (ORDER BY DATE_FORMAT(created_at, '%Y-%m')) as prev_month_revenue,
    ROUND(
        ((SUM(total_amount) - LAG(SUM(total_amount)) OVER (ORDER BY DATE_FORMAT(created_at, '%Y-%m'))) 
         / LAG(SUM(total_amount)) OVER (ORDER BY DATE_FORMAT(created_at, '%Y-%m'))) * 100, 2
    ) as revenue_growth_percent
    
FROM orders 
WHERE status NOT IN ('cancelled', 'refunded')
    AND created_at >= DATE_SUB(CURRENT_DATE, INTERVAL 12 MONTH)
GROUP BY DATE_FORMAT(created_at, '%Y-%m')
ORDER BY month DESC;

-- 2. Customer lifetime value and segmentation
WITH customer_metrics AS (
    SELECT 
        u.id,
        u.email,
        u.first_name,
        u.last_name,
        u.created_at as registration_date,
        COUNT(o.id) as total_orders,
        SUM(o.total_amount) as lifetime_value,
        AVG(o.total_amount) as avg_order_value,
        MIN(o.created_at) as first_order_date,
        MAX(o.created_at) as last_order_date,
        DATEDIFF(MAX(o.created_at), MIN(o.created_at)) as customer_lifespan_days,
        
        -- Recency, Frequency, Monetary calculations
        DATEDIFF(CURRENT_DATE, MAX(o.created_at)) as days_since_last_order,
        COUNT(o.id) as frequency_score,
        SUM(o.total_amount) as monetary_score
        
    FROM users u
    LEFT JOIN orders o ON u.id = o.user_id AND o.status NOT IN ('cancelled', 'refunded')
    WHERE u.deleted_at IS NULL
    GROUP BY u.id, u.email, u.first_name, u.last_name, u.created_at
),
rfm_scores AS (
    SELECT *,
        -- RFM Scoring (1-5 scale)
        CASE 
            WHEN days_since_last_order <= 30 THEN 5
            WHEN days_since_last_order <= 60 THEN 4
            WHEN days_since_last_order <= 90 THEN 3
            WHEN days_since_last_order <= 180 THEN 2
            ELSE 1
        END as recency_score,
        
        CASE 
            WHEN frequency_score >= 10 THEN 5
            WHEN frequency_score >= 5 THEN 4
            WHEN frequency_score >= 3 THEN 3
            WHEN frequency_score >= 2 THEN 2
            ELSE 1
        END as frequency_score_normalized,
        
        CASE 
            WHEN monetary_score >= 1000 THEN 5
            WHEN monetary_score >= 500 THEN 4
            WHEN monetary_score >= 200 THEN 3
            WHEN monetary_score >= 50 THEN 2
            ELSE 1
        END as monetary_score_normalized
        
    FROM customer_metrics
    WHERE total_orders > 0
)
SELECT 
    id,
    email,
    CONCAT(first_name, ' ', last_name) as full_name,
    total_orders,
    ROUND(lifetime_value, 2) as lifetime_value,
    ROUND(avg_order_value, 2) as avg_order_value,
    days_since_last_order,
    recency_score,
    frequency_score_normalized as frequency_score,
    monetary_score_normalized as monetary_score,
    
    -- Customer segmentation based on RFM
    CASE 
        WHEN recency_score >= 4 AND frequency_score_normalized >= 4 AND monetary_score_normalized >= 4 THEN 'Champions'
        WHEN recency_score >= 3 AND frequency_score_normalized >= 3 AND monetary_score_normalized >= 3 THEN 'Loyal Customers'
        WHEN recency_score >= 4 AND frequency_score_normalized <= 2 THEN 'New Customers'
        WHEN recency_score >= 3 AND frequency_score_normalized >= 3 AND monetary_score_normalized <= 2 THEN 'Potential Loyalists'
        WHEN recency_score <= 2 AND frequency_score_normalized >= 3 AND monetary_score_normalized >= 3 THEN 'At Risk'
        WHEN recency_score <= 2 AND frequency_score_normalized <= 2 AND monetary_score_normalized >= 3 THEN 'Cannot Lose Them'
        WHEN recency_score <= 2 AND frequency_score_normalized <= 2 AND monetary_score_normalized <= 2 THEN 'Hibernating'
        ELSE 'Others'
    END as customer_segment
    
FROM rfm_scores
ORDER BY lifetime_value DESC;

-- 3. Product performance analysis with inventory insights
SELECT 
    p.id,
    p.name,
    p.sku,
    c.name as category_name,
    p.price,
    p.stock_quantity,
    p.low_stock_threshold,
    
    -- Sales metrics
    COUNT(oi.id) as units_sold,
    SUM(oi.total_price) as total_revenue,
    AVG(oi.unit_price) as avg_selling_price,
    
    -- Performance indicators
    CASE 
        WHEN p.stock_quantity <= p.low_stock_threshold THEN 'Low Stock'
        WHEN p.stock_quantity = 0 THEN 'Out of Stock'
        ELSE 'In Stock'
    END as stock_status,
    
    -- Sales velocity (units per day)
    ROUND(COUNT(oi.id) / GREATEST(DATEDIFF(CURRENT_DATE, MIN(o.created_at)), 1), 2) as sales_velocity,
    
    -- Profit margins
    CASE 
        WHEN p.cost_price > 0 THEN ROUND(((p.price - p.cost_price) / p.price) * 100, 2)
        ELSE NULL
    END as profit_margin_percent
    
FROM products p
LEFT JOIN categories c ON p.category_id = c.id
LEFT JOIN cart_items ci ON p.id = ci.product_id
LEFT JOIN carts cart ON ci.cart_id = cart.id
LEFT JOIN orders o ON cart.user_id = o.user_id 
LEFT JOIN order_items oi ON p.id = oi.product_id
WHERE p.status = 'active'
    AND (o.created_at IS NULL OR o.created_at >= DATE_SUB(CURRENT_DATE, INTERVAL 90 DAY))
    AND (o.status IS NULL OR o.status NOT IN ('cancelled', 'refunded'))
GROUP BY p.id, p.name, p.sku, c.name, p.price, p.stock_quantity, p.low_stock_threshold, p.cost_price
HAVING units_sold > 0 OR p.stock_quantity <= p.low_stock_threshold
ORDER BY total_revenue DESC, sales_velocity DESC;`,
  ],
} as const;

export type CodeLanguage = keyof typeof TYPING_CODE_SNIPPETS;

export function getRandomCodeSnippet(lang: CodeLanguage): string {
  const list = TYPING_CODE_SNIPPETS[lang];
  return list[Math.floor(Math.random() * list.length)];
}

/**
 * Token types for syntax highlighting (character-level).
 */
export type TokenType = "keyword" | "string" | "comment" | "number" | "operator" | "function" | "punctuation" | "property" | "default";

interface Token {
  type: TokenType;
  start: number;
  end: number;
  value: string;
}

const JS_KEYWORDS = new Set([
  "const", "let", "var", "function", "return", "if", "else", "for", "while",
  "class", "extends", "constructor", "async", "await", "new", "this", "true", "false",
  "null", "undefined", "in", "of", "try", "catch", "finally", "import", "export", "default",
]);

function tokenizeJavaScript(code: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  const n = code.length;

  while (i < n) {
    const start = i;
    const c = code[i];

    // Single-line comment
    if (c === "/" && code[i + 1] === "/") {
      let end = i + 2;
      while (end < n && code[end] !== "\n") end++;
      tokens.push({ type: "comment", start: i, end, value: code.slice(i, end) });
      i = end;
      continue;
    }

    // Multi-line comment
    if (c === "/" && code[i + 1] === "*") {
      let end = i + 2;
      while (end < n - 1 && (code[end] !== "*" || code[end + 1] !== "/")) end++;
      end += 2;
      tokens.push({ type: "comment", start: i, end, value: code.slice(i, end) });
      i = end;
      continue;
    }

    // String double
    if (c === '"') {
      let end = i + 1;
      while (end < n) {
        if (code[end] === "\\") end += 2;
        else if (code[end] === '"') { end++; break; }
        else end++;
      }
      tokens.push({ type: "string", start: i, end, value: code.slice(i, end) });
      i = end;
      continue;
    }

    // String single
    if (c === "`" || c === "'") {
      const quote = c;
      let end = i + 1;
      while (end < n) {
        if (code[end] === "\\") end += 2;
        else if (code[end] === quote) { end++; break; }
        else end++;
      }
      tokens.push({ type: "string", start: i, end, value: code.slice(i, end) });
      i = end;
      continue;
    }

    // Number
    if (/\d/.test(c)) {
      let end = i;
      while (end < n && /[\d.]/.test(code[end])) end++;
      tokens.push({ type: "number", start: i, end, value: code.slice(i, end) });
      i = end;
      continue;
    }

    // Identifier or keyword
    if (/[a-zA-Z_$]/.test(c)) {
      let end = i;
      while (end < n && /[a-zA-Z0-9_$]/.test(code[end])) end++;
      const value = code.slice(i, end);
      const type = JS_KEYWORDS.has(value) ? "keyword" : value === "function" ? "keyword" : "default";
      tokens.push({ type, start: i, end, value });
      i = end;
      continue;
    }

    // Operator / punctuation
    if (/[+\-*/%=<>!&|.,;:?{}()[\]\\]/.test(c)) {
      tokens.push({ type: "operator", start: i, end: i + 1, value: c });
      i++;
      continue;
    }

    // Newline, space, etc.
    tokens.push({ type: "default", start: i, end: i + 1, value: code[i] });
    i++;
  }

  return tokens;
}

function tokenizeHtml(code: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  const n = code.length;

  while (i < n) {
    const start = i;
    const c = code[i];

    if (c === "<") {
      let end = i + 1;
      if (code[end] === "/") end++;
      while (end < n && /[a-zA-Z0-9-]/.test(code[end])) end++;
      tokens.push({ type: "keyword", start: i, end, value: code.slice(i, end) });
      i = end;
      continue;
    }
    if (c === '"' || c === "'") {
      const quote = c;
      let end = i + 1;
      while (end < n && code[end] !== quote) end++;
      end++;
      tokens.push({ type: "string", start: i, end, value: code.slice(i, end) });
      i = end;
      continue;
    }
    tokens.push({ type: "default", start: i, end: i + 1, value: code[i] });
    i++;
  }
  return tokens;
}

export function getTokenTypeAt(code: string, index: number, lang: CodeLanguage): TokenType {
  const tokens =
    lang === "html" ? tokenizeHtml(code) : tokenizeJavaScript(code);
  for (const t of tokens) {
    if (index >= t.start && index < t.end) return t.type;
  }
  return "default";
}

/**
 * Get CSS class for each character index (for syntax highlight).
 * HTML uses tokenizeHtml; javascript, typescript, python, sql use tokenizeJavaScript.
 */
export function getSyntaxClasses(code: string, lang: CodeLanguage): string[] {
  const tokens =
    lang === "html" ? tokenizeHtml(code) : tokenizeJavaScript(code);
  const classes: string[] = new Array(code.length).fill("ty-syntax-default");
  for (const t of tokens) {
    const cls = `ty-syntax-${t.type}`;
    for (let i = t.start; i < t.end; i++) classes[i] = cls;
  }
  return classes;
}
