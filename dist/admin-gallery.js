// Keep original indices: editing one album must never overwrite another album.
export function galleryAlbums(site){const labels=[['house','Kuća i okućnica'],['location','Lokacija i plaže'],...site.apartments.map(a=>[a.slug,'Apartman '+a.name])];const known=new Set(labels.map(([id])=>id));for(const p of site.photos)if(!known.has(p.category)){labels.push([p.category,p.category||'Ostale fotografije']);known.add(p.category)}return labels.map(([id,label])=>({id,label,photos:site.photos.flatMap((photo,index)=>photo.category===id?[{photo,index}]:[])}))}
export function albumPhotos(site,category,search=''){const album=galleryAlbums(site).find(a=>a.id===category);const query=search.trim().toLocaleLowerCase('hr');return (album?.photos||[]).filter(({photo})=>!query||[photo.alt,photo.key,album.label].join(' ').toLocaleLowerCase('hr').includes(query))}
export function neighboringPhotoIndex(site,key,step){const photo=site.photos.find(p=>p.key===key);if(!photo||![1,-1].includes(step))return -1;const rows=albumPhotos(site,photo.category),at=rows.findIndex(row=>row.photo.key===key);return rows[at+step]?.index??-1}

export function photoCount(n){const tail=n%100,last=n%10;return `${n} ${tail>=11&&tail<=14?'fotografija':last===1?'fotografija':last>=2&&last<=4?'fotografije':'fotografija'}`}

// Reorder only the slots belonging to this album; other albums keep their order.
export function movePhoto(site,key,targetKey){
 const from=site.photos.find(p=>p.key===key),to=site.photos.find(p=>p.key===targetKey);
 if(!from||!to||from===to||from.category!==to.category)return false;
 const rows=albumPhotos(site,from.category),photos=rows.map(r=>r.photo),a=photos.findIndex(p=>p.key===key),b=photos.findIndex(p=>p.key===targetKey);
 photos.splice(b,0,photos.splice(a,1)[0]);rows.forEach((r,i)=>{site.photos[r.index]=photos[i]});return true;
}
