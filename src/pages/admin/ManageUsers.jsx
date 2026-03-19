import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import _ from "lodash";
import userService from "../../services/userService";
import Pagination from "../../common/Pagination";
/* import getTimeAgo from "../../utils/getTimeAgo";
 */import Roles from "../../constants/role";

// ─── Helpers ──────────────────────────────────────────────────
const Sk = ({ className }) => (
  <div className={`animate-pulse bg-stone-100 rounded-xl ${className}`} />
);

const ROLE_STYLES = {
  [Roles.ADMIN]: {
    bg: "bg-purple-50",
    text: "text-purple-700",
    border: "border-purple-200",
    dot: "bg-purple-400",
  },
  [Roles.CUSTOMER]: {
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-200",
    dot: "bg-amber-400",
  },
  [Roles.CUSTOMER_STAFF]: {
    bg: "bg-blue-50",
    text: "text-blue-600",
    border: "border-blue-200",
    dot: "bg-blue-400",
  },
  [Roles.CARRIER]: {
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-200",
    dot: "bg-emerald-400",
  },
  [Roles.RAMASSEUR]: {
    bg: "bg-pink-50",
    text: "text-pink-700",
    border: "border-pink-200",
    dot: "bg-pink-400",
  },
};

const RoleBadge = ({ role }) => {
  const s = ROLE_STYLES[role] || {
    bg: "bg-stone-50",
    text: "text-stone-500",
    border: "border-stone-200",
    dot: "bg-stone-300",
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full border ${s.bg} ${s.text} ${s.border} capitalize`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {role}
    </span>
  );
};

const StatusDot = ({ active }) => (
  <span
    className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full border ${
      active
        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
        : "bg-stone-50 text-stone-400 border-stone-200"
    }`}
  >
    <span
      className={`w-1.5 h-1.5 rounded-full ${
        active ? "bg-emerald-400" : "bg-stone-300"
      }`}
    />
    {active ? "Active" : "Inactive"}
  </span>
);

const ROLE_FILTERS = ["All", Roles.ADMIN, Roles.CUSTOMER, Roles.CARRIER];

