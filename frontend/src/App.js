import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import './App.css';

const API_BASE_URL = process.env.REACT_APP_BACKEND_URL;

const translations = {
  ru: {
    title: 'Gyat Panel',
    login: 'Вход',
    register: 'Регистрация',
    username: 'Логин',
    password: 'Пароль',
    loginBtn: 'Войти',
    registerBtn: 'Зарегистрироваться',
    logout: 'Выйти',
    adminPanel: 'Админ панель',
    supportPanel: 'Панель поддержки',
    language: 'Язык',
    uploadAccounts: 'Загрузить аккаунты',
    takeAccounts: 'Забрать',
    deleteAccounts: 'Удалить',
    setTime: 'Установить время',
    moveAccounts: 'Переместить',
    selectAccounts: 'Выделить',
    selectAll: 'Выделить все',
    loginCol: 'Логин',
    geoCol: 'Гео',
    timeCol: 'Время',
    folders: 'Папки',
    createFolder: 'Создать папку',
    deleteFolder: 'Удалить папку',
    main: 'Main',
    users: 'Пользователи',
    pendingUsers: 'Заявки',
    approve: 'Одобрить',
    reject: 'Отклонить',
    block: 'Заблокировать',
    unblock: 'Разблокировать',
    status: 'Статус',
    balance: 'Баланс',
    user: 'User',
    superUser: 'Super User',
    vipUser: 'VIP User',
    support: 'Support',
    admin: 'Admin',
    save: 'Сохранить',
    cancel: 'Отмена',
    back: 'Назад',
    deleteUser: 'Удалить пользователя',
    userCount: 'Обычные пользователи',
    superUserCount: 'Супер пользователи',
    vipUserCount: 'VIP пользователи',
    supportCount: 'Поддержка',
    // New features
    welcome: 'Многофункциональная TikTok панель',
    selectFunction: 'Выберите функцию',
    accountChecker: 'Чекер отлеги аккаунтов',
    accountCheckerDesc: 'Статус отлеги с дополнительными функциями',
    accountValidator: 'Менеджер аккаунтов',
    accountValidatorDesc: 'Массовая проверка валидности аккаунтов и их текущего состояния',
    videoUpload: 'Загрузка видео',
    videoUploadDesc: 'Быстрая и безопасная загрузка видеоконтента на платформу',
    shop: 'Шоп',
    shopDesc: 'Покупка и продажа аккаунтов и прочего',
    inDevelopment: 'В разработке',
    upgradeLevel: 'Повысьте уровень',
    // Shop translations
    shopTitle: 'Магазин',
    categories: 'Категории',
    products: 'Товары',
    accounts: 'Аккаунты',
    other: 'Другое',
    createCategory: 'Создать категорию',
    createProduct: 'Создать товар',
    addProduct: 'Добавить товар',
    productTitle: 'Название',
    description: 'Описание',
    price: 'Цена',
    platform: 'Платформа',
    web: 'Web',
    mobile: 'Mobile',
    geo: 'Гео',
    domain: 'Домен',
    content: 'Содержимое',
    isUnique: 'Уникальный товар',
    quantity: 'Количество',
    purchase: 'Купить',
    myPurchases: 'Мои покупки',
    ageFilter: 'Фильтр по отлеге',
    hours: 'часов',
    available: 'Доступно',
    sold: 'Продано',
    total: 'Всего',
    purchaseSuccess: 'Покупка успешна!',
    insufficientBalance: 'Недостаточно средств',
    sortBy: 'Сортировать по',
    statistics: 'Статистика',
    dailyStats: 'Статистика за день',
    totalSales: 'Всего продаж',
    totalRevenue: 'Общий доход',
    purchaseHistory: 'История покупок',
    buyer: 'Покупатель',
    product: 'Товар',
    amount: 'Сумма',
    time: 'Время',
    noSalesToday: 'Сегодня продаж не было',
    // Settings translations
    settings: 'Настройки',
    settingsDesc: 'Управление настройками аккаунта',
    currentPassword: 'Текущий пароль',
    newPassword: 'Новый пароль',
    changePassword: 'Изменить пароль',
    updateSettings: 'Обновить настройки',
    settingsUpdated: 'Настройки обновлены',
    passwordChanged: 'Пароль изменен',
    incorrectPassword: 'Неверный пароль',
    // Product management translations
    editProduct: 'Редактировать товар',
    deleteProduct: 'Удалить товар',
    productDeleted: 'Товар удален',
    productUpdated: 'Товар обновлен',
    confirmDelete: 'Вы уверены, что хотите удалить этот товар?',
    deleteCategory: 'Удалить категорию',
    categoryDeleted: 'Категория удалена',
    confirmDeleteCategory: 'Вы уверены, что хотите удалить эту категорию?',
    loading: 'Загрузка...',
    welcome: 'Многофункциональная TikTok панель',
    welcomeMessage: 'Привет, {username}! Рады видеть вас в панели.'
  },
  en: {
    title: 'Gyat Panel',
    login: 'Login',
    register: 'Register',
    username: 'Username',
    password: 'Password',
    loginBtn: 'Sign In',
    registerBtn: 'Sign Up',
    logout: 'Logout',
    adminPanel: 'Admin Panel',
    supportPanel: 'Support Panel',
    language: 'Language',
    uploadAccounts: 'Upload Accounts',
    takeAccounts: 'Take',
    deleteAccounts: 'Delete',
    setTime: 'Set Time',
    moveAccounts: 'Move',
    selectAccounts: 'Select',
    selectAll: 'Select All',
    loginCol: 'Login',
    geoCol: 'Geo',
    timeCol: 'Time',
    folders: 'Folders',
    createFolder: 'Create Folder',
    deleteFolder: 'Delete Folder',
    main: 'Main',
    users: 'Users',
    pendingUsers: 'Pending',
    approve: 'Approve',
    reject: 'Reject',
    block: 'Block',
    unblock: 'Unblock',
    status: 'Status',
    balance: 'Balance',
    user: 'User',
    superUser: 'Super User',
    vipUser: 'VIP User',
    support: 'Support',
    admin: 'Admin',
    save: 'Save',
    cancel: 'Cancel',
    back: 'Back',
    deleteUser: 'Delete User',
    userCount: 'Regular Users',
    superUserCount: 'Super Users',
    vipUserCount: 'VIP Users',
    supportCount: 'Support',
    // New features
    welcome: 'Multifunctional TikTok Panel',
    selectFunction: 'Select function',
    accountChecker: 'Account Delay Checker',
    accountCheckerDesc: 'Delay status with additional features',
    accountValidator: 'Account Manager',
    accountValidatorDesc: 'Bulk validation of accounts and their current state',
    videoUpload: 'Video Upload',
    videoUploadDesc: 'Fast and secure video content upload to the platform',
    shop: 'Shop',
    shopDesc: 'Purchase and sell accounts and more',
    inDevelopment: 'In Development',
    upgradeLevel: 'Upgrade Level',
    // Shop translations
    shopTitle: 'Shop',
    categories: 'Categories',
    products: 'Products',
    accounts: 'Accounts',
    other: 'Other',
    createCategory: 'Create Category',
    createProduct: 'Create Product',
    addProduct: 'Add Product',
    productTitle: 'Title',
    description: 'Description',
    price: 'Price',
    platform: 'Platform',
    web: 'Web',
    mobile: 'Mobile',
    geo: 'Geo',
    domain: 'Domain',
    content: 'Content',
    isUnique: 'Unique Product',
    quantity: 'Quantity',
    purchase: 'Purchase',
    myPurchases: 'My Purchases',
    ageFilter: 'Age Filter',
    hours: 'hours',
    available: 'Available',
    sold: 'Sold',
    total: 'Total',
    purchaseSuccess: 'Purchase successful!',
    insufficientBalance: 'Insufficient balance',
    sortBy: 'Sort by',
    statistics: 'Statistics',
    dailyStats: 'Daily Statistics',
    totalSales: 'Total Sales',
    totalRevenue: 'Total Revenue',
    purchaseHistory: 'Purchase History',
    buyer: 'Buyer',
    product: 'Product',
    amount: 'Amount',
    time: 'Time',
    noSalesToday: 'No sales today',
    // Settings translations
    settings: 'Settings',
    settingsDesc: 'Account settings management',
    currentPassword: 'Current Password',
    newPassword: 'New Password',
    changePassword: 'Change Password',
    updateSettings: 'Update Settings',
    settingsUpdated: 'Settings updated',
    passwordChanged: 'Password changed',
    incorrectPassword: 'Incorrect password',
    // Product management translations
    editProduct: 'Edit Product',
    deleteProduct: 'Delete Product',
    productDeleted: 'Product deleted',
    productUpdated: 'Product updated',
    confirmDelete: 'Are you sure you want to delete this product?',
    deleteCategory: 'Delete Category',
    categoryDeleted: 'Category deleted',
    confirmDeleteCategory: 'Are you sure you want to delete this category?',
    loading: 'Loading...',
    welcome: 'Multifunctional TikTok panel',
    welcomeMessage: 'Hello, {username}! We are glad to see you in the panel.'
  }
};

