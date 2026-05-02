'use client';

const WhatsAppButton = () => {
    const phoneNumber = "972535378985";
    const message = encodeURIComponent("היי, הגעתי מהאתר Fiesta ואשמח לקבל פרטים נוספים");
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;

    return (
        <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="whatsapp-float-compact"
            aria-label="Contact us on WhatsApp"
        >
            <i className="fab fa-whatsapp"></i>
            <span className="whatsapp-label-small">נציג Fiesta</span>
        </a>
    );
};

export default WhatsAppButton;