// ─── ManageUsers ──────────────────────────────────────────────
const ManageUsers = ({ searchQuery, user: currentUser }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [roleFilter, setRoleFilter] = useState("All");
  const [sortColumn, setSortColumn] = useState({
    path: "created_at",
    order: "desc",
  });
  const [selectedItems, setSelectedItems] = useState([]);
  const [deleteModal, setDeleteModal] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [trigger, setTrigger] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await userService.getByRole(
        undefined,
        roleFilter === "All" ? undefined : roleFilter,
        pageNumber,
        pageSize
      );
      setUsers(res?.users || []);
      setTotalItems(res?.pagination?.totalItems || 0);
    } catch {
      toast.error("Failed to fetch users!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [roleFilter, pageNumber, pageSize, trigger]);

  useEffect(() => {
    if (!String(searchQuery || "").trim()) {
      setTrigger((t) => !t);
      return;
    }
    const run = async () => {
      try {
        setLoading(true);
        const res = await userService.getUserBySearchQuery(searchQuery);
        setUsers(res?.data || []);
        setTotalItems(1);
      } catch {
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [searchQuery]);

  const handleDelete = async () => {
    const original = [...users];
    try {
      setDeleting(true);
      setUsers((prev) => prev.filter((u) => u.id !== deleteModal.id));
      await userService.deleteById(deleteModal.id);
      setTotalItems((n) => n - 1);
      toast.success("User deleted successfully!");
      setDeleteModal(null);
    } catch (err) {
      setUsers(original);
      toast.error(err?.response?.data?.message || "Failed to delete user!");
    } finally {
      setDeleting(false);
    }
  };

  const onUserSelect = (id) =>
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );

  const toggleAll = () =>
    setSelectedItems(
      selectedItems.length === users.length ? [] : users.map((u) => u.id)
    );

  const sorted = _.orderBy(users, [sortColumn.path], [sortColumn.order]);

  // Stats
  const active = users.filter((u) => u.active).length;
  const verified = users.filter((u) => u.verified).length;

  return (
    <div
      className='min-h-screen bg-stone-50 p-6 md:p-8'
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      {/* ── Header ─────────────────────────────────── */}
      <div className='mb-8'>
        <p className='text-xs font-bold uppercase tracking-[0.2em] text-amber-500 mb-1'>
          Admin
        </p>
        <h1
          className='text-3xl font-black text-stone-800'
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          Manage Users
        </h1>
        <p className='text-stone-400 text-sm mt-1'>
          {totalItems} users registered
        </p>
      </div>

      {/* ── Stats ──────────────────────────────────── */}
      <div className='grid grid-cols-2 md:grid-cols-4 gap-4 mb-6'>
        {[
          {
            icon: "fa-users",
            label: "Total Users",
            value: totalItems,
            color: "from-amber-400 to-orange-500",
            ring: "ring-amber-200",
          },
          {
            icon: "fa-user-check",
            label: "Active",
            value: active,
            color: "from-emerald-400 to-teal-500",
            ring: "ring-emerald-200",
          },
          {
            icon: "fa-shield-alt",
            label: "Verified",
            value: verified,
            color: "from-blue-400 to-indigo-500",
            ring: "ring-blue-200",
          },
          {
            icon: "fa-eye",
            label: "This Page",
            value: sorted.length,
            color: "from-stone-400 to-stone-500",
            ring: "ring-stone-200",
          },
        ].map((s) => (
          <div
            key={s.label}
            className='bg-white rounded-2xl border border-stone-100 p-5'
          >
            <div
              className={`w-10 h-10 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center mb-3 shadow-sm ring-4 ${s.ring}`}
            >
              <i className={`fa ${s.icon} text-white text-xs`} />
            </div>
            <p className='text-xl font-black text-stone-800'>
              {loading ? "—" : s.value}
            </p>
            <p className='text-xs text-stone-400 font-medium mt-0.5'>
              {s.label}
            </p>
          </div>
        ))}
      </div>

      {/* ── Role filter tabs ────────────────────────── */}
      <div className='flex items-center gap-2 mb-5 flex-wrap'>
        {ROLE_FILTERS.map((r) => (
          <button
            key={r}
            onClick={() => {
              setRoleFilter(r);
              setPageNumber(1);
            }}
            className={`text-xs font-bold px-4 py-2 rounded-xl border capitalize transition-colors ${
              roleFilter === r
                ? "bg-amber-50 text-amber-700 border-amber-200"
                : "bg-white text-stone-500 border-stone-200 hover:bg-stone-50"
            }`}
          >
            {r}
          </button>
        ))}

        {/* Bulk action */}
        {selectedItems.length > 0 && (
          <div className='ml-auto flex items-center gap-2'>
            <span className='text-xs text-stone-500 font-semibold'>
              {selectedItems.length} selected
            </span>
            <button className='text-xs font-bold text-red-500 border border-red-200 bg-red-50 hover:bg-red-100 px-3 py-2 rounded-xl transition-colors'>
              <i className='fa fa-trash mr-1.5 text-[10px]' /> Delete Selected
            </button>
          </div>
        )}
      </div>

      {/* ── Table ──────────────────────────────────── */}
      {loading ? (
        <div className='space-y-3'>
          {[...Array(6)].map((_, i) => (
            <Sk key={i} className='h-16 rounded-2xl' />
          ))}
        </div>
      ) : sorted.length === 0 ? (
        <div className='bg-white rounded-2xl border border-stone-100 py-20 text-center'>
          <i className='fa fa-users text-5xl text-stone-200 mb-4 block' />
          <p className='font-bold text-stone-500 mb-1'>No users found</p>
          <p className='text-sm text-stone-400'>
            Try a different role filter or search.
          </p>
        </div>
      ) : (
        <div className='bg-white rounded-2xl border border-stone-100 overflow-hidden'>
          <div className='overflow-x-auto'>
            <table className='w-full text-sm'>
              <thead>
                <tr className='border-b border-stone-100 bg-stone-50'>
                  <th className='px-4 py-3.5'>
                    <input
                      type='checkbox'
                      checked={
                        selectedItems.length === users.length &&
                        users.length > 0
                      }
                      onChange={toggleAll}
                      className='w-4 h-4 rounded border-stone-300 accent-amber-400 cursor-pointer'
                    />
                  </th>
                  {[
                    "User",
                    "Email",
                    "Role",
                    "Status",
                    "Verified",
                    "Joined",
                    "Actions",
                  ].map((h) => (
                    <th
                      key={h}
                      className='px-4 py-3.5 text-left text-xs font-bold uppercase tracking-widest text-stone-400 whitespace-nowrap'
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className='divide-y divide-stone-50'>
                {sorted.map((u) => (
                  <tr
                    key={u.id}
                    className={`hover:bg-stone-50 transition-colors ${
                      selectedItems.includes(u.id) ? "bg-amber-50/40" : ""
                    }`}
                  >
                    {/* Checkbox */}
                    <td className='px-4 py-3'>
                      <input
                        type='checkbox'
                        checked={selectedItems.includes(u.id)}
                        onChange={() => onUserSelect(u.id)}
                        className='w-4 h-4 rounded border-stone-300 accent-amber-400 cursor-pointer'
                      />
                    </td>
                    {/* User */}
                    <td className='px-4 py-3'>
                      <div className='flex items-center gap-3'>
                        <div className='w-9 h-9 rounded-xl overflow-hidden bg-stone-100 shrink-0'>
                          {u.avatar ? (
                            <img
                              src={`${import.meta.env.VITE_BACK_END_URL}${
                                u.avatar
                              }`}
                              alt={u.name}
                              className='w-full h-full object-cover'
                            />
                          ) : (
                            <div className='w-full h-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white text-xs font-bold'>
                              {u.name?.charAt(0)?.toUpperCase()}
                            </div>
                          )}
                        </div>
                        <p className='font-semibold text-stone-700 text-xs whitespace-nowrap'>
                          {u.name}
                        </p>
                      </div>
                    </td>
                    {/* Email */}
                    <td className='px-4 py-3'>
                      <p className='text-xs text-stone-500 max-w-[160px] truncate'>
                        {u.email}
                      </p>
                    </td>
                    {/* Role */}
                    <td className='px-4 py-3'>
                      <RoleBadge role={u.role} />
                    </td>
                    {/* Status */}
                    <td className='px-4 py-3'>
                      <StatusDot active={u.active} />
                    </td>
                    {/* Verified */}
                    <td className='px-4 py-3'>
                      <span
                        className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full border ${
                          u.verified
                            ? "bg-blue-50 text-blue-600 border-blue-200"
                            : "bg-yellow-50 text-yellow-600 border-yellow-200"
                        }`}
                      >
                        <i
                          className={`fa ${
                            u.verified ? "fa-check" : "fa-clock"
                          } text-[9px]`}
                        />
                        {u.verified ? "Verified" : "Pending"}
                      </span>
                    </td>
                    {/* Joined */}
                    <td className='px-4 py-3 text-xs text-stone-400 whitespace-nowrap'>
                      {u.created_at ? getTimeAgo(u.created_at) : "—"}
                    </td>
                    {/* Actions */}
                    <td className='px-4 py-3'>
                      <div className='flex items-center gap-2'>
                        <Link
                          to={`/users/preview/${u.id}`}
                          title='View'
                          className='w-8 h-8 rounded-xl bg-stone-100 hover:bg-amber-50 hover:text-amber-600 flex items-center justify-center text-stone-400 transition-colors'
                        >
                          <i className='fa fa-eye text-xs' />
                        </Link>
                        <Link
                          to={`/users/edit/${u.id}`}
                          title='Edit'
                          className='w-8 h-8 rounded-xl bg-stone-100 hover:bg-blue-50 hover:text-blue-600 flex items-center justify-center text-stone-400 transition-colors'
                        >
                          <i className='fa fa-pen text-xs' />
                        </Link>
                        <button
                          onClick={() => setDeleteModal(u)}
                          title='Delete'
                          className='w-8 h-8 rounded-xl bg-stone-100 hover:bg-red-50 hover:text-red-500 flex items-center justify-center text-stone-400 transition-colors'
                        >
                          <i className='fa fa-trash text-xs' />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className='border-t border-stone-100 px-6 py-4'>
            <Pagination
              itemsCount={totalItems}
              pageNumber={pageNumber}
              pageSize={pageSize}
              onPageSizeChange={(s) => {
                setPageSize(s);
                setPageNumber(1);
              }}
              onPageChange={setPageNumber}
            />
          </div>
        </div>
      )}

      {/* Delete modal */}
      {deleteModal && (
        <div className='fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/50 backdrop-blur-sm'>
          <div className='bg-white rounded-2xl border border-stone-100 shadow-2xl w-full max-w-sm overflow-hidden'>
            <div className='h-1 bg-gradient-to-r from-red-400 to-rose-500' />
            <div className='p-6'>
              <div className='w-11 h-11 rounded-xl bg-red-50 flex items-center justify-center mb-4'>
                <i className='fa fa-exclamation-triangle text-red-500' />
              </div>
              <h3
                className='font-black text-stone-800 text-lg mb-1'
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                Delete User?
              </h3>
              <p className='text-sm text-stone-500 mb-6'>
                Permanently delete <strong>{deleteModal?.name}</strong>? This
                cannot be undone.
              </p>
              <div className='flex gap-3'>
                <button
                  onClick={() => setDeleteModal(null)}
                  className='flex-1 py-2.5 rounded-xl text-sm font-semibold text-stone-600 border border-stone-200 hover:bg-stone-50 transition-colors'
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className='flex-1 py-2.5 rounded-xl text-sm font-bold text-white bg-red-500 hover:bg-red-600 disabled:opacity-60 transition-colors'
                >
                  {deleting ? (
                    <>
                      <i className='fa fa-spinner fa-spin mr-1.5' />
                      Deleting...
                    </>
                  ) : (
                    "Delete"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageUsers;
