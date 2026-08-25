/* =====================================================
   DISASTER PHOTO LIBRARY
   Curated, verified-loading Unsplash images per disaster
   type. Used as report/news thumbnails and picker cards so
   the UI never shows missing/broken icons.
===================================================== */

const UNSPLASH = (id) => `https://images.unsplash.com/${id}?w=600&auto=format&fit=crop&q=60`;

export const DISASTER_PHOTOS = {
  FLOOD: {
    url: UNSPLASH('photo-1547683905-f686c993aae5'),
    alt: 'Flooded street with rising water',
  },
  CYCLONE: {
    url: UNSPLASH('photo-1451187580459-43490279c0fa'),
    alt: 'Satellite view of a cyclone system',
  },
  EARTHQUAKE: {
    url: UNSPLASH('photo-1547471080-7cc2caa01a7e'),
    alt: 'Earthquake rubble and collapsed structures',
  },
  LANDSLIDE: {
    url: UNSPLASH('photo-1515694346937-94d85e41e6f0'),
    alt: 'Steep hill slope prone to landslide',
  },
  FIRE: {
    url: UNSPLASH('photo-1584967918940-a7d51b064268'),
    alt: 'Wildfire flames and smoke',
  },
  TSUNAMI: {
    url: UNSPLASH('photo-1439405326854-014607f694d7'),
    alt: 'Powerful ocean waves approaching shore',
  },
  EXTREME_HEAT: {
    url: UNSPLASH('photo-1509316785289-025f5b846b35'),
    alt: 'Scorching desert heat landscape',
  },
  LIGHTNING: {
    url: UNSPLASH('photo-1429552077091-836152271555'),
    alt: 'Lightning strike during thunderstorm',
  },
  INDUSTRIAL: {
    url: UNSPLASH('photo-1516937941344-00b4e0337589'),
    alt: 'Industrial plant emergency scene',
  },
  RAIN: {
    url: UNSPLASH('photo-1438449805896-28a666819a20'),
    alt: 'Heavy rainfall over the city',
  },
  DEFAULT: {
    url: UNSPLASH('photo-1516280440614-37939bbacd81'),
    alt: 'Emergency rescue operation',
  },
};

/* Resolve the best photo for a disaster type name/id.
   Falls back to the default rescue image for unknown types. */
export const getDisasterPhoto = (type) => {
  const key = String(type || '').toUpperCase();
  return (
    DISASTER_PHOTOS[key] ||
    Object.entries(DISASTER_PHOTOS).find(([k]) => key.includes(k))?.[1] ||
    DISASTER_PHOTOS.DEFAULT
  );
};
