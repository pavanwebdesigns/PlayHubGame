import React, { useState, useEffect, useRef } from 'react';
import QRCodeStyling, { type CornerDotType, type CornerSquareType, type DotType } from 'qr-code-styling';
import {
    FaLink, FaAlignLeft, FaWifi, FaAddressCard, FaEnvelope,
    FaPhone, FaWhatsapp, FaDownload, FaVectorSquare, FaComment,
    FaCalendarCheck, FaMapMarkerAlt, FaBitcoin, FaFileAlt, FaFacebook,
    FaInstagram, FaTwitter, FaYoutube, FaInfoCircle
} from 'react-icons/fa';

// Types of QR Codes
type QRType = 'url' | 'text' | 'wifi' | 'vcard' | 'email' | 'phone' | 'sms' | 'whatsapp' | 'event' | 'geo' | 'crypto' | 'file' | 'social';
type SocialType = 'facebook' | 'instagram' | 'twitter' | 'youtube';

const QRGeneratorPage = ({ onBack }: { onBack: () => void }) => {
    const [qrCode] = useState<QRCodeStyling>(new QRCodeStyling({
        width: 300,
        height: 300,
        type: "svg",
        data: "https://example.com",
        image: "",
        dotsOptions: { color: "#ffffff", type: "rounded" },
        backgroundOptions: { color: "transparent" },
        imageOptions: { crossOrigin: "anonymous", margin: 10 },
        cornersSquareOptions: { color: "#ffffff", type: "extra-rounded" },
        cornersDotOptions: { color: "#ffffff", type: "dot" }
    }));

    const ref = useRef<HTMLDivElement>(null);
    const [currentType, setCurrentType] = useState<QRType>('url');
    const [socialType, setSocialType] = useState<SocialType | null>(null);

    // Input States
    const [url, setUrl] = useState('https://example.com');
    const [text, setText] = useState('Hello World');
    const [ssid, setSsid] = useState('MyWiFi');
    const [wifiPass, setWifiPass] = useState('');
    const [encryption, setEncryption] = useState('WPA');
    const [phone, setPhone] = useState('');
    const [message, setMessage] = useState('');
    const [email, setEmail] = useState('');
    const [subject, setSubject] = useState('');
    const [body, setBody] = useState('');

    // vCard States
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [org, setOrg] = useState('');
    const [vPhone, setVPhone] = useState('');
    const [vEmail, setVEmail] = useState('');
    const [vUrl, setVUrl] = useState('');

    // Other States
    const [eventTitle, setEventTitle] = useState('Event');
    const [eventStart, setEventStart] = useState('');
    const [eventEnd, setEventEnd] = useState('');
    const [eventLoc, setEventLoc] = useState('');
    const [geoLat, setGeoLat] = useState('');
    const [geoLon, setGeoLon] = useState('');
    const [cryptoAddr, setCryptoAddr] = useState('');
    const [cryptoAmount, setCryptoAmount] = useState('');

    // Styling States
    const [dotsColor, setDotsColor] = useState('#000000');
    const [frameColor, setFrameColor] = useState('#000000');
    const [ballColor, setBallColor] = useState('#000000');
    const [bgColor, setBgColor] = useState('#ffffff');
    const [dotsType, setDotsType] = useState<DotType>('rounded');
    const [frameType, setFrameType] = useState<CornerSquareType>('extra-rounded');
    const [ballType, setBallType] = useState<CornerDotType>('dot');
    const [logo, setLogo] = useState<string | undefined>(undefined);

    useEffect(() => {
        if (ref.current) {
            ref.current.innerHTML = '';
            qrCode.append(ref.current);
        }
    }, [qrCode]);

    useEffect(() => {
        generateQR();
        // generateQR is recreated every render; the inputs below already cover when it should run.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        currentType, url, text, ssid, wifiPass, encryption, phone, message,
        email, subject, body, firstName, lastName, org, vPhone, vEmail, vUrl,
        eventTitle, eventStart, eventEnd, eventLoc, geoLat, geoLon, cryptoAddr, cryptoAmount,
        dotsColor, frameColor, ballColor, bgColor, dotsType, frameType, ballType, logo, socialType
    ]);

    const generateQR = () => {
        let data = "";

        switch (currentType) {
            case 'url':
            case 'file':
                data = url;
                break;
            case 'social':
                // For social, we treat it like a URL but placeholder differs
                data = url;
                break;
            case 'text':
                data = text;
                break;
            case 'wifi':
                data = `WIFI:T:${encryption};S:${ssid};P:${wifiPass};;`;
                break;
            case 'phone':
                data = `tel:${phone}`;
                break;
            case 'sms':
                data = `SMSTO:${phone}:${message}`;
                break;
            case 'whatsapp':
                data = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
                break;
            case 'email':
                data = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
                break;
            case 'vcard': {
                const n = `${lastName};${firstName}`;
                const fn = `${firstName} ${lastName}`;
                data = `BEGIN:VCARD\nVERSION:3.0\nN:${n}\nFN:${fn}\nORG:${org}\nTEL:${vPhone}\nEMAIL:${vEmail}\nURL:${vUrl}\nEND:VCARD`;
                break;
            }
            case 'event': {
                const start = eventStart.replace(/[-:]/g, "");
                const end = eventEnd.replace(/[-:]/g, "");
                data = `BEGIN:VEVENT\nSUMMARY:${eventTitle}\nDTSTART:${start}\nDTEND:${end}\nLOCATION:${eventLoc}\nEND:VEVENT`;
                break;
            }
            case 'geo':
                data = `geo:${geoLat},${geoLon}`;
                break;
            case 'crypto':
                data = `bitcoin:${cryptoAddr}${cryptoAmount ? `?amount=${cryptoAmount}` : ''}`;
                break;
            default:
                data = "https://example.com";
        }

        qrCode.update({
            data: data,
            image: logo,
            dotsOptions: { color: dotsColor, type: dotsType },
            backgroundOptions: { color: bgColor },
            cornersSquareOptions: { color: frameColor, type: frameType },
            cornersDotOptions: { color: ballColor, type: ballType }
        });
    };

    const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                setLogo(e.target?.result as string);
            };
            reader.readAsDataURL(file);
        } else {
            setLogo(undefined);
        }
    };

    const downloadQR = (ext: 'png' | 'svg') => {
        qrCode.download({ name: "my-qr-code", extension: ext });
    };

    return (
        <div className="min-vh-100 w-100 d-flex flex-column align-items-center position-relative animate-fade-in" style={{ paddingTop: '80px' }}>

            {/* Standard Back Button */}
            <button
                onClick={onBack}
                className="btn btn-link text-white text-decoration-none position-absolute top-0 start-0 m-4 z-3 d-flex align-items-center gap-2"
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
                Back to Tools
            </button>

            <div className="container p-0 text-white" style={{ maxWidth: '1320px' }}>
                <div className="text-center mb-5">
                    <h1 className="display-4 fw-bold text-white">QR Code Generator</h1>
                </div>

                <div className="row g-4">
                    {/* Left Column: Controls */}
                    <div className="col-lg-7">

                        {/* 1. Type Selection */}
                        <div className="card border-0 bg-dark bg-opacity-50 p-4 mb-4 rounded-4 shadow-sm border border-white border-opacity-10">
                            <h6 className="text-white-50 text-uppercase fw-bold mb-3 small">Select Type</h6>
                            <div className="d-flex flex-wrap gap-2">
                                {/* Common */}
                                {[
                                    { id: 'url', Icon: FaLink, colorClass: 'text-primary', label: 'URL' },
                                    { id: 'text', Icon: FaAlignLeft, colorClass: 'text-success', label: 'Text' },
                                    { id: 'wifi', Icon: FaWifi, colorClass: 'text-info', label: 'WiFi' },
                                    { id: 'vcard', Icon: FaAddressCard, colorClass: 'text-warning', label: 'vCard' },
                                    { id: 'email', Icon: FaEnvelope, colorClass: 'text-danger', label: 'Email' },
                                    { id: 'phone', Icon: FaPhone, colorClass: 'text-success', label: 'Phone' },
                                    { id: 'sms', Icon: FaComment, colorClass: 'text-info', label: 'SMS' },
                                    { id: 'whatsapp', Icon: FaWhatsapp, colorClass: 'text-success', label: 'WhatsApp' },
                                    { id: 'event', Icon: FaCalendarCheck, colorClass: 'text-primary', label: 'Event' },
                                    { id: 'geo', Icon: FaMapMarkerAlt, colorClass: 'text-danger', label: 'Location' },
                                    { id: 'crypto', Icon: FaBitcoin, colorClass: 'text-warning', label: 'Bitcoin' },
                                    { id: 'file', Icon: FaFileAlt, colorClass: 'text-secondary', label: 'File' },
                                ].map(type => (
                                    <button
                                        key={type.id}
                                        className={`btn border-0 py-2 px-3 rounded-lg d-flex flex-column align-items-center justify-content-center gap-1 transition-all ${currentType === type.id && !socialType ? 'bg-primary text-white shadow ring-2 ring-primary ring-opacity-50' : 'bg-gray-900 border border-gray-700 text-gray-400 hover:bg-gray-800'}`}
                                        style={{ width: '80px', height: '70px', backgroundColor: currentType === type.id && !socialType ? '#4f46e5' : '#111827', borderColor: currentType === type.id && !socialType ? '#4f46e5' : '#374151' }}
                                        onClick={() => { setCurrentType(type.id as QRType); setSocialType(null); }}
                                    >
                                        <span style={{ fontSize: '1.4rem' }}>
                                            <type.Icon className={currentType === type.id && !socialType ? 'text-white' : type.colorClass} />
                                        </span>
                                        <span className="small text-nowrap fw-bold" style={{ fontSize: '0.75rem', color: currentType === type.id && !socialType ? 'white' : '#9ca3af' }}>{type.label}</span>
                                    </button>
                                ))}

                                {/* Socials */}
                                {[
                                    { id: 'facebook', Icon: FaFacebook, colorClass: 'text-primary', label: 'FB' },
                                    { id: 'instagram', Icon: FaInstagram, colorClass: 'text-danger', label: 'Insta' },
                                    { id: 'twitter', Icon: FaTwitter, colorClass: 'text-info', label: 'X/Tw' },
                                    { id: 'youtube', Icon: FaYoutube, colorClass: 'text-danger', label: 'YouTube' },
                                ].map(soc => (
                                    <button
                                        key={soc.id}
                                        className={`btn border-0 py-2 px-3 rounded-lg d-flex flex-column align-items-center justify-content-center gap-1 transition-all ${socialType === soc.id ? 'bg-primary text-white shadow ring-2 ring-primary ring-opacity-50' : 'bg-gray-900 border border-gray-700 text-gray-400 hover:bg-gray-800'}`}
                                        style={{ width: '80px', height: '70px', backgroundColor: socialType === soc.id ? '#4f46e5' : '#111827', borderColor: socialType === soc.id ? '#4f46e5' : '#374151' }}
                                        onClick={() => { setCurrentType('social'); setSocialType(soc.id as SocialType); }}
                                    >
                                        <span style={{ fontSize: '1.4rem' }}>
                                            <soc.Icon className={socialType === soc.id ? 'text-white' : soc.colorClass} />
                                        </span>
                                        <span className="small text-nowrap fw-bold" style={{ fontSize: '0.75rem', color: socialType === soc.id ? 'white' : '#9ca3af' }}>{soc.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>



                        {/* 3. Input Fields (Dynamic) */}
                        <div className="card border-0 bg-dark bg-opacity-50 p-4 rounded-4 shadow-sm border border-white border-opacity-10">
                            <h6 className="text-uppercase fw-bold mb-3 small d-flex align-items-center gap-2 text-primary">
                                {currentType === 'url' && <><FaLink /> Website URL</>}
                                {currentType === 'social' && socialType === 'facebook' && <><FaFacebook /> Facebook Profile</>}
                                {currentType === 'social' && socialType === 'instagram' && <><FaInstagram /> Instagram Profile</>}
                                {currentType === 'social' && socialType === 'twitter' && <><FaTwitter /> X/Twitter Profile</>}
                                {currentType === 'social' && socialType === 'youtube' && <><FaYoutube /> YouTube Channel</>}
                                {currentType === 'file' && <><FaFileAlt /> File Link</>}
                                {currentType === 'text' && <><FaAlignLeft /> Plain Text</>}
                                {currentType === 'wifi' && <><FaWifi /> Network Details</>}
                                {currentType === 'vcard' && <><FaAddressCard /> Contact Info</>}
                                {currentType === 'email' && <><FaEnvelope /> Email Details</>}
                                {currentType === 'event' && <><FaCalendarCheck /> Event Details</>}
                                {currentType === 'geo' && <><FaMapMarkerAlt /> Geo Location</>}
                                {currentType === 'crypto' && <><FaBitcoin /> Crypto Payment</>}
                            </h6>

                            <div>
                                {(currentType === 'url' || currentType === 'social' || currentType === 'file') && (
                                    <>
                                        <input type="text" className="form-control form-control-lg bg-black text-white border-secondary border-opacity-25 rounded-3" placeholder={currentType === 'social' ? `https://${socialType}.com/username` : "https://example.com"} value={url} onChange={(e) => setUrl(e.target.value)} />
                                        {currentType === 'file' && <p className="text-white-50 small mt-2"><FaInfoCircle /> For files, upload to a cloud service (Drive, Dropbox) and paste the link here.</p>}
                                    </>
                                )}

                                {currentType === 'text' && (
                                    <textarea className="form-control bg-black text-white border-secondary border-opacity-25 rounded-3" rows={4} placeholder="Type your text..." value={text} onChange={(e) => setText(e.target.value)}></textarea>
                                )}

                                {currentType === 'wifi' && (
                                    <div className="d-flex flex-column gap-3">
                                        <input type="text" className="form-control bg-black text-white border-secondary border-opacity-25" placeholder="Network Name (SSID)" value={ssid} onChange={(e) => setSsid(e.target.value)} />
                                        <div className="row g-3">
                                            <div className="col-8">
                                                <input type="text" className="form-control bg-black text-white border-secondary border-opacity-25" placeholder="Password" value={wifiPass} onChange={(e) => setWifiPass(e.target.value)} />
                                            </div>
                                            <div className="col-4">
                                                <select className="form-select bg-black text-white border-secondary border-opacity-25" value={encryption} onChange={(e) => setEncryption(e.target.value)}>
                                                    <option value="WPA">WPA/2</option>
                                                    <option value="WEP">WEP</option>
                                                    <option value="nopass">None</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {(currentType === 'phone' || currentType === 'sms' || currentType === 'whatsapp') && (
                                    <div className="d-flex flex-column gap-3">
                                        <input type="text" className="form-control bg-black text-white border-secondary border-opacity-25" placeholder="Phone Number (e.g. +1234567890)" value={phone} onChange={(e) => setPhone(e.target.value)} />
                                        {currentType !== 'phone' && (
                                            <textarea className="form-control bg-black text-white border-secondary border-opacity-25" rows={3} placeholder="Message..." value={message} onChange={(e) => setMessage(e.target.value)}></textarea>
                                        )}
                                    </div>
                                )}

                                {currentType === 'email' && (
                                    <div className="d-flex flex-column gap-3">
                                        <input type="email" className="form-control bg-black text-white border-secondary border-opacity-25" placeholder="Recipient Email" value={email} onChange={(e) => setEmail(e.target.value)} />
                                        <input type="text" className="form-control bg-black text-white border-secondary border-opacity-25" placeholder="Subject" value={subject} onChange={(e) => setSubject(e.target.value)} />
                                        <textarea className="form-control bg-black text-white border-secondary border-opacity-25" rows={3} placeholder="Body..." value={body} onChange={(e) => setBody(e.target.value)}></textarea>
                                    </div>
                                )}

                                {currentType === 'vcard' && (
                                    <div className="d-flex flex-column gap-3">
                                        <div className="row g-3">
                                            <div className="col-6">
                                                <input type="text" className="form-control bg-black text-white border-secondary border-opacity-25" placeholder="First Name" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                                            </div>
                                            <div className="col-6">
                                                <input type="text" className="form-control bg-black text-white border-secondary border-opacity-25" placeholder="Last Name" value={lastName} onChange={(e) => setLastName(e.target.value)} />
                                            </div>
                                        </div>
                                        <input type="text" className="form-control bg-black text-white border-secondary border-opacity-25" placeholder="Organization" value={org} onChange={(e) => setOrg(e.target.value)} />
                                        <input type="text" className="form-control bg-black text-white border-secondary border-opacity-25" placeholder="Phone" value={vPhone} onChange={(e) => setVPhone(e.target.value)} />
                                        <input type="email" className="form-control bg-black text-white border-secondary border-opacity-25" placeholder="Email" value={vEmail} onChange={(e) => setVEmail(e.target.value)} />
                                        <input type="text" className="form-control bg-black text-white border-secondary border-opacity-25" placeholder="Website" value={vUrl} onChange={(e) => setVUrl(e.target.value)} />
                                    </div>
                                )}

                                {currentType === 'event' && (
                                    <div className="d-flex flex-column gap-3">
                                        <input type="text" className="form-control bg-black text-white border-secondary border-opacity-25" placeholder="Event Title" value={eventTitle} onChange={(e) => setEventTitle(e.target.value)} />
                                        <div className="row g-3">
                                            <div className="col-6">
                                                <label className="text-white-50 small">Start</label>
                                                <input type="datetime-local" className="form-control bg-black text-white border-secondary border-opacity-25" value={eventStart} onChange={(e) => setEventStart(e.target.value)} />
                                            </div>
                                            <div className="col-6">
                                                <label className="text-white-50 small">End</label>
                                                <input type="datetime-local" className="form-control bg-black text-white border-secondary border-opacity-25" value={eventEnd} onChange={(e) => setEventEnd(e.target.value)} />
                                            </div>
                                        </div>
                                        <input type="text" className="form-control bg-black text-white border-secondary border-opacity-25" placeholder="Location" value={eventLoc} onChange={(e) => setEventLoc(e.target.value)} />
                                    </div>
                                )}

                                {currentType === 'geo' && (
                                    <div className="row g-3">
                                        <div className="col-6">
                                            <input type="text" className="form-control bg-black text-white border-secondary border-opacity-25" placeholder="Latitude" value={geoLat} onChange={(e) => setGeoLat(e.target.value)} />
                                        </div>
                                        <div className="col-6">
                                            <input type="text" className="form-control bg-black text-white border-secondary border-opacity-25" placeholder="Longitude" value={geoLon} onChange={(e) => setGeoLon(e.target.value)} />
                                        </div>
                                    </div>
                                )}

                                {currentType === 'crypto' && (
                                    <div className="d-flex flex-column gap-3">
                                        <input type="text" className="form-control bg-black text-white border-secondary border-opacity-25" placeholder="Bitcoin Address" value={cryptoAddr} onChange={(e) => setCryptoAddr(e.target.value)} />
                                        <input type="number" className="form-control bg-black text-white border-secondary border-opacity-25" placeholder="Amount (BTC)" value={cryptoAmount} onChange={(e) => setCryptoAmount(e.target.value)} />
                                    </div>
                                )}

                            </div>
                        </div>

                        {/* 3. Style Controls (Design Studio) */}
                        <div className="card border-0 bg-dark bg-opacity-50 p-4 mb-4 mt-4 rounded-4 shadow-sm border border-white border-opacity-10">
                            <h6 className="text-white-50 text-uppercase fw-bold mb-3 small">Design Studio</h6>

                            <div className="row g-3">
                                <div className="col-md-6">
                                    <label className="text-white-50 small mb-1">Pattern</label>
                                    <div className="d-flex gap-2">
                                        <select className="form-select form-select-sm bg-black text-white border-secondary border-opacity-25 rounded-3" value={dotsType} onChange={(e) => setDotsType(e.target.value as DotType)}>
                                            <option value="square">Square</option>
                                            <option value="dots">Dots</option>
                                            <option value="rounded">Rounded</option>
                                            <option value="extra-rounded">Extra Rounded</option>
                                            <option value="classy">Classy</option>
                                            <option value="classy-rounded">Classy Rounded</option>
                                        </select>
                                        <input type="color" className="form-control form-control-color bg-transparent border-0 p-0" value={dotsColor} onChange={(e) => setDotsColor(e.target.value)} title="Choose Color" />
                                    </div>
                                </div>

                                <div className="col-md-6">
                                    <label className="text-white-50 small mb-1">Eye Frame</label>
                                    <div className="d-flex gap-2">
                                        <select className="form-select form-select-sm bg-black text-white border-secondary border-opacity-25 rounded-3" value={frameType} onChange={(e) => setFrameType(e.target.value as CornerSquareType)}>
                                            <option value="square">Square</option>
                                            <option value="dot">Dot</option>
                                            <option value="extra-rounded">Extra Rounded</option>
                                        </select>
                                        <input type="color" className="form-control form-control-color bg-transparent border-0 p-0" value={frameColor} onChange={(e) => setFrameColor(e.target.value)} title="Choose Color" />
                                    </div>
                                </div>

                                <div className="col-md-6">
                                    <label className="text-white-50 small mb-1">Eye Ball</label>
                                    <div className="d-flex gap-2">
                                        <select className="form-select form-select-sm bg-black text-white border-secondary border-opacity-25 rounded-3" value={ballType} onChange={(e) => setBallType(e.target.value as CornerDotType)}>
                                            <option value="square">Square</option>
                                            <option value="dot">Dot</option>
                                        </select>
                                        <input type="color" className="form-control form-control-color bg-transparent border-0 p-0" value={ballColor} onChange={(e) => setBallColor(e.target.value)} title="Choose Color" />
                                    </div>
                                </div>

                                <div className="col-md-6">
                                    <label className="text-white-50 small mb-1">Background</label>
                                    <div className="d-flex gap-2 align-items-center bg-black bg-opacity-25 p-1 rounded-3 border border-white border-opacity-10 px-2">
                                        <span className="small text-white-50 me-auto">Color</span>
                                        <input type="color" className="form-control form-control-color bg-transparent border-0 p-0" value={bgColor} onChange={(e) => setBgColor(e.target.value)} title="Choose Color" />
                                    </div>
                                </div>

                                <div className="col-12">
                                    <label className="text-white-50 small mb-1">Logo</label>
                                    <input type="file" className="form-control form-control-sm bg-black text-white border-secondary border-opacity-25" accept="image/*" onChange={handleLogoUpload} />
                                </div>
                            </div>
                        </div>

                    </div>

                    {/* Right Column: Preview */}
                    <div className="col-lg-5">
                        <div className="sticky-top" style={{ top: '80px' }}>
                            <div className="card border-0 bg-dark p-0 overflow-hidden shadow-lg border border-white border-opacity-10 rounded-4">
                                <div className="card-body p-5 d-flex flex-column align-items-center justify-content-center text-center position-relative">
                                    {/* Glow Effect */}
                                    <div className="position-absolute top-50 start-50 translate-middle rounded-circle bg-primary opacity-25" style={{ width: '200px', height: '200px', filter: 'blur(60px)' }}></div>

                                    <h6 className="text-white-50 text-uppercase fw-bold mb-4 position-relative z-1">Live Preview</h6>

                                    <div className="bg-white p-3 rounded-4 shadow-lg position-relative z-1 mb-4" ref={ref} style={{ maxWidth: '100%' }}>
                                        {/* QR Canvas appends here */}
                                    </div>

                                    <div className="d-flex w-100 gap-3 position-relative z-1">
                                        <button className="btn btn-primary flex-grow-1 py-3 rounded-pill fw-bold shadow-lg d-flex align-items-center justify-content-center gap-2" onClick={() => downloadQR('png')}>
                                            <FaDownload /> PNG
                                        </button>
                                        <button className="btn btn-dark border border-secondary border-opacity-50 flex-grow-1 py-3 rounded-pill fw-bold shadow-lg d-flex align-items-center justify-content-center gap-2" onClick={() => downloadQR('svg')}>
                                            <FaVectorSquare /> SVG
                                        </button>
                                    </div>
                                </div>
                                <div className="card-footer bg-black bg-opacity-25 border-top border-white border-opacity-10 text-center py-3">
                                    <small className="text-white-50">Generated locally & securely in your browser.</small>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <style>{`
            .form-control-color {
                width: 40px;
                height: 38px;
                cursor: pointer;
            }
            .form-control-color::-webkit-color-swatch {
                border-radius: 8px;
                border: 1px solid rgba(255,255,255,0.2);
            }
             .animate-fade-in {
                animation: fadeIn 0.3s ease-in-out;
            }
            @keyframes fadeIn {
                from { opacity: 0; transform: translateY(10px); }
                to { opacity: 1; transform: translateY(0); }
            }
        `}</style>
            </div>
        </div>
    );
};

export default QRGeneratorPage;
