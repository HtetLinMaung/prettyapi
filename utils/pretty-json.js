export const getAllValues = (obj = {}, values = []) => {
  Object.entries(obj).forEach(([key, v]) => {
    if (
      typeof obj[key] === "object" &&
      !Array.isArray(obj[key]) &&
      Object.keys(obj[key]).length
    ) {
      getAllValues(obj[key], values);
    } else if (Array.isArray(obj[key]) && obj[key].length) {
      for (const item of obj[key]) {
        if (typeof item == "object") {
          getAllValues(item, values);
        } else {
          values.push(item);
        }
      }
    } else {
      values.push(v);
    }
  });

  return values;
};

export const getAllKeys = (obj = {}, keys = []) => {
  Object.keys(obj).forEach((key) => {
    if (
      typeof obj[key] === "object" &&
      !Array.isArray(obj[key]) &&
      Object.keys(obj[key]).length
    ) {
      getAllKeys(obj[key], keys);
    } else if (Array.isArray(obj[key]) && obj[key].length) {
      for (const item of obj[key]) {
        getAllKeys(item, keys);
      }
    }
    keys.push(key);
  });

  return keys;
};

export const getBeautifulJson = (obj = {}) => {
  let json = JSON.stringify(obj, null, 2);
  const keys = getAllKeys(obj);
  const values = getAllValues(obj);

  const nums = [];
  for (const v of values) {
    if (typeof v == "string") {
      json = json
        .replaceAll(
          `: "${v}"`,
          `: <span class="json-value-string">"${v}"</span>`
        )
        .replaceAll(`"${v}"`, `<span class="json-value-string">"${v}"</span>`);
    } else if (typeof v == "number") {
      nums.push(v);
    } else if (typeof v == "boolean") {
      json = json.replaceAll(
        `: ${v}`,
        `: <span class="json-value-${typeof v}">${v}</span>`
      );
    }
  }
  // sort nums by descending
  nums.sort((a, b) => b - a);
  for (const n of nums) {
    json = json.replace(
      new RegExp(`: ${n}`, "g"),
      `: <span class="json-value-number">${n}</span>`
    );
  }

  for (const key of keys) {
    json = json.replaceAll(
      `"${key}":`,
      `<span class="json-key">"${key}"</span>:`
    );
  }
  return json;
};
