import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations } from '../i18n/translations';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem('sahakar_token') || null);
  const [currentUser, setCurrentUser] = useState(
    JSON.parse(localStorage.getItem('sahakar_user') || 'null')
  );
  const [language, setLanguage] = useState(localStorage.getItem('sahakar_lang') || 'en');

  const changeLanguage = (lang) => {
    setLanguage(lang);
    localStorage.setItem('sahakar_lang', lang);
  };

  const loginUser = (userToken, userData) => {
    setToken(userToken);
    setCurrentUser(userData);
    localStorage.setItem('sahakar_token', userToken);
    localStorage.setItem('sahakar_user', JSON.stringify(userData));
  };

  const logoutUser = () => {
    setToken(null);
    setCurrentUser(null);
    localStorage.removeItem('sahakar_token');
    localStorage.removeItem('sahakar_user');
  };

  const t = (key) => {
    if (translations[language] && translations[language][key]) {
      return translations[language][key];
    }
    if (translations.en && translations.en[key]) {
      return translations.en[key];
    }
    return key;
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        currentUser,
        language,
        setLanguage: changeLanguage,
        loginUser,
        logoutUser,
        t,
        isAuthenticated: !!token && !!currentUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

