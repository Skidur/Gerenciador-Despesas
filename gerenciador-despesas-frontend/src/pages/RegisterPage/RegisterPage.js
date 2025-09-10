import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import zxcvbn from 'zxcvbn';
import FakeDashboardBackground from '../../components/FakeDashboardBackground/FakeDashboardBackground';
import styles from './RegisterPage.module.css';
import api from '../api/apiService';


function RegisterPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [birthDate, setBirthDate] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [passwordStrength, setPasswordStrength] = useState(0);
    const navigate = useNavigate();

    const handlePasswordChange = (e) => {
        const newPassword = e.target.value;
        setPassword(newPassword);

        if (newPassword) {
            const result = zxcvbn(newPassword);
            setPasswordStrength(result.score);
        } else {
            setPasswordStrength(0);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (password !== confirmPassword) {
            setError('As senhas não coincidem.');
            return;
        }

        try {
            await api.post('/auth/register', { username, password, fullName, birthDate });
            setSuccess('Cadastro realizado com sucesso! A redirecionar para o login...');
            setTimeout(() => {
                navigate('/login');
            }, 2000);
        } catch (err) {
            setError(err.response?.data?.error || 'Erro ao cadastrar. Tente outro nome de usuário.');
        }
    };

    return (
        <div className={styles.authPage}>
            <FakeDashboardBackground />
            <div className={styles.authContent}>
                <div className={styles.authBranding}>
                    <h1>Crie sua Conta</h1>
                    <p>Comece a organizar suas despesas hoje mesmo.</p>
                </div>
                <div className={styles.authForm}>
                    <h2>Cadastro</h2>
                    <form onSubmit={handleSubmit}>
                        <input
                            type="text"
                            placeholder="Usuário"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                        <input
                            type="text"
                            placeholder="Nome Completo"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            required
                        />
                        <input
                            type="date"
                            placeholder="Data de Nascimento"
                            value={birthDate}
                            onChange={(e) => setBirthDate(e.target.value)}
                            required
                            style={{ colorScheme: 'dark' }}
                        />
                        <input
                            type="password"
                            placeholder="Senha"
                            value={password}
                            onChange={handlePasswordChange}
                            required
                        />
                        {password && (
                            <div className={styles.passwordStrengthMeter}>
                                <div className={`${styles.strengthBar} ${styles['strength' + passwordStrength]}`} />
                            </div>
                        )}
                        <input
                            type="password"
                            placeholder="Confirmar a Senha"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />
                        <button type="submit">Cadastrar</button>
                        {error && <p className={styles.errorMessage}>{error}</p>}
                        {success && <p style={{ color: '#28a745', textAlign: 'center' }}>{success}</p>}
                    </form>
                    <p>
                        Já tem uma conta? <Link to="/login">Faça login</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default RegisterPage;