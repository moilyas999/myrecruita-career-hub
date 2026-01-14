/**
 * Location Intelligence Service
 * 
 * Smart location matching for UK recruitment, understanding:
 * - Regions and areas
 * - Commutable distances
 * - Remote/hybrid compatibility
 */

// ============================================================================
// UK Region Definitions
// ============================================================================

interface RegionDefinition {
  name: string;
  cities: string[];
  aliases: string[];
}

const UK_REGIONS: Record<string, RegionDefinition> = {
  'london': {
    name: 'Greater London',
    cities: ['london', 'city of london', 'westminster', 'canary wharf', 'shoreditch', 'mayfair', 'holborn'],
    aliases: ['ldn', 'central london', 'greater london', 'the city']
  },
  'south_east': {
    name: 'South East',
    cities: ['brighton', 'reading', 'oxford', 'guildford', 'milton keynes', 'crawley', 'watford', 'slough', 'woking', 'maidenhead', 'st albans', 'luton', 'cambridge', 'southampton', 'portsmouth'],
    aliases: ['se england', 'south east england', 'home counties']
  },
  'south_west': {
    name: 'South West',
    cities: ['bristol', 'bath', 'exeter', 'plymouth', 'bournemouth', 'swindon', 'gloucester', 'cheltenham', 'taunton', 'poole'],
    aliases: ['sw england', 'south west england', 'west country']
  },
  'midlands': {
    name: 'Midlands',
    cities: ['birmingham', 'nottingham', 'leicester', 'derby', 'coventry', 'wolverhampton', 'stoke', 'northampton', 'worcester', 'warwick', 'stratford', 'telford'],
    aliases: ['west midlands', 'east midlands', 'central england']
  },
  'north_west': {
    name: 'North West',
    cities: ['manchester', 'liverpool', 'chester', 'preston', 'blackpool', 'bolton', 'stockport', 'warrington', 'wigan', 'salford', 'oldham'],
    aliases: ['nw england', 'north west england']
  },
  'north_east': {
    name: 'North East',
    cities: ['newcastle', 'sunderland', 'durham', 'middlesbrough', 'darlington', 'gateshead', 'hartlepool'],
    aliases: ['ne england', 'north east england', 'tyneside']
  },
  'yorkshire': {
    name: 'Yorkshire & Humber',
    cities: ['leeds', 'sheffield', 'york', 'bradford', 'hull', 'huddersfield', 'doncaster', 'wakefield', 'harrogate', 'barnsley'],
    aliases: ['yorkshire', 'yorks', 'yorkshire and humber', 'humberside']
  },
  'east_anglia': {
    name: 'East of England',
    cities: ['norwich', 'ipswich', 'peterborough', 'colchester', 'chelmsford', 'southend', 'cambridge'],
    aliases: ['east anglia', 'east of england', 'eastern england']
  },
  'scotland': {
    name: 'Scotland',
    cities: ['edinburgh', 'glasgow', 'aberdeen', 'dundee', 'inverness', 'stirling', 'perth'],
    aliases: ['scottish', 'scots']
  },
  'wales': {
    name: 'Wales',
    cities: ['cardiff', 'swansea', 'newport', 'wrexham', 'bangor'],
    aliases: ['welsh', 'cymru']
  },
  'northern_ireland': {
    name: 'Northern Ireland',
    cities: ['belfast', 'derry', 'londonderry', 'lisburn', 'newry'],
    aliases: ['ni', 'ulster']
  }
};

// Approximate commute times between major cities (in minutes)
const COMMUTE_MATRIX: Record<string, Record<string, number>> = {
  'london': {
    'reading': 30,
    'guildford': 40,
    'watford': 25,
    'slough': 25,
    'st albans': 25,
    'luton': 35,
    'crawley': 45,
    'cambridge': 55,
    'oxford': 60,
    'milton keynes': 50,
    'brighton': 60,
    'southampton': 80,
  },
  'manchester': {
    'liverpool': 45,
    'leeds': 55,
    'sheffield': 55,
    'bolton': 25,
    'stockport': 20,
    'warrington': 30,
    'chester': 50,
  },
  'birmingham': {
    'coventry': 25,
    'wolverhampton': 20,
    'leicester': 50,
    'nottingham': 55,
    'derby': 45,
    'worcester': 40,
  },
  'leeds': {
    'bradford': 20,
    'sheffield': 45,
    'york': 30,
    'manchester': 55,
    'huddersfield': 25,
  },
  'edinburgh': {
    'glasgow': 50,
    'stirling': 45,
    'dundee': 65,
  },
  'bristol': {
    'bath': 15,
    'cardiff': 50,
    'gloucester': 45,
    'swindon': 50,
  }
};

// ============================================================================
// Location Matching Functions
// ============================================================================

export interface LocationMatch {
  score: number; // 0-100
  reason: string;
  distance_minutes?: number;
  is_compatible: boolean;
}

/**
 * Normalize a location string for comparison
 */
export function normalizeLocation(location: string): string {
  return location
    .toLowerCase()
    .trim()
    .replace(/[,\.]/g, '')
    .replace(/\s+/g, ' ');
}

/**
 * Find which region a city belongs to
 */
export function findRegion(city: string): string | null {
  const normalized = normalizeLocation(city);
  
  for (const [regionKey, region] of Object.entries(UK_REGIONS)) {
    if (region.cities.some(c => normalized.includes(c) || c.includes(normalized))) {
      return regionKey;
    }
    if (region.aliases.some(a => normalized.includes(a) || a.includes(normalized))) {
      return regionKey;
    }
    if (normalized.includes(region.name.toLowerCase())) {
      return regionKey;
    }
  }
  
  return null;
}

