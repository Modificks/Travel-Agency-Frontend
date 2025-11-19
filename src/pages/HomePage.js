import React, {useEffect, useState, useMemo} from "react";
import {useNavigate, useSearchParams} from "react-router-dom";
import "./styles/HomePage.css";
import {useAuthorizedFetch} from "../api/UseAuthorizedFetch";
import {useLanguage} from "../context/LanguageContext";
import {useAuth} from "../context/AuthContext";

const TOUR_TYPES = ["HEALTH", "SPORTS", "LEISURE", "SAFARI", "WINE", "ECO", "ADVENTURE", "CULTURAL"];
const TRANSFER_TYPES = ["BUS", "TRAIN", "PLANE", "SHIP", "PRIVATE_CAR", "JEEPS", "MINIBUS", "ELECTRICAL_CARS"];
const HOTEL_TYPES = ["ONE_STAR", "TWO_STARS", "THREE_STARS", "FOUR_STARS", "FIVE_STARS"];
const VOUCHER_STATUSES = ["REGISTERED", "PAID", "CANCELED"];

const PAGE_SIZE = 10;

const HomePage = () => {
    const [vouchers, setVouchers] = useState([]);
    const [totalPages, setTotalPages] = useState(0);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [orderingVoucherId, setOrderingVoucherId] = useState(null);
    const [deletingVoucherId, setDeletingVoucherId] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [voucherToDelete, setVoucherToDelete] = useState(null);

    const [showStatusModal, setShowStatusModal] = useState(false);
    const [voucherToUpdateStatus, setVoucherToUpdateStatus] = useState(null);
    const [newStatus, setNewStatus] = useState("");
    const [managerActionError, setManagerActionError] = useState(null);
    const [managerActionLoadingId, setManagerActionLoadingId] = useState(null);

    const navigate = useNavigate();
    const authorizedFetch = useAuthorizedFetch();
    const {language, toggleLanguage, t} = useLanguage();
    const {isAdmin, isManager} = useAuth();

    const [searchParams, setSearchParams] = useSearchParams();
    const page = useMemo(() => Number(searchParams.get("page")) || 0, [searchParams]);

    const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8080";

    const sort = useMemo(() => ({
        field: searchParams.get("sortField") || "title",
        direction: searchParams.get("sortDirection") || "ASC"
    }), [searchParams]);

    const filters = useMemo(() => ({
        title: searchParams.get("title") || "",
        minPrice: searchParams.get("minPrice") || "",
        maxPrice: searchParams.get("maxPrice") || "",
        tourType: searchParams.get("tourType") || "",
        transferType: searchParams.get("transferType") || "",
        hotelType: searchParams.get("hotelType") || ""
    }), [searchParams]);

    useEffect(() => {
        const fetchVouchers = async () => {
            setLoading(true);
            setError(null);

            const params = new URLSearchParams();
            params.append("page", page);
            params.append("size", PAGE_SIZE);
            params.append("sort", `${sort.field},${sort.direction}`);

            Object.keys(filters).forEach(key => {
                if (filters[key]) {
                    params.append(key, filters[key]);
                }
            });

            try {
                const res = await authorizedFetch(`${API_URL}/api/vouchers?${params.toString()}`);

                if (res.status === 204) {
                    setVouchers([]);
                    setTotalPages(0);
                } else if (!res.ok) {
                    setError(t("home.errorLoad"));
                } else {
                    const data = await res.json();
                    setVouchers(data.content || []);
                    setTotalPages(data.totalPages || 0);
                }
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        void fetchVouchers();
    }, [authorizedFetch, searchParams, page, sort, filters, t]);

    const handleParamChange = (newParams) => {
        const allParams = new URLSearchParams(searchParams);

        for (const [key, value] of Object.entries(newParams)) {
            if (value) {
                allParams.set(key, value);
            } else {
                allParams.delete(key);
            }
        }

        if (!("page" in newParams)) {
            allParams.set("page", "0");
        }

        setSearchParams(allParams);
    };

    const handleFilterChange = (e) => {
        const {name, value} = e.target;
        handleParamChange({[name]: value});
    };

    const handleSortChange = (e) => {
        const {name, value} = e.target;
        handleParamChange({[name]: value});
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 0 && newPage < totalPages) {
            handleParamChange({page: newPage});
        }
    };

    const handleProfileClick = () => {
        navigate("/me");
    };

    const handleMyTripsClick = () => {
        navigate("/my-trips");
    };

    const handleVoucherClick = (id) => {
        navigate(`/vouchers/${id}`);
    };

    const handleOrderVoucher = async (e, voucherId) => {
        e.stopPropagation();

        setOrderingVoucherId(voucherId);
        setError(null);

        try {
            const res = await authorizedFetch(
                `${API_URL}/api/vouchers/${voucherId}/order`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    }
                }
            );

            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                setError(errorData.message);
            }

            const updatedVoucher = await res.json();

            setVouchers(prevVouchers =>
                prevVouchers.map(v => v.id === voucherId ? updatedVoucher : v)
            );

        } catch (err) {
            setError(err.message);
        } finally {
            setOrderingVoucherId(null);
        }
    };

    const openDeleteModal = (e, voucher) => {
        e.stopPropagation();
        setVoucherToDelete(voucher);
        setShowDeleteModal(true);
    };

    const closeDeleteModal = () => {
        setShowDeleteModal(false);
        setVoucherToDelete(null);
    };

    const confirmDelete = async () => {
        if (!voucherToDelete) return;

        setDeletingVoucherId(voucherToDelete.id);
        setError(null);

        try {
            const res = await authorizedFetch(
                `${API_URL}/api/admin/vouchers/${voucherToDelete.id}/delete`,
                {
                    method: "DELETE"
                }
            );

            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                setError(errorData.message || t("admin.errorDelete"));
            }

            setVouchers(prevVouchers => prevVouchers.filter(v => v.id !== voucherToDelete.id));
            closeDeleteModal();

        } catch (err) {
            setError(err.message);
        } finally {
            setDeletingVoucherId(null);
        }
    };

    const handleUpdateVoucher = (e, voucherId) => {
        e.stopPropagation();
        navigate(`/admin/vouchers/edit/${voucherId}`);
    };

    const handleChangeHotStatus = async (e, voucherId, currentIsHot) => {
        e.stopPropagation();
        setManagerActionLoadingId(voucherId);
        setManagerActionError(null);

        try {
            const res = await authorizedFetch(
                `${API_URL}/api/manager/vouchers/${voucherId}/hot?isHot=${!currentIsHot}`,
                {
                    method: "PATCH",
                    headers: {"Content-Type": "application/json"}
                }
            );

            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                setError(errorData.message);
            }

        } catch (err) {
            setManagerActionError(err.message);
            setError(err.message);
        } finally {
            setManagerActionLoadingId(null);
        }
    };

    const openStatusModal = (e, voucher) => {
        e.stopPropagation();
        setVoucherToUpdateStatus(voucher);
        setNewStatus(voucher.voucherStatus || VOUCHER_STATUSES[0]);
        setShowStatusModal(true);
        setManagerActionError(null);
    };

    const closeStatusModal = () => {
        setShowStatusModal(false);
        setVoucherToUpdateStatus(null);
        setNewStatus("");
        setManagerActionError(null);
    };

    const confirmChangeStatus = async () => {
        if (!voucherToUpdateStatus || !newStatus) return;

        setManagerActionLoadingId(voucherToUpdateStatus.id);
        setManagerActionError(null);

        try {
            const res = await authorizedFetch(
                `${API_URL}/api/manager/vouchers/${voucherToUpdateStatus.id}/status`,
                {
                    method: "PATCH",
                    headers: {"Content-Type": "application/json"},
                    body: JSON.stringify({newStatus: newStatus})
                }
            );

            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                setError(errorData.message);
            }

            const updatedVoucher = await res.json();
            setVouchers(prev => prev.map(v => v.id === updatedVoucher.id ? updatedVoucher : v));
            closeStatusModal();

        } catch (err) {
            setManagerActionError(err.message);
        } finally {
            setManagerActionLoadingId(null);
        }
    };


    return (
        <div className="home-page">
            <button className="lang-button" onClick={toggleLanguage}>
                {t(`language.${language}`)}
            </button>

            <header className="home-header">
                <h1 className="home-title">{t("home.title")}</h1>
                <div className="header-buttons">
                    {isAdmin && (
                        <button className="admin-btn" onClick={() => navigate("/admin")}>
                            {t("home.adminPanel")}
                        </button>
                    )}
                    <button className="my-trips-btn" onClick={handleMyTripsClick}>
                        {t("home.myTrips")}
                    </button>
                    <button className="profile-btn" onClick={handleProfileClick}>
                        {t("home.profile")}
                    </button>
                </div>
            </header>

            <div className="controls-panel">
                <div className="filter-grid">
                    <div className="control-group">
                        <label htmlFor="title">{t("home.filterTitle")}</label>
                        <input type="text" id="title" name="title" value={filters.title} onChange={handleFilterChange}
                               placeholder={t("home.placeholderTitle")}/>
                    </div>
                    <div className="control-group">
                        <label htmlFor="minPrice">{t("home.filterMinPrice")}</label>
                        <input type="number" id="minPrice" name="minPrice" value={filters.minPrice}
                               onChange={handleFilterChange} placeholder={t("home.placeholderMinPrice")}/>
                    </div>
                    <div className="control-group">
                        <label htmlFor="maxPrice">{t("home.filterMaxPrice")}</label>
                        <input type="number" id="maxPrice" name="maxPrice" value={filters.maxPrice}
                               onChange={handleFilterChange} placeholder={t("home.placeholderMaxPrice")}/>
                    </div>
                    <div className="control-group">
                        <label htmlFor="tourType">{t("home.filterTourType")}</label>
                        <select id="tourType" name="tourType" value={filters.tourType} onChange={handleFilterChange}>
                            <option value="">{t("home.optionAll")}</option>
                            {TOUR_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
                        </select>
                    </div>
                    <div className="control-group">
                        <label htmlFor="transferType">{t("home.filterTransferType")}</label>
                        <select id="transferType" name="transferType" value={filters.transferType}
                                onChange={handleFilterChange}>
                            <option value="">{t("home.optionAll")}</option>
                            {TRANSFER_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
                        </select>
                    </div>
                    <div className="control-group">
                        <label htmlFor="hotelType">{t("home.filterHotelType")}</label>
                        <select id="hotelType" name="hotelType" value={filters.hotelType} onChange={handleFilterChange}>
                            <option value="">{t("home.optionAll")}</option>
                            {HOTEL_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
                        </select>
                    </div>
                </div>

                <div className="sort-controls">
                    <div className="control-group">
                        <label htmlFor="sortField">{t("home.sortBy")}</label>
                        <select id="sortField" name="sortField" value={sort.field} onChange={handleSortChange}>
                            <option value="title">{t("home.optionSortTitle")}</option>
                            <option value="price">{t("home.optionSortPrice")}</option>
                            <option value="arrivalDate">{t("home.optionSortArrival")}</option>
                            <option value="isHot">{t("home.optionSortHot")}</option>
                        </select>
                    </div>
                    <div className="control-group">
                        <label htmlFor="sortDirection">{t("home.sortDirection")}</label>
                        <select id="sortDirection" name="sortDirection" value={sort.direction}
                                onChange={handleSortChange}>
                            <option value="ASC">{t("home.optionDirAsc")}</option>
                            <option value="DESC">{t("home.optionDirDesc")}</option>
                        </select>
                    </div>
                </div>
            </div>

            {error && <p className="error">{error}</p>}
            {loading && <p className="loading">{t("home.loading")}</p>}

            <div className="voucher-list">
                {!loading && vouchers.length === 0 ? (
                    <p className="no-vouchers">{t("home.noVouchers")}</p>
                ) : (
                    vouchers.map((v) => (
                        <div
                            className="voucher-card"
                            key={v.id}
                        >
                            <div
                                className="voucher-content"
                                onClick={() => handleVoucherClick(v.id)}
                            >
                                <div className="voucher-header">
                                    <h3 className="voucher-title">
                                        {v.title}{" "}
                                        {v.isHot && <span className="hot-icon">🔥</span>}
                                    </h3>
                                </div>
                                <p className="voucher-description">{v.description}</p>
                                <p className="voucher-price">${v.price?.toFixed(2)}</p>
                            </div>

                            <button
                                className="order-btn"
                                onClick={(e) => handleOrderVoucher(e, v.id)}
                                disabled={orderingVoucherId === v.id}
                            >
                                {orderingVoucherId === v.id ? t("home.ordering") : t("home.order")}
                            </button>

                            {isManager && (
                                <div className="manager-actions-wrapper">
                                    <span className="actions-label">{t("manager.actionsLabel")}</span>
                                    <div className="manager-actions">
                                        <button
                                            className="manager-hot-btn"
                                            onClick={(e) => handleChangeHotStatus(e, v.id, v.isHot)}
                                            disabled={managerActionLoadingId === v.id}
                                        >
                                            {v.isHot ? t("manager.removeHot") : t("manager.setHot")}
                                        </button>
                                        <button
                                            className="manager-status-btn"
                                            onClick={(e) => openStatusModal(e, v)}
                                            disabled={managerActionLoadingId === v.id}
                                        >
                                            {t("manager.changeStatus")}
                                        </button>
                                    </div>
                                </div>
                            )}

                            {isAdmin && (
                                <div className="admin-actions-wrapper">
                                    <span className="actions-label">{t("admin.actionsLabel")}</span>
                                    <div className="admin-actions">
                                        <button
                                            className="update-btn"
                                            onClick={(e) => handleUpdateVoucher(e, v.id)}
                                        >
                                            {t("admin.update")}
                                        </button>
                                        <button
                                            className="delete-btn"
                                            onClick={(e) => openDeleteModal(e, v)}
                                            disabled={deletingVoucherId === v.id}
                                        >
                                            {deletingVoucherId === v.id ? t("admin.deleting") : t("admin.delete")}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>

            {totalPages > 1 && (
                <div className="pagination-controls">
                    <button
                        className="pagination-btn"
                        onClick={() => handlePageChange(page - 1)}
                        disabled={page === 0 || loading}
                    >
                        {t("home.paginationPrevious")}
                    </button>
                    <span className="page-info">
                        {t("home.paginationPage")} {page + 1} {t("home.paginationOf")} {totalPages}
                    </span>
                    <button
                        className="pagination-btn"
                        onClick={() => handlePageChange(page + 1)}
                        disabled={page >= totalPages - 1 || loading}
                    >
                        {t("home.paginationNext")}
                    </button>
                </div>
            )}

            {showDeleteModal && (
                <div className="modal-overlay" onClick={closeDeleteModal}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h2 className="modal-title">{t("admin.confirmDeleteTitle")}</h2>
                        <p className="modal-message">
                            {t("admin.confirmDelete")}
                        </p>
                        {voucherToDelete && (
                            <div className="modal-voucher-info">
                                <strong>{voucherToDelete.title}</strong>
                                <span>${voucherToDelete.price?.toFixed(2)}</span>
                            </div>
                        )}
                        <div className="modal-actions">
                            <button className="modal-cancel-btn" onClick={closeDeleteModal}>
                                {t("admin.cancel")}
                            </button>
                            <button className="modal-delete-btn" onClick={confirmDelete} disabled={deletingVoucherId}>
                                {deletingVoucherId ? t("admin.deleting") : t("admin.confirmDeleteBtn")}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showStatusModal && (
                <div className="modal-overlay" onClick={closeStatusModal}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h2 className="modal-title">{t("manager.modalTitle")}</h2>
                        {voucherToUpdateStatus && (
                            <div className="modal-voucher-info">
                                <strong>{voucherToUpdateStatus.title}</strong>
                                <p>{t("manager.currentStatus")}: {voucherToUpdateStatus.voucherStatus || "N/A"}</p>
                            </div>
                        )}

                        {managerActionError && <p className="error-message">{managerActionError}</p>}

                        <div className="form-group">
                            <label htmlFor="newStatus">{t("manager.selectNewStatus")}</label>
                            <select
                                id="newStatus"
                                value={newStatus}
                                onChange={(e) => setNewStatus(e.target.value)}
                                style={{width: "100%", padding: "8px", border: "1px solid #ccc", borderRadius: "4px"}}
                            >
                                {VOUCHER_STATUSES.map(status => (
                                    <option key={status} value={status}>{status}</option>
                                ))}
                            </select>
                        </div>

                        <div className="modal-actions">
                            <button className="modal-cancel-btn" onClick={closeStatusModal}>
                                {t("admin.cancel")}
                            </button>
                            <button
                                className="modal-confirm-btn"
                                onClick={confirmChangeStatus}
                                disabled={managerActionLoadingId === voucherToUpdateStatus.id}
                                style={{backgroundColor: "#007bff", color: "white", border: "none"}}
                            >
                                {managerActionLoadingId === voucherToUpdateStatus.id ? t("manager.updating") : t("manager.confirmUpdate")}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default HomePage;
