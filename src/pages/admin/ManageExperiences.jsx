import React, { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import _ from "lodash";

// Services
import tourService from "../../services/tourService";

// Commons
import Pagination from "../../common/Pagination";
import Table from "../../common/Table";
import Sk from "../../common/skeleton";
import Badge from "../../common/badge";
import renderImage from "../../utils/renderImage";

// Components
import ConfirmModal from "../../components/modals/DeleteModal";
import userService from "../../services/userService";
import role from "../../constants/role";
import paginate from "../../utils/paginate";

const ManageExperiences = ({ Type }) => {
  const [searchParam] = useSearchParams();
  const q = searchParam.get("q");

  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [sortColumn, setSortColumn] = useState({
    path: "",
    order: "",
  });
  const [deleteModal, setDeleteModal] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const columns = [
    {
      label: "Cover",
      content: (item) =>
        item?.cover_image ? (
          <img
            src={renderImage(item.cover_image)}
            height={50}
            width={50}
            className='rounded-xs object-cover'
            alt={item?.title}
          />
        ) : (
          <div className='w-12.5 h-12.5 rounded-xs bg-stone-100 flex items-center justify-center'>
            <i className='fa fa-image text-stone-400 text-lg' />
          </div>
        ),
    },
    {
      label: "Title",
      path: "title",
    },
    {
      label: "Destination",
      content: (item) => (
        <div>
          <i className='fa fa-map-marker-alt text-[13px] text-amber-700 mr-3' />
          {item.destination}
        </div>
      ),
    },
    {
      label: "Price",
      path: "price",
      content: (item) => <div>${Number(item.price).toFixed(0)}</div>,
    },
    {
      label: "Featured",
      path: "is_featured",
      content: (item) => <Badge active={item.is_featured} />,
    },
    {
      label: "Hot Deal",
      path: "is_hot_deal",
      content: (item) => <Badge active={item.is_hot_deal} />,
    },
    {
      label: "Category",
      path: "category",
      content: (item) => (
        <div className='rounded-2xl border text-center border-amber-800 text-amber-800 bg-amber-100'>
          {item.category}
        </div>
      ),
    },
    {
      label: "Actions",
      content: (item) => renderActions(item),
    },
  ];

  const renderActions = (item) => {
    const user = userService.getCurrentUser();
    const isAdmin = user?.role === role.ADMIN;

    const canEdit = isAdmin;
    const canView = isAdmin;
    const canDelete = isAdmin;

    const editIcon = (
      <Link
        to={`/admin/${Type === "activity" ? "activities" : Type + "s"}/edit/${
          item.id
        }`}
      >
        <i className='fas fa-edit text-blue-500 transition-colors ml-4'></i>
      </Link>
    );

    const viewIcon = (
      <Link
        to={`/admin/${Type === "activity" ? "activities" : Type + "s"}/view/${
          item.id
        }`}
      >
        <i className='fas fa-eye  text-yellow-500 transition-colors ml-4'></i>
      </Link>
    );

    const deleteIcon = (
      <button onClick={() => setDeleteModal(item)}>
        <i className='fas fa-trash text-red-500 transition-colors ml-4'></i>
      </button>
    );

    return (
      <div className='flex items-center justify-between '>
        {canEdit && editIcon}
        {canView && viewIcon}
        {canDelete && deleteIcon}
      </div>
    );
  };

  const handleSort = (sortColumn) => {
    setSortColumn(sortColumn);
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await tourService.getAll({
        type: Type,
        page: pageNumber,
        limit: pageSize,
        searchQuery: q,
      });

      setTours(res.data);
      setTotalItems(q ? res.data?.length : res.pagination.totalItems);
    } catch (err) {
      toast.error("Failed to fetch tours!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPageNumber(1);
  }, [q]);

  useEffect(() => {
    fetchData();
  }, [pageNumber, pageSize, q, Type]);

  const handleDelete = async (id) => {
    try {
      setDeleting(true);
      await tourService.deleteOne(id);
      setTours((prev) => prev.filter((t) => t.id !== deleteModal.id));
      setTotalItems((n) => n - 1);
      toast.success(
        `${
          String(Type[0]).toUpperCase() + String(Type).slice(1).toLowerCase()
        } deleted successfully!`
      );
      setDeleteModal(null);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to delete tour!");
    } finally {
      setDeleting(false);
    }
  };

  const renderPageData = () => {
    const sorted = _.orderBy(tours, [sortColumn.path], [sortColumn.order]);
    /*const paginated = paginate(sorted, pageNumber, pageSize);*/
    return { data: sorted };
  };

  const { data } = renderPageData();

  // Stats
  const featured = tours.filter((t) => t.is_featured).length;
  const hotDeals = tours.filter((t) => t.is_hot_deal).length;

  return (
    <div
      className='min-h-screen bg-stone-50 p-6 md:p-8'
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      {/* ── Header ─────────────────────────────────── */}
      <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8'>
        <div>
          <p className='text-xs font-bold uppercase tracking-[0.2em] text-amber-500 mb-1'>
            Admin
          </p>
          <h1
            className='text-3xl font-black text-stone-800'
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            <div>
              <div className='capitalize'>
                Manage {Type === "activity" ? "activities" : Type + "s"}
              </div>
            </div>
          </h1>
          <p className='text-stone-400 text-sm mt-1'>
            {totalItems} {Type === "activity" ? "activities" : Type + "s"} in
            total
          </p>
        </div>
        <Link
          to={`/admin/${
            Type === "activity" ? "activities" : Type + "s"
          }/create`}
          className='inline-flex items-center gap-2 text-sm font-bold text-amber-900 bg-amber-400 hover:bg-amber-300 transition-colors px-5 py-2.5 rounded-xl shadow-sm shadow-amber-200 self-start sm:self-auto'
        >
          <i className='fa fa-plus text-xs' /> Add New {Type}
        </Link>
      </div>

      {/* ── Stats ──────────────────────────────────── */}
      <div className='grid grid-cols-2 md:grid-cols-4 gap-4 mb-6'>
        {[
          {
            icon: "fa-map-marked-alt",
            label: `Total ${Type === "activity" ? "activities" : Type + "s"}`,
            value: totalItems,
            color: "from-amber-400 to-orange-500",
            ring: "ring-amber-200",
          },
          {
            icon: "fa-star",
            label: "Featured",
            value: featured,
            color: "from-blue-400 to-indigo-500",
            ring: "ring-blue-200",
          },
          {
            icon: "fa-fire",
            label: "Hot Deals",
            value: hotDeals,
            color: "from-red-400 to-rose-500",
            ring: "ring-red-200",
          },
          {
            icon: "fa-eye",
            label: "This Page",
            value: data.length,
            color: "from-emerald-400 to-teal-500",
            ring: "ring-emerald-200",
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

      {/* ── Table ──────────────────────────────────── */}
      {loading ? (
        <div className='space-y-3'>
          {[...Array(6)].map((_, i) => (
            <Sk key={i} className='h-16 rounded-2xl' />
          ))}
        </div>
      ) : data.length === 0 ? (
        <div className='bg-white rounded-2xl border border-stone-100 py-20 text-center'>
          <i className='fa fa-map text-5xl text-stone-200 mb-4 block' />
          <p className='font-bold text-stone-500 mb-1'>No {Type} found</p>
          <p className='text-sm text-stone-400'>
            Try adjusting your search or add a new {Type}.
          </p>
        </div>
      ) : (
        <>
          <Table
            columns={columns}
            data={data}
            onSort={handleSort}
            sortColumn={sortColumn}
          />
          {/* Pagination */}
          <div className='border-t border-stone-100 px-6 py-4'>
            <Pagination
              itemsCount={totalItems}
              pageNumber={pageNumber}
              pageSize={pageSize}
              onPageSizeChange={(s) => {
                setPageSize(s);
                setPageNumber(1);
              }}
              onPageChange={(page) => {
                setPageNumber(page);
              }}
            />
          </div>
        </>
      )}

      {/* Delete modal */}
      {deleteModal && (
        <ConfirmModal
          title={`Delete ${Type}`}
          message={`Are you sure you want to delete "${Type}"? This action cannot be undone.`}
          onConfirm={handleDelete}
          tourId={deleteModal?.id}
          onClose={() => setDeleteModal(null)}
          loading={deleting}
        />
      )}
    </div>
  );
};

export default ManageExperiences;
