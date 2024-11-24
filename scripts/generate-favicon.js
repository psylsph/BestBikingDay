const sharp = require('sharp');

const svgString = `
<svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
  <rect width="32" height="32" fill="#1a1a1a"/>
  <circle cx="16" cy="16" r="12" fill="none" stroke="#ffffff" stroke-width="2"/>
  <path d="M10 16 L16 10 L22 16 L16 22 Z" fill="#ffffff"/>
</svg>
`;

sharp(Buffer.from(svgString))
  .resize(32, 32)
  .png()
  .toFile('assets/favicon.png')
  .then(() => console.log('Favicon generated successfully'))
  .catch(err => console.error('Error generating favicon:', err));
