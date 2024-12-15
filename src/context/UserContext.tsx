import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";

// Define the shape of the context state and methods
interface UserContextType {
  userToken: string | null;
  userId: string | null;
  suborgId: string | null;
  setData: (userToken: string, userId: string) => void;
  updateSubOrgId: (subOrgId: string) => void;
  updateUserId: (userId: string) => void;
  logout: () => void;
}

// Create the context with a default value (use undefined to enforce proper usage)
const UserContext = createContext<UserContextType | undefined>(undefined);

// Hook to use the UserContext
export const useUserContext = (): UserContextType => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUserContext must be used within a UserContextProvider");
  }
  return context;
};

// Provider component
export const UserContextProvider = ({ children }: { children: ReactNode }) => {
  const [userToken, setUserToken] = useState<string | null>(null);
  const [suborgId, setSuborgId] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    // Load user data from localStorage on initial render
    const savedUserToken = localStorage.getItem("userToken");
    const savedUserId = localStorage.getItem("userId");
    const savedSuborgId = localStorage.getItem("suborgId");

    if (savedUserToken && savedUserId) {
      setUserToken(savedUserToken);
      setUserId(savedUserId);
    }

    if (savedSuborgId) {
      setSuborgId(savedSuborgId);
    }
  }, []);

  const setData = (token: string, id: string) => {
    // Save user token and ID to localStorage and state
    localStorage.setItem("userToken", token);
    localStorage.setItem("userId", id);
    setUserToken(token);
    setUserId(id);
  };

  const updateSubOrgId = (id: string) => {
    // Save suborgId to localStorage and state
    localStorage.setItem("suborgId", id);
    setSuborgId(id);
  };

  const updateUserId = (id: string) => {
    // Save userId to localStorage and state
    localStorage.setItem("userId", id);
    setUserId(id);
  };

  const logout = () => {
    // Clear user data from localStorage and state
    localStorage.removeItem("userToken");
    localStorage.removeItem("userId");
    localStorage.removeItem("suborgId");
    setUserToken(null);
    setUserId(null);
    setSuborgId(null);
  };

  return (
    <UserContext.Provider
      value={{
        userToken,
        userId,
        suborgId,
        setData,
        updateSubOrgId,
        updateUserId,
        logout,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};
