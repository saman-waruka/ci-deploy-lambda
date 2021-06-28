"use strict";
const axios = require("axios");
// const body = require("../../helper/body");
module.exports.fanzTransactionWebhook = async (event) => {
  const path = "/payment/fanz-webhook";

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
    if (!event.headers.Authorization) {
      console.log(" missing_header  : Authorization ");
      return {
        statusCode: 400,
        body: "status is required.",
      };
    }

    const payload = JSON.parse(event.body);

    const { status, transactionId, pid } = payload;
    console.log(" url ======> ", { urlLocal, urlDev, urlStaging, urlProd });

    console.log(
      ` transactionId => ${transactionId}   pid => ${pid}  status => ${status} `
    );
    console.log(" payload => ", payload);
    console.log(" event => ", event);

    if (!status) {
      console.log(" missing_key  : status ");
      return {
        statusCode: 400,
        body: "status is required.",
      };
    }
    if (status === "success" && !transactionId) {
      console.log(" missing_key  : transactionId ");
      return {
        statusCode: 400,
        body: "transactionId is required.",
      };
    }
    if (!pid) {
      console.log(" missing_key  : pid ");
      return {
        statusCode: 400,
        body: "pid is required.",
      };
    }

    const options = {
      headers: {
        authorization: event.headers.Authorization || "",
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
    console.log("======= error occur ======");
    console.log(error);
    return {
      statusCode: 500,
    };
  }
};
