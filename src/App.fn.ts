/*
 * @Author: joe.iannone 
 * @Date: 2021-02-09 23:11:03 
 * @Last Modified by: joe.iannone
 * @Last Modified time: 2021-02-10 11:40:13
 */


/**
 * A wrapper around fetch that automatically refreshes token and refetches request
 * 
 * @param url :string
 * @param method  :string
 * @param headers : Headers
 * @param body : string|Blob|ArrayBufferView|ArrayBuffer|FormData|URLSearchParams|null|undefined
 */
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


/**
 * A more convenient way to check for undefined
 * 
 * @param v : any
 */
const exists = (v: any) => {
  if (typeof v !== 'undefined') return true;
  else return false;
}


/**
 * 
 * @param dataURI : string
 */
const dataURItoBlob = (dataURI: string) => {
  // convert base64/URLEncoded data component to raw binary data held in a string
  var byteString;
  if (dataURI.split(',')[0].indexOf('base64') >= 0)
    byteString = atob(dataURI.split(',')[1]);
  else
    byteString = unescape(dataURI.split(',')[1]);

  // separate out the mime component
  var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];

  // write the bytes of the string to a typed array
  var ia = new Uint8Array(byteString.length);
  for (var i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }
  return new Blob([ia], {type:mimeString});
};


export {
  refreshFetch,
  exists,
  dataURItoBlob
}