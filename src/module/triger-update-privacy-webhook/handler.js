"use strict";
const axios = require("axios");

module.exports.trigerUpdatePrivacy = async (event) => {
  const path = `/update-privacy/${process.env.REGISTERED_N_DAYS_AGO || 7}`;
  console.log(" path ===> ", path);
  const urlProd = process.env.URL_PROD_API
    ? `${process.env.URL_PROD_API}${path}`
    : undefined;
  const urlStaging = process.env.URL_STAGING_API
    ? `${process.env.URL_STAGING_API}${path}`
    : undefined;
  const urlDev = process.env.URL_DEV_API
    ? `${process.env.URL_DEV_API}${path}`
    : undefined;
  const urlLocal = process.env.URL_LOCAL_API
    ? `${process.env.URL_LOCAL_API}${path}`
    : undefined;
  console.log(" url ======> ", { urlLocal, urlDev, urlStaging, urlProd });

  const options = {
    headers: {
      authorization: process.env.PAYONE_AUTHORIZATION_KEY || "",
      "Content-Type": "application/json",
    },
  };
  const arrayRequestURL = [];
  try {
    const payload = JSON.parse(event.body);
    console.log(" payload => ", payload);
    console.log(" event => ", event);
    const { secret } = payload;
    console.log("secret ==> ", payload["secret"]);
    console.log("secret2 ==> ", payload.secret);
    console.log("release ==> ", payload.releases);
    if (!secret) {
      console.log(" missing_key  : secret ");
      return {
        statusCode: 400,
        body: "secret is required.",
      };
    }
    if (secret !== process.env.PRISMIC_SECRET) {
      console.log("secret invalid.");
      return {
        statusCode: 401,
        body: "secret invalid.",
      };
    }

    // add url  prod
    if (urlProd) {
      arrayRequestURL.push(urlProd);
    }

    // add url  staging
    if (urlStaging) {
      arrayRequestURL.push(urlStaging);
    }

    // add url  dev
    if (urlDev) {
      arrayRequestURL.push(urlDev);
    }

    // add url localhost
    if (urlLocal) {
      arrayRequestURL.push(urlLocal);
    }

    console.log(" arrayRequestURL ====> ", arrayRequestURL);

    // send all request url
    const results = await Promise.all(
      arrayRequestURL.map((url) => axios.post(url, {}, options))
    );
    console.log(results);

    return {
      statusCode: 200,
      body: "OK",
    };
  } catch (error) {
    console.log(error);
    return {
      statusCode: 202,
      body: JSON.stringify(error, null, 2),
    };
  }
};
