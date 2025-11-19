import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuthorizedFetch } from "../../api/UseAuthorizedFetch";
import { useLanguage } from "../../context/LanguageContext";
import "../styles/voucher/VoucherDetailsPage.css";

const VoucherDetailsPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const authorizedFetch = useAuthorizedFetch();
    const { t } = useLanguage();

    const [voucher, setVoucher] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8080";

    useEffect(() => {
        const fetchVoucher = async () => {
            try {
                const res = await authorizedFetch(`${API_URL}/api/vouchers/${id}`);
                if (!res.ok) setError(t("voucherDetails.notFound", "Voucher not found"));
                const data = await res.json();
                setVoucher(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        void fetchVoucher();
    }, [id, authorizedFetch, t]);

    if (loading) return <div className="loading">{t("voucherDetails.loading")}</div>;
    if (error) return <div className="error">{error}</div>;

    return (
        <div className="voucher-details-page">
            <button className="back-btn" onClick={() => navigate("/vouchers")}>← {t("voucherDetails.back")}</button>
            <h1 className="voucher-details-title">{voucher.title}</h1>
            <p className="voucher-description">{voucher.description}</p>

            <div className="voucher-info">
                <p><strong>{t("voucherDetails.price")}:</strong> ${voucher.price.toFixed(2)}</p>
                <p><strong>{t("voucherDetails.tourType")}:</strong> {voucher.tourType}</p>
                <p><strong>{t("voucherDetails.transferType")}:</strong> {voucher.transferType}</p>
                <p><strong>{t("voucherDetails.hotelType")}:</strong> {voucher.hotelType}</p>
                <p><strong>{t("voucherDetails.status")}:</strong> {voucher.status}</p>
                <p><strong>{t("voucherDetails.arrival")}:</strong> {voucher.arrivalDate}</p>
                <p><strong>{t("voucherDetails.eviction")}:</strong> {voucher.evictionDate}</p>
                {voucher.isHot && <p className="hot-badge">{t("voucherDetails.hot")}</p>}
            </div>
        </div>
    );
};

export default VoucherDetailsPage;
