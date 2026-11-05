// Maps each source's free-form categories/tags onto one short, fixed group per asset type.
// First matching group wins, so order matters (specific before generic). Words match on word boundaries.
import type { CatalogEntry } from './catalogLib';

type Groups = [group: string, words: string][];

const MODEL: Groups = [
  ['Characters', 'character people person human man woman knight pirate villager farmer zombie skeleton robot'],
  [
    'Animals',
    'animal animals pets creature fish bird duck frog turtle crab whale dolphin shark deer fox rabbit cow sheep horse chicken dog cat insect',
  ],
  [
    'Vehicles & boats',
    'vehicle vehicles transport car cars truck train boat ship sailboat canoe raft plane airplane aircraft helicopter bicycle cart balloon watercraft',
  ],
  [
    'Buildings & structures',
    'building buildings architecture house cabin hut cottage barn castle tower windmill lighthouse bridge dock pier fence wall gate well tent structures',
  ],
  [
    'Trees & plants',
    'tree trees pine palm bush plant plants flower flowers grass mushroom cactus reed lily vegetation nature-plants ground cover',
  ],
  ['Water & coast', 'water river pond lake wave waves beach coast shore seashell shell coral fountain waterfall'],
  ['Rocks & terrain', 'rock rocks stone cliff boulder terrain island mountain volcano cloud'],
  ['Furniture', 'furniture seating table chair bench bed shelf cabinet sofa'],
  ['Food', 'food food-drink fruit bread cake cookie pastry apple avocado melon banana vegetable drink candy'],
  ['Weapons & tools', 'weapon weapons weapons-military sword shield axe bow gun tools tool pickaxe hammer'],
  ['Lighting', 'lighting lamp lantern torch campfire light candle'],
  ['Electronics', 'electronics electronics-gadgets computer phone'],
  [
    'Props & containers',
    'props prop containers barrel crate chest bucket box sign flag anchor buoy net decorative industrial coin key',
  ],
];

const TEXTURE: Groups = [
  ['Fabric & leather', 'fabric fabrics leather carpet cloth textile wool'],
  ['Wood', 'wood raw wood planks plank bark wooden parquet'],
  ['Brick & tiles', 'brick bricks tiles tile'],
  ['Roofing', 'roofing roof'],
  ['Road & asphalt', 'road asphalt cobblestone paving pavement'],
  ['Concrete & plaster', 'concrete plaster plaster-concrete cement'],
  ['Stone & rock', 'rock rocks stone marble granite sandstone cliff'],
  ['Ground & terrain', 'terrain ground sand gravel soil dirt mud grass snow ice moon forest floor leaves'],
  ['Metal', 'metal metals rust painted metal chainmail'],
  ['Plastic, paint & paper', 'plastic paint paper cardboard rubber'],
];

const HDRI: Groups = [
  ['Skies', 'skies sky pure sky'],
  ['Sunrise & sunset', 'sunrise-sunset sunrise sunset'],
  ['Night', 'night'],
  ['Indoor', 'indoor studio'],
  ['Urban', 'urban city street'],
  ['Nature', 'nature natural forest field'],
  ['Outdoor', 'outdoor day environment'],
];

const compile = (g: Groups) =>
  g.map(([name, words]) => ({
    name,
    re: new RegExp(
      `\\b(${words
        .split(' ')
        .map((w) => w.replace(/-/g, '\\-'))
        .join('|')})s?\\b`,
      'i',
    ),
  }));
const TABLE: Record<string, ReturnType<typeof compile>> = {
  model: compile(MODEL),
  texture: compile(TEXTURE),
  hdri: compile(HDRI),
};

/** The one browsing group for an entry, e.g. "Fabric & leather" or "Vehicles & boats". */
export function groupOf(e: CatalogEntry): string {
  const groups = TABLE[e.kind] ?? [];
  // Prefer the source's own categories, then the name, then free tags.
  for (const text of [(e.cats ?? []).join(' '), e.name, e.tags.join(' ')])
    for (const g of groups) if (g.re.test(text)) return g.name;
  return 'Other';
}
