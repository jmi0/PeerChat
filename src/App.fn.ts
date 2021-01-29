const refreshFetch = (url: string, method: string, headers: Headers, body: string|Blob|ArrayBufferView|ArrayBuffer|FormData|URLSearchParams|null|undefined) => {
  return new Promise((resolve, reject) => {
    // attempt to make request
    fetch(url, {method: method, headers: headers, body: body})
    .then(response => response.json())
    .then(result => {
      // token is expired
      if (typeof result.tokenexpired !== 'undefined') {
        // refresh token
        fetch('/refreshtoken', { method: 'POST', headers: {'Content-Type': 'application/json'}})
        .then(response => response.json())
        .then(result => {
          resolve(result);
        })
        .catch(err => reject(err))
      } else resolve(result);
    })
    .catch(err => reject(err) )
  });
}

const exists = (v: any) => {
  if (typeof v !== 'undefined') return true;
  else return false;
}

export {
  refreshFetch,
  exists
}