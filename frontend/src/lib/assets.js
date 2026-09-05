const B = "https://static.prod-images.emergentagent.com/jobs/4a763fbf-4f9d-42a8-af37-1036efe0d5ca/images/";
export const IMAGES = {
  hero: B + "ed8b9c122dc4fe26dbf073ac70c761461001aeb3c4a07d7270cb9ee9bd2679e8.jpeg",
  worldForYou: B + "94bb130af9be891ffde1dab5e00ae1ed6f0797a645f72eb7e1eef6b03f312490.jpeg",
  worldForPet: B + "512282b16346f0234b3ed335ad37da2f62007ee230fa406d589909e8ca130ddb.jpeg",
};

export const CATEGORY_IMAGES = {
  clothing: B + "0369e51b07701ded4bf8190f2105be787cac8b65ae35fbd73084e90ef67477a0.jpeg",
  drinkware: B + "a787e33ab5ef96e50e19087c13ffda74fa04ac9a28649bd7818702321e4e6a5d.jpeg",
  caps: B + "06320297027982211701804444ce4a6bc3aa5d5e71aa608bc0952aa35edde310.jpeg",
  stationary: B + "b1c04e708e60f875ae41105e584893f3bcb6d7016a496ea66c0332ee9cf134ac.jpeg",
  accessories: B + "e7f33d51b6b3fc34e01c4d41f2ac50b46a85b9b8f6ddb9ae5abe55e8d78c209d.jpeg",
  bags: B + "da05d2450c7286c649de91d80e65fcba15932416309923a68fadab8b0ae8fa7a.jpeg",
  gifting: B + "018d0ab400737da050644ea79865701a83a7d3b5d08efc62925019082f6e7653.jpeg",
  decors: B + "b5d1524ff7c55b5b7c52e8235efd2b277647ed57fdedcf083331229211e0374a.jpeg",
  "pet-tags": B + "aa36c990094b4de96165c0633d0dbccb3479c9a80cc714646beb7655b980f2c6.jpeg",
  "unisex-dog-t-shirts": B + "7fa7e7732e8e323038b6f8b528c9dd6b2cc0dc7c7098007a5fe8d81a5c0aed7f.jpeg",
};
export const catImage = (slug) => CATEGORY_IMAGES[slug] || IMAGES.worldForYou;
