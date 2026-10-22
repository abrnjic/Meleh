import {brandRevision,destinationRevision,catalogueRevision,photoLibraryRevision,apartmentNamesRevision,amenitiesRevision,specificationRevision,viewsRevision,productionPhotoRevision,languageRevision,houseRulesRevision} from './destination.js';
// Every normal save retains all migration markers, so subsequent public reads
// do not reapply defaults or create an unexpected revision conflict.
export function publicSiteRecord(data,revision){return {data,revision,brandRevision,destinationRevision,catalogueRevision,photoLibraryRevision,apartmentNamesRevision,amenitiesRevision,specificationRevision,viewsRevision,productionPhotoRevision,languageRevision,houseRulesRevision,updatedAt:new Date().toISOString()}}
