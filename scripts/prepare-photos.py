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
revision='photos-'+hashlib.sha256(json.dumps([records,covers],sort_keys=True).encode()).hexdigest()[:16]
payload={'revision':revision,'covers':covers,'photos':records}
(ROOT/'dist/photo-library-data.js').write_text('export default '+json.dumps(payload,ensure_ascii=False,indent=2)+';\n')
print(json.dumps({'photos':len(records),'originalMB':round(orig_bytes/1048576,1),'webMB':round(web_bytes/1048576,1),'maxPhotoKB':round(max((ROOT/'dist/assets'/p['file']).stat().st_size for p in records)/1024),'revision':revision}))
