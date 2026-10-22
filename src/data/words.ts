/**
 * Базовый словарь English Kids.
 *
 * Темы подобраны по уровню 2–4 классов и ориентированы на лексику учебников
 * «Enjoy English» (М. З. Биболетова), но словарь НЕ является полной или
 * официальной копией учебника. Слова можно дополнять: добавьте строку в нужную
 * тему — ID создаётся автоматически.
 */

export type Grade = 2 | 3 | 4;

export interface Topic {
  id: string;
  grade: Grade;
  title: string;
  emoji: string;
}

export interface Word {
  /** Уникальный ID, например "g2-animals-cat". */
  id: string;
  /** Русский перевод (то, что видит ребёнок). */
  ru: string;
  /** Основное английское написание. */
  en: string;
  /** Допустимые альтернативные написания или переводы. */
  alt: string[];
  grade: Grade;
  topicId: string;
  emoji: string;
  /** Пишется с большой буквы (дни недели, месяцы). */
  capital: boolean;
}

/** [русский, английский, эмодзи, альтернативы] */
type Row = [ru: string, en: string, emoji?: string, alt?: string[]];

interface TopicSource {
  topic: Topic;
  capitalized?: boolean;
  rows: Row[];
}

const SOURCES: TopicSource[] = [
  // ───────────── 2 класс ─────────────
  {
    topic: { id: 'g2-animals', grade: 2, title: 'Животные', emoji: '🐾' },
    rows: [
      ['кошка', 'cat', '🐱'],
      ['собака', 'dog', '🐶'],
      ['лиса', 'fox', '🦊'],
      ['лягушка', 'frog', '🐸'],
      ['свинья', 'pig', '🐷'],
      ['курица', 'hen', '🐔', ['chicken']],
      ['лошадь', 'horse', '🐴'],
      ['корова', 'cow', '🐮'],
      ['утка', 'duck', '🦆'],
      ['мышь', 'mouse', '🐭'],
      ['кролик', 'rabbit', '🐰', ['bunny']],
      ['обезьяна', 'monkey', '🐵'],
      ['лев', 'lion', '🦁'],
      ['тигр', 'tiger', '🐯'],
      ['слон', 'elephant', '🐘'],
      ['медведь', 'bear', '🐻'],
      ['крокодил', 'crocodile', '🐊'],
      ['жираф', 'giraffe', '🦒'],
      ['попугай', 'parrot', '🦜'],
      ['сова', 'owl', '🦉'],
      ['птица', 'bird', '🐦'],
      ['рыба', 'fish', '🐟'],
      ['коза', 'goat', '🐐'],
      ['овца', 'sheep', '🐑'],
      ['волк', 'wolf', '🐺'],
      ['змея', 'snake', '🐍'],
    ],
  },
  {
    topic: { id: 'g2-colours', grade: 2, title: 'Цвета', emoji: '🎨' },
    rows: [
      ['красный', 'red', '🔴'],
      ['зелёный', 'green', '🟢'],
      ['синий, голубой', 'blue', '🔵'],
      ['жёлтый', 'yellow', '🟡'],
      ['чёрный', 'black', '⚫'],
      ['белый', 'white', '⚪'],
      ['коричневый', 'brown', '🟤'],
      ['оранжевый', 'orange', '🟠'],
      ['розовый', 'pink'],
      ['серый', 'grey', '', ['gray']],
      ['фиолетовый', 'purple', '🟣', ['violet']],
    ],
  },
  {
    topic: { id: 'g2-numbers', grade: 2, title: 'Числа', emoji: '🔢' },
    rows: [
      ['один', 'one', '1'],
      ['два', 'two', '2'],
      ['три', 'three', '3'],
      ['четыре', 'four', '4'],
      ['пять', 'five', '5'],
      ['шесть', 'six', '6'],
      ['семь', 'seven', '7'],
      ['восемь', 'eight', '8'],
      ['девять', 'nine', '9'],
      ['десять', 'ten', '10'],
      ['одиннадцать', 'eleven', '11'],
      ['двенадцать', 'twelve', '12'],
    ],
  },
  {
    topic: { id: 'g2-family', grade: 2, title: 'Семья', emoji: '🏡' },
    rows: [
      ['мама', 'mother', '👩', ['mum', 'mom', 'mummy', 'mommy']],
      ['папа', 'father', '👨', ['dad', 'daddy']],
      ['сестра', 'sister', '👧'],
      ['брат', 'brother', '👦'],
      ['бабушка', 'grandmother', '👵', ['granny', 'grandma']],
      ['дедушка', 'grandfather', '👴', ['grandpa', 'granddad', 'grandad']],
      ['семья', 'family'],
      ['сын', 'son'],
      ['дочь', 'daughter'],
      ['малыш', 'baby', '👶'],
      ['друг', 'friend'],
    ],
  },
  {
    topic: { id: 'g2-toys', grade: 2, title: 'Игрушки', emoji: '🧸' },
    rows: [
      ['мяч', 'ball', '⚽'],
      ['кукла', 'doll'],
      ['машинка', 'car', '🚗'],
      ['поезд', 'train', '🚂'],
      ['воздушный змей', 'kite', '🪁'],
      ['игрушка', 'toy'],
      ['велосипед', 'bike', '🚲', ['bicycle']],
      ['плюшевый мишка', 'teddy bear', '🧸', ['teddy']],
      ['воздушный шарик', 'balloon', '🎈'],
      ['робот', 'robot', '🤖'],
      ['барабан', 'drum', '🥁'],
      ['лодка', 'boat', '⛵'],
      ['самолёт', 'plane', '✈️', ['aeroplane', 'airplane']],
    ],
  },
  {
    topic: { id: 'g2-actions', grade: 2, title: 'Что я умею', emoji: '🤸' },
    rows: [
      ['бегать', 'run', '🏃'],
      ['прыгать', 'jump'],
      ['плавать', 'swim', '🏊'],
      ['летать', 'fly'],
      ['петь', 'sing', '🎤'],
      ['танцевать', 'dance', '💃'],
      ['читать', 'read', '📖'],
      ['писать', 'write', '✍️'],
      ['рисовать', 'draw', '🖍️', ['paint']],
      ['кататься на коньках', 'skate', '⛸️'],
      ['кататься на лыжах', 'ski', '⛷️'],
      ['играть', 'play'],
      ['лазать', 'climb', '🧗'],
      ['кататься (на велосипеде)', 'ride', '🚴'],
      ['гулять', 'walk'],
      ['считать', 'count'],
      ['говорить', 'speak', '', ['talk']],
    ],
  },
  {
    topic: { id: 'g2-school', grade: 2, title: 'Школа', emoji: '🎒' },
    rows: [
      ['ручка', 'pen', '🖊️'],
      ['карандаш', 'pencil', '✏️'],
      ['книга', 'book', '📕'],
      ['портфель', 'schoolbag', '🎒', ['school bag', 'bag']],
      ['линейка', 'ruler', '📏'],
      ['ластик', 'rubber', '', ['eraser']],
      ['парта', 'desk'],
      ['школа', 'school', '🏫'],
      ['учитель', 'teacher'],
      ['ученик', 'pupil', '', ['student']],
      ['тетрадь', 'copybook', '📓', ['exercise book', 'notebook']],
      ['пенал', 'pencil box', '', ['pencil case']],
      ['урок', 'lesson'],
      ['классная комната', 'classroom'],
    ],
  },

  // ───────────── 3 класс ─────────────
  {
    topic: { id: 'g3-food', grade: 3, title: 'Еда', emoji: '🍎' },
    rows: [
      ['яблоко', 'apple', '🍎'],
      ['банан', 'banana', '🍌'],
      ['апельсин', 'orange', '🍊'],
      ['яйцо', 'egg', '🥚'],
      ['молоко', 'milk', '🥛'],
      ['хлеб', 'bread', '🍞'],
      ['масло (сливочное)', 'butter', '🧈'],
      ['сыр', 'cheese', '🧀'],
      ['торт', 'cake', '🎂'],
      ['конфета', 'sweet', '🍬', ['candy']],
      ['сок', 'juice', '🧃'],
      ['чай', 'tea', '🍵'],
      ['кофе', 'coffee', '☕'],
      ['каша', 'porridge', '🥣'],
      ['бутерброд', 'sandwich', '🥪'],
      ['суп', 'soup', '🍲'],
      ['мороженое', 'ice cream', '🍦', ['icecream']],
      ['варенье', 'jam'],
      ['мёд', 'honey', '🍯'],
      ['мясо', 'meat', '🥩'],
      ['сахар', 'sugar'],
      ['вода', 'water', '💧'],
      ['морковь', 'carrot', '🥕'],
      ['помидор', 'tomato', '🍅'],
      ['картофель', 'potato', '🥔'],
    ],
  },
  {
    topic: { id: 'g3-body', grade: 3, title: 'Тело', emoji: '🙂' },
    rows: [
      ['голова', 'head'],
      ['глаз', 'eye', '👁️'],
      ['нос', 'nose', '👃'],
      ['ухо', 'ear', '👂'],
      ['рот', 'mouth', '👄'],
      ['рука (кисть)', 'hand', '✋'],
      ['рука (от плеча)', 'arm', '💪'],
      ['нога', 'leg', '🦵'],
      ['ступня', 'foot', '🦶'],
      ['волосы', 'hair'],
      ['лицо', 'face', '🙂'],
      ['зуб', 'tooth', '🦷'],
      ['палец', 'finger'],
      ['шея', 'neck'],
      ['хвост', 'tail'],
    ],
  },
  {
    topic: { id: 'g3-clothes', grade: 3, title: 'Одежда', emoji: '👕' },
    rows: [
      ['платье', 'dress', '👗'],
      ['юбка', 'skirt'],
      ['рубашка', 'shirt', '👔'],
      ['футболка', 'T-shirt', '👕', ['tshirt', 'tee shirt']],
      ['джинсы', 'jeans', '👖'],
      ['брюки', 'trousers', '', ['pants']],
      ['шорты', 'shorts', '🩳'],
      ['куртка', 'jacket', '🧥'],
      ['пальто', 'coat'],
      ['шапка, шляпа', 'hat', '👒'],
      ['кепка', 'cap', '🧢'],
      ['носки', 'socks', '🧦'],
      ['туфли', 'shoes', '👞'],
      ['сапоги', 'boots', '👢'],
      ['шарф', 'scarf', '🧣'],
      ['перчатки', 'gloves', '🧤'],
      ['свитер', 'sweater', '', ['jumper', 'pullover']],
    ],
  },
  {
    topic: { id: 'g3-home', grade: 3, title: 'Мой дом', emoji: '🏠' },
    rows: [
      ['дом', 'house', '🏠', ['home']],
      ['комната', 'room'],
      ['кухня', 'kitchen'],
      ['спальня', 'bedroom'],
      ['ванная комната', 'bathroom', '🛁'],
      ['гостиная', 'living room', '🛋️', ['sitting room']],
      ['стол', 'table'],
      ['стул', 'chair', '🪑'],
      ['кровать', 'bed', '🛏️'],
      ['диван', 'sofa'],
      ['лампа', 'lamp', '💡'],
      ['окно', 'window', '🪟'],
      ['дверь', 'door', '🚪'],
      ['стена', 'wall'],
      ['пол', 'floor'],
      ['картина', 'picture', '🖼️'],
      ['часы (настенные)', 'clock', '🕰️'],
    ],
  },
  {
    topic: { id: 'g3-weather', grade: 3, title: 'Погода и времена года', emoji: '⛅' },
    rows: [
      ['зима', 'winter', '❄️'],
      ['весна', 'spring', '🌷'],
      ['лето', 'summer', '☀️'],
      ['осень', 'autumn', '🍂', ['fall']],
      ['погода', 'weather'],
      ['солнце', 'sun', '🌞'],
      ['дождь', 'rain', '🌧️'],
      ['снег', 'snow', '🌨️'],
      ['облако', 'cloud', '☁️'],
      ['ветер', 'wind', '🌬️'],
      ['солнечный', 'sunny'],
      ['дождливый', 'rainy'],
      ['снежный', 'snowy'],
      ['ветреный', 'windy'],
      ['холодный', 'cold', '🥶'],
      ['жаркий', 'hot', '🥵'],
      ['тёплый', 'warm'],
    ],
  },
  {
    topic: { id: 'g3-days', grade: 3, title: 'Дни недели', emoji: '📅' },
    capitalized: true,
    rows: [
      ['понедельник', 'Monday'],
      ['вторник', 'Tuesday'],
      ['среда', 'Wednesday'],
      ['четверг', 'Thursday'],
      ['пятница', 'Friday'],
      ['суббота', 'Saturday'],
      ['воскресенье', 'Sunday'],
      ['день', 'day'],
      ['неделя', 'week'],
    ],
  },

  // ───────────── начало 4 класса ─────────────
  {
    topic: { id: 'g4-months', grade: 4, title: 'Месяцы', emoji: '🗓️' },
    capitalized: true,
    rows: [
      ['январь', 'January'],
      ['февраль', 'February'],
      ['март', 'March'],
      ['апрель', 'April'],
      ['май', 'May'],
      ['июнь', 'June'],
      ['июль', 'July'],
      ['август', 'August'],
      ['сентябрь', 'September'],
      ['октябрь', 'October'],
      ['ноябрь', 'November'],
      ['декабрь', 'December'],
      ['месяц', 'month'],
      ['год', 'year'],
    ],
  },
  {
    topic: { id: 'g4-places', grade: 4, title: 'Город и природа', emoji: '🌳' },
    rows: [
      ['город', 'city', '🏙️', ['town']],
      ['деревня', 'village'],
      ['улица', 'street'],
      ['парк', 'park'],
      ['магазин', 'shop', '', ['store']],
      ['река', 'river'],
      ['поле', 'field'],
      ['лес', 'forest', '🌲', ['wood', 'woods']],
      ['дерево', 'tree', '🌳'],
      ['цветок', 'flower', '🌸'],
      ['сад', 'garden'],
      ['ферма', 'farm'],
      ['мост', 'bridge', '🌉'],
      ['зоопарк', 'zoo'],
      ['озеро', 'lake'],
      ['гора', 'mountain', '⛰️'],
      ['море', 'sea', '🌊'],
      ['небо', 'sky'],
      ['трава', 'grass'],
    ],
  },
  {
    topic: { id: 'g4-adjectives', grade: 4, title: 'Какой? Описание', emoji: '✨' },
    rows: [
      ['большой', 'big', '', ['large']],
      ['маленький', 'small', '', ['little']],
      ['длинный', 'long'],
      ['короткий', 'short'],
      ['высокий', 'tall'],
      ['счастливый', 'happy', '😊'],
      ['грустный', 'sad', '😢'],
      ['сердитый', 'angry', '😠'],
      ['добрый', 'kind'],
      ['смешной', 'funny', '😂'],
      ['храбрый', 'brave'],
      ['умный', 'clever', '', ['smart']],
      ['старый', 'old'],
      ['молодой', 'young'],
      ['новый', 'new'],
      ['хороший', 'good', '👍'],
      ['плохой', 'bad', '👎'],
      ['красивый', 'beautiful', '', ['pretty']],
      ['быстрый', 'fast', '', ['quick']],
      ['медленный', 'slow', '🐢'],
      ['сильный', 'strong'],
    ],
  },
];

