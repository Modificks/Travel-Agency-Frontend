import React, {useState} from "react";
import {useNavigate} from "react-router-dom";
import {useLanguage} from "../../context/LanguageContext";
import hiddenPassIcon from "../../assets/icons/hidden_pass.png";
import showPassIcon from "../../assets/icons/show_pass.png";
import "../styles/auth/RegisterPage.css";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8080";

const RegisterPage = () => {
    const navigate = useNavigate();
    const {language, toggleLanguage, t} = useLanguage();

    const [formData, setFormData] = useState({
        name: "",
        surname: "",
        email: "",
        phoneNumber: "",
        password: "",
        confirmPassword: "",
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    const handleChange = (field, value) => {
        setFormData({...formData, [field]: value});
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        if (formData.password !== formData.confirmPassword) {
            setError(t("register.passwordsMismatch"));
            return;
        }

        try {
            const response = await fetch(`${API_URL}/api/auth/register`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Accept-Language": language,
                },
                body: JSON.stringify({
                    name: formData.name,
                    surname: formData.surname,
                    email: formData.email,
                    phoneNumber: formData.phoneNumber,
                    password: formData.password,
                    confirmPassword: formData.confirmPassword,
                }),
            });

            const contentType = response.headers.get("content-type");

            if (!response.ok) {
                let errorMessage;


                if (contentType?.includes("application/json")) {
                    const errorData = await response.json();
                    errorMessage = errorData.message;
                } else {
                    errorMessage = await response.text();
                }

                setError(errorMessage);
                return;
            }

            let successMessage;
            if (contentType?.includes("application/json")) {
                const data = await response.json();
                successMessage = data.message;
            } else {
                successMessage = await response.text();
            }

            setSuccess(successMessage);

            setTimeout(() => navigate("/login"), 2000);
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="register-body">
            <button className="lang-button" onClick={toggleLanguage}>
                {t(`language.${language}`)}
            </button>

            <div className="register-container">
                <h1 className="register-title">
                    {t("register.title")}
                </h1>

                <form className="register-form" onSubmit={handleRegister}>
                    <div className="row">
                        <div className="input-group">
                            <label>
                                {t("register.name")}
                            </label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => handleChange("name", e.target.value)}
                                placeholder={language === "uk" ? "Іван" : "John"}
                                required
                            />
                        </div>
                        <div className="input-group">
                            <label>
                                {t("register.surname")}
                            </label>
                            <input
                                type="text"
                                value={formData.surname}
                                onChange={(e) => handleChange("surname", e.target.value)}
                                placeholder={language === "uk" ? "Петренко" : "Doe"}
                                required
                            />
                        </div>
                    </div>

                    <div className="input-group">
                        <label>{t("register.email")}</label>
                        <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => handleChange("email", e.target.value)}
                            placeholder="your@email.com"
                            required
                        />
                    </div>

                    <div className="input-group">
                        <label>{t("register.phone")}</label>
                        <input
                            type="tel"
                            value={formData.phoneNumber}
                            onChange={(e) => handleChange("phoneNumber", e.target.value)}
                            placeholder="+380123456789"
                        />
                    </div>

                    <div className="input-group">
                        <label>{t("register.password")}</label>
                        <div className="password-input-wrapper">
                            <input
                                type={showPassword ? "text" : "password"}
                                value={formData.password}
                                onChange={(e) => handleChange("password", e.target.value)}
                                placeholder="••••••••"
                                required
                            />
                            <button
                                type="button"
                                className="password-toggle"
                                onClick={() => setShowPassword(!showPassword)}
                                aria-label={t("register.togglePassword")}
                            >
                                <img
                                    src={showPassword ? hiddenPassIcon : showPassIcon}
                                    alt={showPassword ? t("register.hide") : t("register.show")}
                                    className="password-icon"
                                />
                            </button>
                        </div>
                    </div>

                    <div className="input-group">
                        <label>{t("register.confirmPassword")}</label>
                        <div className="password-input-wrapper">
                            <input
                                type={showConfirmPassword ? "text" : "password"}
                                value={formData.confirmPassword}
                                onChange={(e) => handleChange("confirmPassword", e.target.value)}
                                placeholder="••••••••"
                                required
                            />
                            <button
                                type="button"
                                className="password-toggle"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                aria-label={t("register.toggleConfirmPassword")}
                            >
                                <img
                                    src={showConfirmPassword ? hiddenPassIcon : showPassIcon}
                                    alt={showConfirmPassword ? t("register.hide") : t("register.show")}
                                    className="password-icon"
                                />
                            </button>
                        </div>
                    </div>

                    {error && <p className="error">{error}</p>}
                    {success && <p className="success">{success}</p>}

                    <button className="btn-primary" type="submit">
                        {t("register.submit")}
                    </button>
                </form>

                <div className="link">
                    {t("register.alreadyHave")}{" "}
                    <button className="link-btn" onClick={() => navigate("/login")}>
                        {t("register.login")}
                    </button>
                </div>

                <div className="link">
                    <button className="link-btn" onClick={() => navigate("/")}>
                        ← {t("register.backHome")}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;
