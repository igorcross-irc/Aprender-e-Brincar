export const learningWorlds = [
  {
    id: 'discover', title: 'Descobrir', icon: '🌱', color: 'emerald',
    description: 'Experiências livres para observar, tocar, ouvir e descobrir.',
    ages: ['6-12m','12-18m','18-24m','2-3y','3-4y','4-5y'],
    activityIds: ['peekaboo','bubbles','discovery-sounds','discovery-animals','discovery-colors','discover-objects','baby-discover','animals','body-parts','object-hunt','animal-families']
  },
  {
    id: 'language', title: 'Falar & Comunicar', icon: '🗣️', color: 'violet',
    description: 'Palavras, comunicação, sílabas, rimas e histórias.',
    ages: ['2-3y','3-4y','4-5y'],
    activityIds: ['communication','phrases','syllables','rhymes','sound-initial','story-sequence','story-interactive','vocabulary','opposites','action-words','story-choices','phrase-builder-2']
  },
  {
    id: 'colors-shapes', title: 'Cores & Formas', icon: '🎨', color: 'sky',
    description: 'Perceber, nomear, comparar e combinar formas e cores.',
    ages: ['6-12m','12-18m','18-24m','2-3y','3-4y','4-5y'],
    activityIds: ['color-sort','shape-sort','discovery-colors','baby-colors','colors','find-color','shape-match','size-sort','color-hunt-2','shape-sequence','compare-sizes']
  },
  {
    id: 'animals-sounds', title: 'Animais & Sons', icon: '🐾', color: 'amber',
    description: 'Conheça animais, sons e desafios de atenção auditiva.',
    ages: ['6-12m','12-18m','18-24m','2-3y','3-4y','4-5y'],
    activityIds: ['discovery-sounds','discovery-animals','animals','find-animal','sound-guess','attention-auditory','sound-sequence','animal-sound-memory','animal-homes']
  },
  {
    id: 'numbers-logic', title: 'Números & Lógica', icon: '🔢', color: 'indigo',
    description: 'Contagem, quantidades, padrões, classificação e raciocínio.',
    ages: ['2-3y','3-4y','4-5y'],
    activityIds: ['count-tap','count','number-match','balloons','odd-one-out','match-pairs','classify-animals','sort-groups','sequence','count-more','number-order']
  },
  {
    id: 'memory-attention', title: 'Memória & Atenção', icon: '🧠', color: 'rose',
    description: 'Brincadeiras para observar, lembrar, associar e encontrar.',
    ages: ['18-24m','2-3y','3-4y','4-5y'],
    activityIds: ['memory','memory-fruits','memory-transport','memory-toys','memory-party','match-pairs','attention-auditory','sound-sequence','odd-one-out','memory-objects','attention-path']
  },
  {
    id: 'create-move', title: 'Criar & Mexer', icon: '✨', color: 'orange',
    description: 'Desenho, movimento, ritmo e expressão pelo brincar.',
    ages: ['18-24m','2-3y','3-4y','4-5y'],
    activityIds: ['music-keys','canvas','puzzle','movement','rhythm','music-rhythm','guided-movement','rhythm-copy','movement-copy']
  }
];

export const worldById = (id) => learningWorlds.find((world) => world.id === id) || null;
