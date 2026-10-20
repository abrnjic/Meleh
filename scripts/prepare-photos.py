"""Prepare faithful, metadata-free web copies from explicitly mapped apartment folders.
Requires Pillow. Originals in ../Fotke are never modified. Run from any directory.
"""
import hashlib, io, json
from pathlib import Path
from PIL import Image, ImageOps, ImageCms
ROOT=Path(__file__).resolve().parents[1]
config=json.loads((ROOT/'config/photo-folders.json').read_text())
source=(ROOT/config['sourceRoot']).resolve()
records=[];covers={};orig_bytes=0;web_bytes=0
for unit in config['apartments']:
 folder=source/unit['folder']
 if not folder.is_dir():raise SystemExit('Missing mapped folder: '+unit['folder'])
 files=sorted(p for p in (folder.rglob('*') if unit.get('recursive',True) else folder.glob('*')) if p.suffix.lower() in {'.jpg','.jpeg','.png','.webp'})
 priorities={name:i for i,name in enumerate(unit.get('preferred',[]))}
 files.sort(key=lambda p:(priorities.get(p.relative_to(folder).as_posix(),999),p.relative_to(folder).as_posix()))
 for n,p in enumerate(files,1):
  raw=p.read_bytes();orig_bytes+=len(raw);digest=hashlib.sha256(raw).hexdigest()[:12]
  name=unit['slug']+'-'+digest+'.webp';target=ROOT/'dist/assets'/name
  if not target.exists():
   with Image.open(io.BytesIO(raw)) as original:
    image=ImageOps.exif_transpose(original)
    if original.info.get('icc_profile'):
     try:image=ImageCms.profileToProfile(image,ImageCms.ImageCmsProfile(io.BytesIO(original.info['icc_profile'])),ImageCms.createProfile('sRGB'),outputMode='RGB')
     except (ValueError,OSError):image=image.convert('RGB')
    else:image=image.convert('RGB')
    image.thumbnail((1600,1600),Image.Resampling.LANCZOS)
    image.save(target,'WEBP',quality=78,method=4)
  web_bytes+=target.stat().st_size
  key=unit['slug']+'-'+digest
  if n==1:covers[unit['slug']]=key
  label='Balkon' if 'Balkon' in p.parts else 'Fotografija'
  records.append({'key':key,'file':name,'url':None,'category':unit['slug'],'illustrative':False,'alt':f"Apartman {unit['slug'].upper()} — {label.lower()} {n}",'altEn':f"Apartment {unit['slug'].upper()} — photograph {n}",'altDe':f"Apartment {unit['slug'].upper()} — Foto {n}"})
site_images={};outdoor=[]
for group in config.get('collections',[]):
 folder=source/group['folder']
 for n,filename in enumerate(group['files'],1):
  p=folder/filename
  raw=p.read_bytes();orig_bytes+=len(raw);digest=hashlib.sha256(raw).hexdigest()[:12]
  name=group['slug']+'-'+digest+'.webp';target=ROOT/'dist/assets'/name
  if not target.exists():
   with Image.open(io.BytesIO(raw)) as original:
    image=ImageOps.exif_transpose(original)
    if original.info.get('icc_profile'):
     try:image=ImageCms.profileToProfile(image,ImageCms.ImageCmsProfile(io.BytesIO(original.info['icc_profile'])),ImageCms.createProfile('sRGB'),outputMode='RGB')
     except (ValueError,OSError):image=image.convert('RGB')
    else:image=image.convert('RGB')
    image.thumbnail((1600,1600),Image.Resampling.LANCZOS)
    image.save(target,'WEBP',quality=78,method=4)
  web_bytes+=target.stat().st_size
  key=group['slug']+'-'+digest
  labels=group['labels']
  outdoor.append({'key':key,'file':name,'url':None,'category':group['slug'],'illustrative':False,'alt':f"{labels[0]} — {n}",'altEn':f"{labels[1]} — {n}",'altDe':f"{labels[2]} — {n}",'altCs':f"{labels[3]} — {n}"})
  for field,relative in config.get('siteImages',{}).items():
   if p.relative_to(source).as_posix()==relative:site_images[field]=key
if set(site_images)!=set(config.get('siteImages',{})):raise SystemExit('Missing selected outdoor cover photograph')
records=outdoor+records
guide_images={title:'location-'+hashlib.sha256((source/relative).read_bytes()).hexdigest()[:12] for title,relative in config.get('guideImages',{}).items()}
if any(key not in {p['key'] for p in records} for key in guide_images.values()):raise SystemExit('Missing selected guide photograph')
revision='photos-'+hashlib.sha256(json.dumps([records,covers,site_images,guide_images],sort_keys=True).encode()).hexdigest()[:16]
payload={'revision':revision,'covers':covers,'siteImages':site_images,'guideImages':guide_images,'photos':records}
(ROOT/'dist/photo-library-data.js').write_text('export default '+json.dumps(payload,ensure_ascii=False,indent=2)+';\n')
print(json.dumps({'photos':len(records),'outdoorPhotos':len(outdoor),'originalMB':round(orig_bytes/1048576,1),'webMB':round(web_bytes/1048576,1),'maxPhotoKB':round(max((ROOT/'dist/assets'/p['file']).stat().st_size for p in records)/1024),'revision':revision}))
