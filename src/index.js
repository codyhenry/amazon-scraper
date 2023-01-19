const axios = require("axios");
const { JSDOM } = require("jsdom");

const getProductUrl = (product_id) =>
  `https://www.amazon.com/gp/product/ajax/?asin=${product_id}&m=&smid=&sourcecustomerorglistid=&sourcecustomerorglistitemid=&sr=8-5&pc=dp&experienceId=aodAjaxMain`;

const selectors = {
  image: "#aod-asin-image-id",
  title: "#aod-asin-title-block",
  condition: "#aod-offer-heading h4",
  conditionDescription: "#aod-other-offer-condition-text",
  price: ".a-price .a-offscreen",
  soldBy: "#aod-offer-soldBy .a-col-right .a-size-small",
  pinnedElement: "#aod-pinned-offer",
  offerListElement: "#aod-offer-list",
  offerItem: "#aod-offer-",
};

async function getPrices(product_id) {
  const productUrl = getProductUrl(product_id);
  const { data: html } = await axios.get(productUrl, {
    headers: {
      authority: `www.amazon.com`,
      accept: `text/html,*/*`,
      "user-agent": `Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Mobile Safari/537.36`,
      pragma: `no-cache`,
    },
  });
  const dom = new JSDOM(html);

  const getOffer = (element) => {
    //returns object
    if (!element) {
      return;
    }

    var condition = element.querySelector(selectors["condition"]).textContent;
    condition = condition.replace(/[\n\s]/g, "").trim();
    const price = element.querySelector(selectors["price"]).textContent;
    const conditionDescription =
      condition !== "New"
        ? element
            .querySelector(selectors["conditionDescription"])
            .textContent.trim()
        : null;
    const soldBy = element
      .querySelector(selectors["soldBy"])
      .textContent.trim();

    return { price, condition, conditionDescription, soldBy };
  };

  const getElement = (selector) => {
    return dom.window.document.querySelector(selector);
  };

  const image = getElement(selectors["image"]).getAttribute("src");
  var title = getElement(selectors["title"]).textContent;
  title =
    title.length > 50 ? `${title.trim().slice(0, 50)}` + "..." : title.trim();

  const pinnedElement = getElement(selectors["pinnedElement"]);
  const pinnedInfo = getOffer(pinnedElement);

  const offerListElement = getElement(selectors["offerListElement"]);
  const offersToRetrieve = 5;
  const offers = [];
  for (var i = 1; i < offersToRetrieve; i++) {
    offers.push(
      getOffer(offerListElement.querySelector(`${selectors["offerItem"]}${i}`))
    );
  }

  const result = {
    image,
    title,
    pinnedInfo,
    offers,
    productUrl,
  };
  console.log(result);
}

getPrices("B088QSDB7S");