/**
 * Check if a location string indicates remote work
 */
export function isRemoteLocation(location: string): boolean {
  const normalized = normalizeLocation(location);
  const remoteIndicators = ['remote', 'work from home', 'wfh', 'anywhere', 'fully remote', 'home based', 'home-based'];
  return remoteIndicators.some(r => normalized.includes(r));
}

/**
 * Check if a location string indicates hybrid work
 */
export function isHybridLocation(location: string): boolean {
  const normalized = normalizeLocation(location);
  const hybridIndicators = ['hybrid', 'flexible', 'partial remote', 'office/remote', 'remote/office'];
  return hybridIndicators.some(h => normalized.includes(h));
}

/**
 * Get commute time between two cities if known
 */
function getCommuteTime(city1: string, city2: string): number | null {
  const norm1 = normalizeLocation(city1);
  const norm2 = normalizeLocation(city2);
  
  // Check direct lookup
  if (COMMUTE_MATRIX[norm1]?.[norm2]) {
    return COMMUTE_MATRIX[norm1][norm2];
  }
  if (COMMUTE_MATRIX[norm2]?.[norm1]) {
    return COMMUTE_MATRIX[norm2][norm1];
  }
  
  // Check if one city contains the other (e.g., "london" in "central london")
  for (const [baseCity, destinations] of Object.entries(COMMUTE_MATRIX)) {
    if (norm1.includes(baseCity) || baseCity.includes(norm1)) {
      for (const [destCity, time] of Object.entries(destinations)) {
        if (norm2.includes(destCity) || destCity.includes(norm2)) {
          return time;
        }
      }
    }
  }
  
  return null;
}

/**
 * Main location matching function
 */
export function matchLocation(
  candidateLocation: string | null,
  jobLocation: {
    city?: string;
    region?: string;
    remote_ok: boolean;
    hybrid_ok: boolean;
  },
  candidateRemotePreference?: boolean
): LocationMatch {
  // Handle missing candidate location
  if (!candidateLocation) {
    if (jobLocation.remote_ok) {
      return {
        score: 70,
        reason: 'Remote work available, candidate location unknown',
        is_compatible: true
      };
    }
    return {
      score: 30,
      reason: 'Candidate location unknown, job requires office presence',
      is_compatible: false
    };
  }
  
  const normalizedCandidate = normalizeLocation(candidateLocation);
  const candidateIsRemote = isRemoteLocation(candidateLocation) || candidateRemotePreference === true;
  
  // Remote candidate + remote job = perfect match
  if (candidateIsRemote && jobLocation.remote_ok) {
    return {
      score: 100,
      reason: 'Both candidate and job support remote work',
      is_compatible: true
    };
  }
  
  // Check for exact city match
  if (jobLocation.city) {
    const normalizedJobCity = normalizeLocation(jobLocation.city);
    
    if (normalizedCandidate.includes(normalizedJobCity) || normalizedJobCity.includes(normalizedCandidate)) {
      return {
        score: 100,
        reason: 'Exact city match',
        is_compatible: true
      };
    }
    
    // Check commute time
    const commuteTime = getCommuteTime(candidateLocation, jobLocation.city);
    if (commuteTime !== null) {
      if (commuteTime <= 30) {
        return {
          score: 95,
          reason: `Short commute (~${commuteTime} minutes)`,
          distance_minutes: commuteTime,
          is_compatible: true
        };
      }
      if (commuteTime <= 60) {
        return {
          score: 80,
          reason: `Reasonable commute (~${commuteTime} minutes)`,
          distance_minutes: commuteTime,
          is_compatible: true
        };
      }
      if (commuteTime <= 90) {
        return {
          score: 60,
          reason: `Long commute (~${commuteTime} minutes)`,
          distance_minutes: commuteTime,
          is_compatible: jobLocation.hybrid_ok
        };
      }
    }
  }
  
  // Check for region match
  const candidateRegion = findRegion(candidateLocation);
  const jobRegion = jobLocation.region ? findRegion(jobLocation.region) : 
                    jobLocation.city ? findRegion(jobLocation.city) : null;
  
  if (candidateRegion && jobRegion && candidateRegion === jobRegion) {
    return {
      score: 75,
      reason: `Same region: ${UK_REGIONS[candidateRegion].name}`,
      is_compatible: true
    };
  }
  
  // Hybrid available for different location
  if (jobLocation.hybrid_ok) {
    return {
      score: 50,
      reason: 'Hybrid work available, candidate in different area',
      is_compatible: true
    };
  }
  
  // Remote OK as fallback
  if (jobLocation.remote_ok) {
    return {
      score: 70,
      reason: 'Remote work available for candidate in different location',
      is_compatible: true
    };
  }
  
  // No compatibility
  return {
    score: 20,
    reason: 'Location mismatch - different area, no remote option',
    is_compatible: false
  };
}

/**
 * Check if candidate can work in any of multiple job locations
 */
export function matchMultipleLocations(
  candidateLocation: string | null,
  jobLocations: Array<{ city?: string; region?: string; remote_ok: boolean; hybrid_ok: boolean }>
): LocationMatch {
  let bestMatch: LocationMatch = {
    score: 0,
    reason: 'No compatible locations',
    is_compatible: false
  };
  
  for (const jobLocation of jobLocations) {
    const match = matchLocation(candidateLocation, jobLocation);
    if (match.score > bestMatch.score) {
      bestMatch = match;
    }
  }
  
  return bestMatch;
}
