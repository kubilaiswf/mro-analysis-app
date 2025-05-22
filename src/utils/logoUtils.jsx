/**
 * Utility functions for handling MRO company logos
 */

/**
 * Maps MRO company names to their logo file names
 * @param {string} companyName - The MRO company name
 * @returns {string} The logo file name or null if not found
 */
export const getMROLogoFilename = (companyName) => {
  // Normalize the company name for comparison
  const normalizedName = companyName.toLowerCase().trim();
  
  const logoMap = {
    'ajw technique': 'ajw.png',
    'aeroplex of central europe': 'Aeroplex.png',
    'ameco beijing': 'ameco-beijing.svg',
    'magnetic mro': 'magnetic_line_logo.jpeg',
    'magnetic line': 'magnetic_line_logo.jpeg',
    'direct maintenance': 'magnetic_line_logo.jpeg',
    's7 technics': 's7-technics.png',
    'kenya airways mro': 'kq_mro.jpg', 
    'lufthansa technik': 'lufthansa-technik.jpg',
    'kf aerospace': 'kf-aero.png',
    'klm uk engineering': 'klm-uk-engineering.jpeg',
    'korean air': 'korea-air.jpg',
    'israel aerospace industries (iai)': 'iai-logo.png',
    'bedek': 'iai-logo.png',
    'bedek - iai': 'iai-logo.png',
    'feam maintenance / engineering': 'feam.jpg',
    'feam aero': 'feam.jpg',
    'feam': 'feam.jpg',
    'dublin aerospace': 'dublin-aero.jpg',
    'efw gmbh': 'efw.png',
    'efw': 'efw.png',
    'elbe flugzeugwerke': 'efw.png',
    'cascade aerospace': 'cascasde-aerospace.webp',
    'aerfin': 'aerfin.jpeg',
    'air work': 'air_work_logo.png',
    'etihad airways engineering': 'Etihad-Airways-Engineering.jpg',
    'etihad engineering': 'Etihad-Airways-Engineering.jpg',
    'lot aircraft maintenance services': 'LOT-AMS.jpg', 
    'ethiopian airlines mro services': 'Ethiopian.jpg',
    'ethiopian mro': 'Ethiopian.jpg',
    'etg maintenance': 'ETG.png',
    'egyptair maintenance & engineering': 'EgyptAir.jpg',
    'coopesa, r.l.': 'Coopesa.png',
    'coopesa r.l.': 'Coopesa.png',
    'coopesa': 'Coopesa.png',
    'delta techops': 'DeltaTech.jpg',
    'china aircraft services limited (casl)': 'CASL.png',
    'bct aviation maintenance': 'BCT-Aviation-Maintenance.png',
    'aerostar': 'Aerostar-S.A.jpg',
    'atitech s.p.a.': 'Atitech.png',
    'aircraft maintenance and engineering service gmbh (amtes)': 'AMTES.png',
    'apella s.a.': 'APELLA.png',
    'aiesl': 'AIESL.jpg',
    'aviation maintenance & engineering services (ames)': 'AMES.png',
    'airborne maintenance & engineering services (ames)': 'AMES.png',
    'airborne maintenance & engineering services': 'AMES.png',
    'atlantic aviation group': 'AAG_WITH_SERVICES_LOGO_FINAL.png',
    'aerospace rotables': 'aerospace-rotables.png',
    'bird aviation': 'bird.jpg',
    'certified aviation services': 'CAS.jpg',
    'cas': 'CAS.jpg',
    'excel engineering ltd': '2excel.png',
    'ga telesis engine services': 'ga-telesis.png',
    'aar corp': 'AAR.png',
    'adria tehnika': 'adria.jpg',
    'aviation technical services (ats)': 'ATS.png',
    'iberia maintenance': 'iberia.jpg',
    'gmf aeroasia': 'gmf.png',
    'haeco group': 'HAECO.png',
    'turkish technic': 'Turkish.png',
    'thy technic': 'Turkish.png',
    'turkish airlines technic': 'Turkish.png',
    'thy technical': 'Turkish.png',
    // 'exhibitor bird': 'exhibitor-bird.jpg', // Still unclear
    // 'Untitled-1.png' : '' // Still needs MRO Name
  };

  // Try to find a match in the logo map
  for (const [key, value] of Object.entries(logoMap)) {
    if (normalizedName.includes(key)) {
      return value;
    }
  }

  // If no match is found, return null
  return null;
};

/**
 * Returns the full path to an MRO company logo
 * @param {string} companyName - The MRO company name
 * @returns {string} The full path to the logo or a default image if not found
 */
export const getMROLogoPath = (companyName) => {
  const logoFilename = getMROLogoFilename(companyName);
  if (logoFilename) {
    // Use the import.meta.url approach for Vite to correctly resolve assets
    return new URL(`../data/logos/${logoFilename}`, import.meta.url).href;
  }
  return null; // Return null if no logo is found
};

/**
 * Component to display an MRO company logo with fallback
 * @param {string} companyName - The MRO company name
 * @param {number} size - The desired size of the logo (width and height)
 * @param {boolean} isRounded - Whether the logo should have rounded corners
 * @returns {JSX.Element} The logo component
 */
export const MROLogo = ({ companyName, size = 48, isRounded = false, className = '' }) => {
  const logoPath = getMROLogoPath(companyName);
  
  return (
    <div 
      className={`flex items-center justify-center ${isRounded ? 'rounded-full' : 'rounded-md'} overflow-hidden shadow-xl border border-gray-300 ${className}`}
      style={{ width: `${size}px`, height: `${size}px` }}
    >
      {logoPath ? (
        <img 
          src={logoPath} 
          alt={`${companyName} logo`}
          className="object-cover w-full h-full"
          onError={(e) => {
            e.target.onerror = null;
            // Use the import.meta.url approach for Vite to correctly resolve the fallback asset
            e.target.src = new URL('../assets/default-mro-logo.png', import.meta.url).href;
          }}
        />
      ) : (
        <span className="text-gray-500 font-bold text-xs">{companyName.substring(0, 2).toUpperCase()}</span>
      )}
    </div>
  );
}; 