const App = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showLogin, setShowLogin] = useState(true);
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [registrationMessage, setRegistrationMessage] = useState('');
  const [registrationError, setRegistrationError] = useState('');
  const [showWelcomeMessage, setShowWelcomeMessage] = useState(false);
  const [accounts, setAccounts] = useState([]);
  const [folders, setFolders] = useState([]);
  const [currentFolder, setCurrentFolder] = useState(null);
  const [selectedAccounts, setSelectedAccounts] = useState([]);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [showAccountManager, setShowAccountManager] = useState(false);
  const [showShop, setShowShop] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showSettingsPage, setShowSettingsPage] = useState(false);
  const [showStatistics, setShowStatistics] = useState(false);
  const [statisticsData, setStatisticsData] = useState(null);
  const [language, setLanguage] = useState('ru');

  // Sorting states for account table
  const [sortBy, setSortBy] = useState('');
  const [sortOrder, setSortOrder] = useState('asc');

  // Shop states
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showCreateCategory, setShowCreateCategory] = useState(false);
  const [showCreateProduct, setShowCreateProduct] = useState(false);
  const [showEditProduct, setShowEditProduct] = useState(false);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [purchaseQuantity, setPurchaseQuantity] = useState(1);
  const [minAgeHours, setMinAgeHours] = useState(1);

  // NEW: Statistics states
  const [showStatisticsModal, setShowStatisticsModal] = useState(false);
  const [statistics, setStatistics] = useState(null);

  // Role upgrade states
  const [showRoleUpgradeModal, setShowRoleUpgradeModal] = useState(false);
  const [roleInfo, setRoleInfo] = useState(null);
  const [selectedUpgradeRole, setSelectedUpgradeRole] = useState('');

  // Admin user edit states
  const [showAdminEditModal, setShowAdminEditModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [adminEditForm, setAdminEditForm] = useState({
    balance_amount: '',
    role: '',
    role_days: 30
  });

  // Modal states
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showTimeModal, setShowTimeModal] = useState(false);
  const [showMoveModal, setShowMoveModal] = useState(false);
  const [showSelectModal, setShowSelectModal] = useState(false);
  const [showFolderModal, setShowFolderModal] = useState(false);

  const [uploadText, setUploadText] = useState('');
  const [timeHours, setTimeHours] = useState(1);
  const [folderName, setFolderName] = useState('');

  // Shop form states
  const [categoryForm, setCategoryForm] = useState({ name: '', description: '' });
  const [productForm, setProductForm] = useState({
    title: '',
    description: '',
    price: 0,
    category_id: '',
    product_type: 'accounts',
    platform: 'web',
    geo: '',
    domain: '', // NEW: domain field
    content: '',
    is_unique: true
  });

  // Settings form state
  const [settingsForm, setSettingsForm] = useState({
    current_password: '',
    new_password: '',
    language: 'ru'
  });

  // Admin states
  const [allUsers, setAllUsers] = useState([]);
  const [pendingUsers, setPendingUsers] = useState([]);
  const [rolesStats, setRolesStats] = useState({
    User: 0,
    'Super User': 0,
    'VIP User': 0,
    Support: 0
  });

  const t = translations[language];

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (user && showAccountManager) {
      fetchFolders();
    }
  }, [user, showAccountManager]);

  useEffect(() => {
    if (currentFolder && showAccountManager) {
      fetchAccounts();
    }
  }, [currentFolder, showAccountManager]);

  useEffect(() => {
    if (user && showShop) {
      fetchCategories();
      fetchProducts();
    }
  }, [user, showShop, selectedCategory]);

  const checkAuth = async () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUser(response.data);
        setLanguage(response.data.language || 'ru');
      } catch (error) {
        localStorage.removeItem('token');
      }
    }
    setLoading(false);
  };

  // NEW: Fetch statistics
  const fetchStatistics = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/api/admin/shop-statistics`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStatistics(response.data);
      setShowStatisticsModal(true);
    } catch (error) {
      console.error('Error fetching statistics:', error);
      alert('Ошибка загрузки статистики');
    }
  };

  const fetchFolders = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/api/folders`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFolders(response.data.folders);
      // Set Main folder as default
      const mainFolder = response.data.folders.find(f => f.name === 'Main');
      if (mainFolder && !currentFolder) {
        setCurrentFolder(mainFolder);
      }
    } catch (error) {
      console.error('Error fetching folders:', error);
    }
  };

  const fetchAccounts = async () => {
    if (!currentFolder) return;

    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/api/accounts?folder_id=${currentFolder.folder_id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAccounts(response.data.accounts);
    } catch (error) {
      console.error('Error fetching accounts:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/api/shop/categories`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCategories(response.data.categories);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem('token');
      const params = selectedCategory ? `?category_id=${selectedCategory.category_id}` : '';
      const response = await axios.get(`${API_BASE_URL}/api/shop/products${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProducts(response.data.products);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  // Sorting function for accounts
  const sortAccounts = (accounts, sortBy, sortOrder) => {
    if (!sortBy) return accounts;
    
    const sorted = [...accounts].sort((a, b) => {
      let aVal, bVal;
      
      if (sortBy === 'geo') {
        aVal = a.geo || '';
        bVal = b.geo || '';
      } else if (sortBy === 'time') {
        aVal = new Date(a.uploaded_at);
        bVal = new Date(b.uploaded_at);
      }
      
      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
    
    return sorted;
  };

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    // Clear registration messages when logging in
    setRegistrationMessage('');
    setRegistrationError('');
    
    try {
      const response = await axios.post(`${API_BASE_URL}/api/login`, formData);
      localStorage.setItem('token', response.data.access_token);
      setUser(response.data.user);
      setLanguage(response.data.user.language || 'ru');
      setFormData({ username: '', password: '' });
      
      // Show welcome message
      setShowWelcomeMessage(true);
      // Auto-hide welcome message after 5 seconds
      setTimeout(() => setShowWelcomeMessage(false), 5000);
    } catch (error) {
      alert(error.response?.data?.detail || 'Login failed');
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    // Clear previous messages
    setRegistrationMessage('');
    setRegistrationError('');
    
    try {
      await axios.post(`${API_BASE_URL}/api/register`, formData);
      setRegistrationMessage('Регистрация успешна! Ожидайте подтверждения администратора.');
      setFormData({ username: '', password: '' });
      // Don't switch to login immediately, let user see the message
    } catch (error) {
      setRegistrationError(error.response?.data?.detail || 'Ошибка регистрации');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setShowAdminPanel(false);
    setShowAccountManager(false);
    setShowShop(false);
    setShowSettings(false);
    setAccounts([]);
    setFolders([]);
    setCurrentFolder(null);
    setSelectedAccounts([]);
    setRolesStats({ User: 0, 'Super User': 0, 'VIP User': 0, Support: 0 });
  };

  const handleLanguageChange = async (newLang) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_BASE_URL}/api/user/language`,
        { language: newLang },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setLanguage(newLang);
    } catch (error) {
      console.error('Error changing language:', error);
    }
  };

  // Feature access control
  const canAccessFeature = (feature) => {
    if (!user) return false;

    switch (feature) {
      case 'accountChecker':
        return true; // Available to all users
      case 'accountValidator':
        return ['Super User', 'VIP User', 'Support', 'Admin'].includes(user.status);
      case 'videoUpload':
        return ['VIP User', 'Support', 'Admin'].includes(user.status);
      case 'shop':
        return true; // Available to all users
      case 'settings':
        return true; // Available to all users
      default:
        return false;
    }
  };

  const handleFeatureClick = (feature) => {
    if (!canAccessFeature(feature)) {
      return;
    }

    switch (feature) {
      case 'accountChecker':
        setShowAccountManager(true);
        break;
      case 'accountValidator':
        // TODO: Implement account validator
        alert('Функция чекера аккаунтов в разработке');
        break;
      case 'videoUpload':
        // TODO: Implement video upload
        alert('Функция загрузки видео в разработке');
        break;
      case 'shop':
        setShowShop(true);
        break;
      case 'settings':
        setShowSettingsPage(true);
        setSettingsForm({
          current_password: '',
          new_password: '',
          language: user.language || 'ru'
        });
        break;
      default:
        break;
    }
  };

  // Shop functions
  const handleCreateCategory = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_BASE_URL}/api/shop/categories`, categoryForm, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCategoryForm({ name: '', description: '' });
      setShowCreateCategory(false);
      fetchCategories();
    } catch (error) {
      alert('Error creating category');
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    if (!window.confirm(t.confirmDeleteCategory)) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await axios.delete(`${API_BASE_URL}/api/shop/categories/${categoryId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      fetchCategories();
      fetchProducts(); // Refresh products list as well
      
      if (selectedCategory?.category_id === categoryId) {
        setSelectedCategory(null);
      }
      
      // Show success message with info about deleted products
      const deletedProducts = response.data.deleted_products || 0;
      if (deletedProducts > 0) {
        alert(`Категория удалена успешно. Также удалено ${deletedProducts} товаров из этой категории.`);
      } else {
        alert(t.categoryDeleted);
      }
    } catch (error) {
      alert(error.response?.data?.detail || 'Error deleting category');
    }
  };

  const fetchAdminStatistics = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/api/admin/statistics`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStatisticsData(response.data);
    } catch (error) {
      alert('Error fetching statistics');
      console.error(error);
    }
  };

  const handleCreateProduct = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_BASE_URL}/api/shop/products`, productForm, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProductForm({
        title: '',
        description: '',
        price: 0,
        category_id: '',
        product_type: 'accounts',
        platform: 'web',
        geo: '',
        domain: '', // Reset domain field
        content: '',
        is_unique: true
      });
      setShowCreateProduct(false);
      fetchProducts();
    } catch (error) {
      alert('Error creating product');
    }
  };

  const handleEditProduct = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_BASE_URL}/api/shop/products/${selectedProduct.product_id}`, productForm, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setShowEditProduct(false);
      fetchProducts();
      alert(t.productUpdated);
    } catch (error) {
      alert('Error updating product');
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm(t.confirmDelete)) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_BASE_URL}/api/shop/products/${productId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchProducts();
      alert(t.productDeleted);
    } catch (error) {
      alert('Error deleting product');
    }
  };

  const handleLoadProductForEdit = async (product) => {
    setSelectedProduct(product);
    setProductForm({
      title: product.title,
      description: product.description,
      price: product.price,
      category_id: product.category_id,
      product_type: product.product_type,
      platform: product.platform || 'web',
      geo: product.geo || '',
      domain: product.domain || '',
      content: product.content,
      is_unique: product.is_unique
    });
    setShowEditProduct(true);
  };

  // Function to get role-specific icon/avatar
  const getRoleIcon = (status) => {
    switch (status) {
      case 'Admin':
        return '👑'; // Crown for Admin
      case 'Support':
        return '🛠️'; // Tools for Support
      case 'VIP User':
        return '💎'; // Diamond for VIP User
      case 'Super User':
        return '⭐'; // Star for Super User
      case 'User':
      default:
        return '👤'; // Person for regular User
    }
  };

  const handleUpdateSettings = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${API_BASE_URL}/api/user/settings`, settingsForm, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Update user state with new info
      setUser(response.data.user);
      setLanguage(response.data.user.language);
      
      // Reset form
      setSettingsForm({
        current_password: '',
        new_password: '',
        language: response.data.user.language || 'ru'
      });
      
      setShowSettingsPage(false);
      alert(t.settingsUpdated);
    } catch (error) {
      alert(error.response?.data?.detail || 'Error updating settings');
    }
  };

  // Role upgrade functions
  const fetchRoleInfo = async () => {
    try {
      console.log('Fetching role info...');
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/api/user/role-info`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('Role info response:', response.data);
      setRoleInfo(response.data);
    } catch (error) {
      console.error('Error fetching role info:', error);
    }
  };



  const openRoleUpgradeModal = async () => {
    console.log('Opening role upgrade modal...');
    try {
      await fetchRoleInfo();
      console.log('Role info fetched, opening modal...');
      setShowRoleUpgradeModal(true);
    } catch (error) {
      console.error('Error opening role upgrade modal:', error);
    }
  };

  // Admin user edit functions
  const openAdminEditModal = (targetUser) => {
    setEditingUser(targetUser);
    setAdminEditForm({
      balance_amount: '',
      role: targetUser.status,
      role_days: 30
    });
    setShowAdminEditModal(true);
  };

  const handleAdminUserEdit = async (action) => {
    if (!editingUser) return;

    try {
      const token = localStorage.getItem('token');
      let requestData = {
        user_id: editingUser.user_id,
        action: action
      };

      if (action === 'add_balance') {
        if (!adminEditForm.balance_amount || parseFloat(adminEditForm.balance_amount) <= 0) {
          alert('Введите корректную сумму для пополнения');
          return;
        }
        requestData.value = parseFloat(adminEditForm.balance_amount);
      } else if (action === 'set_balance') {
        if (!adminEditForm.balance_amount || parseFloat(adminEditForm.balance_amount) < 0) {
          alert('Введите корректное значение баланса');
          return;
        }
        requestData.value = parseFloat(adminEditForm.balance_amount);
      } else if (action === 'set_role') {
        if (!adminEditForm.role) {
          alert('Выберите роль');
          return;
        }
        requestData.value = adminEditForm.role;
        // For temporary roles, send days parameter
        if (['Super User', 'VIP User'].includes(adminEditForm.role)) {
          requestData.days = adminEditForm.role_days;
        }
      }

      const response = await axios.post(`${API_BASE_URL}/api/admin/user-edit`, requestData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Refresh admin data
      fetchAdminData();
      
      setShowAdminEditModal(false);
      setEditingUser(null);
      alert('Пользователь успешно обновлен!');
    } catch (error) {
      const errorMessage = error.response?.data?.detail || 'Ошибка при редактировании пользователя';
      if (errorMessage.includes('VIP user limit reached')) {
        alert('❌ Достигнут лимит VIP-пользователей (максимум 20 VIP-пользователей)');
      } else {
        alert(errorMessage);
      }
    }
  };

  const handleRoleUpgrade = async () => {
    if (!selectedUpgradeRole || !roleInfo) return;

    try {
      const token = localStorage.getItem('token');
      const upgradeData = {
        target_role: selectedUpgradeRole
      };

      const response = await axios.post(`${API_BASE_URL}/api/user/upgrade-role`, upgradeData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Update user data with new role and balance
      setUser(prev => ({
        ...prev,
        status: response.data.new_role,
        balance: response.data.new_balance
      }));

      // Close modal and reset state
      setShowRoleUpgradeModal(false);
      setSelectedUpgradeRole('');
      setRoleInfo(null);

      alert(`Роль успешно обновлена до ${response.data.new_role}! Осталось дней: ${response.data.remaining_days}`);
    } catch (error) {
      const errorMessage = error.response?.data?.detail || 'Ошибка при покупке роли';
      if (errorMessage.includes('VIP user limit reached')) {
        alert('❌ Достигнут лимит VIP-пользователей (максимум 20 VIP-пользователей)');
      } else {
        alert(errorMessage);
      }
    }
  };

  const handlePurchase = async () => {
    try {
      const token = localStorage.getItem('token');
      const purchaseData = {
        product_id: selectedProduct.product_id,
        quantity: purchaseQuantity,
        min_age_hours: selectedProduct.product_type === 'accounts' ? minAgeHours : undefined
      };

      const response = await axios.post(`${API_BASE_URL}/api/shop/purchase`, purchaseData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Download the purchased content
      const blob = new Blob([response.data.content], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = response.data.filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      // Update user balance
      setUser(prev => ({ ...prev, balance: response.data.new_balance }));
      setShowPurchaseModal(false);
      fetchProducts();
      alert(t.purchaseSuccess);
    } catch (error) {
      alert(error.response?.data?.detail || 'Purchase failed');
    }
  };

  // Account Manager Functions (existing functions remain the same)
  const handleUploadAccounts = async () => {
    if (!uploadText.trim()) return;

    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_BASE_URL}/api/accounts`,
        {
          accounts_text: uploadText,
          folder_id: currentFolder.folder_id
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUploadText('');
      setShowUploadModal(false);
      fetchAccounts();
      alert('Accounts uploaded successfully!');
    } catch (error) {
      alert('Error uploading accounts');
    }
  };

  const handleTakeAccounts = async () => {
    if (selectedAccounts.length === 0) {
      alert('No accounts selected');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${API_BASE_URL}/api/accounts/download`,
        { account_ids: selectedAccounts },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Download file
      const blob = new Blob([response.data.content], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = response.data.filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      setSelectedAccounts([]);
    } catch (error) {
      alert('Error downloading accounts');
    }
  };

  const handleDeleteAccounts = async () => {
    if (selectedAccounts.length === 0) {
      alert('No accounts selected');
      return;
    }

    if (!window.confirm('Are you sure you want to delete selected accounts?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_BASE_URL}/api/accounts/delete`,
        { account_ids: selectedAccounts },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSelectedAccounts([]);
      fetchAccounts();
    } catch (error) {
      alert('Error deleting accounts');
    }
  };

  const handleSetTime = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_BASE_URL}/api/folders/${currentFolder.folder_id}/cooldown`,
        { hours: timeHours },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setShowTimeModal(false);
      fetchFolders();
      fetchAccounts();
    } catch (error) {
      alert('Error setting time');
    }
  };

  const handleMoveAccounts = async (targetFolderId) => {
    if (selectedAccounts.length === 0) return;

    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_BASE_URL}/api/accounts/move`,
        {
          account_ids: selectedAccounts,
          folder_id: targetFolderId
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSelectedAccounts([]);
      setShowMoveModal(false);
      fetchAccounts();
    } catch (error) {
      alert('Error moving accounts');
    }
  };

  const handleSelectAccounts = async (criteria, value = null) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${API_BASE_URL}/api/accounts/select`,
        {
          criteria,
          value,
          folder_id: currentFolder.folder_id
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSelectedAccounts(response.data.account_ids);
      setShowSelectModal(false);
    } catch (error) {
      alert('Error selecting accounts');
    }
  };

  const handleCreateFolder = async () => {
    if (!folderName.trim()) return;

    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_BASE_URL}/api/folders`,
        { name: folderName },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setFolderName('');
      setShowFolderModal(false);
      fetchFolders();
    } catch (error) {
      alert('Error creating folder');
    }
  };

  const handleDeleteFolder = async (folderId) => {
    if (!window.confirm('Are you sure? Accounts will be moved to Main folder.')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_BASE_URL}/api/folders/${folderId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchFolders();

      // If current folder was deleted, switch to Main
      if (currentFolder && currentFolder.folder_id === folderId) {
        const mainFolder = folders.find(f => f.name === 'Main');
        setCurrentFolder(mainFolder);
      }
    } catch (error) {
      alert('Error deleting folder');
    }
  };

  // Admin functions
  const fetchAdminData = async () => {
    try {
      const token = localStorage.getItem('token');
      const [usersResponse, pendingResponse] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/admin/users`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${API_BASE_URL}/api/admin/pending-users`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      setAllUsers(usersResponse.data.users);
      setPendingUsers(pendingResponse.data.users);

      // Calculate roles statistics
      const stats = usersResponse.data.users.reduce((acc, user) => {
        acc[user.status] = (acc[user.status] || 0) + 1;
        return acc;
      }, { User: 0, 'Super User': 0, 'VIP User': 0, Support: 0 });
      setRolesStats(stats);
    } catch (error) {
      console.error('Error fetching admin data:', error);
    }
  };

  const handleAdminAction = async (userId, action, value = null) => {
    console.log('Admin Action:', { userId, action, value, currentUser: user });
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_BASE_URL}/api/admin/user-action`,
        { user_id: userId, action, value },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchAdminData();
    } catch (error) {
      console.error('Admin Action Error:', error.response?.data?.detail || error.message);
      alert(error.response?.data?.detail || 'Error performing action');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm(t.deleteUser + '?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_BASE_URL}/api/admin/users/delete`,
        { user_id: userId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchAdminData();
    } catch (error) {
      console.error('Delete User Error:', error.response?.data?.detail || error.message);
      alert(error.response?.data?.detail || 'Error deleting user');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center glass-bg">
        <div className="glass-card p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen glass-bg flex items-center justify-center">
        <div className="glass-card p-10 w-full max-w-lg login-form-container">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-4xl font-black text-white tracking-wider">
              {t.title}
              <div className="text-sm font-normal text-red-400 mt-1">Premium Access Panel</div>
            </h1>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="glass-input text-sm p-3"
            >
              <option value="ru">🇷🇺 RU</option>
              <option value="en">🇬🇧 EN</option>
            </select>
          </div>

          <div className="flex mb-8 glass-tabs">
            <button
              className={`flex-1 p-4 text-lg font-bold ${showLogin ? 'active' : ''}`}
              onClick={() => {
                setShowLogin(true);
                setRegistrationMessage('');
                setRegistrationError('');
              }}
            >
              {t.login}
            </button>
            <button
              className={`flex-1 p-4 text-lg font-bold ${!showLogin ? 'active' : ''}`}
              onClick={() => {
                setShowLogin(false);
                setRegistrationMessage('');
                setRegistrationError('');
              }}
            >
              {t.register}
            </button>
          </div>

          <form onSubmit={showLogin ? handleLogin : handleRegister} className="space-y-8">
            <div className="space-y-3">
              <label className="text-white font-semibold text-sm tracking-wide">
                {t.username}
              </label>
              <input
                type="text"
                placeholder="Enter your username..."
                className="glass-input w-full p-4 text-lg"
                value={formData.username}
                onChange={(e) => setFormData({...formData, username: e.target.value})}
                required
              />
            </div>
            <div className="space-y-3">
              <label className="text-white font-semibold text-sm tracking-wide">
                {t.password}
              </label>
              <input
                type="password"
                placeholder="Enter your password..."
                className="glass-input w-full p-4 text-lg"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                required
                minLength="6"
              />
            </div>
            <button type="submit" className="glass-button w-full p-4 text-lg font-black tracking-wider mt-4">
              {showLogin ? t.loginBtn : t.registerBtn}
            </button>
          </form>
          
          {/* Registration Messages */}
          {!showLogin && registrationMessage && (
            <div className="mt-4 p-4 bg-green-900 bg-opacity-30 border border-green-500 rounded-lg">
              <div className="flex items-center gap-2">
                <span className="text-green-400 text-xl">✅</span>
                <p className="text-green-300 font-semibold">{registrationMessage}</p>
              </div>
            </div>
          )}
          
          {!showLogin && registrationError && (
            <div className="mt-4 p-4 bg-red-900 bg-opacity-30 border border-red-500 rounded-lg">
              <div className="flex items-center gap-2">
                <span className="text-red-400 text-xl">❌</span>
                <p className="text-red-300 font-semibold">{registrationError}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Shop View
  if (showShop) {
    return (
      <div className="min-h-screen glass-bg">
        {/* UPDATED Header with modern design */}
        <div className="glass-header p-6">
          <div className="container mx-auto flex justify-between items-center">
            <div className="flex items-center gap-4">
              <h1 className="text-4xl font-black text-white tracking-wider">
                <span className="shop-icon">🛒</span> {t.shopTitle}
                <div className="text-sm font-normal text-red-400">Premium Store</div>
              </h1>
            </div>

            <div className="flex items-center gap-8">
              <div className="text-white text-right">
                <p className="text-2xl font-black tracking-wide">{user.username}</p>
                <div className="flex gap-4 text-sm mt-1">
                  <span className={`px-3 py-2 rounded-full font-bold text-xs tracking-wider flex items-center gap-2 ${
                    user.status === 'Admin' ? 'status-admin' :
                    user.status === 'Support' ? 'status-support' :
                    user.status === 'VIP User' ? 'status-vip' :
                    user.status === 'Super User' ? 'status-super' :
                    'status-user'
                  }`}>
                    <span className="text-lg">{getRoleIcon(user.status)}</span>
                    {user.status}
                  </span>
                  <span className="text-yellow-400 font-black text-lg">${user.balance.toFixed(2)}</span>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  className="glass-button glass-button-secondary px-6 py-3 font-bold"
                  onClick={() => setShowShop(false)}
                >
                  {t.back}
                </button>

                <button
                  className="glass-button glass-button-danger px-6 py-3 font-bold"
                  onClick={handleLogout}
                >
                  {t.logout}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto p-8">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* Categories Sidebar */}
            <div className="lg:col-span-1">
              <div className="glass-card p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-bold text-white tracking-wide">
                    <span className="folder-icon">📂</span> {t.categories}
                  </h3>
                  {user.status === 'Admin' && (
                    <button
                      className="glass-button glass-button-success px-4 py-2 text-xl font-bold"
                      onClick={() => setShowCreateCategory(true)}
                      title="Create Category"
                    >
                      +
                    </button>
                  )}
                </div>

                <div className="space-y-4">
                  <div
                    className={`category-item ${!selectedCategory ? 'active' : ''}`}
                    onClick={() => setSelectedCategory(null)}
                  >
                    <span className="text-white font-semibold">📦 Все товары</span>
                  </div>

                  {categories.map(category => (
                    <div
                      key={category.category_id}
                      className={`category-item ${
                        selectedCategory?.category_id === category.category_id ? 'active' : ''
                      }`}
                    >
                      <div
                        className="flex-1 cursor-pointer"
                        onClick={() => setSelectedCategory(category)}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-white font-semibold">📁 {category.name}</span>
                          {user.status === 'Admin' && (
                            <button
                              className="glass-button glass-button-danger ml-2 px-2 py-1 text-sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteCategory(category.category_id);
                              }}
                              title={t.deleteCategory}
                            >
                              🗑️
                            </button>
                          )}
                        </div>
                        {category.description && (
                          <p className="text-gray-300 text-sm mt-1">{category.description}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Products */}
            <div className="lg:col-span-4">
              {user.status === 'Admin' && (
                <div className="glass-card p-6 mb-8">
                  <div className="flex justify-between items-center">
                    <h3 className="text-xl font-bold text-white">Admin Controls</h3>
                    <div className="flex gap-4">
                      {/* NEW: Statistics Button */}
                      <button
                        className="glass-button glass-button-secondary px-4 py-2"
                        onClick={fetchStatistics}
                      >
                        <span className="stats-icon">📊</span> {t.statistics}
                      </button>
                      <button
                        className="glass-button glass-button-primary px-4 py-2"
                        onClick={() => setShowCreateProduct(true)}
                      >
                        <span className="add-icon">➕</span> {t.addProduct}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                {products.map(product => (
                  <div key={product.product_id} className="glass-card p-6 product-card flex flex-col">
                    <div className="flex justify-between items-start mb-4 flex-shrink-0">
                      <h4 className="text-xl font-bold text-white">{product.title}</h4>
                      <span className={`product-type-badge ${
                        product.product_type === 'accounts' ? 'accounts' : 'other'
                      }`}>
                        {product.product_type === 'accounts' ? '👥 ' + t.accounts : '📄 ' + t.other}
                      </span>
                    </div>

                    <p className="text-gray-300 mb-4">{product.description}</p>

                    {product.product_type === 'accounts' && (
                      <div className="mb-4 space-y-2 account-details">
                        {product.platform && (
                          <div className="detail-item">
                            <span className="detail-label">🌐 {t.platform}:</span>
                            <span className="detail-value">{product.platform.toUpperCase()}</span>
                          </div>
                        )}
                        {product.geo && (
                          <div className="detail-item">
                            <span className="detail-label">🌍 {t.geo}:</span>
                            <span className="detail-value">{product.geo}</span>
                          </div>
                        )}
                        {/* NEW: Domain field display */}
                        {product.domain && (
                          <div className="detail-item">
                            <span className="detail-label">🌐 {t.domain}:</span>
                            <span className="detail-value">{product.domain}</span>
                          </div>
                        )}
                        
                        {product.age_stats && (
                          <div className="mt-3">
                            <p className="text-gray-400 text-sm mb-2">Отлежка аккаунтов:</p>
                            <div className="age-stats-grid">
                              <div className="age-stat-item">
                                <div className="stat-value">{product.age_stats['0h']}</div>
                                <div className="stat-label">0+ ч</div>
                              </div>
                              <div className="age-stat-item">
                                <div className="stat-value">{product.age_stats['1h']}</div>
                                <div className="stat-label">1+ ч</div>
                              </div>
                              <div className="age-stat-item">
                                <div className="stat-value">{product.age_stats['4h']}</div>
                                <div className="stat-label">4+ ч</div>
                              </div>
                              <div className="age-stat-item">
                                <div className="stat-value">{product.age_stats['12h']}</div>
                                <div className="stat-label">12+ ч</div>
                              </div>
                              <div className="age-stat-item">
                                <div className="stat-value">{product.age_stats['24h']}</div>
                                <div className="stat-label">24+ ч</div>
                              </div>
                              <div className="age-stat-item">
                                <div className="stat-value">{product.age_stats['36h']}</div>
                                <div className="stat-label">36+ ч</div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="product-footer">
                      <div>
                        <div className="product-price">${product.price}</div>
                        <div className="product-stats">
                          {t.available}: {product.available_quantity} | {t.sold}: {product.sold_quantity}
                        </div>
                      </div>

                      <div className="flex gap-2">
                        {user.status === 'Admin' && (
                          <>
                            <button
                              className="glass-button glass-button-secondary"
                              onClick={() => handleLoadProductForEdit(product)}
                              title={t.editProduct}
                            >
                              ✏️
                            </button>
                            <button
                              className="glass-button glass-button-danger"
                              onClick={() => handleDeleteProduct(product.product_id)}
                              title={t.deleteProduct}
                            >
                              🗑️
                            </button>
                          </>
                        )}
                        <button
                          className="glass-button glass-button-primary"
                          onClick={() => {
                            setSelectedProduct(product);
                            setPurchaseQuantity(1);
                            setMinAgeHours(1);
                            setShowPurchaseModal(true);
                          }}
                          disabled={product.available_quantity === 0}
                        >
                           {t.purchase}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                
                {products.length === 0 && (
                  <div className="col-span-full text-center text-gray-400 py-12">
                    Товары не найдены
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* NEW: Statistics Modal */}
        {showStatisticsModal && statistics && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 modal-overlay">
            <div className="glass-card p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <h3 className="text-2xl font-bold text-white mb-6 text-center">
                📊 {t.dailyStats} - {statistics.date}
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="stats-card sales">
                  <h4 className="stats-title">{t.totalSales}</h4>
                  <p className="stats-value">{statistics.total_sales}</p>
                </div>
                <div className="stats-card revenue">
                  <h4 className="stats-title">{t.totalRevenue}</h4>
                  <p className="stats-value">${statistics.total_revenue}</p>
                </div>
              </div>

              <div className="mb-6">
                <h4 className="text-xl font-bold text-white mb-4">{t.purchaseHistory}</h4>
                {statistics.purchases.length > 0 ? (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {statistics.purchases.map((purchase, index) => (
                      <div key={index} className="purchase-item">
                        <div className="purchase-info">
                          <span className="purchase-buyer">{purchase.username}</span>
                          <span className="purchase-product">{purchase.product_title}</span>
                          <span className="purchase-quantity">x{purchase.quantity}</span>
                        </div>
                        <div className="purchase-details">
                          <span className="purchase-amount">${purchase.total_cost}</span>
                          <span className="purchase-time">{purchase.purchased_at}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-gray-400 py-8">
                    {t.noSalesToday}
                  </div>
                )}
              </div>

              <div className="flex justify-center">
                <button
                  className="glass-button glass-button-secondary px-6 py-2"
                  onClick={() => setShowStatisticsModal(false)}
                >
                  {t.cancel}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Purchase Modal (unchanged) */}
        {showPurchaseModal && selectedProduct && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="glass-card p-6 w-full max-w-md">
              <h3 className="text-xl font-bold text-white mb-4">Покупка: {selectedProduct.title}</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-white mb-2">{t.quantity}:</label>
                  <input
                    type="number"
                    min="1"
                    max={selectedProduct.available_quantity}
                    className="glass-input w-full p-3"
                    value={purchaseQuantity}
                    onChange={(e) => setPurchaseQuantity(parseInt(e.target.value) || 1)}
                  />
                </div>

                {selectedProduct.product_type === 'accounts' && (
                  <div>
                    <label className="block text-white mb-2">{t.ageFilter}:</label>
                    <select
                      className="glass-input w-full p-3"
                      value={minAgeHours}
                      onChange={(e) => setMinAgeHours(parseInt(e.target.value))}
                    >
                      <option value={0}>0+ {t.hours}</option>
                      <option value={1}>1+ {t.hours}</option>
                      <option value={4}>4+ {t.hours}</option>
                      <option value={12}>12+ {t.hours}</option>
                      <option value={24}>24+ {t.hours}</option>
                      <option value={36}>36+ {t.hours}</option>
                    </select>
                  </div>
                )}

                <div className="purchase-summary">
                  <div className="flex justify-between text-lg">
                    <span className="text-white">{t.total}:</span>
                    <span className="text-yellow-400 font-bold">
                      ${(selectedProduct.price * purchaseQuantity).toFixed(2)}
                    </span>
                  </div>
                  <div className="text-sm text-gray-400 mt-1">
                    {t.balance}: ${user.balance.toFixed(2)}
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  className="glass-button glass-button-secondary px-4 py-2"
                  onClick={() => setShowPurchaseModal(false)}
                >
                  {t.cancel}
                </button>
                <button
                  className="glass-button glass-button-primary px-4 py-2"
                  onClick={handlePurchase}
                  disabled={selectedProduct.price * purchaseQuantity > user.balance}
                >
                   {t.purchase}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Create Category Modal (unchanged) */}
        {showCreateCategory && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="glass-card p-6 w-full max-w-md">
              <h3 className="text-xl font-bold text-white mb-4">{t.createCategory}</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-white mb-2">Название:</label>
                  <input
                    type="text"
                    className="glass-input w-full p-3"
                    value={categoryForm.name}
                    onChange={(e) => setCategoryForm({...categoryForm, name: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-white mb-2">{t.description}:</label>
                  <textarea
                    className="glass-input w-full p-3 h-24 resize-none"
                    value={categoryForm.description}
                    onChange={(e) => setCategoryForm({...categoryForm, description: e.target.value})}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  className="glass-button glass-button-secondary px-4 py-2"
                  onClick={() => {
                    setShowCreateCategory(false);
                    setCategoryForm({ name: '', description: '' });
                  }}
                >
                  {t.cancel}
                </button>
                <button
                  className="glass-button glass-button-primary px-4 py-2"
                  onClick={handleCreateCategory}
                >
                  {t.save}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Product Modal */}
        {showEditProduct && selectedProduct && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center p-4 pt-32 z-50">
            <div className="glass-card p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <h3 className="text-xl font-bold text-white mb-4">✏️ {t.editProduct}</h3>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white mb-2">{t.productTitle}:</label>
                    <input
                      type="text"
                      className="glass-input w-full p-3"
                      value={productForm.title}
                      onChange={(e) => setProductForm({...productForm, title: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-white mb-2">{t.price}:</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      className="glass-input w-full p-3"
                      value={productForm.price}
                      onChange={(e) => setProductForm({...productForm, price: parseFloat(e.target.value) || 0})}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white mb-2">Категория:</label>
                    <select
                      className="glass-input w-full p-3"
                      value={productForm.category_id}
                      onChange={(e) => setProductForm({...productForm, category_id: e.target.value})}
                    >
                      <option value="">Выберите категорию</option>
                      {categories.map(cat => (
                        <option key={cat.category_id} value={cat.category_id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-white mb-2">Тип товара:</label>
                    <select
                      className="glass-input w-full p-3"
                      value={productForm.product_type}
                      onChange={(e) => setProductForm({...productForm, product_type: e.target.value})}
                    >
                      <option value="accounts">{t.accounts}</option>
                      <option value="other">{t.other}</option>
                    </select>
                  </div>
                </div>

                {productForm.product_type === 'accounts' && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-white mb-2">{t.platform}:</label>
                      <select
                        className="glass-input w-full p-3"
                        value={productForm.platform}
                        onChange={(e) => setProductForm({...productForm, platform: e.target.value})}
                      >
                        <option value="web">{t.web}</option>
                        <option value="mobile">{t.mobile}</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-white mb-2">{t.geo}:</label>
                      <input
                        type="text"
                        className="glass-input w-full p-3"
                        placeholder="RU, US, EU..."
                        value={productForm.geo}
                        onChange={(e) => setProductForm({...productForm, geo: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-white mb-2">{t.domain}:</label>
                      <input
                        type="text"
                        className="glass-input w-full p-3"
                        placeholder="example.com"
                        value={productForm.domain}
                        onChange={(e) => setProductForm({...productForm, domain: e.target.value})}
                      />
                    </div>
                  </div>
                )}

                {productForm.product_type === 'other' && (
                  <div>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={productForm.is_unique}
                        onChange={(e) => setProductForm({...productForm, is_unique: e.target.checked})}
                      />
                      <span className="text-white">{t.isUnique}</span>
                    </label>
                  </div>
                )}

                <div>
                  <label className="block text-white mb-2">{t.description}:</label>
                  <textarea
                    className="glass-input w-full p-3 h-20 resize-none"
                    value={productForm.description}
                    onChange={(e) => setProductForm({...productForm, description: e.target.value})}
                  />
                </div>

                <div>
                  <label className="block text-white mb-2">{t.content}:</label>
                  <textarea
                    className="glass-input w-full p-3 h-40 resize-none"
                    placeholder={productForm.product_type === 'accounts' 
                      ? "Каждая новая строка = один аккаунт (любой формат)" 
                      : "Текстовое содержимое товара"}
                    value={productForm.content}
                    onChange={(e) => setProductForm({...productForm, content: e.target.value})}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  className="glass-button glass-button-secondary px-4 py-2"
                  onClick={() => setShowEditProduct(false)}
                >
                  {t.cancel}
                </button>
                <button
                  className="glass-button glass-button-primary px-4 py-2"
                  onClick={handleEditProduct}
                >
                  {t.save}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* UPDATED Create Product Modal with Domain field */}
        {showCreateProduct && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center p-4 pt-32 z-50">
            <div className="glass-card p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <h3 className="text-xl font-bold text-white mb-4">{t.createProduct}</h3>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white mb-2">{t.productTitle}:</label>
                    <input
                      type="text"
                      className="glass-input w-full p-3"
                      value={productForm.title}
                      onChange={(e) => setProductForm({...productForm, title: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-white mb-2">{t.price}:</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      className="glass-input w-full p-3"
                      value={productForm.price}
                      onChange={(e) => setProductForm({...productForm, price: parseFloat(e.target.value) || 0})}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white mb-2">Категория:</label>
                    <select
                      className="glass-input w-full p-3"
                      value={productForm.category_id}
                      onChange={(e) => setProductForm({...productForm, category_id: e.target.value})}
                    >
                      <option value="">Выберите категорию</option>
                      {categories.map(cat => (
                        <option key={cat.category_id} value={cat.category_id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-white mb-2">Тип товара:</label>
                    <select
                      className="glass-input w-full p-3"
                      value={productForm.product_type}
                      onChange={(e) => setProductForm({...productForm, product_type: e.target.value})}
                    >
                      <option value="accounts">{t.accounts}</option>
                      <option value="other">{t.other}</option>
                    </select>
                  </div>
                </div>

                {productForm.product_type === 'accounts' && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-white mb-2">{t.platform}:</label>
                      <select
                        className="glass-input w-full p-3"
                        value={productForm.platform}
                        onChange={(e) => setProductForm({...productForm, platform: e.target.value})}
                      >
                        <option value="web">{t.web}</option>
                        <option value="mobile">{t.mobile}</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-white mb-2">{t.geo}:</label>
                      <input
                        type="text"
                        className="glass-input w-full p-3"
                        placeholder="RU, US, EU..."
                        value={productForm.geo}
                        onChange={(e) => setProductForm({...productForm, geo: e.target.value})}
                      />
                    </div>
                    {/* NEW: Domain field */}
                    <div>
                      <label className="block text-white mb-2">{t.domain}:</label>
                      <input
                        type="text"
                        className="glass-input w-full p-3"
                        placeholder="example.com"
                        value={productForm.domain}
                        onChange={(e) => setProductForm({...productForm, domain: e.target.value})}
                      />
                    </div>
                  </div>
                )}

                {productForm.product_type === 'other' && (
                  <div>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={productForm.is_unique}
                        onChange={(e) => setProductForm({...productForm, is_unique: e.target.checked})}
                      />
                      <span className="text-white">{t.isUnique}</span>
                    </label>
                  </div>
                )}

                <div>
                  <label className="block text-white mb-2">{t.description}:</label>
                  <textarea
                    className="glass-input w-full p-3 h-20 resize-none"
                    value={productForm.description}
                    onChange={(e) => setProductForm({...productForm, description: e.target.value})}
                  />
                </div>

                <div>
                  <label className="block text-white mb-2">{t.content}:</label>
                  <textarea
                    className="glass-input w-full p-3 h-40 resize-none"
                    placeholder={productForm.product_type === 'accounts' 
                      ? "Каждая новая строка = один аккаунт (любой формат)" 
                      : "Текстовое содержимое товара"}
                    value={productForm.content}
                    onChange={(e) => setProductForm({...productForm, content: e.target.value})}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  className="glass-button glass-button-secondary px-4 py-2"
                  onClick={() => {
                    setShowCreateProduct(false);
                    setProductForm({
                      title: '',
                      description: '',
                      price: 0,
                      category_id: '',
                      product_type: 'accounts',
                      platform: 'web',
                      geo: '',
                      domain: '',
                      content: '',
                      is_unique: true
                    });
                  }}
                >
                  {t.cancel}
                </button>
                <button
                  className="glass-button glass-button-primary px-4 py-2"
                  onClick={handleCreateProduct}
                >
                  {t.save}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Settings Page
  if (showSettingsPage) {
    return (
      <div className="min-h-screen glass-bg">
        <div className="container mx-auto p-4">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-white">⚙️ {t.settings}</h1>
            <div className="flex gap-4">
              <select
                value={language}
                onChange={(e) => handleLanguageChange(e.target.value)}
                className="glass-input p-2"
              >
                <option value="ru">🇷🇺 RU</option>
                <option value="en">🇺🇸 EN</option>
              </select>
              <button
                className="glass-button glass-button-secondary px-4 py-2"
                onClick={() => setShowSettingsPage(false)}
              >
                {t.back}
              </button>
            </div>
          </div>

          <div className="glass-card p-6 max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-white mb-6">{t.settings}</h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-white mb-2 font-semibold">{t.currentPassword}:</label>
                <input
                  type="password"
                  className="glass-input w-full p-3"
                  value={settingsForm.current_password}
                  onChange={(e) => setSettingsForm({...settingsForm, current_password: e.target.value})}
                  placeholder="Введите текущий пароль"
                  required
                />
              </div>

              <div>
                <label className="block text-white mb-2 font-semibold">{t.newPassword}:</label>
                <input
                  type="password"
                  className="glass-input w-full p-3"
                  value={settingsForm.new_password}
                  onChange={(e) => setSettingsForm({...settingsForm, new_password: e.target.value})}
                  placeholder="Оставьте пустым, если не хотите менять"
                />
              </div>

              <div>
                <label className="block text-white mb-2 font-semibold">{t.language}:</label>
                <select
                  className="glass-input w-full p-3"
                  value={settingsForm.language}
                  onChange={(e) => setSettingsForm({...settingsForm, language: e.target.value})}
                >
                  <option value="ru">🇷🇺 Русский</option>
                  <option value="en">🇬🇧 English</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-6">
                <button
                  className="glass-button glass-button-secondary px-6 py-3"
                  onClick={() => setShowSettingsPage(false)}
                >
                  {t.cancel}
                </button>
                <button
                  className="glass-button glass-button-primary px-6 py-3"
                  onClick={handleUpdateSettings}
                >
                  {t.updateSettings}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Feature Dashboard (Main page with feature blocks)
  if (!showAccountManager && !showAdminPanel && !showShop && !showSettingsPage) {
    return (
      <div className="min-h-screen glass-bg">
        {/* UPDATED Header */}
        <div className="glass-header p-6">
          <div className="container mx-auto flex justify-between items-center">
            <div className="flex items-center gap-4">
              <h1 className="text-4xl font-black text-white tracking-wider">
                {t.title}
                <div className="text-sm font-normal text-red-400">Premium Management Panel</div>
              </h1>
            </div>

            <div className="flex items-center gap-8">
              <div className="text-white text-right">
                <p className="text-2xl font-black tracking-wide">{user.username}</p>
                <div className="flex gap-4 text-sm mt-1">
                  <span className={`px-3 py-2 rounded-full font-bold text-xs tracking-wider flex items-center gap-2 ${
                    user.status === 'Admin' ? 'status-admin' :
                    user.status === 'Support' ? 'status-support' :
                    user.status === 'VIP User' ? 'status-vip' :
                    user.status === 'Super User' ? 'status-super' :
                    'status-user'
                  }`}>
                    <span className="text-lg">{getRoleIcon(user.status)}</span>
                    {user.status}
                  </span>
                  <span className="text-yellow-400 font-black text-lg">${user.balance.toFixed(2)}</span>
                  {['User', 'Super User', 'VIP User'].includes(user.status) && (
                    <button
                      className="glass-button glass-button-primary px-3 py-1 text-xs font-bold"
                      onClick={openRoleUpgradeModal}
                    >
                      Уровень
                    </button>
                  )}
                </div>
              </div>

              <div className="flex gap-3">
                <select
                  value={language}
                  onChange={(e) => handleLanguageChange(e.target.value)}
                  className="glass-input p-3 text-sm"
                >
                  <option value="ru">🇷🇺 RU</option>
                  <option value="en">🇺🇸 EN</option>
                </select>



                {(user.status === 'Admin' || user.status === 'Support') && (
                  <button
                    className="glass-button glass-button-primary px-6 py-3 font-bold"
                    onClick={() => {
                      setShowAdminPanel(true);
                      fetchAdminData();
                    }}
                  >
                     {user.status === 'Admin' ? t.adminPanel : t.supportPanel}
                  </button>
                )}

                <button
                  className="glass-button glass-button-danger px-6 py-3 font-bold"
                  onClick={handleLogout}
                >
                  {t.logout}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Hero Section */}
        <div className="hero-section">
          <h2 className="hero-title">{t.welcome}</h2>
        </div>

        {/* Features Grid */}
        <div className="features-grid">
          {/* Account Checker - Available to all */}
          <div
            className="feature-card enabled"
            onClick={() => handleFeatureClick('accountChecker')}
          >
            <div className="feature-icon">
              🕐
            </div>
            <h3 className="feature-title">{t.accountChecker}</h3>
            <p className="feature-description">{t.accountCheckerDesc}</p>
          </div>

          {/* Shop - Now available to all */}
          <div
            className="feature-card enabled"
            onClick={() => handleFeatureClick('shop')}
          >
            <div className="feature-icon">
              🛒
            </div>
            <h3 className="feature-title">{t.shop}</h3>
            <p className="feature-description">{t.shopDesc}</p>
          </div>

          {/* Account Validator - Restricted for User role */}
          <div
            className={`feature-card ${canAccessFeature('accountValidator') ? 'enabled' : 'restricted'}`}
            onClick={() => canAccessFeature('accountValidator') && handleFeatureClick('accountValidator')}
          >
            <div className={`feature-icon ${canAccessFeature('accountValidator') ? '' : 'disabled'}`}>
              📋
            </div>
            <h3 className="feature-title">{t.accountValidator}</h3>
            <p className="feature-description">{t.accountValidatorDesc}</p>
            {!canAccessFeature('accountValidator') && (
              <div className="feature-status">{t.upgradeLevel}</div>
            )}
          </div>

          {/* Video Upload - VIP+ only, in development */}
          <div
            className={`feature-card ${canAccessFeature('videoUpload') ? 'disabled' : 'restricted'}`}
          >
            <div className={`feature-icon ${canAccessFeature('videoUpload') ? 'disabled' : 'disabled'}`}>
              📹
            </div>
            <h3 className="feature-title">{t.videoUpload}</h3>
            <p className="feature-description">{t.videoUploadDesc}</p>
            <div className="feature-status">
              {canAccessFeature('videoUpload') ? t.inDevelopment : t.upgradeLevel}
            </div>
          </div>

          {/* Settings - Available to all */}
          <div
            className="feature-card enabled"
            onClick={() => handleFeatureClick('settings')}
          >
            <div className="feature-icon">
              ⚙️
            </div>
            <h3 className="feature-title">{t.settings}</h3>
            <p className="feature-description">{t.settingsDesc}</p>
          </div>
        </div>

        {/* Role Upgrade Modal - Only on Feature Dashboard */}
        {showRoleUpgradeModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[9999]">
            <div className="glass-card p-6 w-full max-w-md">
              <h3 className="text-xl font-bold text-white mb-4">🚀 Повышение уровня</h3>
              
              {roleInfo && (
                <div className="space-y-4">
                  <div className="text-white">
                    <p className="mb-2"><strong>Текущая роль:</strong> {getRoleIcon(roleInfo.current_role)} {roleInfo.current_role}</p>
                    {roleInfo.remaining_days !== null && (
                      <p className="mb-2 text-yellow-400">
                        <strong>Осталось дней:</strong> {roleInfo.remaining_days}
                      </p>
                    )}
                    <p className="mb-4"><strong>Баланс:</strong> <span className="text-yellow-400">${roleInfo.balance.toFixed(2)}</span></p>
                  </div>

                  {roleInfo.available_upgrades.length > 0 ? (
                    <div>
                      <label className="block text-white mb-2 font-semibold">Выберите роль:</label>
                      <select
                        className="glass-input w-full p-3 mb-4"
                        value={selectedUpgradeRole}
                        onChange={(e) => setSelectedUpgradeRole(e.target.value)}
                      >
                        <option value="">Выберите роль для покупки</option>
                        {roleInfo.available_upgrades.map(role => (
                          <option key={role} value={role}>
                            {getRoleIcon(role)} {role} - ${roleInfo.prices[role]}
                          </option>
                        ))}
                      </select>

                      {selectedUpgradeRole && (
                        <div className="bg-blue-900 bg-opacity-30 p-4 rounded-lg mb-4">
                          <h4 className="text-white font-bold mb-2">Детали покупки:</h4>
                          <p className="text-white">• Роль: {getRoleIcon(selectedUpgradeRole)} {selectedUpgradeRole}</p>
                          <p className="text-white">• Цена: <span className="text-yellow-400">${roleInfo.prices[selectedUpgradeRole]}</span></p>
                          <p className="text-white">• Длительность: +30 дней</p>
                          {roleInfo.current_role === selectedUpgradeRole && roleInfo.remaining_days > 0 && (
                            <p className="text-green-400">• Время будет добавлено к текущему: {roleInfo.remaining_days + 30} дней всего</p>
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center text-gray-400">
                      <p>Нет доступных обновлений для вашей роли</p>
                    </div>
                  )}
                </div>
              )}

              <div className="flex justify-end gap-3 mt-6">
                <button
                  className="glass-button glass-button-secondary px-4 py-2"
                  onClick={() => {
                    setShowRoleUpgradeModal(false);
                    setSelectedUpgradeRole('');
                  }}
                >
                  Отмена
                </button>
                {roleInfo && roleInfo.available_upgrades.length > 0 && selectedUpgradeRole && (
                  <button
                    className="glass-button glass-button-primary px-4 py-2"
                    onClick={handleRoleUpgrade}
                    disabled={!selectedUpgradeRole || roleInfo.balance < roleInfo.prices[selectedUpgradeRole]}
                  >
                    {roleInfo.balance < roleInfo.prices[selectedUpgradeRole] 
                      ? 'Недостаточно средств' 
                      : `Купить за $${roleInfo.prices[selectedUpgradeRole]}`
                    }
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Welcome Message - Bottom Right Corner */}
        {showWelcomeMessage && (
          <div className="fixed bottom-6 right-6 z-50">
            <div className="glass-card p-4 max-w-sm animate-slide-in-right">
              <div className="flex items-center gap-3">
                <span className="text-2xl">👋</span>
                <div>
                  <h4 className="text-white font-bold text-sm">{t.welcome}</h4>
                  <p className="text-gray-300 text-xs">
                    {t.welcomeMessage.replace('{username}', user.username)}
                  </p>
                </div>
                <button
                  className="text-gray-400 hover:text-white ml-2"
                  onClick={() => setShowWelcomeMessage(false)}
                >
                  ✕
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Rest of the existing code for admin panel and account manager...
  if (showAdminPanel) {
    return (
      <div className="min-h-screen glass-bg">
        <div className="container mx-auto p-4">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-white">
              {user.status === 'Admin' ? t.adminPanel : t.supportPanel}
            </h1>
            <div className="flex gap-4">
              <select
                value={language}
                onChange={(e) => handleLanguageChange(e.target.value)}
                className="glass-input p-2"
              >
                <option value="ru">RU</option>
                <option value="en">EN</option>
              </select>
              <button
                className="glass-button glass-button-primary px-4 py-2"
                onClick={() => {
                  setShowStatistics(true);
                  fetchAdminStatistics();
                }}
              >
                📊 Статистика
              </button>
              <button
                className="glass-button glass-button-secondary px-4 py-2"
                onClick={() => {
                  setShowAdminPanel(false);
                  fetchAdminData();
                }}
              >
                {t.back}
              </button>
            </div>
          </div>

          {/* Roles Statistics */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="glass-card p-6 text-center">
              <h3 className="text-lg font-bold text-white">{t.userCount}</h3>
              <p className="text-3xl text-red-400 font-bold">{rolesStats.User}</p>
            </div>
            <div className="glass-card p-6 text-center">
              <h3 className="text-lg font-bold text-white">{t.superUserCount}</h3>
              <p className="text-3xl text-red-400 font-bold">{rolesStats['Super User']}</p>
            </div>
            <div className="glass-card p-6 text-center">
              <h3 className="text-lg font-bold text-white">{t.vipUserCount}</h3>
              <p className="text-3xl text-red-400 font-bold">{rolesStats['VIP User']}</p>
            </div>
            <div className="glass-card p-6 text-center">
              <h3 className="text-lg font-bold text-white">{t.supportCount}</h3>
              <p className="text-3xl text-red-400 font-bold">{rolesStats.Support}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Pending Users */}
            <div className="glass-card p-6">
              <h2 className="text-2xl font-bold text-white mb-6">{t.pendingUsers}</h2>
              <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                {pendingUsers.map(user => (
                  <div key={user.user_id} className="glass-card p-4 hover:bg-gray-700">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-white font-medium text-lg">{user.username}</p>
                        <p className="text-gray-400 text-sm">{new Date(user.created_at).toLocaleString()}</p>
                      </div>
                      <div className="flex gap-3">
                        <button
                          className="glass-button glass-button-success px-4 py-2 text-sm"
                          onClick={() => handleAdminAction(user.user_id, 'approve')}
                        >
                          {t.approve}
                        </button>
                        <button
                          className="glass-button glass-button-danger px-4 py-2 text-sm"
                          onClick={() => handleAdminAction(user.user_id, 'reject')}
                        >
                          {t.reject}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                {pendingUsers.length === 0 && (
                  <p className="text-gray-400 text-center py-8">No pending users</p>
                )}
              </div>
            </div>

            {/* All Users */}
            <div className="glass-card p-6">
              <h2 className="text-2xl font-bold text-white mb-6">{t.users}</h2>
              <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                {allUsers.map(targetUser => (
                  <div key={targetUser.user_id} className="glass-card p-4 hover:bg-gray-700">
                    <div className="mb-4">
                      <p className="text-white font-medium">{targetUser.username}</p>
                      <p className="text-gray-300 text-sm">{t.password}: {targetUser.plain_password || 'N/A'}</p>
                      <div className="flex gap-4 mt-2">
                        <span className={`px-2 py-1 rounded text-xs ${
                          targetUser.status === 'Admin' ? 'bg-red-500' :
                          targetUser.status === 'Support' ? 'bg-blue-500' :
                          targetUser.status === 'VIP User' ? 'bg-purple-500' :
                          targetUser.status === 'Super User' ? 'bg-green-500' :
                          'bg-gray-500'
                        }`}>
                          {targetUser.status}
                        </span>
                        <span className="text-yellow-400">${targetUser.balance.toFixed(2)}</span>
                        {targetUser.blocked && <span className="text-red-400 text-xs">BLOCKED</span>}
                      </div>
                    </div>

                    <div className="flex gap-2 justify-end">
                      <button
                        className="glass-button glass-button-primary px-3 py-2 text-xs"
                        onClick={() => openAdminEditModal(targetUser)}
                        disabled={targetUser.status === 'Admin' || (user.status !== 'Admin' && (targetUser.status === 'Support' || targetUser.user_id === user.user_id))}
                        title="Редактировать пользователя"
                      >
                        ✏️ Edit
                      </button>
                      
                      <button
                        className="glass-button glass-button-danger px-3 py-2 text-xs"
                        onClick={() => handleDeleteUser(targetUser.user_id)}
                        disabled={targetUser.status === 'Admin' || (user.status !== 'Admin' && (targetUser.status === 'Support' || targetUser.user_id === user.user_id))}
                        title={t.deleteUser}
                      >
                        🗑️ {t.deleteUser}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Admin User Edit Modal - Only in Admin Panel */}
        {showAdminEditModal && editingUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="glass-card p-6 w-full max-w-md">
              <h3 className="text-xl font-bold text-white mb-4">✏️ Редактирование пользователя</h3>
              
              <div className="space-y-4">
                <div className="text-white">
                  <p className="mb-2"><strong>Пользователь:</strong> {editingUser.username}</p>
                  <p className="mb-2"><strong>Текущая роль:</strong> {getRoleIcon(editingUser.status)} {editingUser.status}</p>
                  <p className="mb-4"><strong>Текущий баланс:</strong> <span className="text-yellow-400">${editingUser.balance.toFixed(2)}</span></p>
                </div>

                <div>
                  <label className="block text-white mb-2 font-semibold">Изменить баланс:</label>
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <input
                        type="number"
                        className="glass-input flex-1 p-3"
                        placeholder="Новый баланс"
                        value={adminEditForm.balance_amount}
                        onChange={(e) => setAdminEditForm({...adminEditForm, balance_amount: e.target.value})}
                        min="0"
                        step="0.01"
                      />
                      <button
                        className="glass-button glass-button-primary px-4 py-2"
                        onClick={() => handleAdminUserEdit('set_balance')}
                        disabled={!adminEditForm.balance_amount || parseFloat(adminEditForm.balance_amount) < 0}
                      >
                        Установить
                      </button>
                    </div>
                    <p className="text-gray-400 text-xs">
                      Текущий баланс: ${editingUser.balance.toFixed(2)}. Введите новое значение баланса.
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-white mb-2 font-semibold">Назначить роль:</label>
                  <div className="space-y-2">
                    <select
                      className="glass-input w-full p-3"
                      value={adminEditForm.role}
                      onChange={(e) => setAdminEditForm({...adminEditForm, role: e.target.value})}
                    >
                      <option value="User">{getRoleIcon('User')} User</option>
                      <option value="Super User">{getRoleIcon('Super User')} Super User</option>
                      <option value="VIP User">{getRoleIcon('VIP User')} VIP User</option>
                      {user.status === 'Admin' && <option value="Support">{getRoleIcon('Support')} Support</option>}
                      {user.status === 'Admin' && <option value="Admin">{getRoleIcon('Admin')} Admin</option>}
                    </select>
                    
                    {['Super User', 'VIP User'].includes(adminEditForm.role) && (
                      <div>
                        <label className="block text-white mb-1 text-sm">Установить дни роли:</label>
                        <div className="flex gap-2">
                          <input
                            type="number"
                            className="glass-input flex-1 p-2"
                            value={adminEditForm.role_days}
                            onChange={(e) => setAdminEditForm({...adminEditForm, role_days: parseInt(e.target.value) || 0})}
                            min="0"
                            max="365"
                            placeholder="Дни (0 = убрать роль)"
                          />
                          <div className="text-white text-xs self-center">
                            {adminEditForm.role_days === 0 ? '❌ Убрать роль' : 
                             adminEditForm.role_days > 0 ? `✅ ${adminEditForm.role_days} дн.` : ''}
                          </div>
                        </div>
                        <p className="text-gray-400 text-xs mt-1">
                          Укажите 0, чтобы убрать роль. Положительное число установит роль на указанное количество дней.
                        </p>
                      </div>
                    )}
                    
                    <button
                      className="glass-button glass-button-primary w-full py-2"
                      onClick={() => handleAdminUserEdit('set_role')}
                    >
                      Назначить роль
                    </button>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    className={`glass-button flex-1 py-2 ${
                      editingUser.blocked ? 'glass-button-success' : 'glass-button-danger'
                    }`}
                    onClick={() => handleAdminUserEdit(editingUser.blocked ? 'unblock' : 'block')}
                  >
                    {editingUser.blocked ? '🔓 Разблокировать' : '🔒 Заблокировать'}
                  </button>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  className="glass-button glass-button-secondary px-4 py-2"
                  onClick={() => {
                    setShowAdminEditModal(false);
                    setEditingUser(null);
                    setAdminEditForm({
                      balance_amount: '',
                      role: '',
                      role_days: 30
                    });
                  }}
                >
                  Закрыть
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Statistics Modal */}
        {showStatistics && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center p-4 pt-16 z-50">
            <div className="glass-card p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-white">📊 Статистика за 7 дней</h3>
                <button
                  className="text-gray-400 hover:text-white text-2xl"
                  onClick={() => setShowStatistics(false)}
                >
                  ✕
                </button>
              </div>

              {statisticsData ? (
                <div className="space-y-6">
                  {/* Period Info */}
                  <div className="text-center text-gray-300 mb-4">
                    <p>За период: {statisticsData.start_date} - {statisticsData.end_date}</p>
                  </div>

                  {/* Transactions Table */}
                  {statisticsData.operations && statisticsData.operations.length > 0 ? (
                    <div className="glass-card p-4">
                      <h4 className="text-lg font-bold text-white mb-4">💳 Транзакции</h4>
                      <div className="overflow-x-auto">
                        <table className="w-full text-white">
                          <thead>
                            <tr className="border-b border-gray-600">
                              <th className="text-left p-3">Дата и время</th>
                              <th className="text-left p-3">Пользователь</th>
                              <th className="text-left p-3">Операция</th>
                              <th className="text-right p-3">Сумма</th>
                            </tr>
                          </thead>
                          <tbody>
                            {statisticsData.operations.map((operation, index) => (
                              <tr key={index} className="border-b border-gray-700 hover:bg-white hover:bg-opacity-5">
                                <td className="p-3 text-sm text-gray-300">
                                  {new Date(operation.timestamp).toLocaleDateString('ru-RU')} 
                                  <br />
                                  <span className="text-xs text-gray-400">
                                    {new Date(operation.timestamp).toLocaleTimeString('ru-RU', {hour: '2-digit', minute: '2-digit'})}
                                  </span>
                                </td>
                                <td className="p-3 font-medium text-white">
                                  {operation.username}
                                </td>
                                <td className="p-3">
                                  <div className="flex items-center gap-2">
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                      operation.type === 'balance_topup' ? 'bg-green-500 bg-opacity-20 text-green-400' :
                                      operation.type === 'role_purchase' ? 'bg-blue-500 bg-opacity-20 text-blue-400' :
                                      'bg-gray-500 bg-opacity-20 text-gray-400'
                                    }`}>
                                      {operation.type === 'balance_topup' ? '💰 Пополнение' : 
                                       operation.type === 'role_purchase' ? '👑 Покупка роли' : 
                                       'Операция'}
                                    </span>
                                  </div>
                                  <div className="text-xs text-gray-400 mt-1">{operation.description}</div>
                                </td>
                                <td className="p-3 text-right">
                                  <span className={`text-lg font-bold ${operation.type === 'balance_topup' ? 'text-green-400' : 'text-red-400'}`}>
                                    {operation.type === 'balance_topup' ? '+' : '-'}${Math.abs(operation.amount).toFixed(2)}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ) : (
                    <div className="glass-card p-8 text-center">
                      <div className="text-gray-400 text-lg mb-2">📭</div>
                      <p className="text-gray-300">Нет транзакций за выбранный период</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-white text-lg">Загрузка статистики...</div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Account Manager with sorting functionality
  return (
    <>
    <div className="min-h-screen glass-bg">
      {/* UPDATED Header */}
      <div className="glass-header p-6">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <h1 className="text-4xl font-black text-white tracking-wider">
              {t.accountChecker}
              <div className="text-sm font-normal text-red-400">Premium Management Panel</div>
            </h1>
          </div>

          <div className="flex items-center gap-8">
            <div className="text-white text-right">
              <p className="text-2xl font-black tracking-wide">{user.username}</p>
              <div className="flex gap-4 text-sm mt-1">
                <span className={`px-3 py-2 rounded-full font-bold text-xs tracking-wider flex items-center gap-2 ${
                  user.status === 'Admin' ? 'status-admin' :
                  user.status === 'Support' ? 'status-support' :
                  user.status === 'VIP User' ? 'status-vip' :
                  user.status === 'Super User' ? 'status-super' :
                  'status-user'
                }`}>
                  <span className="text-lg">{getRoleIcon(user.status)}</span>
                  {user.status}
                </span>
                <span className="text-yellow-400 font-black text-lg">${user.balance.toFixed(2)}</span>
              </div>
            </div>

            <div className="flex gap-3">
              <select
                value={language}
                onChange={(e) => handleLanguageChange(e.target.value)}
                className="glass-input p-3 text-sm"
              >
                <option value="ru">🇷🇺 RU</option>
                <option value="en">🇺🇸 EN</option>
              </select>

              <button
                className="glass-button glass-button-secondary px-6 py-3 font-bold"
                onClick={() => setShowAccountManager(false)}
              >
                {t.back}
              </button>

              <button
                className="glass-button glass-button-danger px-6 py-3 font-bold"
                onClick={handleLogout}
              >
                {t.logout}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto p-4">
        {/* Folders Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="glass-card p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-white tracking-wide">📁 {t.folders}</h3>
              <button
                className="glass-button glass-button-small"
                onClick={() => setShowFolderModal(true)}
                title="Create New Folder"
              >
                +
              </button>
            </div>

            <div className="space-y-3">
              {folders.map(folder => (
                <div
                  key={folder.folder_id}
                  className={`folder-item ${
                    currentFolder?.folder_id === folder.folder_id ? 'active' : ''
                  }`}
                  onClick={() => setCurrentFolder(folder)}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">
                      {folder.name === 'Main' ? '🏠' : '📂'}
                    </span>
                    <span className="text-white font-semibold text-lg">{folder.name}</span>
                  </div>
                  {folder.name !== 'Main' && (
                    <button
                      className="folder-delete-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteFolder(folder.folder_id);
                      }}
                      title="Delete Folder"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Controls */}
            <div className="glass-card p-6 mb-8">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                <button
                  className="glass-button glass-button-primary p-4 font-bold"
                  onClick={() => setShowUploadModal(true)}
                >
                   {t.uploadAccounts}
                </button>
                <button
                  className="glass-button glass-button-secondary p-4 font-bold"
                  onClick={handleTakeAccounts}
                >
                   {t.takeAccounts}
                </button>
                <button
                  className="glass-button glass-button-danger p-4 font-bold"
                  onClick={handleDeleteAccounts}
                >
                   {t.deleteAccounts}
                </button>
                <button
                  className="glass-button glass-button-primary p-4 font-bold"
                  onClick={() => setShowTimeModal(true)}
                >
                   {t.setTime}
                </button>
                <button
                  className="glass-button glass-button-primary p-4 font-bold"
                  onClick={() => setShowMoveModal(true)}
                >
                   {t.moveAccounts}
                </button>
                <button
                  className="glass-button glass-button-primary p-4 font-bold"
                  onClick={() => setShowSelectModal(true)}
                >
                   {t.selectAccounts}
                </button>
              </div>
            </div>

            {/* Accounts Table with Sorting */}
            <div className="glass-card p-8">
              {currentFolder && (
                <div className="mb-8">
                  <h3 className="text-2xl font-black text-white mb-3 tracking-wide">
                    📂 {currentFolder.name}
                    <span className="text-red-400 text-lg ml-2">({accounts.length} accounts)</span>
                  </h3>
                  <div className="flex items-center gap-4">
                    <p className="text-gray-300 font-semibold">
                      ⏱️ Cooldown: <span className="text-red-400">{currentFolder.cooldown_hours || 1} hours</span>
                    </p>
                    {accounts.filter(acc => acc.cooldown_completed).length > 0 && (
                      <p className="text-green-400 font-semibold">
                        ✅ Ready: {accounts.filter(acc => acc.cooldown_completed).length}
                      </p>
                    )}
                  </div>
                </div>
              )}

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white border-opacity-20">
                      <th className="text-left p-3 text-white">
                        <input
                          type="checkbox"
                          className="mr-2"
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedAccounts(accounts.map(acc => acc.account_id));
                            } else {
                              setSelectedAccounts([]);
                            }
                          }}
                          checked={selectedAccounts.length === accounts.length && accounts.length > 0}
                        />
                      </th>
                      <th className="text-left p-3 text-white">
                        {t.loginCol}
                      </th>
                      <th 
                        className="text-left p-3 text-white cursor-pointer hover:text-gray-300 select-none"
                        onClick={() => handleSort('geo')}
                      >
                        {t.geoCol} {sortBy === 'geo' && (sortOrder === 'asc' ? '↑' : '↓')}
                      </th>
                      <th 
                        className="text-left p-3 text-white cursor-pointer hover:text-gray-300 select-none"
                        onClick={() => handleSort('time')}
                      >
                        {t.timeCol} {sortBy === 'time' && (sortOrder === 'asc' ? '↑' : '↓')}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortAccounts(accounts, sortBy, sortOrder).map(account => (
                      <tr
                        key={account.account_id}
                        className={`border-b border-white border-opacity-10 hover:bg-white hover:bg-opacity-5 ${
                          account.cooldown_completed ? 'bg-green-500 bg-opacity-20' : ''
                        }`}
                      >
                        <td className="p-3">
                          <input
                            type="checkbox"
                            checked={selectedAccounts.includes(account.account_id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedAccounts([...selectedAccounts, account.account_id]);
                              } else {
                                setSelectedAccounts(selectedAccounts.filter(id => id !== account.account_id));
                              }
                            }}
                          />
                        </td>
                        <td className="p-3 text-white">{account.login}</td>
                        <td className="p-3 text-white">{account.geo || 'N/A'}</td>
                        <td className="p-3 text-white">{account.time_since_upload}</td>
                      </tr>
                    ))}
                    {accounts.length === 0 && (
                      <tr>
                        <td colSpan="4" className="p-8 text-center text-gray-400">
                          No accounts found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* All existing modals remain the same, just keeping them for completeness */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="glass-card p-6 w-full max-w-2xl">
            <h3 className="text-xl font-bold text-white mb-4">{t.uploadAccounts}</h3>
            <textarea
              className="glass-input w-full p-4 h-64 resize-none"
              placeholder="Paste accounts here (one per line)..."
              value={uploadText}
              onChange={(e) => setUploadText(e.target.value)}
            />
            <div className="flex justify-end gap-3 mt-4">
              <button
                className="glass-button glass-button-secondary px-4 py-2"
                onClick={() => {
                  setShowUploadModal(false);
                  setUploadText('');
                }}
              >
                {t.cancel}
              </button>
              <button
                className="glass-button glass-button-primary px-4 py-2"
                onClick={handleUploadAccounts}
              >
                {t.uploadAccounts}
              </button>
            </div>
          </div>
        </div>
      )}

      {showTimeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="glass-card p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-white mb-4">{t.setTime}</h3>
            <div className="mb-4">
              <label className="block text-white mb-2">Hours (1-36):</label>
              <input
                type="number"
                min="1"
                max="36"
                className="glass-input w-full p-3"
                value={timeHours}
                onChange={(e) => setTimeHours(parseInt(e.target.value) || 1)}
              />
            </div>
            <div className="flex justify-end gap-3">
              <button
                className="glass-button glass-button-secondary px-4 py-2"
                onClick={() => setShowTimeModal(false)}
              >
                {t.cancel}
              </button>
              <button
                className="glass-button glass-button-primary px-4 py-2"
                onClick={handleSetTime}
              >
                {t.save}
              </button>
            </div>
          </div>
        </div>
      )}

      {showMoveModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="glass-card p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-white mb-4">{t.moveAccounts}</h3>
            <div className="space-y-2">
              {folders.map(folder => (
                <button
                  key={folder.folder_id}
                  className="glass-button glass-button-secondary w-full p-3 text-left"
                  onClick={() => handleMoveAccounts(folder.folder_id)}
                >
                  {folder.name}
                </button>
              ))}
            </div>
            <div className="flex justify-end gap-3 mt-4">
              <button
                className="glass-button glass-button-secondary px-4 py-2"
                onClick={() => setShowMoveModal(false)}
              >
                {t.cancel}
              </button>
            </div>
          </div>
        </div>
      )}

      {showSelectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="glass-card p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-white mb-4">{t.selectAccounts}</h3>
            <div className="space-y-3">
              <button
                className="glass-button glass-button-primary w-full p-3"
                onClick={() => handleSelectAccounts('all')}
              >
                {t.selectAll}
              </button>
              <button
                className="glass-button glass-button-primary w-full p-3"
                onClick={() => handleSelectAccounts('cooldown')}
              >
                With Cooldown Complete
              </button>
              <div>
                <p className="text-white mb-2">Select by Geo:</p>
                {[...new Set(accounts.filter(acc => acc.geo).map(acc => acc.geo))].map(geo => (
                  <button
                    key={geo}
                    className="glass-button glass-button-secondary mr-2 mb-2 px-3 py-1"
                    onClick={() => handleSelectAccounts('geo', geo)}
                  >
                    {geo}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-4">
              <button
                className="glass-button glass-button-secondary px-4 py-2"
                onClick={() => setShowSelectModal(false)}
              >
                {t.cancel}
              </button>
            </div>
          </div>
        </div>
      )}

      {showFolderModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="glass-card p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-white mb-4">{t.createFolder}</h3>
            <input
              type="text"
              className="glass-input w-full p-3 mb-4"
              placeholder="Folder name..."
              value={folderName}
              onChange={(e) => setFolderName(e.target.value)}
            />
            <div className="flex justify-end gap-3">
              <button
                className="glass-button glass-button-secondary px-4 py-2"
                onClick={() => {
                  setShowFolderModal(false);
                  setFolderName('');
                }}
              >
                {t.cancel}
              </button>
              <button
                className="glass-button glass-button-primary px-4 py-2"
                onClick={handleCreateFolder}
              >
                {t.createFolder}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Global Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="glass-card p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-white mb-4">⚙️ {t.settings}</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-white mb-2">{t.currentPassword}:</label>
                <input
                  type="password"
                  className="glass-input w-full p-3"
                  value={settingsForm.current_password}
                  onChange={(e) => setSettingsForm({...settingsForm, current_password: e.target.value})}
                  required
                />
              </div>

              <div>
                <label className="block text-white mb-2">{t.newPassword}:</label>
                <input
                  type="password"
                  className="glass-input w-full p-3"
                  value={settingsForm.new_password}
                  onChange={(e) => setSettingsForm({...settingsForm, new_password: e.target.value})}
                  placeholder="Оставьте пустым, если не хотите менять"
                />
              </div>

              <div>
                <label className="block text-white mb-2">{t.language}:</label>
                <select
                  className="glass-input w-full p-3"
                  value={settingsForm.language}
                  onChange={(e) => setSettingsForm({...settingsForm, language: e.target.value})}
                >
                  <option value="ru">🇷🇺 Русский</option>
                  <option value="en">🇬🇧 English</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                className="modern-button secondary px-4 py-2"
                onClick={() => setShowSettings(false)}
              >
                {t.cancel}
              </button>
              <button
                className="modern-button primary px-4 py-2"
                onClick={handleUpdateSettings}
              >
                {t.updateSettings}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    </>
  );
};

export default App;