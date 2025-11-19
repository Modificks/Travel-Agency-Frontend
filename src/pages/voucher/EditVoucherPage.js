import React, {useEffect, useState} from "react";
import {useNavigate, useParams} from "react-router-dom";
import "../styles/voucher/EditVoucherPage.css";
import {useAuthorizedFetch} from "../../api/UseAuthorizedFetch";
import {useLanguage} from "../../context/LanguageContext";

const TOUR_TYPES = ["HEALTH", "SPORTS", "LEISURE", "SAFARI", "WINE", "ECO", "ADVENTURE", "CULTURAL"];
const TRANSFER_TYPES = ["BUS", "TRAIN", "PLANE", "SHIP", "PRIVATE_CAR", "JEEPS", "MINIBUS", "ELECTRICAL_CARS"];
const HOTEL_TYPES = ["ONE_STAR", "TWO_STARS", "THREE_STARS", "FOUR_STARS", "FIVE_STARS"];

const EditVoucherPage = () => {
    const {voucherId} = useParams();
    const navigate = useNavigate();
    const authorizedFetch = useAuthorizedFetch();
    const {language, toggleLanguage, t} = useLanguage();

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        price: "",
        tourType: "",
        transferType: "",
        hotelType: "",
        arrivalDate: "",
        evictionDate: "",
        isHot: false
    });

    const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8080";

    useEffect(() => {
        const fetchVoucher = async () => {
            setLoading(true);
            setError(null);

            try {
                const res = await authorizedFetch(`${API_URL}/api/vouchers/${voucherId}`);

                if (!res.ok) {
                    setError(t("admin.errorLoadVoucher"));
                }

                const data = await res.json();

                setFormData({
                    title: data.title || "",
                    description: data.description || "",
                    price: data.price || "",
                    tourType: data.tourType || "",
                    transferType: data.transferType || "",
                    hotelType: data.hotelType || "",
                    arrivalDate: data.arrivalDate || "",
                    evictionDate: data.evictionDate || "",
                    isHot: data.isHot || false
                });
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        void fetchVoucher();
    }, [voucherId, authorizedFetch, t]);

    const handleChange = (e) => {
        const {name, value, type, checked} = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError(null);

        try {
            const res = await authorizedFetch(
                `${API_URL}/api/admin/vouchers/${voucherId}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(formData)
                }
            );

            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                const errorMessage = errorData.message || `Error: ${res.status}`;
                setError(errorMessage);
                setSubmitting(false);
                return;
            }

            navigate("/vouchers", {
                replace: true,
                state: { refresh: true, timestamp: Date.now() }
            });
        } catch (err) {
            setError(err.message);
            setSubmitting(false);
        }
    };

    const handleCancel = () => {
        navigate("/vouchers");
    };

    if (loading) {
        return (
            <div className="create-voucher-page">
                <button className="lang-button" onClick={toggleLanguage}>
                    {t(`language.${language}`)}
                </button>
                <p className="loading">{t("admin.loading")}</p>
            </div>
        );
    }

    return (
        <div className="create-voucher-page">
            <button className="lang-button" onClick={toggleLanguage}>
                {t(`language.${language}`)}
            </button>

            <div className="create-voucher-container">
                <h1 className="page-title">{t("admin.editVoucher")}</h1>

                {error && <p className="error-message">{error}</p>}

                <form onSubmit={handleSubmit} className="voucher-form">
                    <div className="form-grid">
                        <div className="form-group full-width">
                            <label htmlFor="title">{t("admin.fieldTitle")} *</label>
                            <input
                                type="text"
                                id="title"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-group full-width">
                            <label htmlFor="description">{t("admin.fieldDescription")} *</label>
                            <textarea
                                id="description"
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="price">{t("admin.fieldPrice")} *</label>
                            <input
                                type="number"
                                id="price"
                                name="price"
                                step="0.01"
                                min="0"
                                value={formData.price}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="tourType">{t("admin.fieldTourType")} *</label>
                            <select
                                id="tourType"
                                name="tourType"
                                value={formData.tourType}
                                onChange={handleChange}
                                required
                            >
                                <option value="">{t("admin.selectOption")}</option>
                                {TOUR_TYPES.map(type => (
                                    <option key={type} value={type}>{type}</option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label htmlFor="transferType">{t("admin.fieldTransferType")} *</label>
                            <select
                                id="transferType"
                                name="transferType"
                                value={formData.transferType}
                                onChange={handleChange}
                                required
                            >
                                <option value="">{t("admin.selectOption")}</option>
                                {TRANSFER_TYPES.map(type => (
                                    <option key={type} value={type}>{type}</option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label htmlFor="hotelType">{t("admin.fieldHotelType")} *</label>
                            <select
                                id="hotelType"
                                name="hotelType"
                                value={formData.hotelType}
                                onChange={handleChange}
                                required
                            >
                                <option value="">{t("admin.selectOption")}</option>
                                {HOTEL_TYPES.map(type => (
                                    <option key={type} value={type}>{type}</option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label htmlFor="arrivalDate">{t("admin.fieldArrivalDate")} *</label>
                            <input
                                type="date"
                                id="arrivalDate"
                                name="arrivalDate"
                                value={formData.arrivalDate}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="evictionDate">{t("admin.fieldEvictionDate")} *</label>
                            <input
                                type="date"
                                id="evictionDate"
                                name="evictionDate"
                                value={formData.evictionDate}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-group checkbox-group">
                            <label htmlFor="isHot" className="checkbox-label">
                                <input
                                    type="checkbox"
                                    id="isHot"
                                    name="isHot"
                                    checked={formData.isHot}
                                    onChange={handleChange}
                                />
                                <span>{t("admin.fieldIsHot")} 🔥</span>
                            </label>
                        </div>
                    </div>

                    <div className="form-actions">
                        <button
                            type="submit"
                            className="submit-btn"
                            disabled={submitting}
                        >
                            {submitting ? t("admin.updating") : t("admin.updateButton")}
                        </button>
                        <button
                            type="button"
                            className="cancel-btn"
                            onClick={handleCancel}
                            disabled={submitting}
                        >
                            {t("admin.cancel")}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditVoucherPage;
