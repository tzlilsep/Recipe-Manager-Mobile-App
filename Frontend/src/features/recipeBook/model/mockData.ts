// English comments only.

import { Recipe } from './types';

export const AVAILABLE_TAGS = [
  'קינוח','בשר','עוף','דגים','צמחוני','טבעוני',
  'מנה עיקרית','מנה ראשונה','סלט','מרק','אפייה',
  'מאפה','בריא','מהיר','חגיגי',
] as const;

export const initialMyRecipes: Recipe[] = [
  {
    id: 1,
    title: 'פסטה ברוטב עגבניות',
    ingredients: [
      { name: 'פסטה', amount: '500', unit: 'גרם' },
      { name: 'עגבניות', amount: '4', unit: 'יחידה' },
      { name: 'שום', amount: '3', unit: 'שיניים' },
      { name: 'בזיליקום', amount: '1', unit: 'חבילה' },
      { name: 'שמן זית', amount: '2', unit: 'כף' },
    ],
    instructions: [
      { type: 'text', content: 'בשלו את הפסטה לפי ההוראות' },
      { type: 'text', content: 'הכינו את הרוטב מעגבניות, שום ובזיליקום' },
      { type: 'text', content: 'ערבבו יחד' },
    ],
    workTime: '15 דקות',
    totalTime: '25 דקות',
    servings: 4,
    imageUrl: 'https://images.unsplash.com/photo-1724365858492-743b85c95ac4?auto=format&fit=crop&w=1080&q=80',
    tags: ['מנה עיקרית', 'צמחוני', 'מהיר'],
    tips: 'מומלץ להשתמש בעגבניות בשלות וטריות.',
  },
];

export const initialOthersRecipes: Recipe[] = [
  {
    id: 101,
    title: 'עוגת שוקולד',
    ingredients: [
      { name: 'שוקולד מריר', amount: '200', unit: 'גרם', groupTitle: 'לבלילה' },
      { name: 'חמאה', amount: '200', unit: 'גרם', groupTitle: 'לבלילה' },
      { name: 'ביצים', amount: '4', unit: 'יחידה', groupTitle: 'לבלילה' },
      { name: 'סוכר', amount: '200', unit: 'גרם', groupTitle: 'לבלילה' },
      { name: 'קמח', amount: '100', unit: 'גרם', groupTitle: 'לבלילה' },
    ],
    instructions: [
      { type: 'text', content: 'המיסו שוקולד וחמאה' },
      { type: 'text', content: 'הוסיפו ביצים וסוכר' },
      { type: 'text', content: 'הוסיפו קמח' },
      { type: 'text', content: 'אפו ב-180 מעלות ל-30 דקות' },
    ],
    workTime: '15 דקות',
    totalTime: '45 דקות',
    servings: 8,
    imageUrl: 'https://images.unsplash.com/photo-1644158776192-2d24ce35da1d?auto=format&fit=crop&w=1080&q=80',
    author: 'שרה כהן',
    saveCount: 42,
    tags: ['קינוח', 'אפייה'],
  },
];