function slug(en: string): string {
  return en.toLowerCase().replace(/[^a-z]+/g, '-').replace(/^-|-$/g, '');
}

export const TOPICS: Topic[] = SOURCES.map((s) => s.topic);

export const WORDS: Word[] = SOURCES.flatMap(({ topic, capitalized, rows }) =>
  rows.map(([ru, en, emoji = '', alt = []]) => ({
    id: `${topic.id}-${slug(en)}`,
    ru,
    en,
    alt,
    grade: topic.grade,
    topicId: topic.id,
    emoji,
    capital: Boolean(capitalized) && /^[A-Z]/.test(en),
  })),
);

export const GRADES: Grade[] = [2, 3, 4];

const BY_ID = new Map(WORDS.map((w) => [w.id, w]));

export function getWord(id: string): Word | undefined {
  return BY_ID.get(id);
}

export function topicsOfGrade(grade: Grade): Topic[] {
  return TOPICS.filter((t) => t.grade === grade);
}

export function getTopic(id: string): Topic | undefined {
  return TOPICS.find((t) => t.id === id);
}

/** Слова выбранного класса; topicId === 'all' — все темы класса. */
export function wordsFor(grade: Grade, topicId: string): Word[] {
  return WORDS.filter((w) => w.grade === grade && (topicId === 'all' || w.topicId === topicId));
}
