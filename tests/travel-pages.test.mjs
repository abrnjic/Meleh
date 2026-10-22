import test from 'node:test';import assert from 'node:assert/strict';import {readFile} from 'node:fs/promises';
import {arrivalContent,arrivalLinks,arrivalCopy,ARRIVAL_SOURCES} from '../dist/arrival.js';
import {pageSeo,seoPages} from '../dist/seo.js';import {renderSeoHtml,sitemapXml} from '../server/seo.js';
import defaults from '../server/default-site.json' with {type:'json'};
const template=await readFile(new URL('../server/page-template.html',import.meta.url),'utf8');
test('merged guide has one main heading and the day plan precedes recommendations',()=>{
 const {html,status}=renderSeoHtml(template,defaults,'/vodic');assert.equal(status,200);assert.equal((html.match(/<h1\b/g)||[]).length,1);
 assert.ok(html.indexOf('id="plan-dana"')<html.indexOf('Doživite Pelješac.'));
 assert.equal(pageSeo(defaults,'/plan-dana').canonical,pageSeo(defaults,'/vodic').canonical);
 assert.ok(!seoPages(defaults).includes('/plan-dana'));assert.ok(!sitemapXml(defaults).includes('/plan-dana'));
});
test('getting-here is indexed and rendered in four languages using current host details',()=>{
 for(const lang of ['hr','en','de','cs']){const {html,status}=renderSeoHtml(template,defaults,'/kako-do-nas',lang);assert.equal(status,200);assert.equal((html.match(/<h1\b/g)||[]).length,1);assert.ok(html.includes('Google Maps')||html.includes('www.google.com/maps'));assert.ok(html.includes(ARRIVAL_SOURCES.bus));assert.ok(html.includes(arrivalCopy(lang).car));assert.equal(pageSeo(defaults,'/kako-do-nas',lang).noindex,false);}
 const site={...defaults,address:'Druga ulica 7, Pelješac',mapsUrl:'https://maps.app.goo.gl/example',mapEmbed:null,checkIn:'16:00'};
 const links=arrivalLinks(site);assert.equal(links.map,site.mapsUrl);assert.ok(decodeURIComponent(links.directions).includes(site.address));assert.ok(decodeURIComponent(links.embed).includes(site.address));assert.ok(arrivalContent(site).includes('16:00'));
 assert.equal((arrivalContent(site).match(/class="arrival-card"/g)||[]).length,4);
});
