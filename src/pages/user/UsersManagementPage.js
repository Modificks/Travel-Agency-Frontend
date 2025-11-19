import React, {useState, useEffect, useCallback} from "react";
import {useNavigate} from "react-router-dom";
import "../styles/user/UsersManagementPage.css";
import {useLanguage} from "../../context/LanguageContext";
import {useAuth} from "../../context/AuthContext";
import {useAuthorizedFetch} from "../../api/UseAuthorizedFetch";

const UsersManagementPage = () => {
    const navigate = useNavigate();
    const {t, language, toggleLanguage} = useLanguage();
    const {isAdmin, loading: authLoading} = useAuth();
    const authorizedFetch = useAuthorizedFetch();

    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [searchId, setSearchId] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    const PAGE_SIZE = 10;

    useEffect(() => {
        if (!authLoading && !isAdmin) {
            navigate("/vouchers");
        }
    }, [isAdmin, authLoading, navigate]);

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await authorizedFetch(`/api/admin/users?page=${currentPage}&size=${PAGE_SIZE}`);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                setError(errorData.message || "Failed to fetch users");
            }

            const data = await response.json();

            setUsers(data.content);
            setTotalPages(data.totalPages);
        } catch (err) {
            setError(err.message || t("users.fetchError"));
            console.error("Error fetching users:", err);
        } finally {
            setLoading(false);
        }
    }, [authorizedFetch, currentPage, t]);

    useEffect(() => {
        if (isAdmin) {
            fetchUsers();
        }
    }, [isAdmin, fetchUsers]);

    const handleSearchById = async () => {
        if (!searchId.trim()) {
            fetchUsers();
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await authorizedFetch(`/api/admin/users/${searchId}`);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                setError(errorData.message || "User not found");
            }

            const data = await response.json();

            setUsers([data]);
            setTotalPages(1);
            setSelectedUser(null);
        } catch (err) {
            setError(err.message || t("users.notFound"));
            console.error("Error searching user:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleUserClick = (user) => {
        setSelectedUser(selectedUser?.id === user.id ? null : user);
    };

    const handleClearSearch = () => {
        setSearchId("");
        setCurrentPage(0);
    };

    const handleBlockUser = async (userId, isBlocked) => {
        setLoading(true);
        setError(null);
        setSuccessMessage(null);

        try {
            const response = await authorizedFetch(
                `/api/admin/users/${userId}/status?isBlocked=${isBlocked}`,
                {method: "PATCH"}
            );

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                setError(errorData.message || "Failed to change user status");
            }

            const updatedUser = await response.json();

            setUsers(users.map(u => u.id === userId ? updatedUser : u));

            if (selectedUser?.id === userId) {
                setSelectedUser(updatedUser);
            }

            setSuccessMessage(t(isBlocked ? "users.userBlocked" : "users.userUnblocked"));

            setTimeout(() => setSuccessMessage(null), 3000);
        } catch (err) {
            setError(err.message || t("users.statusChangeError"));
            console.error("Error changing user status:", err);
        } finally {
            setLoading(false);
        }
    };

    if (authLoading) return <p>Loading...</p>;
    if (!isAdmin) return null;

    return (
        <div className="users-container">
            <button className="lang-button" onClick={toggleLanguage}>
                {t(`language.${language}`)}
            </button>

            <div className="users-card">
                <div className="users-header">
                    <h1 className="users-title">{t("users.title")}</h1>
                    <button className="back-btn-top" onClick={() => navigate("/admin")}>
                        {t("users.backToAdmin")}
                    </button>
                </div>

                <div className="search-section">
                    <input
                        type="text"
                        className="search-input"
                        placeholder={t("users.searchPlaceholder")}
                        value={searchId}
                        onChange={(e) => setSearchId(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSearchById()}
                    />
                    <button className="search-btn" onClick={handleSearchById}>
                        {t("users.search")}
                    </button>
                    {searchId && (
                        <button className="clear-btn" onClick={handleClearSearch}>
                            {t("users.clear")}
                        </button>
                    )}
                </div>

                {error && <div className="error-message">{error}</div>}
                {successMessage && <div className="success-message">{successMessage}</div>}

                {loading ? (
                    <div className="loading-spinner">{t("users.loading")}</div>
                ) : (
                    <>
                        <div className="users-list">
                            {users.map((user) => (
                                <div key={user.id} className="user-item">
                                    <div
                                        className="user-summary"
                                        onClick={() => handleUserClick(user)}
                                        role="button"
                                        tabIndex={0}
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter" || e.key === " ") {
                                                handleUserClick(user);
                                            }
                                        }}
                                    >
                                        <div className="user-main-info">
                                            <span className="user-name">
                                                {user.name} {user.surname}
                                            </span>
                                            <span className="user-email">{user.email}</span>
                                        </div>
                                        <div className="user-badges">
                                            <span className={`role-badge ${user.role.toLowerCase()}`}>
                                                {user.role}
                                            </span>
                                            <span className={`status-badge ${user.active ? "active" : "inactive"}`}>
                                                {user.active ? t("users.active") : t("users.inactive")}
                                            </span>
                                        </div>
                                    </div>

                                    {selectedUser?.id === user.id && (
                                        <div className="user-details">
                                            <div className="detail-row">
                                                <span className="detail-label">{t("users.id")}:</span>
                                                <span className="detail-value">{user.id}</span>
                                            </div>
                                            <div className="detail-row">
                                                <span className="detail-label">{t("users.phone")}:</span>
                                                <span
                                                    className="detail-value">{user.phoneNumber || t("users.noPhone")}</span>
                                            </div>
                                            <div className="detail-row">
                                                <span className="detail-label">{t("users.balance")}:</span>
                                                <span className="detail-value balance">${user.balance.toFixed(2)}</span>
                                            </div>
                                            <div className="detail-row">
                                                <span className="detail-label">{t("users.vouchers")}:</span>
                                                <span className="detail-value">{user.vouchers?.length || 0}</span>
                                            </div>

                                            {user.vouchers?.length > 0 && (
                                                <div className="vouchers-section">
                                                    <h4>{t("users.vouchersList")}:</h4>
                                                    <ul className="vouchers-list">
                                                        {user.vouchers.map((voucher) => (
                                                            <li key={voucher.id} className="voucher-item">
                                                                {voucher.name || `Voucher id: ${voucher.id}`}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}

                                            <div className="user-actions">
                                                <button
                                                    className={`action-btn ${user.active ? "block-btn" : "unblock-btn"}`}
                                                    onClick={() => handleBlockUser(user.id, !user.active)}
                                                    disabled={loading}
                                                >
                                                    {user.active ? t("users.blockUser") : t("users.unblockUser")}
                                                </button>

                                                <button
                                                    className="view-vouchers-btn"
                                                    onClick={() => navigate(`/admin/users/${user.id}/vouchers`)}
                                                >
                                                    {t("users.viewVouchers")}
                                                </button>
                                            </div>

                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        {!searchId && totalPages > 1 && (
                            <div className="pagination">
                                <button
                                    className="page-btn"
                                    onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
                                    disabled={currentPage === 0}
                                >
                                    {t("users.previous")}
                                </button>
                                <span className="page-info">
                                    {t("users.page")} {currentPage + 1} {t("users.of")} {totalPages}
                                </span>
                                <button
                                    className="page-btn"
                                    onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))}
                                    disabled={currentPage >= totalPages - 1}
                                >
                                    {t("users.next")}
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default UsersManagementPage;
