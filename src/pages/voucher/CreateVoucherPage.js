import React, {useState} from "react";
import {useNavigate} from "react-router-dom";
import "../styles/voucher/CreateVoucherPage.css";
import {useLanguage} from "../../context/LanguageContext";
import {useAuth} from "../../context/AuthContext";
import {useAuthorizedFetch} from "../../api/UseAuthorizedFetch";

const TOUR_TYPES = ["HEALTH", "SPORTS", "LEISURE", "SAFARI", "WINE", "ECO", "ADVENTURE", "CULTURAL"];
const TRANSFER_TYPES = ["BUS", "TRAIN", "PLANE", "SHIP", "PRIVATE_CAR", "JEEPS", "MINIBUS", "ELECTRICAL_CARS"];
const HOTEL_TYPES = ["ONE_STAR", "TWO_STARS", "THREE_STARS", "FOUR_STARS", "FIVE_STARS"];

const CreateVoucherPage = () => {
    const navigate = useNavigate();
    const {t, language, toggleLanguage} = useLanguage();
    const {isAdmin, loading} = useAuth();
    const authorizedFetch = useAuthorizedFetch();

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

    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8080";

    if (loading) {
        return <p className="loading">Loading...</p>;
    }

    if (!isAdmin) {
        navigate("/vouchers");
        return null;
    }

    const handleChange = (e) => {
        const {name, value, type, checked} = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccessMessage("");
        setSubmitting(true);

        try {
            const voucherData = {
                ...formData,
                price: Number.parseFloat(formData.price)
            };

            const response = await authorizedFetch(
                `${API_URL}/api/admin/vouchers/create`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(voucherData)
                }
            );

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                setError(errorData.message);
                return;
            }

            setFormData({
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

            setSuccessMessage(t("admin.voucherCreated"));

        } catch (err) {
            setError(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="create-voucher-page">
            <button className="lang-button" onClick={toggleLanguage}>
                {t(`language.${language}`)}
            </button>

            <div className="create-voucher-container">
                <h1 className="page-title">{t("admin.createVoucherTitle")}</h1>

                <form className="voucher-form" onSubmit={handleSubmit}>
                    <div className="form-grid">
                        <div className="form-group">
                            <label htmlFor="title">{t("admin.voucherTitle")}</label>
                            <input
                                type="text"
                                id="title"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                placeholder={t("admin.titlePlaceholder")}
                                required
                            />
                        </div>

                        <div className="form-group full-width">
                            <label htmlFor="description">{t("admin.description")}</label>
                            <textarea
                                id="description"
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                placeholder={t("admin.descriptionPlaceholder")}
                                rows="4"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="price">{t("admin.price")}</label>
                            <input
                                type="number"
                                step="0.01"
                                id="price"
                                name="price"
                                value={formData.price}
                                onChange={handleChange}
                                placeholder="0.00"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="tourType">{t("admin.tourType")}</label>
                            <select
                                id="tourType"
                                name="tourType"
                                value={formData.tourType}
                                onChange={handleChange}
                                required
                            >
                                <option value="">{t("admin.select")}</option>
                                {TOUR_TYPES.map(type => (
                                    <option key={type} value={type}>{type}</option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label htmlFor="transferType">{t("admin.transferType")}</label>
                            <select
                                id="transferType"
                                name="transferType"
                                value={formData.transferType}
                                onChange={handleChange}
                                required
                            >
                                <option value="">{t("admin.select")}</option>
                                {TRANSFER_TYPES.map(type => (
                                    <option key={type} value={type}>{type}</option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label htmlFor="hotelType">{t("admin.hotelType")}</label>
                            <select
                                id="hotelType"
                                name="hotelType"
                                value={formData.hotelType}
                                onChange={handleChange}
                                required
                            >
                                <option value="">{t("admin.select")}</option>
                                {HOTEL_TYPES.map(type => (
                                    <option key={type} value={type}>{type}</option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label htmlFor="arrivalDate">{t("admin.arrivalDate")}</label>
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
                            <label htmlFor="evictionDate">{t("admin.evictionDate")}</label>
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
                            <label className="checkbox-label">
                                <input
                                    type="checkbox"
                                    name="isHot"
                                    checked={formData.isHot}
                                    onChange={handleChange}
                                />
                                <span>{t("admin.isHot")}</span>
                            </label>
                        </div>
                    </div>

                    {error && <p className="error-message">{error}</p>}
                    {successMessage && (
                        <p className="success-message" style={{color: "green", textAlign: "center", margin: "10px 0"}}>
                            {successMessage}
                        </p>
                    )}

                    <div className="form-actions">
                        <button type="submit" className="submit-btn" disabled={submitting}>
                            {submitting ? t("admin.creating") : t("admin.create")}
                        </button>
                        <button type="button" className="cancel-btn" onClick={() => navigate("/admin")}>
                            {t("admin.cancel")}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateVoucherPage;
