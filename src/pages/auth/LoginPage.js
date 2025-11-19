/* global globalThis */
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ReactComponent as GitHubIcon } from "../../assets/icons/github-mark.svg";
import hiddenPassIcon from "../../assets/icons/hidden_pass.png";
import showPassIcon from "../../assets/icons/show_pass.png";
import { useLanguage } from "../../context/LanguageContext";
import { useFetchWithLang } from "../../api/FetchWithLang";
import "../styles/auth/LoginPage.css";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8080";

const LoginPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { language, toggleLanguage, t } = useLanguage();
    const fetchWithLang = useFetchWithLang();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState(null);

    const queryParams = new URLSearchParams(location.search);
    const urlError = queryParams.get("error");

    useEffect(() => {
        if (urlError === "UserBlocked") {
            setError(t("login.userBlocked"));
        }
    }, [urlError, t]);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError(null);

        try {
            const response = await fetchWithLang(`${API_URL}/api/auth/login`, {
                method: "POST",
                credentials: "include",
                body: JSON.stringify({ email, password }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: undefined }));
                setError(errorData.message);
                return;
            }

            globalThis.location.href = "/vouchers";
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError(t("errors.networkError"));
            }
        }
    };

    const handleGitHubLogin = () => {
        globalThis.location.href = `${API_URL}/oauth2/authorization/github`;
    };

    return (
        <div className="login-body">
            <button className="lang-button" onClick={toggleLanguage}>
                {t(`language.${language}`)}
            </button>

            <div className="login-container">
                <h1 className="login-title">{t("login.title")}</h1>

                {error && <p className="error-text">{error}</p>}

                <div className="form-container">
                    <div className="input-group">
                        <label className="label">{t("login.email")}</label>
                        <input
                            className="input"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="your@email.com"
                            required
                        />
                    </div>

                    <div className="input-group">
                        <label className="label">{t("login.password")}</label>
                        <div className="password-input-wrapper">
                            <input
                                className="input"
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                            />
                            <button
                                type="button"
                                className="password-toggle"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                <img
                                    src={showPassword ? hiddenPassIcon : showPassIcon}
                                    alt="toggle"
                                    className="password-icon"
                                />
                            </button>
                        </div>
                    </div>

                    <button className="btn-primary" onClick={handleLogin}>
                        {t("login.submit")}
                    </button>
                </div>

                <div className="divider">{t("login.or")}</div>

                <button className="btn-github" onClick={handleGitHubLogin}>
                    <GitHubIcon className="github-icon" />
                    {t("login.loginGithub")}
                </button>

                <div className="link-group">
                    {t("login.noAccount")}{" "}
                    <button className="link-button" onClick={() => navigate("/register")}>
                        {t("login.register")}
                    </button>
                </div>

                <div className="link-group">
                    <button className="link-button" onClick={() => navigate("/")}>
                        ← {t("login.backHome")}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
