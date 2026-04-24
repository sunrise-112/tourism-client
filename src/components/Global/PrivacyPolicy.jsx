import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import settingsService from "../../services/adminSettings";

const PrivacyPolicy = () => {
  const { t } = useTranslation();
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const fetchedInfo = await settingsService.get();
        setSettings(fetchedInfo);
      } catch (error) {
        console.error("Failed to load settings:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className='min-h-screen bg-stone-50 flex items-center justify-center'>
        <div className='text-stone-500'>Loading...</div>
      </div>
    );
  }

  const contactInfo = {
    company_name: settings?.company_name,
    address: settings?.address,
    phone: settings?.company_phone,
    email: import.meta.env.VITE_CONTACT_EMAIL,
    opening_hours: settings?.opening_hours,
  };

  return (
    <div className='min-h-screen bg-stone-50 py-12 px-4 sm:px-6'>
      <div className='max-w-4xl mx-auto'>
        {/* Main Card */}
        <div className='bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden'>
          <div className='p-6 sm:p-8 md:p-10'>
            {/* Privacy Policy HTML content */}
            <div
              className='prose prose-stone max-w-none
                prose-headings:text-stone-800 prose-headings:font-semibold
                prose-p:text-stone-600 prose-p:leading-relaxed
                prose-ul:text-stone-600 prose-li:my-1
                prose-a:text-accent prose-a:no-underline hover:prose-a:underline
                prose-strong:text-stone-800'
              dangerouslySetInnerHTML={{
                __html: settings?.privacy_policy || "",
              }}
            />

            {/* Dynamic Company Contact Information */}
            <div className='mt-12 pt-8 border-t border-stone-200'>
              <h2 className='text-xl font-semibold text-stone-800 mb-4'>
                {t("privacy.companyContact", "Company Contact Information")}
              </h2>
              <div className='bg-stone-50 rounded-xl p-5 space-y-2 text-stone-600'>
                <p className='flex items-start gap-3'>
                  <i className='fa fa-building text-accent mt-1 w-4' />
                  <span>
                    <strong>{t("privacy.companyName", "Company")}:</strong>{" "}
                    {contactInfo.company_name}
                  </span>
                </p>
                <p className='flex items-start gap-3'>
                  <i className='fa fa-map-marker-alt text-accent mt-1 w-4' />
                  <span>
                    <strong>{t("privacy.address", "Address")}:</strong>{" "}
                    {contactInfo.address ||
                      t("privacy.notProvided", "Not provided")}
                  </span>
                </p>
                <p className='flex items-start gap-3'>
                  <i className='fa fa-phone text-accent mt-1 w-4' />
                  <span>
                    <strong>{t("privacy.phone", "Phone")}:</strong>{" "}
                    {contactInfo.phone ||
                      t("privacy.notProvided", "Not provided")}
                  </span>
                </p>
                <p className='flex items-start gap-3'>
                  <i className='fa fa-envelope text-accent mt-1 w-4' />
                  <span>
                    <strong>{t("privacy.email", "Email")}:</strong>{" "}
                    <a
                      href={`mailto:${contactInfo.email}`}
                      className='text-accent hover:underline'
                    >
                      {contactInfo?.email}
                    </a>
                  </span>
                </p>
                {contactInfo.opening_hours && (
                  <p className='flex items-start gap-3'>
                    <i className='fa fa-clock text-accent mt-1 w-4' />
                    <span>
                      <strong>{t("privacy.hours", "Opening Hours")}:</strong>{" "}
                      {contactInfo.opening_hours}
                    </span>
                  </p>
                )}
              </div>
              <p className='text-xs text-stone-400 mt-4'>
                {t(
                  "privacy.contactNote",
                  "For any privacy-related questions, please contact us using the details above."
                )}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
