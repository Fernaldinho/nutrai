import { getPublicProfileBySlug } from '@/app/actions/settings';
import { MapPin, Phone, MessageSquare, Globe, Heart } from 'lucide-react';

export default async function PublicProfilePage({ params }) {
  const { slug } = params;
  const profile = await getPublicProfileBySlug(slug);

  if (!profile) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-main)', color: 'var(--text-primary)' }}>
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ fontSize: '3rem', fontWeight: '800', marginBottom: '16px' }}>404</h1>
          <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)' }}>Profissional não encontrado.</p>
        </div>
      </div>
    );
  }

  const MapPreview = ({ address }) => {
    if (!address) return null;
    const encodedAddress = encodeURIComponent(address);
    const simpleEmbedUrl = `https://maps.google.com/maps?q=${encodedAddress}&t=&z=15&ie=UTF8&iwloc=&output=embed`;

    return (
      <div style={{ width: '100%', height: '240px', borderRadius: '16px', overflow: 'hidden', border: '1px solid var(--border-light)', marginTop: '16px' }}>
        <iframe
          width="100%"
          height="100%"
          frameBorder="0" style={{ border: 0 }}
          src={simpleEmbedUrl}
          allowFullScreen
        ></iframe>
      </div>
    );
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: profile.custom_theme === 'dark' ? '#0f172a' : '#f8fafc',
      color: profile.custom_theme === 'dark' ? '#f8fafc' : '#0f172a',
      padding: '40px 20px',
      fontFamily: 'Inter, system-ui, sans-serif'
    }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        
        {/* Header Card */}
        <div style={{ 
          background: profile.custom_theme === 'dark' ? 'rgba(30, 41, 59, 0.7)' : 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(12px)',
          borderRadius: '24px',
          padding: '40px',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
          border: '1px solid ' + (profile.custom_theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'),
          textAlign: 'center',
          marginBottom: '32px'
        }}>
          <div style={{ 
            width: '120px', height: '120px', borderRadius: '50%', margin: '0 auto 24px', 
            overflow: 'hidden', border: `4px solid ${profile.custom_color || '#06c2ae'}`,
            boxShadow: `0 0 20px -5px ${profile.custom_color || '#06c2ae'}`
          }}>
            <img 
              src={profile.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name)}&background=06c2ae&color=fff`} 
              alt={profile.name}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
          
          <h1 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '8px' }}>{profile.name}</h1>
          {profile.crn && <p style={{ fontSize: '1rem', color: 'var(--text-tertiary)', marginBottom: '24px' }}>{profile.crn}</p>}
          
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '12px' }}>
             {profile.whatsapp_number && (
               <a 
                 href={`https://wa.me/${profile.whatsapp_number.replace(/\D/g, '')}?text=${encodeURIComponent(profile.whatsapp_message || 'Olá!')}`}
                 style={{ 
                   display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px', 
                   borderRadius: '12px', background: '#25D366', color: 'white', fontWeight: '600', textDecoration: 'none',
                   transition: 'transform 0.2s'
                 }}
                 onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
                 onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
               >
                 <MessageSquare size={18} /> WhatsApp
               </a>
             )}
             <button style={{ 
               display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px', 
               borderRadius: '12px', background: profile.custom_color || '#06c2ae', color: 'white', fontWeight: '600', border: 'none',
               cursor: 'pointer', transition: 'transform 0.2s'
             }}>
               Agendar Consulta
             </button>
          </div>
        </div>

        {/* Locations Section */}
        <div style={{ 
          background: profile.custom_theme === 'dark' ? 'rgba(30, 41, 59, 0.7)' : 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(12px)',
          borderRadius: '24px',
          padding: '32px',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
          border: '1px solid ' + (profile.custom_theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)')
        }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <MapPin size={22} style={{ color: profile.custom_color || '#06c2ae' }} />
            Onde Atendo
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px' }}>
            {profile.locations.length === 0 ? (
              <p style={{ textAlign: 'center', padding: '20px', color: 'var(--text-tertiary)' }}>Atendimento Online apenas.</p>
            ) : (
              profile.locations.map(loc => (
                <div key={loc.id} style={{ 
                  padding: '24px', borderRadius: '20px', 
                  background: profile.custom_theme === 'dark' ? 'rgba(15, 23, 42, 0.5)' : 'rgba(248, 250, 252, 0.8)',
                  border: '1px solid ' + (profile.custom_theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)')
                }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '4px' }}>{loc.name}</h3>
                  <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>{loc.address}</p>
                  
                  {loc.address && <MapPreview address={loc.address} />}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Footer */}
        <div style={{ textAlign: 'center', marginTop: '40px', paddingBottom: '40px', opacity: 0.6 }}>
          <p style={{ fontSize: '14px' }}>
            Powered by <strong>NutriSaaS</strong> — {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </div>
  );
}
