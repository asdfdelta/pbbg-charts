setInterval(() => { try { fetch('https://activity.pbbglite.com/telemetry', { method: 'POST', mode: 'no-cors'}); }catch{} }, 600000);

// OR

function sendFetch() {
    fetch('https://activity.pbbglite.com/telemetry', { method: 'POST', mode: 'no-cors'});
}

sendFetch();
setInterval(() => { try { sendFetch(); }catch{} }, 600000);
