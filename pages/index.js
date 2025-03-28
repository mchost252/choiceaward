import { useEffect } from 'react';
import { useRouter } from 'next/router';
import fs from 'fs';
import path from 'path';

// This gets called at build time
export async function getStaticProps() {
  const filePath = path.join(process.cwd(), 'public', 'index.html');
  const htmlContent = fs.readFileSync(filePath, 'utf8');
  
  return {
    props: {
      htmlContent
    }
  };
}

export default function Home({ htmlContent }) {
  // Use dangerouslySetInnerHTML to render the static HTML
  return (
    <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
  );
} 