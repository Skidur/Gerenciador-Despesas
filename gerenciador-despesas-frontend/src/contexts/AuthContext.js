import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [user, setUser] = useState(null);
    const [isBirthday, setIsBirthday] = useState(false);

    useEffect(() => {
        if (token) {
            try {
                const decodedUser = jwtDecode(token);
                setUser(decodedUser);
            } catch (e) {
                localStorage.removeItem('token');
                setToken(null);
                setUser(null);
            }
        }
    }, [token]);

    const loginAction = async (data) => {
        try {
            const response = await axios.post('http://localhost:3001/api/auth/login', data);
            if (response.data && response.data.token) {
                const receivedToken = response.data.token;
                setToken(receivedToken);
                localStorage.setItem('token', receivedToken);
                
                const decodedUser = jwtDecode(receivedToken);
                setUser(decodedUser);

                if (response.data.isBirthday) {
                    setIsBirthday(true);
                }

                return true;
            }
        } catch (err) {
            console.error(err);
            if (err.response) {
                throw new Error(err.response.data.error || 'Erro ao fazer login');
            } else {
                throw new Error('Não foi possível conectar ao servidor. Verifique sua conexão.');
            }
        }
    };

    const logOut = () => {
        setToken(null);
        setUser(null);
        setIsBirthday(false);
        localStorage.removeItem('token');
    };

    return (
        <AuthContext.Provider value={{ token, user, isBirthday, loginAction, logOut }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};