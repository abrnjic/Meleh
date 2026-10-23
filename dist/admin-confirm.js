export const DRAFT_REMOVAL_NOTICE='Promjena ostaje u nacrtu do spremanja ili objave.';
// Ask before entering an updater or sending a deletion request.
export function confirmRemoval(question,consequence=DRAFT_REMOVAL_NOTICE,ask=message=>window.confirm(message)){
 return ask(`${question}\n\n${consequence}`)===true;
}
