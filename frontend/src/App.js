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
    back: 'Назад'
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
    back: 'Back'
  }
};

const App = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showLogin, setShowLogin] = useState(true);
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [accounts, setAccounts] = useState([]);
  const [folders, setFolders] = useState([]);
  const [currentFolder, setCurrentFolder] = useState(null);
  const [selectedAccounts, setSelectedAccounts] = useState([]);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [language, setLanguage] = useState('ru');
  
  // Modal states
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showTimeModal, setShowTimeModal] = useState(false);
  const [showMoveModal, setShowMoveModal] = useState(false);
  const [showSelectModal, setShowSelectModal] = useState(false);
  const [showFolderModal, setShowFolderModal] = useState(false);
  
  const [uploadText, setUploadText] = useState('');
  const [timeHours, setTimeHours] = useState(1);
  const [folderName, setFolderName] = useState('');
  
  // Admin states
  const [allUsers, setAllUsers] = useState([]);
  const [pendingUsers, setPendingUsers] = useState([]);

  const t = translations[language];

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (user) {
      fetchFolders();
    }
  }, [user]);

  useEffect(() => {
    if (currentFolder) {
      fetchAccounts();
    }
  }, [currentFolder]);

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

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${API_BASE_URL}/api/login`, formData);
      localStorage.setItem('token', response.data.access_token);
      setUser(response.data.user);
      setLanguage(response.data.user.language || 'ru');
      setFormData({ username: '', password: '' });
    } catch (error) {
      alert(error.response?.data?.detail || 'Login failed');
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE_URL}/api/register`, formData);
      alert('Registration successful! Waiting for admin approval.');
      setFormData({ username: '', password: '' });
      setShowLogin(true);
    } catch (error) {
      alert(error.response?.data?.detail || 'Registration failed');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setShowAdminPanel(false);
    setAccounts([]);
    setFolders([]);
    setCurrentFolder(null);
    setSelectedAccounts([]);
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
    } catch (error) {
      console.error('Error fetching admin data:', error);
    }
  };

  const handleAdminAction = async (userId, action, value = null) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_BASE_URL}/api/admin/user-action`, 
        { 
          user_id: userId,
          action,
          value 
        }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchAdminData();
    } catch (error) {
      alert('Error performing action');
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
              onClick={() => setShowLogin(true)}
            >
              {t.login}
            </button>
            <button 
              className={`flex-1 p-4 text-lg font-bold ${!showLogin ? 'active' : ''}`}
              onClick={() => setShowLogin(false)}
            >
              {t.register}
            </button>
          </div>
          
          <form onSubmit={showLogin ? handleLogin : handleRegister} className="space-y-6">
            <div className="space-y-2">
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
            <div className="space-y-2">
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
            <button type="submit" className="glass-button premium-button w-full p-4 text-lg font-black tracking-wider">
              {showLogin ? t.loginBtn : t.registerBtn}
            </button>
          </form>

          {showLogin && (
            <div className="mt-8 p-6 glass-card bg-opacity-50">
              <h3 className="text-lg font-bold text-white mb-3">👑 Admin Access</h3>
              <div className="text-sm text-gray-300 space-y-2">
                <div><span className="text-red-400 font-semibold">Username:</span> Логин</div>
                <div><span className="text-red-400 font-semibold">Password:</span> пароль</div>
              </div>
              <div className="text-xs text-gray-400 mt-3">
                Use these credentials for admin panel access
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

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
                className="glass-button px-4 py-2"
                onClick={() => {
                  setShowAdminPanel(false);
                  fetchAdminData();
                }}
              >
                {t.back}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Pending Users */}
            <div className="glass-card p-6">
              <h2 className="text-xl font-bold text-white mb-4">{t.pendingUsers}</h2>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {pendingUsers.map(user => (
                  <div key={user.user_id} className="glass-card p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-white font-medium">{user.username}</p>
                        <p className="text-gray-300 text-sm">{new Date(user.created_at).toLocaleString()}</p>
                      </div>
                      <div className="flex gap-2">
                        <button 
                          className="glass-button-success px-3 py-1 text-sm"
                          onClick={() => handleAdminAction(user.user_id, 'approve')}
                        >
                          {t.approve}
                        </button>
                        <button 
                          className="glass-button-danger px-3 py-1 text-sm"
                          onClick={() => handleAdminAction(user.user_id, 'reject')}
                        >
                          {t.reject}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                {pendingUsers.length === 0 && (
                  <p className="text-gray-400 text-center">No pending users</p>
                )}
              </div>
            </div>

            {/* All Users */}
            <div className="glass-card p-6">
              <h2 className="text-xl font-bold text-white mb-4">{t.users}</h2>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {allUsers.map(user => (
                  <div key={user.user_id} className="glass-card p-4">
                    <div className="mb-3">
                      <p className="text-white font-medium">{user.username}</p>
                      <p className="text-gray-300 text-sm">Password: {user.password}</p>
                      <div className="flex gap-4 mt-2">
                        <span className={`px-2 py-1 rounded text-xs ${
                          user.status === 'Admin' ? 'bg-red-500' :
                          user.status === 'Support' ? 'bg-blue-500' :
                          user.status === 'VIP User' ? 'bg-purple-500' :
                          user.status === 'Super User' ? 'bg-green-500' :
                          'bg-gray-500'
                        }`}>
                          {user.status}
                        </span>
                        <span className="text-yellow-400">${user.balance.toFixed(2)}</span>
                        {user.blocked && <span className="text-red-400 text-xs">BLOCKED</span>}
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      <select 
                        className="glass-input text-xs p-1"
                        onChange={(e) => handleAdminAction(user.user_id, 'change_status', e.target.value)}
                        value={user.status}
                      >
                        <option value="User">User</option>
                        <option value="Super User">Super User</option>
                        <option value="VIP User">VIP User</option>
                        <option value="Support">Support</option>
                        {user.status === 'Admin' && <option value="Admin">Admin</option>}
                      </select>
                      
                      <input 
                        type="number" 
                        className="glass-input text-xs p-1 w-20"
                        placeholder="$"
                        onBlur={(e) => {
                          if (e.target.value) {
                            handleAdminAction(user.user_id, 'change_balance', e.target.value);
                          }
                        }}
                      />
                      
                      <button 
                        className={`text-xs px-2 py-1 rounded ${
                          user.blocked ? 'glass-button-success' : 'glass-button-danger'
                        }`}
                        onClick={() => handleAdminAction(
                          user.user_id, 
                          user.blocked ? 'unblock' : 'block'
                        )}
                      >
                        {user.blocked ? t.unblock : t.block}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen glass-bg">
      {/* Header */}
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
                <span className={`px-3 py-2 rounded-full font-bold text-xs tracking-wider ${
                  user.status === 'Admin' ? 'status-admin' :
                  user.status === 'Support' ? 'status-support' :
                  user.status === 'VIP User' ? 'status-vip' :
                  user.status === 'Super User' ? 'status-super' :
                  'status-user'
                }`}>
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
                <option value="en">🇬🇧 EN</option>
              </select>
              
              {(user.status === 'Admin' || user.status === 'Support') && (
                <button 
                  className="glass-button premium-button px-6 py-3 font-bold"
                  onClick={() => {
                    setShowAdminPanel(true);
                    fetchAdminData();
                  }}
                >
                  👑 {user.status === 'Admin' ? t.adminPanel : t.supportPanel}
                </button>
              )}
              
              <button 
                className="glass-button-danger px-6 py-3 font-bold"
                onClick={handleLogout}
              >
                🚪 {t.logout}
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
                className="glass-button-small"
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
                  className={`flex items-center justify-between p-4 rounded-xl cursor-pointer transition-all duration-300 ${
                    currentFolder?.folder_id === folder.folder_id 
                      ? 'bg-red-500 bg-opacity-20 border border-red-500 border-opacity-40 shadow-lg shadow-red-500 shadow-opacity-20' 
                      : 'hover:bg-white hover:bg-opacity-10 border border-transparent'
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
                      className="text-red-400 hover:text-red-300 text-xl font-bold transition-colors duration-200"
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
            <div className="glass-card p-6 mb-6">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <button 
                  className="glass-button premium-button p-4 font-bold"
                  onClick={() => setShowUploadModal(true)}
                >
                  📤 {t.uploadAccounts}
                </button>
                <button 
                  className="glass-button premium-button p-4 font-bold"
                  onClick={handleTakeAccounts}
                >
                  💾 {t.takeAccounts}
                </button>
                <button 
                  className="glass-button-danger p-4 font-bold"
                  onClick={handleDeleteAccounts}
                >
                  🗑️ {t.deleteAccounts}
                </button>
                <button 
                  className="glass-button premium-button p-4 font-bold"
                  onClick={() => setShowTimeModal(true)}
                >
                  ⏰ {t.setTime}
                </button>
                <button 
                  className="glass-button premium-button p-4 font-bold"
                  onClick={() => setShowMoveModal(true)}
                >
                  📁 {t.moveAccounts}
                </button>
                <button 
                  className="glass-button premium-button p-4 font-bold"
                  onClick={() => setShowSelectModal(true)}
                >
                  🎯 {t.selectAccounts}
                </button>
              </div>
            </div>

            {/* Accounts Table */}
            <div className="glass-card p-8">
              {currentFolder && (
                <div className="mb-6">
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
                      <th className="text-left p-3 text-white cursor-pointer hover:text-gray-300">
                        {t.loginCol}
                      </th>
                      <th className="text-left p-3 text-white cursor-pointer hover:text-gray-300">
                        {t.geoCol}
                      </th>
                      <th className="text-left p-3 text-white cursor-pointer hover:text-gray-300">
                        {t.timeCol}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {accounts.map(account => (
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

      {/* Modals */}
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
                className="glass-button-secondary px-4 py-2"
                onClick={() => {
                  setShowUploadModal(false);
                  setUploadText('');
                }}
              >
                {t.cancel}
              </button>
              <button 
                className="glass-button px-4 py-2"
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
                className="glass-button-secondary px-4 py-2"
                onClick={() => setShowTimeModal(false)}
              >
                {t.cancel}
              </button>
              <button 
                className="glass-button px-4 py-2"
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
                  className="glass-button w-full p-3 text-left"
                  onClick={() => handleMoveAccounts(folder.folder_id)}
                >
                  {folder.name}
                </button>
              ))}
            </div>
            <div className="flex justify-end gap-3 mt-4">
              <button 
                className="glass-button-secondary px-4 py-2"
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
                className="glass-button w-full p-3"
                onClick={() => handleSelectAccounts('all')}
              >
                {t.selectAll}
              </button>
              <button 
                className="glass-button w-full p-3"
                onClick={() => handleSelectAccounts('cooldown')}
              >
                With Cooldown Complete
              </button>
              <div>
                <p className="text-white mb-2">Select by Geo:</p>
                {[...new Set(accounts.filter(acc => acc.geo).map(acc => acc.geo))].map(geo => (
                  <button 
                    key={geo}
                    className="glass-button mr-2 mb-2 px-3 py-1"
                    onClick={() => handleSelectAccounts('geo', geo)}
                  >
                    {geo}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-4">
              <button 
                className="glass-button-secondary px-4 py-2"
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
                className="glass-button-secondary px-4 py-2"
                onClick={() => {
                  setShowFolderModal(false);
                  setFolderName('');
                }}
              >
                {t.cancel}
              </button>
              <button 
                className="glass-button px-4 py-2"
                onClick={handleCreateFolder}
              >
                {t.createFolder}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;