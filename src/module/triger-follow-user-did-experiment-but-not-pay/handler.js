"use strict";
const axios = require("axios");
module.exports.trigerSendmailFollowUserToMakePayment = async (event) => {
  const path = `/users/follow-user-did-experiment-but-not-pay/${
    process.env.DID_EXPERIMENT_N_DAYS_AGO || 1
  }`;
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
