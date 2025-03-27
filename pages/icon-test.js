import Head from 'next/head';
import { useEffect, useState } from 'react';

export default function IconTest() {
  const [iconStatuses, setIconStatuses] = useState({});
  
  useEffect(() => {
    // Test icon URLs
    const iconsToTest = [
      {name: 'Microsoft Icon', path: '/assets/microsoft.svg'},
      {name: 'Instagram Icon', path: '/assets/instagram-icon.png'},
      {name: 'Main Site Icon', path: '/assets/icon.png'}
    ];
    
    const testIcons = async () => {
      const results = {};
      
      for (const icon of iconsToTest) {
        try {
          const res = await fetch(icon.path);
          results[icon.name] = {
            status: res.status,
            ok: res.ok,
            path: icon.path
          };
        } catch (err) {
          results[icon.name] = {
            status: 'Error',
            error: err.message,
            path: icon.path
          };
        }
      }
      
      setIconStatuses(results);
    };
    
    testIcons();
  }, []);
  
  return (
    <div style={{ padding: '2rem', fontFamily: 'Arial, sans-serif' }}>
      <Head>
        <title>Icon Testing Page</title>
      </Head>
      
      <h1>Icon Debug Page</h1>
      
      <div style={{ marginTop: '2rem' }}>
        <h2>Icon Status Tests</h2>
        <pre style={{ background: '#f1f1f1', padding: '1rem', borderRadius: '5px' }}>
          {JSON.stringify(iconStatuses, null, 2)}
        </pre>
      </div>
      
      <div style={{ marginTop: '2rem' }}>
        <h2>Direct Icon Displays</h2>
        
        <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', marginTop: '1rem' }}>
          <div>
            <h3>Microsoft SVG Icon</h3>
            <img src="/assets/microsoft.svg" alt="Microsoft Icon" style={{ width: '64px', height: '64px', border: '1px solid #ccc' }} />
          </div>
          
          <div>
            <h3>Instagram PNG Icon</h3>
            <img src="/assets/instagram-icon.png" alt="Instagram Icon" style={{ width: '64px', height: '64px', border: '1px solid #ccc' }} />
          </div>
          
          <div>
            <h3>Main Site PNG Icon</h3>
            <img src="/assets/icon.png" alt="Main Site Icon" style={{ width: '64px', height: '64px', border: '1px solid #ccc' }} />
          </div>
        </div>
      </div>
    </div>
  );
} 