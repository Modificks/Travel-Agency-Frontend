import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useLanguage } from "../../context/LanguageContext";

import hiddenPassIcon from "../../assets/icons/hidden_pass.png";
import showPassIcon from "../../assets/icons/show_pass.png";

import "../styles/user/ResetPasswordPage.css";

const ResetPasswordPage = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const { language, toggleLanguage, t } = useLanguage();

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const token = searchParams.get("token");

    const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8080";

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        if (!token) {
            setError(t("resetPassword.noToken"));
            return;
        }

        if (password !== confirmPassword) {
            setError(t("resetPassword.passwordsMismatch"));
            return;
        }

        if (password.length < 4) {
            setError(t("resetPassword.passwordTooShort"));
            return;
        }

        setIsSubmitting(true);

        try {
            const response = await fetch(
                `${API_URL}/api/users/me/password-reset/confirm`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Accept-Language": language,
                    },
                    credentials: "include",
                    body: JSON.stringify({
                        code: token,
                        newPassword: password,
                        confirmPassword: confirmPassword,
                    }),
                }
            );

            if (!response.ok) {
                let errorMsg = t("resetPassword.errorDefault");

                try {
                    const errData = await response.json();
                    errorMsg = errData.message || errorMsg;
                } catch {
                    const errText = await response.text();
                    errorMsg = errText || errorMsg;
                }

                setError(errorMsg);
                setIsSubmitting(false);
                return;
            }

            setSuccess(t("resetPassword.success"));
            setTimeout(() => navigate("/login"), 2000);

        } catch (err) {
            setError(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    let submitButtonText = t("resetPassword.submit");

    if (success) {
        submitButtonText = t("resetPassword.redirecting");
    } else if (isSubmitting) {
        submitButtonText = t("resetPassword.submitting");
    }

    if (!token) {
        return (
            <div className="reset-password-page">
                <button className="lang-button" onClick={toggleLanguage}>
                    {t(`language.${language}`)}
                </button>

                <div className="reset-password-container">
                    <h2 className="page-title">{t("resetPassword.invalidLinkTitle")}</h2>

                    <p className="error-message">{t("resetPassword.noToken")}</p>

                    <button className="back-btn" onClick={() => navigate("/login")}>
                        {t("resetPassword.backToLogin")}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="reset-password-page">
            <button className="lang-button" onClick={toggleLanguage}>
                {t(`language.${language}`)}
            </button>

            <div className="reset-password-container">
                <h2 className="page-title">{t("resetPassword.title")}</h2>

                <form className="reset-password-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>{t("resetPassword.newPassword")}</label>

                        <div className="password-input-wrapper">
                            <input
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                disabled={isSubmitting || success}
                                required
                            />

                            <button
                                type="button"
                                className="password-toggle"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                <img
                                    src={showPassword ? hiddenPassIcon : showPassIcon}
                                    alt={showPassword ? t("register.hide") : t("register.show")}
                                    className="password-icon"
                                />
                            </button>
                        </div>
                    </div>

                    <div className="form-group">
                        <label>{t("resetPassword.confirmPassword")}</label>

                        <div className="password-input-wrapper">
                            <input
                                type={showConfirmPassword ? "text" : "password"}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="••••••••"
                                disabled={isSubmitting || success}
                                required
                            />

                            <button
                                type="button"
                                className="password-toggle"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            >
                                <img
                                    src={showConfirmPassword ? hiddenPassIcon : showPassIcon}
                                    alt={showConfirmPassword ? t("register.hide") : t("register.show")}
                                    className="password-icon"
                                />
                            </button>
                        </div>
                    </div>

                    {error && <p className="error-message">{error}</p>}
                    {success && <p className="success-message">{success}</p>}

                    <div className="form-actions">
                        <button type="submit" className="submit-btn" disabled={isSubmitting || success}>
                            {submitButtonText}
                        </button>

                        <button
                            type="button"
                            className="cancel-btn"
                            onClick={() => navigate("/login")}
                            disabled={isSubmitting || success}
                        >
                            {t("resetPassword.cancel")}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ResetPasswordPage;
