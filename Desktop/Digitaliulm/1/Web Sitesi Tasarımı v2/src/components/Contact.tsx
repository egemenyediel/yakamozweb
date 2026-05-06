import { useState, useEffect } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle } from "lucide-react";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { loadContent, ContactInfo } from '../utils/contentManager';
import { toast } from 'sonner';

interface ContactProps {
  lang: 'tr' | 'de' | 'en';
}

export function Contact({ lang }: ContactProps) {
  const [contactInfo, setContactInfo] = useState<ContactInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });

  useEffect(() => {
    loadContent().then(content => {
      if (content) {
        setContactInfo(content.contact);
      }
    });
  }, []);

  const translations = {
    tr: {
      subtitle: 'İletişim',
      title: 'Projeleriniz İçin Bizimle İletişime Geçin',
      description: '24 saat içinde geri dönüş yapıyoruz',
      name: 'Adınız',
      email: 'E-posta',
      message: 'Mesajınız',
      send: 'Gönder',
      success: 'Mesajınız başarıyla gönderildi!',
      error: 'Bir hata oluştu. Lütfen tekrar deneyin.',
      phone: 'Telefon',
      address: 'Adres',
      messageSent: 'Mesaj başarıyla gönderildi. Kısa süre içinde size dönüş yapacağız.'
    },
    de: {
      subtitle: 'Kontakt',
      title: 'Kontaktieren Sie uns für Ihre Projekte',
      description: 'Wir antworten innerhalb von 24 Stunden',
      name: 'Ihr Name',
      email: 'E-Mail',
      message: 'Ihre Nachricht',
      send: 'Senden',
      success: 'Ihre Nachricht wurde erfolgreich gesendet!',
      error: 'Es ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut.',
      phone: 'Telefon',
      address: 'Adresse',
      messageSent: 'Nachricht erfolgreich gesendet. Wir werden Sie bald kontaktieren.'
    },
    en: {
      subtitle: 'Contact',
      title: 'Get in Touch for Your Projects',
      description: 'We respond within 24 hours',
      name: 'Your Name',
      email: 'Email',
      message: 'Your Message',
      send: 'Send',
      success: 'Your message was sent successfully!',
      error: 'An error occurred. Please try again.',
      phone: 'Phone',
      address: 'Address',
      messageSent: 'Message sent successfully. We will get back to you soon.'
    }
  };

  const t = translations[lang];

  const openMailFallback = () => {
    const targetEmail = contactInfo?.email || 'info@digitaliulm.de';
    const subject = encodeURIComponent('Digitaliulm Contact Form');
    const body = encodeURIComponent(
      `Name: ${formData.name}\nEmail: ${formData.email}\n\nMessage:\n${formData.message}`
    );
    window.location.href = `mailto:${targetEmail}?subject=${subject}&body=${body}`;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      const targetEmail = contactInfo?.email || 'info@digitaliulm.de';

      const response = await fetch(`https://formsubmit.co/ajax/${targetEmail}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          message: formData.message,
          _subject: `Digitaliulm Contact (${lang.toUpperCase()})`,
          _template: 'table',
          _captcha: false,
        }),
      });

      if (response.ok) {
        toast.success(t.success);
        setSubmitted(true);
        setFormData({ name: '', email: '', message: '' });
        
        // Reset success message after 5 seconds
        setTimeout(() => setSubmitted(false), 5000);
      } else {
        toast.error(t.error);
        openMailFallback();
      }
    } catch (error) {
      console.error('Form submission error:', error);
      toast.error(t.error);
      openMailFallback();
    } finally {
      setLoading(false);
    }
  };

  if (!contactInfo) return null;

  return (
    <section id="contact" className="py-24 md:py-32 relative">
      {/* Semi-transparent overlay for readability */}
      <div className="absolute inset-0 bg-black/15 backdrop-blur-sm" />
      
      <div className="max-w-[1400px] mx-auto px-4 md:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-block mb-4">
            <span className="text-sm px-4 py-2 rounded-full bg-[#0EA5E9]/10 text-[#0EA5E9] border border-[#0EA5E9]/20">
              {t.subtitle}
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl text-white mb-6 tracking-tight">
            {t.title}
          </h2>
          <p className="text-lg md:text-xl text-white/60">
            {t.description}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Contact Form */}
          <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-white/5 to-transparent p-8">
            {submitted && (
              <div className="mb-6 p-4 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                <p className="text-green-400 text-sm">{t.messageSent}</p>
              </div>
            )}
            
            <form 
              name="contact"
              method="POST"
              netlify-honeypot="bot-field"
              onSubmit={handleSubmit}
              className="space-y-6"
            >
              {/* Netlify honeypot field */}
              <input type="hidden" name="form-name" value="contact" />
              <input type="hidden" name="bot-field" />
              
              <div>
                <Input 
                  type="text"
                  name="name"
                  placeholder={t.name}
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/40 rounded-xl h-12 focus:border-[#0EA5E9] focus:ring-[#0EA5E9]"
                />
              </div>
              <div>
                <Input 
                  type="email" 
                  name="email"
                  placeholder={t.email}
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/40 rounded-xl h-12 focus:border-[#0EA5E9] focus:ring-[#0EA5E9]"
                />
              </div>
              <div>
                <Textarea 
                  name="message"
                  placeholder={t.message}
                  value={formData.message}
                  onChange={handleInputChange}
                  required
                  rows={6}
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/40 rounded-xl resize-none focus:border-[#0EA5E9] focus:ring-[#0EA5E9]"
                />
              </div>
              <button 
                type="submit"
                disabled={loading}
                className="group w-full inline-flex items-center justify-center gap-3 px-8 py-4 bg-[#0EA5E9] text-white rounded-full hover:bg-[#0284c7] disabled:bg-gray-500 disabled:cursor-not-allowed transition-all duration-300 shadow-[0_0_30px_rgba(14,165,233,0.3)] hover:shadow-[0_0_40px_rgba(14,165,233,0.5)]"
              >
                <span className="font-medium">{loading ? '...' : t.send}</span>
                <Send className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </form>
          </div>

          {/* Contact Info */}
          <div className="space-y-6">
            <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-white/5 to-transparent p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#0EA5E9]/10 border border-[#0EA5E9]/20 flex items-center justify-center flex-shrink-0">
                  <Mail className="w-6 h-6 text-[#0EA5E9]" />
                </div>
                <div>
                  <p className="text-sm text-white/60 mb-1">Email</p>
                  <p className="text-white">{contactInfo.email}</p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-white/5 to-transparent p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#0EA5E9]/10 border border-[#0EA5E9]/20 flex items-center justify-center flex-shrink-0">
                  <Phone className="w-6 h-6 text-[#0EA5E9]" />
                </div>
                <div>
                  <p className="text-sm text-white/60 mb-1">{t.phone}</p>
                  <p className="text-white">{contactInfo.phone}</p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-white/5 to-transparent p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#0EA5E9]/10 border border-[#0EA5E9]/20 flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-6 h-6 text-[#0EA5E9]" />
                </div>
                <div>
                  <p className="text-sm text-white/60 mb-1">{t.address}</p>
                  <p className="text-white">{contactInfo.address[lang]}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
