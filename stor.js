async function getStor(key) {
    return new Promise((resolve) => {
        if (!key)
            chrome.storage.local.get(null, resolve);
        else
            chrome.storage.local.get([key], (result) => resolve(result[key]));
    });
}

async function setStor(key, val) {
    return new Promise((resolve) => {
        var obj = {};
        obj[key] = val;
        chrome.storage.local.set(obj, resolve);
    });
}
