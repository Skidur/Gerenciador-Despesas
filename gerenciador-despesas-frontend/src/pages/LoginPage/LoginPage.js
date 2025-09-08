import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import FakeDashboardBackground from '../../components/FakeDashboardBackground/FakeDashboardBackground';
import styles from './LoginPage.module.css';

function LoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { loginAction } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const success = await loginAction({ username, password });
            if (success) {
                navigate('/');
            }
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className={styles.authPage}>
            <FakeDashboardBackground />
            <div className={styles.authContent}>
                <div className={styles.authBranding}>
                    <h1>Bem-vindo de Volta!</h1>
                    <p>Controle suas finanças de forma simples e visual.</p>
                </div>
                <div className={styles.authForm}>
                    <h2>Login</h2>
                    <form onSubmit={handleSubmit}>
                        <input
                            type="text"
                            placeholder="Usuário"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                        <input
                            type="password"
                            placeholder="Senha"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                        <button type="submit">Entrar</button>
                        {error && <p className={styles.errorMessage}>{error}</p>}
                    </form>
                    <p>
                        Não tem uma conta? <Link to="/register">Cadastre-se</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default LoginPage;