import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuthorizedFetch } from "../../api/UseAuthorizedFetch";
import { useLanguage } from "../../context/LanguageContext";
import "../styles/admin/AdminUserVouchersPage.css";

const AdminUserVouchersPage = () => {
    const { userId } = useParams();
    const navigate = useNavigate();
    const { t, language, toggleLanguage } = useLanguage();
    const authorizedFetch = useAuthorizedFetch();

    const [vouchers, setVouchers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchVouchers = async () => {
            try {
                const response = await authorizedFetch(`/api/admin/users/${userId}/vouchers`);

                if (response.status === 204) {
                    setVouchers([]);
                } else if (response.ok) {
                    const data = await response.json();
                    setVouchers(data);
                } else {
                    setError(t("errors.failedToLoad"));
                }
            } catch (err) {
                console.error(err);
                setError(t("errors.networkError"));
            } finally {
                setLoading(false);
            }
        };

        void fetchVouchers();
    }, [userId, authorizedFetch, t]);

    if (loading) return (
        <div className="admin-vouchers-container">
            <div className="loading-text">{t("users.loading")}</div>
        </div>
    );

    return (
        <div className="admin-vouchers-container">
            <button className="lang-button" onClick={toggleLanguage}>
                {t(`language.${language}`)}
            </button>

            <div className="admin-card">
                <div className="admin-header">
                    <h1 className="admin-title">{t("admin.userVouchers")}</h1>
                    <h2 className="admin-subtitle">User ID: {userId}</h2>
                </div>

                {error && <p className="error-text">{error}</p>}

                {vouchers.length === 0 && !error ? (
                    <p className="info-text">{t("admin.noVouchersFound")}</p>
                ) : (
                    <div className="table-responsive">
                        <table className="voucher-table">
                            <thead>
                            <tr>
                                <th>{t("admin.voucherId")}</th>
                                <th>{t("admin.voucherDestination")}</th>
                                <th>{t("admin.voucherPrice")}</th>
                                <th>{t("admin.voucherStartDate")}</th>
                                <th>{t("admin.voucherEndDate")}</th>
                            </tr>
                            </thead>
                            <tbody>
                            {vouchers.map(v => (
                                <tr key={v.id}>
                                    <td>{v.id}</td>
                                    <td>{v.title}</td>
                                    <td className="price-cell">${v.price}</td>
                                    <td>{v.arrivalDate}</td>
                                    <td>{v.evictionDate}</td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                )}

                <button className="back-btn" onClick={() => navigate(-1)}>
                    {t("admin.back")}
                </button>
            </div>
        </div>
    );
};

export default AdminUserVouchersPage;
