const sizes=['100','115','130','150'];
const storageKey='meleh-text-size';
export function normalizeTextSize(value){return sizes.includes(String(value))?String(value):'100'}
export function applyTextSize(value,root,storage){
 const size=normalizeTextSize(value);
 root.dataset.textSize=size;
 try{(storage??window.localStorage).setItem(storageKey,size)}catch{}
 return size;
}
export function restoreTextSize(root,storage){
 let value;
 try{value=(storage??window.localStorage).getItem(storageKey)}catch{}
 root.dataset.textSize=normalizeTextSize(value);
 return root.dataset.textSize;
}
