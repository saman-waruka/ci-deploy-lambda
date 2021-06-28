"use strict";
const axios = require("axios");
const body = require("../../helper/body");
module.exports.payoneTransactionWebhook = async (event) => {
  const path = "/payment/payone-webhook";
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
  try {
    const payload = await body.parse(event);
    console.log(" url ======> ", { urlLocal, urlDev, urlStaging, urlProd });

    console.log(
      ` txid => ${payload.txid}   txaction => ${payload.txaction}  type => ${payload.clearingtype}   mode => ${payload.mode}`
    );
    console.log(" payload => ", payload);
    console.log(" event => ", event);
    const { key, txid, txaction } = payload;

    if (!key) {
      console.log(" missing_key  : key ");
      return {
        statusCode: 400,
        body: "key is required.",
      };
    }
    if (!txid) {
      console.log(" missing_key  : txid ");
      return {
        statusCode: 400,
        body: "txid is required.",
      };
    }
    if (!txaction) {
      console.log(" missing_key  : txaction ");
      return {
        statusCode: 400,
        body: "txaction is required.",
      };
    }

    const options = {
      headers: {
        authorization: key || "",
        "Content-Type": "application/json",
      },
    };

    const arrayRequest = [];
    // add url  prod
    if (urlProd) {
      arrayRequest.push(urlProd);
    }

    // add url  staging
    if (urlStaging) {
      arrayRequest.push(urlStaging);
    }

    // add url  dev
    if (urlDev) {
      arrayRequest.push(urlDev);
    }

    // add url localhost
    if (urlLocal) {
      arrayRequest.push(urlLocal);
    }

    // send all request url
    const results = await Promise.all(
      arrayRequest.map((url) => axios.post(url, payload, options))
    );
    const allProcessStatus = results.map((res) => res.data.processed);
    const isProcessed = allProcessStatus.includes(true);
    console.log(" all Processes => ", allProcessStatus);
    console.log(" isProcessed => ", isProcessed);
    console.log(results);

    if (isProcessed) {
      return {
        statusCode: 200,
        body: "TSOK",
      };
    }

    return {
      statusCode: 200,
      // body: "TSOK",
    };
  } catch (error) {
    console.log(error);
    return {
      statusCode: 500,
    };
  }
};
