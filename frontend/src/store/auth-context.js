import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useContext, useEffect, useState } from "react";
import { authService } from "../services/auth-service";
const AuthContext = createContext(undefined);
export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(() => localStorage.getItem("do-nft-token"));
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const login = (nextToken, nextUser) => {
        localStorage.setItem("do-nft-token", nextToken);
        setToken(nextToken);
        setUser(nextUser);
    };
    const logout = () => {
        localStorage.removeItem("do-nft-token");
        setToken(null);
        setUser(null);
    };
    const refreshUser = async () => {
        if (!localStorage.getItem("do-nft-token")) {
            setLoading(false);
            return;
        }
        try {
            const currentUser = await authService.me();
            setUser(currentUser);
        }
        catch {
            logout();
        }
        finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        void refreshUser();
    }, []);
    return (_jsx(AuthContext.Provider, { value: {
            token,
            user,
            loading,
            login,
            logout,
            refreshUser
        }, children: children }));
};
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within AuthProvider");
    }
    return context;
};
