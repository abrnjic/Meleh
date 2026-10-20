import czech from './czech-data.js';
export const LANGUAGES=['hr','en','de','cs'];
export const LOCALES={hr:'hr-HR',en:'en-GB',de:'de-DE',cs:'cs-CZ'};
export function translateCs(value){
 const text=String(value??'');
 if(Object.hasOwn(czech,text))return czech[text];
 let match=/^Apartment photographs: (.*)\. $/.exec(text);if(match)return `Fotografie apartmánů: ${match[1]}.`;
 match=/^Capacity: (\d+) standard beds(?: \+ (\d+) extra bed)?\.$/.exec(text);if(match)return `Kapacita: ${match[1]} základní lůžka${match[2]?' + '+match[2]+' přistýlka':''}.`;
 match=/^Allowed · €([\d.,]+) \/ day$/.exec(text);if(match)return `Povoleni · ${match[1]} € / den`;
 match=/^Apartment (A-\d+) — photograph (\d+)$/.exec(text);if(match)return `Apartmán ${match[1]} — fotografie ${match[2]}`;
 match=/^Apartment (A-\d+) — balcony (\d+)$/.exec(text);if(match)return `Apartmán ${match[1]} — balkon ${match[2]}`;
 return text;
}
