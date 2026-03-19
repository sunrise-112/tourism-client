import { useEffect, useState, useRef } from "react";
import { toast } from "react-toastify";
import userService from "../../services/userService";

const Sk = ({ className }) => (
  <div className={`animate-pulse bg-stone-100 rounded-xl ${className}`} />
);

const inputClass =
  "w-full px-4 py-3 text-sm bg-stone-50 border border-stone-200 rounded-xl outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/15 transition-all placeholder-stone-300 text-stone-700";

const labelClass =
  "block text-xs font-bold uppercase tracking-widest text-stone-400 mb-1.5";

const SectionCard = ({ title, eyebrow, children, danger = false }) => (
  <div
    className={`bg-white rounded-2xl border overflow-hidden ${
      danger ? "border-red-100" : "border-stone-100"
    }`}
  >
    <div
      className={`h-1 ${
        danger
          ? "bg-gradient-to-r from-red-400 to-rose-500"
          : "bg-gradient-to-r from-amber-400 via-orange-500 to-rose-400"
      }`}
    />
    <div className='p-6'>
      {eyebrow && (
        <p
          className={`text-xs font-bold uppercase tracking-[0.2em] mb-1 ${
            danger ? "text-red-400" : "text-amber-500"
          }`}
        >
          {eyebrow}
        </p>
      )}
      <h2
        className='text-base font-black text-stone-800 mb-5'
        style={{ fontFamily: "'Playfair Display', serif" }}
      >
        {title}
      </h2>
      {children}
    </div>
  </div>
);

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileRef = useRef(null);

  const [infoForm, setInfoForm] = useState({ name: "", email: "" });
  const [savingInfo, setSavingInfo] = useState(false);

  const [pwForm, setPwForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [savingPw, setSavingPw] = useState(false);
  const [showPw, setShowPw] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [deletingAccount, setDeletingAccount] = useState(false);

  useEffect(() => {
    userService
      .getMe()
      .then((u) => {
        setUser(u);
        setInfoForm({ name: u?.name || "", email: u?.email || "" });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleAvatarUpload = async () => {
    const file = fileRef.current?.files[0];
    if (!file) return;
    try {
      setUploadingAvatar(true);
      const formData = new FormData();
      formData.append("avatar", file);
      const updated = await userService.updateAvatar(formData);
      setUser(updated?.data || updated);
      setAvatarPreview(null);
      toast.success("Avatar updated successfully!");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to update avatar");
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleInfoSubmit = async (e) => {
    e.preventDefault();
    try {
      setSavingInfo(true);
      const updated = await userService.updateMe(infoForm);
      setUser(updated?.data || updated);
      toast.success("Profile updated!");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to update profile");
    } finally {
      setSavingInfo(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirmPassword)
      return toast.error("Passwords do not match");
    if (pwForm.newPassword.length < 8)
      return toast.error("Password must be at least 8 characters");
    try {
      setSavingPw(true);
      await userService.updateMe({
        currentPassword: pwForm.currentPassword,
        newPassword: pwForm.newPassword,
      });
      toast.success("Password changed successfully!");
      setPwForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to change password");
    } finally {
      setSavingPw(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirm !== user?.name) return;
    try {
      setDeletingAccount(true);
      await userService.updateMe({ deleteAccount: true });
      toast.success("Account deleted. Goodbye!");
      setTimeout(() => (window.location.href = "/"), 1500);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to delete account");
    } finally {
      setDeletingAccount(false);
    }
  };

  const avatarSrc =
    avatarPreview ||
    (user?.avatar
      ? `${import.meta.env.VITE_BACK_END_URL}${user.avatar}`
      : null);

  const pwStrength = Math.min(
    [
      pwForm.newPassword.length >= 8,
      /[A-Z]/.test(pwForm.newPassword),
      /[0-9]/.test(pwForm.newPassword),
      /[^A-Za-z0-9]/.test(pwForm.newPassword),
    ].filter(Boolean).length,
    4
  );

  return (
    <div
      className='min-h-screen bg-stone-50 p-6 md:p-8'
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      {/* ── Page header ──────────────────────────────────── */}
      <div className='mb-8'>
        <p className='text-xs font-bold uppercase tracking-[0.2em] text-amber-500 mb-1'>
          Account
        </p>
        <h1
          className='text-3xl font-black text-stone-800'
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          My Profile
        </h1>
        <p className='text-stone-400 text-sm mt-1'>
          Manage your account settings and preferences
        </p>
      </div>

      {loading ? (
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
          <Sk className='h-64 rounded-2xl lg:row-span-2' />
          <Sk className='h-64 rounded-2xl lg:col-span-2' />
          <Sk className='h-72 rounded-2xl lg:col-span-2' />
          <Sk className='h-48 rounded-2xl lg:col-span-3' />
        </div>
      ) : (
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
          {/* ── Col 1: Avatar + Stats ─────────────────── */}
          <div className='space-y-6'>
            {/* Avatar card */}
            <SectionCard eyebrow='Photo' title='Profile Picture'>
              <div className='flex flex-col items-center text-center'>
                <div className='relative mb-4'>
                  <div className='w-28 h-28 rounded-2xl overflow-hidden bg-stone-100 ring-4 ring-amber-400/20 mx-auto'>
                    {avatarSrc ? (
                      <img
                        src={avatarSrc}
                        alt={user?.name}
                        className='w-full h-full object-cover'
                      />
                    ) : (
                      <div className='w-full h-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white font-black text-3xl'>
                        {user?.name?.charAt(0)?.toUpperCase() || "?"}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => fileRef.current?.click()}
                    className='absolute -bottom-2 -right-2 w-8 h-8 bg-amber-400 hover:bg-amber-300 rounded-xl flex items-center justify-center shadow-md transition-colors'
                  >
                    <i className='fa fa-camera text-amber-900 text-xs' />
                  </button>
                </div>

                <p className='font-black text-stone-800 text-base'>
                  {user?.name}
                </p>
                <p className='text-xs text-stone-400 mb-1'>{user?.email}</p>
                <span className='inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-700 capitalize mb-5'>
                  <span className='w-1.5 h-1.5 rounded-full bg-amber-400' />
                  {user?.role}
                </span>

                <input
                  ref={fileRef}
                  type='file'
                  accept='image/*'
                  className='hidden'
                  onChange={handleAvatarChange}
                />

                <div className='flex flex-wrap justify-center gap-2 w-full'>
                  <button
                    onClick={() => fileRef.current?.click()}
                    className='flex items-center gap-1.5 text-xs font-semibold text-stone-600 border border-stone-200 hover:bg-stone-50 px-3 py-2 rounded-xl transition-colors'
                  >
                    <i className='fa fa-upload text-[10px]' /> Choose Photo
                  </button>
                  {avatarPreview && (
                    <>
                      <button
                        onClick={handleAvatarUpload}
                        disabled={uploadingAvatar}
                        className='flex items-center gap-1.5 text-xs font-bold text-amber-900 bg-amber-400 hover:bg-amber-300 disabled:opacity-60 px-3 py-2 rounded-xl transition-colors'
                      >
                        {uploadingAvatar ? (
                          <>
                            <i className='fa fa-spinner fa-spin text-[10px]' />{" "}
                            Saving...
                          </>
                        ) : (
                          <>
                            <i className='fa fa-check text-[10px]' /> Save
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => {
                          setAvatarPreview(null);
                          if (fileRef.current) fileRef.current.value = "";
                        }}
                        className='text-xs font-semibold text-stone-400 hover:text-red-500 border border-stone-200 hover:border-red-200 px-3 py-2 rounded-xl transition-colors'
                      >
                        Cancel
                      </button>
                    </>
                  )}
                </div>
                <p className='text-[10px] text-stone-400 mt-3'>
                  JPG, PNG or WebP. Max 5MB.
                </p>
              </div>
            </SectionCard>

            {/* Quick stats */}
            <div className='bg-white rounded-2xl border border-stone-100 p-6'>
              <p className='text-xs font-bold uppercase tracking-[0.2em] text-amber-500 mb-4'>
                Quick Stats
              </p>
              <div className='space-y-3'>
                {[
                  {
                    icon: "fa-calendar-alt",
                    label: "Member Since",
                    value: user?.created_at
                      ? new Date(user.created_at).toLocaleDateString("en-US", {
                          month: "long",
                          year: "numeric",
                        })
                      : "—",
                  },
                  {
                    icon: "fa-suitcase-rolling",
                    label: "Total Bookings",
                    value: user?.bookings_count ?? "—",
                  },
                  {
                    icon: "fa-star",
                    label: "Reviews Written",
                    value: user?.reviews_count ?? "—",
                  },
                ].map((s) => (
                  <div key={s.label} className='flex items-center gap-3'>
                    <div className='w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center shrink-0'>
                      <i className={`fa ${s.icon} text-amber-500 text-xs`} />
                    </div>
                    <div className='flex-1 min-w-0'>
                      <p className='text-xs text-stone-400'>{s.label}</p>
                      <p className='text-sm font-bold text-stone-700'>
                        {s.value}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Col 2-3: Forms ────────────────────────── */}
          <div className='lg:col-span-2 space-y-6'>
            {/* Personal info */}
            <SectionCard eyebrow='Details' title='Personal Information'>
              <form
                onSubmit={handleInfoSubmit}
                className='grid sm:grid-cols-2 gap-4'
              >
                <div>
                  <label className={labelClass}>Full Name</label>
                  <input
                    value={infoForm.name}
                    onChange={(e) =>
                      setInfoForm((f) => ({ ...f, name: e.target.value }))
                    }
                    placeholder='Your full name'
                    required
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Email Address</label>
                  <input
                    type='email'
                    value={infoForm.email}
                    onChange={(e) =>
                      setInfoForm((f) => ({ ...f, email: e.target.value }))
                    }
                    placeholder='your@email.com'
                    required
                    className={inputClass}
                  />
                </div>
                <div className='sm:col-span-2'>
                  <label className={labelClass}>Role</label>
                  <div className='flex items-center gap-2 px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl'>
                    <span className='w-2 h-2 rounded-full bg-amber-400' />
                    <span className='text-sm font-semibold text-stone-600 capitalize'>
                      {user?.role}
                    </span>
                    <span className='text-xs text-stone-400 ml-1'>
                      (cannot be changed)
                    </span>
                  </div>
                </div>
                <div className='sm:col-span-2 pt-1'>
                  <button
                    type='submit'
                    disabled={savingInfo}
                    className='flex items-center gap-2 text-sm font-bold text-amber-900 bg-amber-400 hover:bg-amber-300 disabled:opacity-60 px-6 py-2.5 rounded-xl transition-colors shadow-sm shadow-amber-200'
                  >
                    {savingInfo ? (
                      <>
                        <i className='fa fa-spinner fa-spin text-xs' />{" "}
                        Saving...
                      </>
                    ) : (
                      <>
                        <i className='fa fa-check text-xs' /> Save Changes
                      </>
                    )}
                  </button>
                </div>
              </form>
            </SectionCard>

            {/* Password */}
            <SectionCard eyebrow='Security' title='Change Password'>
              <form
                onSubmit={handlePasswordSubmit}
                className='grid sm:grid-cols-2 gap-4'
              >
                {/* Current password spans full width */}
                <div className='sm:col-span-2'>
                  <label className={labelClass}>Current Password</label>
                  <div className='relative'>
                    <input
                      type={showPw.current ? "text" : "password"}
                      value={pwForm.currentPassword}
                      onChange={(e) =>
                        setPwForm((f) => ({
                          ...f,
                          currentPassword: e.target.value,
                        }))
                      }
                      placeholder='Your current password'
                      required
                      className={`${inputClass} pr-10`}
                    />
                    <button
                      type='button'
                      onClick={() =>
                        setShowPw((s) => ({ ...s, current: !s.current }))
                      }
                      className='absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 transition-colors'
                    >
                      <i
                        className={`fa ${
                          showPw.current ? "fa-eye-slash" : "fa-eye"
                        } text-xs`}
                      />
                    </button>
                  </div>
                </div>

                {/* New + Confirm side by side */}
                {[
                  {
                    key: "new",
                    field: "newPassword",
                    label: "New Password",
                    placeholder: "Min. 8 characters",
                  },
                  {
                    key: "confirm",
                    field: "confirmPassword",
                    label: "Confirm Password",
                    placeholder: "Repeat new password",
                  },
                ].map(({ key, field, label, placeholder }) => (
                  <div key={key}>
                    <label className={labelClass}>{label}</label>
                    <div className='relative'>
                      <input
                        type={showPw[key] ? "text" : "password"}
                        value={pwForm[field]}
                        onChange={(e) =>
                          setPwForm((f) => ({ ...f, [field]: e.target.value }))
                        }
                        placeholder={placeholder}
                        required
                        className={`${inputClass} pr-10`}
                      />
                      <button
                        type='button'
                        onClick={() =>
                          setShowPw((s) => ({ ...s, [key]: !s[key] }))
                        }
                        className='absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 transition-colors'
                      >
                        <i
                          className={`fa ${
                            showPw[key] ? "fa-eye-slash" : "fa-eye"
                          } text-xs`}
                        />
                      </button>
                    </div>
                  </div>
                ))}

                {/* Strength bar */}
                {pwForm.newPassword && (
                  <div className='sm:col-span-2 flex items-center gap-2'>
                    {[...Array(4)].map((_, i) => (
                      <div
                        key={i}
                        className={`h-1.5 flex-1 rounded-full transition-colors ${
                          i < pwStrength
                            ? [
                                "bg-red-400",
                                "bg-amber-400",
                                "bg-yellow-400",
                                "bg-emerald-400",
                              ][pwStrength - 1]
                            : "bg-stone-100"
                        }`}
                      />
                    ))}
                    <span className='text-xs text-stone-400 ml-1 w-12'>
                      {["", "Weak", "Fair", "Good", "Strong"][pwStrength]}
                    </span>
                  </div>
                )}

                <div className='sm:col-span-2 pt-1'>
                  <button
                    type='submit'
                    disabled={savingPw}
                    className='flex items-center gap-2 text-sm font-bold text-amber-900 bg-amber-400 hover:bg-amber-300 disabled:opacity-60 px-6 py-2.5 rounded-xl transition-colors shadow-sm shadow-amber-200'
                  >
                    {savingPw ? (
                      <>
                        <i className='fa fa-spinner fa-spin text-xs' />{" "}
                        Updating...
                      </>
                    ) : (
                      <>
                        <i className='fa fa-lock text-xs' /> Update Password
                      </>
                    )}
                  </button>
                </div>
              </form>
            </SectionCard>
          </div>

          {/* ── Full width: Danger zone ───────────────── */}
          <div className='lg:col-span-3'>
            <SectionCard eyebrow='Danger Zone' title='Delete Account' danger>
              <div className='grid sm:grid-cols-2 gap-6 items-start'>
                <div>
                  <p className='text-sm text-stone-400 leading-relaxed'>
                    This will permanently delete your account, all bookings, and
                    reviews. This action{" "}
                    <strong className='text-stone-600'>cannot be undone</strong>
                    .
                  </p>
                </div>
                <div className='bg-red-50 border border-red-100 rounded-xl p-4 space-y-3'>
                  <label className='block text-xs font-bold text-red-500 uppercase tracking-widest'>
                    Type{" "}
                    <span className='font-black text-red-600'>
                      {user?.name}
                    </span>{" "}
                    to confirm
                  </label>
                  <input
                    value={deleteConfirm}
                    onChange={(e) => setDeleteConfirm(e.target.value)}
                    placeholder={user?.name}
                    className='w-full px-4 py-2.5 text-sm bg-white border border-red-200 rounded-xl outline-none focus:border-red-400 focus:ring-2 focus:ring-red-400/15 transition-all placeholder-red-200 text-stone-700'
                  />
                  <button
                    onClick={handleDeleteAccount}
                    disabled={deleteConfirm !== user?.name || deletingAccount}
                    className='flex items-center gap-2 text-sm font-bold text-white bg-red-500 hover:bg-red-600 disabled:opacity-40 disabled:cursor-not-allowed px-5 py-2.5 rounded-xl transition-colors'
                  >
                    {deletingAccount ? (
                      <>
                        <i className='fa fa-spinner fa-spin text-xs' />{" "}
                        Deleting...
                      </>
                    ) : (
                      <>
                        <i className='fa fa-trash text-xs' /> Delete My Account
                      </>
                    )}
                  </button>
                </div>
              </div>
            </SectionCard>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
