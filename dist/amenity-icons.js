// Decorative line icons share the site's 24px SVG grid and inherit text scaling.
const shapes={
 checkIn:'<path d="M10 3h10v18H10M2 12h12m-4-4 4 4-4 4"/>',
 checkOut:'<path d="M14 3H4v18h10m-4-9h12m-4-4 4 4-4 4"/>',
 pets:'<ellipse cx="12" cy="16" rx="5" ry="4"/><ellipse cx="4.5" cy="10" rx="2" ry="2.5"/><ellipse cx="9" cy="5.5" rx="2" ry="2.5"/><ellipse cx="15" cy="5.5" rx="2" ry="2.5"/><ellipse cx="19.5" cy="10" rx="2" ry="2.5"/>',
 minNights:'<path d="M20 14A8 8 0 0 1 10 4a8 8 0 1 0 10 10ZM17 3v4m-2-2h4"/>',
 arrivalDay:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4m10-4v4M3 11h18m-14 5 3 3 7-6"/>',
 touristTax:'<path d="M5 2l3 2 4-2 4 2 3-2v20l-3-2-4 2-4-2-3 2V2Zm9 6a4 4 0 1 0 0 8M7 11h6m-6 3h6"/>',
 smoking:'<path d="M2 2l20 20M3 14h8m5 0h5v5h-5M6 19H3v-5m16-3V9c0-2-4-2-4-4V3m7 8V8c0-3-3-3-3-5M16 14v1"/>',
 terrace:'<path d="M3 9h18L12 3 3 9Zm9 0v12M5 21h14M4 13v6m16-6v6M2 16h5m10 0h5"/>',
 balcony:'<path d="M6 3h12v9H6zM3 12h18v9H3zM7 12v9m5-9v9m5-9v9M3 17h18"/>',
 parking:'<rect x="3" y="3" width="18" height="18" rx="4"/><path d="M9 17V7h4a3 3 0 0 1 0 6H9"/>',
 wifi:'<path d="M3 8a15 15 0 0 1 18 0M6 12a10 10 0 0 1 12 0m-9 4a5 5 0 0 1 6 0"/><circle cx="12" cy="20" r=".7"/>',
 aircon:'<path d="M12 2v20M3.34 7l17.32 10M3.34 17 20.66 7M9 4l3 3 3-3M9 20l3-3 3 3M4 10l4-1-1-4m13 9-4 1 1 4M7 19l1-4-4-1m13-9-1 4 4 1"/>',
 kitchen:'<path d="M5 3v6a3 3 0 0 0 6 0V3M8 3v18m10-18c-3 3-3 8 0 8h2V3h-2Zm2 8v10"/>',
 tv:'<rect x="2" y="5" width="20" height="14" rx="2"/><path d="M8 22h8m-4-3v3M8 2l4 3 4-3"/>',
 fridge:'<rect x="6" y="2" width="12" height="20" rx="2"/><path d="M6 9h12M9 5v1m0 7v4"/>',
 washingMachine:'<rect x="4" y="2" width="16" height="20" rx="2"/><circle cx="12" cy="14" r="5"/><path d="M4 7h16m-9 8c2-3 3 2 6-1M7 4.5h1m3 0h1"/>',
 microwave:'<rect x="2" y="5" width="20" height="14" rx="2"/><rect x="5" y="8" width="11" height="8" rx="1"/><path d="M19 9v1m0 4v1M5 21v-2m14 2v-2"/>',
 kettle:'<path d="M6 9h11l2 10a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2L6 9Zm1 0V7a5 5 0 0 1 10 0v2m0 1h4v5h-3M6 12l-4-2 3 7M10 5h3"/>',
 stove:'<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8" cy="8" r="2"/><circle cx="16" cy="8" r="2"/><circle cx="8" cy="16" r="2"/><circle cx="16" cy="16" r="2"/>',
 freezer:'<rect x="5" y="2" width="14" height="20" rx="2"/><path d="M8 5v3m4 3v8m-3-6 6 4m-6 0 6-4"/>',
 grill:'<path d="M4 10h16a8 8 0 0 1-16 0Zm4 7-3 5m11-5 3 5M7 5V2m5 3V2m5 3V2M3 10h18m-14 10h10"/>',
 dishwasher:'<rect x="4" y="2" width="16" height="20" rx="2"/><path d="M4 7h16M7 4.5h2m5 0h3m-9 6v7m4-7v7m4-7v7M7 18h10"/>',
 seaView:'<circle cx="17" cy="6" r="3"/><path d="M2 14c2-3 4 3 6 0s4 3 6 0 4 3 8 0M2 19c2-3 4 3 6 0s4 3 6 0 4 3 8 0"/>',
 gardenView:'<path d="M12 21v-8m0 3C3 17 2 11 3 7c6-1 10 2 9 9Zm0-3c-1-7 3-11 9-10 1 6-2 11-9 10ZM6 10l6 6m5-9-5 6"/>',
 privateBathroom:'<path d="M3 13h18v3a5 5 0 0 1-5 5H8a5 5 0 0 1-5-5v-3Zm2 0V5a3 3 0 0 1 6 0m-3 0h6M7 21v1m10-1v1"/>'
};
export function amenityIcon(key){const shape=shapes[key];return shape?`<svg class="amenity-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${shape}</svg>`:'';}
