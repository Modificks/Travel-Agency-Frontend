import React, { createContext, useContext, useState, useEffect, useMemo } from "react";
import PropTypes from "prop-types";

const AuthContext = createContext(null);
const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8080";

export const AuthProvider = ({ children }) => {
    const [isAdmin, setIsAdmin] = useState(false);
    const [isManager, setIsManager] = useState(false);
    const [role, setRole] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkUserRole = async () => {
            try {
                const response = await fetch(`${API_URL}/api/auth/me`, {
                    method: "GET",
                    credentials: "include",
                    headers: {
                        "Content-Type": "application/json"
                    }
                });

                if (response.ok) {
                    const roleText = await response.text();
                    const cleanRole = roleText.replaceAll('"', '');

                    setRole(cleanRole);

                    const admin = cleanRole === 'ADMIN';
                    const manager = cleanRole === 'MANAGER';

                    setIsAdmin(admin);
                    setIsManager(manager || admin);
                } else {
                    setIsAdmin(false);
                    setIsManager(false);
                    setRole(null);
                }
            } catch (error) {
                console.error("Error checking user role:", error);
                setIsAdmin(false);
                setIsManager(false);
                setRole(null);
            } finally {
                setLoading(false);
            }
        };

        void checkUserRole();
    }, []);

    const contextValue = useMemo(() => ({
        isAdmin,
        isManager,
        role,
        loading
    }), [isAdmin, isManager, role, loading]);

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
};

AuthProvider.propTypes = {
    children: PropTypes.node.isRequired,
};

export const useAuth = () => useContext(AuthContext);
