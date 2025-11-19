import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/admin/AdminPage.css";
import { useLanguage } from "../../context/LanguageContext";
import { useAuth } from "../../context/AuthContext";

const AdminPanelPage = () => {
    const navigate = useNavigate();
    const { t, language, toggleLanguage } = useLanguage();
    const { isAdmin, loading } = useAuth();

    if (loading) return <p>Loading...</p>;

    if (!isAdmin) {
        navigate("/vouchers");
        return null;
    }

    return (
        <div className="admin-container">
            <button className="lang-button" onClick={toggleLanguage}>
                {t(`language.${language}`)}
            </button>

            <div className="admin-card">
                <h1 className="admin-title">{t("admin.title")}</h1>

                <div className="admin-buttons">
                    <button className="admin-btn" onClick={() => navigate("/admin/create-voucher")}>
                        {t("admin.createVoucher")}
                    </button>

                    <button className="admin-btn secondary" onClick={() => navigate("/admin/users")}>
                        {t("admin.findUser")}
                    </button>
                </div>

                <button className="back-btn" onClick={() => navigate("/vouchers")}>
                    {t("admin.backToHome")}
                </button>
            </div>
        </div>
    );
};

export default AdminPanelPage;
