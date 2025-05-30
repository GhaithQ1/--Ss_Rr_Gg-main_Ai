import React, { createContext, useState, useContext } from 'react';

const UserContext = createContext();

export const useUser = () => useContext(UserContext);

export const UserProvider = ({ children }) => {
  const [userId, setUserId] = useState(null); // لتخزين معرف المستخدم
  const [userById, setUserById] = useState(null); // بيانات المستخدم عبر المعرف
  const [showChat, setShowChat] = useState(false); // إظهار أو إخفاء الدردشة
  const [userTheme, setUserTheme] = useState('light'); // الثيم الخاص بالمستخدم
  const [notifications, setNotifications] = useState([]); // الإشعارات للمستخدم
  const [type_post, setType_post] = useState(""); // الإشعارات للمستخدم
  const [type_post_role, setType_post_role] = useState(""); // الإشعارات للمستخدم
  return (
    <UserContext.Provider value={{ 
      userId, setUserId, 
      userById, setUserById, 
      showChat, setShowChat,
      userTheme, setUserTheme, 
      notifications, setNotifications ,
      type_post, setType_post,
      type_post_role, setType_post_role
    }}>
      {children}
    </UserContext.Provider>
  );
};
