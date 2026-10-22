/**
 * Словарь English Kids.
 *
 * Сверен со словарями в конце учебников «Enjoy English» (М. З. Биболетова)
 * для 2, 3 и 4 класса: каждое слово стоит в том классе, где оно впервые
 * появляется в учебнике, а русский перевод взят из словаря учебника
 * (иногда сокращён или уточнён в скобках, чтобы задание было однозначным).
 * Темы 4 класса повторяют списки «Do you remember the words from Unit N?».
 *
 * Это учебная выборка (существительные, глаголы, прилагательные по темам),
 * а не полная или официальная копия учебника. Чтобы добавить слово, допишите
 * строку в нужную тему — ID создаётся автоматически.
 */

import { IPA } from './transcriptions';

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
  /** Транскрипция без скобок, например "kæt". */
  ipa: string;
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
  // ───────────── 2 класс (словарь учебника Enjoy English 2) ─────────────
  {
    topic: { id: 'g2-animals', grade: 2, title: 'Животные', emoji: '🐾' },
    rows: [
      ['кот, кошка', 'cat', '🐱'],
      ['пёс, собака', 'dog', '🐶'],
      ['лиса', 'fox', '🦊'],
      ['лягушка', 'frog', '🐸'],
      ['поросёнок', 'pig', '🐷', ['piglet']],
      ['курица', 'hen', '🐔', ['chicken']],
      ['петух', 'cockerel', '🐓', ['rooster', 'cock']],
      ['утка', 'duck', '🦆'],
      ['мышь', 'mouse', '🐭'],
      ['мыши', 'mice', '🐁'],
      ['кролик', 'rabbit', '🐰', ['bunny']],
      ['обезьяна', 'monkey', '🐵'],
      ['лев', 'lion', '🦁'],
      ['слон', 'elephant', '🐘'],
      ['медведь', 'bear', '🐻'],
      ['крокодил', 'crocodile', '🐊'],
      ['жираф', 'giraffe', '🦒'],
      ['зебра', 'zebra', '🦓'],
      ['попугай', 'parrot', '🦜'],
      ['рыба', 'fish', '🐟'],
      ['змея', 'snake', '🐍'],
      ['пчела', 'bee', '🐝'],
      ['домашнее животное', 'pet'],
    ],
  },
  {
    topic: { id: 'g2-colours', grade: 2, title: 'Цвета', emoji: '🎨' },
    rows: [
      ['красный', 'red', '🔴'],
      ['зелёный', 'green', '🟢'],
      ['синий', 'blue', '🔵'],
      ['жёлтый', 'yellow', '🟡'],
      ['чёрный', 'black', '⚫'],
      ['белый', 'white', '⚪'],
      ['коричневый', 'brown', '🟤'],
      ['оранжевый', 'orange', '🟠'],
      ['розовый', 'pink'],
      ['серый', 'grey', '', ['gray']],
    ],
  },
  {
    topic: { id: 'g2-numbers', grade: 2, title: 'Числа 1–10', emoji: '🔢' },
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
    ],
  },
  {
    topic: { id: 'g2-family', grade: 2, title: 'Семья и друзья', emoji: '🏡' },
    rows: [
      ['мама', 'mum', '👩', ['mother', 'mom', 'mummy', 'mommy']],
      ['мать', 'mother', '👩', ['mum', 'mom', 'mummy', 'mommy']],
      ['папа', 'dad', '👨', ['father', 'daddy']],
      ['отец', 'father', '👨', ['dad', 'daddy']],
      ['сестра', 'sister', '👧'],
      ['брат', 'brother', '👦'],
      ['бабушка', 'grandmother', '👵', ['granny', 'grandma', 'gran']],
      ['дедушка', 'grandfather', '👴', ['grandpa', 'granddad', 'grandad']],
      ['друг', 'friend'],
      ['мужчина, человек', 'man', '', ['person']],
      ['королева', 'queen', '👑'],
    ],
  },
  {
    topic: { id: 'g2-actions', grade: 2, title: 'Что я умею', emoji: '🤸' },
    rows: [
      ['бегать', 'run', '🏃'],
      ['прыгать', 'jump'],
      ['скакать', 'skip', '', ['hop']],
      ['плавать', 'swim', '🏊'],
      ['летать', 'fly'],
      ['петь', 'sing', '🎤'],
      ['танцевать', 'dance', '💃'],
      ['читать', 'read', '📖'],
      ['рисовать', 'draw', '🖍️', ['paint']],
      ['кататься на коньках', 'skate', '⛸️'],
      ['кататься на лыжах', 'ski', '⛷️'],
      ['кататься (на велосипеде)', 'ride', '🚴'],
      ['ходить пешком, гулять', 'walk'],
      ['играть', 'play'],
      ['считать', 'count'],
      ['говорить', 'speak', '', ['talk', 'say']],
      ['сидеть', 'sit'],
      ['помогать', 'help'],
      ['видеть', 'see', '👀'],
      ['нюхать', 'smell', '', ['sniff']],
      ['трогать', 'touch'],
      ['жить', 'live'],
      ['любить, нравиться', 'like', '', ['love']],
    ],
  },
  {
    topic: { id: 'g2-games', grade: 2, title: 'Игры и спорт', emoji: '⚽' },
    rows: [
      ['мяч', 'ball', '⚽'],
      ['велосипед', 'bike', '🚲', ['bicycle']],
      ['воздушный змей', 'kite', '🪁'],
      ['коробка', 'box', '📦'],
      ['шахматы', 'chess', '♟️'],
      ['футбол', 'football', '', ['soccer']],
      ['хоккей', 'hockey', '🏒'],
      ['теннис', 'tennis', '🎾'],
      ['настольный теннис', 'table tennis', '🏓', ['ping pong']],
      ['бадминтон', 'badminton', '🏸'],
      ['баскетбол', 'basketball', '🏀'],
    ],
  },
  {
    topic: { id: 'g2-school', grade: 2, title: 'Школа', emoji: '🎒' },
    rows: [
      ['ручка', 'pen', '🖊️'],
      ['карандаш', 'pencil', '✏️'],
      ['пенал', 'pencil box', '', ['pencil case']],
      ['ластик', 'rubber', '', ['eraser']],
      ['книга', 'book', '📕'],
      ['портфель, сумка', 'bag', '🎒', ['schoolbag', 'school bag']],
      ['учебник', 'textbook', '📗'],
      ['рабочая тетрадь', 'workbook', '📓'],
      ['урок', 'lesson', '', ['class']],
      ['ученик', 'pupil', '', ['student', 'schoolchild']],
      ['правило', 'rule'],
    ],
  },
  {
    topic: { id: 'g2-me-home', grade: 2, title: 'Я и мой дом', emoji: '🙂' },
    rows: [
      ['глаз', 'eye', '👁️'],
      ['нос', 'nose', '👃'],
      ['лицо', 'face', '🙂'],
      ['палец (на руке)', 'finger'],
      ['палец (на ноге)', 'toe'],
      ['дом (здание)', 'house', '🏠'],
      ['дом (где ты живёшь)', 'home'],
      ['кровать', 'bed', '🛏️'],
      ['стол', 'table'],
      ['часы (не наручные)', 'clock', '🕰️'],
    ],
  },
  {
    topic: { id: 'g2-around', grade: 2, title: 'Вокруг нас', emoji: '🌳' },
    rows: [
      ['яблоко', 'apple', '🍎'],
      ['торт', 'cake', '🎂'],
      ['джем, варенье', 'jam'],
      ['лёд', 'ice', '🧊'],
      ['роза', 'rose', '🌹'],
      ['лес', 'forest', '🌲', ['wood', 'woods']],
      ['зоопарк', 'zoo'],
      ['ферма', 'farm'],
      ['год', 'year'],
    ],
  },
  {
    topic: { id: 'g2-adjectives', grade: 2, title: 'Какой?', emoji: '✨' },
    rows: [
      ['большой', 'big', '', ['large']],
      ['длинный', 'long'],
      ['счастливый, весёлый', 'happy', '😊', ['glad', 'merry', 'cheerful']],
      ['грустный', 'sad', '😢'],
      ['злой, сердитый', 'angry', '😠', ['cross', 'mad']],
      ['добрый', 'kind'],
      ['забавный, смешной', 'funny', '😂'],
      ['храбрый', 'brave', '', ['courageous']],
      ['умный', 'smart', '', ['clever']],
      ['сильный', 'strong'],
      ['хороший', 'good', '👍'],
      ['плохой', 'bad', '👎'],
      ['старый', 'old'],
      ['красивый', 'nice', '', ['beautiful', 'pretty']],
      ['милый, хорошенький', 'pretty', '', ['cute', 'lovely']],
      ['ленивый', 'lazy'],
      ['стройный', 'slim', '', ['thin', 'slender']],
      ['застенчивый', 'shy'],
      ['отличный, прекрасный', 'fine', '', ['great', 'excellent']],
    ],
  },

  // ───────────── 3 класс (новые слова учебника Enjoy English 3) ─────────────
  {
    topic: { id: 'g3-animals', grade: 3, title: 'Животные', emoji: '🐄' },
    rows: [
      ['животное', 'animal'],
      ['корова', 'cow', '🐮'],
      ['лошадь, конь', 'horse', '🐴'],
      ['тигр', 'tiger', '🐯'],
      ['кенгуру', 'kangaroo', '🦘'],
      ['птица', 'bird', '🐦'],
      ['бабочка', 'butterfly', '🦋'],
    ],
  },
  {
    topic: { id: 'g3-food', grade: 3, title: 'Еда', emoji: '🍞' },
    rows: [
      ['хлеб', 'bread', '🍞'],
      ['масло сливочное', 'butter', '🧈'],
      ['сыр', 'cheese', '🧀'],
      ['молоко', 'milk', '🥛'],
      ['яйцо', 'egg', '🥚'],
      ['бутерброд', 'sandwich', '🥪'],
      ['каша (овсяная)', 'porridge', '🥣', ['oatmeal']],
      ['суп', 'soup', '🍲'],
      ['мясо', 'meat', '🥩'],
      ['ветчина', 'ham'],
      ['сок', 'juice', '🧃'],
      ['чай', 'tea', '🍵'],
      ['кофе', 'coffee', '☕'],
      ['вода', 'water', '💧'],
      ['мёд', 'honey', '🍯'],
      ['сахар', 'sugar'],
      ['соль', 'salt', '🧂'],
      ['конфета', 'sweet', '🍬', ['sweets', 'candy']],
      ['шоколад', 'chocolate', '🍫'],
      ['банан', 'banana', '🍌'],
      ['лимон', 'lemon', '🍋'],
      ['морковь', 'carrot', '🥕'],
      ['капуста', 'cabbage', '🥬'],
      ['картошка', 'potato', '🥔'],
      ['помидор', 'tomato', '🍅'],
      ['кукуруза', 'corn', '🌽', ['maize']],
      ['завтрак', 'breakfast'],
      ['обед', 'lunch'],
      ['ужин', 'dinner'],
    ],
  },
  {
    topic: { id: 'g3-body', grade: 3, title: 'Тело', emoji: '💪' },
    rows: [
      ['голова', 'head'],
      ['рука (от плеча до кисти)', 'arm', '💪'],
      ['рука (кисть)', 'hand', '✋'],
      ['нога', 'leg', '🦵'],
      ['ступня', 'foot', '🦶'],
      ['волосы', 'hair'],
      ['ухо', 'ear', '👂'],
      ['рот', 'mouth', '👄'],
      ['шея', 'neck'],
      ['плечо', 'shoulder'],
      ['колено', 'knee'],
      ['спина', 'back'],
      ['зуб', 'tooth', '🦷'],
      ['хвост', 'tail'],
    ],
  },
  {
    topic: { id: 'g3-people', grade: 3, title: 'Люди и семья', emoji: '👨‍👩‍👧' },
    rows: [
      ['семья', 'family'],
      ['малыш', 'baby', '👶', ['infant']],
      ['ребёнок', 'child', '', ['kid', 'baby']],
      ['дети', 'children', '', ['kids']],
      ['мальчик', 'boy', '👦'],
      ['девочка', 'girl', '👧'],
      ['сын', 'son'],
      ['женщина', 'woman', '', ['lady']],
      ['люди', 'people'],
      ['учитель', 'teacher'],
      ['доктор', 'doctor'],
      ['фермер', 'farmer'],
      ['почтальон', 'postman'],
    ],
  },
  {
    topic: { id: 'g3-numbers', grade: 3, title: 'Числа 11–20 и 100', emoji: '🔢' },
    rows: [
      ['одиннадцать', 'eleven', '11'],
      ['двенадцать', 'twelve', '12'],
      ['тринадцать', 'thirteen', '13'],
      ['четырнадцать', 'fourteen', '14'],
      ['пятнадцать', 'fifteen', '15'],
      ['шестнадцать', 'sixteen', '16'],
      ['семнадцать', 'seventeen', '17'],
      ['восемнадцать', 'eighteen', '18'],
      ['девятнадцать', 'nineteen', '19'],
      ['двадцать', 'twenty', '20'],
      ['сто', 'hundred', '100'],
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
  {
    topic: { id: 'g3-months', grade: 3, title: 'Месяцы и времена года', emoji: '🗓️' },
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
      ['время года', 'season'],
      ['зима', 'winter', '❄️'],
      ['весна', 'spring', '🌷'],
      ['лето', 'summer', '☀️'],
      ['осень', 'autumn', '🍂', ['fall']],
      ['дождь', 'rain', '🌧️'],
    ],
  },
  {
    topic: { id: 'g3-things', grade: 3, title: 'Игрушки и вещи', emoji: '🧸' },
    rows: [
      ['игрушка', 'toy'],
      ['кукла', 'doll'],
      ['машина (легковая)', 'car', '🚗'],
      ['воздушный шарик', 'balloon', '🎈'],
      ['самокат', 'scooter', '🛴'],
      ['коньки', 'skates'],
      ['компьютер', 'computer', '💻'],
      ['пианино', 'piano', '🎹'],
      ['головоломка', 'puzzle', '🧩'],
      ['фотография', 'photo', '📷', ['photograph']],
      ['подарок', 'present', '🎁', ['gift']],
      ['открытка', 'postcard', '', ['card']],
      ['письмо, буква', 'letter', '✉️'],
      ['конверт', 'envelope'],
      ['марка', 'stamp'],
      ['часы (наручные)', 'watch', '⌚'],
      ['рубашка', 'shirt', '👔'],
      ['носок', 'sock', '🧦'],
    ],
  },
  {
    topic: { id: 'g3-school-home', grade: 3, title: 'Школа и дом', emoji: '🏫' },
    rows: [
      ['школа', 'school', '🏫'],
      ['домашняя работа', 'homework'],
      ['слово', 'word'],
      ['вопрос', 'question'],
      ['ответ', 'answer'],
      ['стихотворение', 'poem'],
      ['песня', 'song'],
      ['бумага', 'paper'],
      ['комната', 'room'],
      ['дверь', 'door', '🚪'],
      ['лампа', 'lamp', '💡'],
      ['рисунок, картина', 'picture', '🖼️', ['drawing', 'painting']],
      ['телевизор', 'TV', '📺', ['television', 'telly']],
    ],
  },
  {
    topic: { id: 'g3-places', grade: 3, title: 'Город и природа', emoji: '🏙️' },
    rows: [
      ['город', 'city', '🏙️', ['town']],
      ['улица', 'street'],
      ['парк', 'park'],
      ['магазин', 'shop', '', ['store']],
      ['река', 'river'],
      ['небо', 'sky'],
      ['звезда', 'star', '⭐'],
      ['дерево', 'tree', '🌳'],
      ['цветок', 'flower', '🌸'],
      ['корабль', 'ship', '🚢'],
    ],
  },
  {
    topic: { id: 'g3-actions', grade: 3, title: 'Что я делаю', emoji: '🏃' },
    rows: [
      ['писать', 'write', '✍️'],
      ['есть, кушать', 'eat'],
      ['пить', 'drink'],
      ['спать', 'sleep', '😴'],
      ['взбираться', 'climb', '🧗'],
      ['учить, узнавать', 'learn', '', ['study']],
      ['слушать', 'listen', '👂'],
      ['смотреть', 'look', '', ['watch']],
      ['покупать', 'buy'],
      ['давать', 'give'],
      ['приходить', 'come'],
      ['мыть', 'wash'],
      ['стоять', 'stand'],
      ['улыбаться', 'smile'],
      ['знать', 'know'],
      ['хотеть', 'want'],
      ['открывать', 'open'],
      ['закрывать', 'close', '', ['shut']],
      ['помнить', 'remember'],
      ['любить', 'love', '❤️', ['like']],
    ],
  },
  {
    topic: { id: 'g3-adjectives', grade: 3, title: 'Какой?', emoji: '✨' },
    rows: [
      ['маленький', 'small', '', ['little']],
      ['короткий', 'short'],
      ['новый', 'new'],
      ['весёлый', 'merry', '', ['happy', 'cheerful', 'jolly']],
      ['прекрасный (очень красивый)', 'beautiful', '', ['lovely']],
      ['чудесный', 'wonderful', '', ['marvellous', 'marvelous']],
      ['любимый', 'favourite', '', ['favorite']],
      ['холодный', 'cold', '🥶'],
      ['солнечный', 'sunny'],
      ['тёмный', 'dark'],
      ['яркий', 'bright'],
      ['чистый', 'clean'],
      ['грязный', 'dirty'],
      ['голодный', 'hungry'],
      ['здоровый', 'healthy'],
      ['занятой', 'busy'],
      ['быстрый', 'quick', '', ['fast']],
    ],
  },

  // ───────────── 4 класс (списки слов из разделов учебника Enjoy English 4) ─────────────
  {
    topic: { id: 'g4-weather', grade: 4, title: 'Unit 1. Погода', emoji: '⛅' },
    rows: [
      ['погода', 'weather'],
      ['солнце', 'sun', '🌞'],
      ['ветер', 'wind', '🌬️'],
      ['снег', 'snow', '🌨️'],
      ['снежок', 'snowball'],
      ['снеговик', 'snowman', '⛄'],
      ['облачный', 'cloudy', '☁️'],
      ['дождливый', 'rainy'],
      ['снежный', 'snowy'],
      ['ветрено, ветреный', 'windy'],
      ['морозный', 'frosty'],
      ['тёплый, тепло', 'warm'],
      ['жаркий, жарко', 'hot', '🥵'],
      ['пикник', 'picnic'],
      ['нырять', 'dive'],
      ['кататься на санках', 'toboggan', '🛷', ['sledge', 'sled']],
      ['завтра', 'tomorrow'],
    ],
  },
  {
    topic: { id: 'g4-home', grade: 4, title: 'Unit 2. Мой дом', emoji: '🏠' },
    rows: [
      ['квартира', 'flat', '', ['apartment']],
      ['холл, прихожая', 'hall', '', ['hallway']],
      ['кухня', 'kitchen'],
      ['спальня', 'bedroom'],
      ['ванная комната', 'bathroom', '🛁'],
      ['гостиная', 'living room', '🛋️', ['sitting room', 'lounge']],
      ['кладовая', 'pantry', '', ['larder']],
      ['туалет', 'toilet', '', ['lavatory', 'restroom']],
      ['стена', 'wall'],
      ['пол', 'floor'],
      ['окно', 'window', '🪟'],
      ['стул', 'chair', '🪑'],
      ['кресло', 'armchair'],
      ['диван', 'sofa', '', ['couch']],
      ['парта, письменный стол', 'desk'],
      ['книжная полка', 'shelf', '', ['bookshelf']],
      ['шкаф для одежды', 'wardrobe', '', ['closet']],
      ['ковёр', 'carpet', '', ['rug']],
      ['камин', 'fireplace'],
      ['большой (просторный)', 'large', '', ['big']],
    ],
  },
  {
    topic: { id: 'g4-country', grade: 4, title: 'Unit 3. Город и деревня', emoji: '🌄' },
    rows: [
      ['столица', 'capital'],
      ['дорога', 'road'],
      ['мост', 'bridge', '🌉'],
      ['поле', 'field'],
      ['сад', 'garden'],
      ['яблоня', 'apple tree'],
      ['холм', 'hill'],
      ['гора', 'mountain', '⛰️'],
      ['море', 'sea', '🌊'],
      ['океан', 'ocean'],
      ['пустыня', 'desert', '🏜️'],
      ['овца, овцы', 'sheep', '🐑'],
      ['верблюд', 'camel', '🐫'],
      ['дельфин', 'dolphin', '🐬'],
      ['кит', 'whale', '🐳'],
      ['орёл', 'eagle', '🦅'],
      ['полезный', 'useful'],
    ],
  },
  {
    topic: { id: 'g4-family', grade: 4, title: 'Unit 5. Семья и дела', emoji: '👪' },
    rows: [
      ['дочь', 'daughter'],
      ['внучка', 'granddaughter'],
      ['внук', 'grandson'],
      ['еда, пища', 'food'],
      ['готовить (еду)', 'cook', '🍳'],
      ['телефон', 'phone', '📱', ['telephone', 'mobile']],
      ['вежливый', 'polite'],
    ],
  },
  {
    topic: { id: 'g4-clothes', grade: 4, title: 'Unit 6. Одежда и покупки', emoji: '👕' },
    rows: [
      ['одежда', 'clothes'],
      ['платье', 'dress', '👗'],
      ['юбка', 'skirt'],
      ['блузка', 'blouse', '👚'],
      ['футболка', 'T-shirt', '👕', ['tshirt', 'tee shirt']],
      ['брюки', 'trousers', '', ['pants']],
      ['джинсы', 'jeans', '👖'],
      ['шорты', 'shorts', '🩳'],
      ['свитер', 'sweater', '', ['jumper', 'pullover']],
      ['костюм', 'suit'],
      ['куртка', 'jacket', '🧥'],
      ['пальто', 'coat', '', ['overcoat']],
      ['плащ', 'raincoat'],
      ['шапка, кепка', 'cap', '🧢', ['hat']],
      ['шарф', 'scarf', '🧣'],
      ['варежки', 'mittens', '🧤', ['mitten']],
      ['туфли', 'shoes', '👞', ['shoe']],
      ['ботинки', 'boots', '👢', ['boot']],
      ['кроссовки', 'trainers', '👟', ['trainer', 'sneakers']],
      ['зонт', 'umbrella', '☂️'],
      ['бутылка', 'bottle', '🍼'],
      ['стакан', 'glass', '🥛'],
      ['кусок', 'piece'],
    ],
  },
  {
    topic: { id: 'g4-school', grade: 4, title: 'Unit 7. Школа', emoji: '📚' },
    rows: [
      ['одноклассник', 'classmate'],
      ['классная комната, кабинет', 'classroom'],
      ['доска (в классе)', 'board', '', ['blackboard', 'whiteboard']],
      ['линейка', 'ruler', '📏'],
      ['словарь', 'dictionary', '📘'],
      ['краски', 'paints', '🎨'],
      ['отметка', 'mark', '', ['grade']],
      ['перемена', 'break', '', ['recess']],
      ['математика', 'Maths', '➗', ['math', 'mathematics']],
      ['переводить', 'translate'],
      ['золотая рыбка', 'goldfish', '🐠'],
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
    ipa: IPA[en] ?? '',
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
