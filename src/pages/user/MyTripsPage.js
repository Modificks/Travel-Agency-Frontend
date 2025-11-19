import React, {useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";
import "../styles/user/MyTripsPage.css";
import {useAuthorizedFetch} from "../../api/UseAuthorizedFetch";
import {useLanguage} from "../../context/LanguageContext";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8080";

const MyTripsPage = () => {
    const [vouchers, setVouchers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const navigate = useNavigate();
    const authorizedFetch = useAuthorizedFetch();
    const {language, toggleLanguage, t} = useLanguage();

    useEffect(() => {
        const fetchMyVouchers = async () => {
            setLoading(true);
            setError(null);

            try {
                const res = await authorizedFetch(`${API_URL}/api/users/me/vouchers`);

                if (res.status === 204) {
                    setVouchers([]);
                    return;
                }

                if (!res.ok) {
                    setError(t("myTrips.errorLoad", "Failed to load your vouchers"));
                    return;
                }

                const data = await res.json();
                setVouchers(data || []);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        void fetchMyVouchers();
    }, [authorizedFetch, t]);

    const handleBackClick = () => {
        navigate("/vouchers");
    };

    const handleVoucherClick = (id) => {
        navigate(`/vouchers/${id}`);
    };

    const formatDate = (dateString) => {
        const locale = language === "uk" ? "uk-UA" : "en-US";
        if (!dateString) return t("common.notAvailable", "N/A");
        const date = new Date(dateString);
        return date.toLocaleDateString(locale, {
            year: "numeric",
            month: "long",
            day: "numeric"
        });
    };

    return (
        <div className="my-trips-page">
            <button className="lang-button" onClick={toggleLanguage}>
                {t(`language.${language}`)}
            </button>

            <header className="trips-header">
                <button className="back-btn" onClick={handleBackClick}>
                    ← {t("myTrips.back")}
                </button>
                <h1 className="trips-title">{t("myTrips.title")}</h1>
            </header>

            {loading && <p className="loading">{t("myTrips.loading")}</p>}
            {error && <p className="error">{error}</p>}

            <div className="trips-list">
                {!loading && vouchers.length === 0 ? (
                    <div className="no-trips">
                        <p>{t("myTrips.noTrips")}</p>
                    </div>
                ) : (
                    vouchers.map((v) => (
                        <button
                            className="trip-card"
                            key={v.id}
                            onClick={() => handleVoucherClick(v.id)}
                        >
                            <div className="trip-header">
                                <h3 className="trip-title">
                                    {v.title}
                                    {v.isHot && <span className="hot-badge">{t("myTrips.hot")}</span>}
                                </h3>
                                <span className="trip-price">${v.price?.toFixed(2)}</span>
                            </div>

                            <div className="trip-details">
                                <div className="detail-row">
                                    <span className="detail-label">📅 {t("myTrips.arrival")}:</span>
                                    <span className="detail-value">{formatDate(v.arrivalDate)}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="detail-label">🏖️ {t("myTrips.tourType")}:</span>
                                    <span className="detail-value">{v.tourType}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="detail-label">🚗 {t("myTrips.transfer")}:</span>
                                    <span className="detail-value">{v.transferType}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="detail-label">🏨 {t("myTrips.hotel")}:</span>
                                    <span className="detail-value">{v.hotelType}</span>
                                </div>
                                {v.duration && (
                                    <div className="detail-row">
                                        <span className="detail-label">⏱️ {t("myTrips.duration")}:</span>
                                        <span className="detail-value">{v.duration} {t("myTrips.days")}</span>
                                    </div>
                                )}
                            </div>

                            {v.description && (
                                <p className="trip-description">{v.description}</p>
                            )}

                            <div className="trip-status">
                                <span className={`status-badge status-${v.voucherStatus?.toLowerCase()}`}>
                                    {v.voucherStatus || t("myTrips.statusActive", "ACTIVE")}
                                </span>
                            </div>
                        </button>
                    ))
                )}
            </div>
        </div>
    );
};

export default MyTripsPage;
