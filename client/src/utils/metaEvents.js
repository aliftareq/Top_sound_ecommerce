export const trackViewContent = (product) => {
  if (window.fbq) {
    window.fbq("track", "ViewContent", {
      content_ids: [product._id],
      content_name: product.name,
      value: product.price,
      currency: "BDT",
    });
  }
};

export const trackAddToCart = (product) => {
  if (window.fbq) {
    window.fbq("track", "AddToCart", {
      content_ids: [product._id],
      content_name: product.name,
      value: product.price,
      currency: "BDT",
    });
  }
};

export const trackInitiateCheckout = (total) => {
  if (window.fbq) {
    window.fbq("track", "InitiateCheckout", {
      value: total,
      currency: "BDT",
    });
  }
};

export const trackPurchase = (order) => {
  if (window.fbq) {
    window.fbq("track", "Purchase", {
      value: order.total,
      currency: "BDT",
    });
  }
};