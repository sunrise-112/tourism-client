const FloatingWhatsApp = ({ phoneNumber, message = "" }) => {
  const cleanNumber = phoneNumber?.replace(/[^0-9]/g, "");
  const href = `https://wa.me/${cleanNumber}${
    message ? `?text=${encodeURIComponent(message)}` : ""
  }`;

  return (
    <a
      href={href}
      target='_blank'
      rel='noopener noreferrer'
      aria-label='Chat on WhatsApp'
      className='fixed bottom-6 right-6 z-50 flex items-center justify-center
        w-14 h-14 rounded-full bg-green-500 shadow-lg shadow-green-500/30
        hover:bg-green-600 hover:scale-105 active:scale-95
        transition-all duration-200'
    >
      <span className='absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75 animate-ping' />
      <i className='fab fa-whatsapp text-white text-2xl relative' />
    </a>
  );
};

export default FloatingWhatsApp;
