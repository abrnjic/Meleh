import library from './photo-library-data.js';

export const photoLibraryRevision=library.revision;
export const isIllustrativePhoto=photo=>photo?.illustrative!==false&&photo?.category!=='location';
export function apartmentPhotographs(site,slug){return site.photos.filter(p=>p.category===slug&&!isIllustrativePhoto(p));}
export function applyPhotoLibrary(site){
 const data=structuredClone(site),slugs=new Set(data.apartments.map(a=>a.slug));
 const covered=new Set(Object.keys(library.covers).filter(slug=>slugs.has(slug)));
 // Retain real host uploads alongside managed files when more folder photos arrive.
 const imported=new Set(library.photos.map(p=>p.key));
 data.photos=[...data.photos.filter(p=>!covered.has(p.category)||(!imported.has(p.key)&&!isIllustrativePhoto(p)&&!/^a-\d+-[a-f0-9]{12}$/.test(p.key))),...structuredClone(library.photos.filter(p=>covered.has(p.category)))];
 data.apartments=data.apartments.map(a=>{
  if(!covered.has(a.slug))return a;
  const existing=data.photos.find(p=>p.key===a.image);
  return existing&&!isIllustrativePhoto(existing)?a:{...a,image:library.covers[a.slug]};
 });
 return data;
}
