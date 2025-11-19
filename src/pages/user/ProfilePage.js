import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../../context/LanguageContext";
import { useFetchWithLang } from "../../api/FetchWithLang";
import "../styles/user/ProfilePage.css";

const ProfilePage = () => {
    const [user, setUser] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        email: "",
        name: "",
        surname: "",
        phoneNumber: ""
    });
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [isSending, setIsSending] = useState(false);
    const navigate = useNavigate();
    const { language, toggleLanguage, t } = useLanguage();
    const fetchWithLang = useFetchWithLang();

    const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8080";

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await fetchWithLang(`${API_URL}/api/users/me`);

                if (response.status === 401) {
                    navigate("/login");
                    return;
                }
                if (!response.ok) {
                    setError("Failed to fetch user data.");
                    return;
                }

                const data = await response.json();
                setUser(data);
                setFormData({
                    email: data.email || "",
                    name: data.name || "",
                    surname: data.surname || "",
                    phoneNumber: data.phoneNumber || ""
                });
            } catch (err) {
                if (err instanceof Error) {
                    setError(err.message);
                } else {
                    setError("An unexpected error occurred");
                }
            }
        };

        void fetchUser();
    }, [navigate, fetchWithLang]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setMessage("");
        setError("");

        try {
            const response = await fetchWithLang(`${API_URL}/api/users/me/update`, {
                method: "PUT",
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => null);
                setError(errorData?.message || "Failed to update profile.");
                return;
            }

            const updatedUser = await response.json();
            setUser(updatedUser);
            setIsEditing(false);
            setMessage(t("profile.successUpdate"));
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError("An unexpected error occurred");
            }
        }
    };

    const handleCancelEdit = () => {
        if (user) {
            setFormData({
                email: user.email || "",
                name: user.name || "",
                surname: user.surname || "",
                phoneNumber: user.phoneNumber || ""
            });
        }
        setIsEditing(false);
        setError("");
    };

    const handleInitiatePasswordReset = async () => {
        setMessage("");
        setError("");
        setIsSending(true);

        try {
            const response = await fetchWithLang(`${API_URL}/api/users/me/password-reset/initiate`, {
                method: "POST",
            });

            if (!response.ok) {
                const errorText = await response.text();
                setError(errorText || "Failed to send reset link.");
                return;
            }

            setMessage(t("profile.success"));
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError("An unexpected error occurred");
            }
        } finally {
            setIsSending(false);
        }
    };

    if (!user) {
        return (
            <div className="profile-body">
                <div className="profile-loading">{t("profile.loading")}</div>
            </div>
        );
    }

    return (
        <div className="profile-body">
            <button className="lang-button" onClick={toggleLanguage}>
                {t(`language.${language}`)}
            </button>

            <div className="profile-container">
                <h2 className="profile-title">{t("profile.title")}</h2>

                <div className="balance-section">
                    <div className="balance-label">{t("profile.balance")}</div>
                    <div className="balance-amount">${user.balance?.toFixed(2) || "0.00"}</div>
                </div>

                <form onSubmit={handleUpdateProfile} className="profile-form">
                    <div className="form-group">
                        <label htmlFor="email">{t("profile.email")}</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="name">{t("profile.name")}</label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="surname">{t("profile.surname")}</label>
                        <input
                            type="text"
                            id="surname"
                            name="surname"
                            value={formData.surname}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="phoneNumber">{t("profile.phone")}</label>
                        <input
                            type="tel"
                            id="phoneNumber"
                            name="phoneNumber"
                            value={formData.phoneNumber}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                            required
                        />
                    </div>

                    {isEditing ? (
                        <div className="button-group">
                            <button type="submit" className="btn btn-primary">
                                {t("profile.save")}
                            </button>
                            <button type="button" className="btn btn-secondary" onClick={handleCancelEdit}>
                                {t("profile.cancel")}
                            </button>
                        </div>
                    ) : (
                        <button type="button" className="btn btn-primary" onClick={() => setIsEditing(true)}>
                            {t("profile.edit")}
                        </button>
                    )}
                </form>

                <hr className="divider" />

                <div className="password-section">
                    <h3 className="section-title">{t("profile.changePassword")}</h3>
                    <p className="section-description">
                        {t("profile.resetDescription")}
                    </p>
                    <button
                        className="btn btn-outline"
                        onClick={handleInitiatePasswordReset}
                        disabled={isSending}
                    >
                        {isSending ? t("profile.send") : t("profile.sendReset")}
                    </button>
                </div>

                {message && <div className="alert alert-success">{message}</div>}
                {error && <div className="alert alert-error">{error}</div>}
            </div>
        </div>
    );
};

export default ProfilePage;
