// https://docs.cypress.io/api/table-of-contents
import { productType } from "@/types/product";

describe("Landing Page", () => {
  beforeEach(() => {
    cy.visit("/");
  });
  it("Renders all the fields", () => {
    cy.contains("h1", "Villefranche");
    // Contains an input of type radio
    cy.get("input[type=radio]").should(
      "have.length",
      Object.keys(productType).length
    );
    // Contains an input of type range
    cy.get("input[type=range]").should("have.length", 1);
    // Should contain Stripe payment element
    cy.get(".__PrivateStripeElement > iframe").should("have.length", 1);
    // Contains one button
    cy.get("button").should("have.length", 1);
  });
  it("Is possible to pay", () => {
    cy.wait(6000);
    cy.get(".__PrivateStripeElement > iframe")
      .should("have.length", 1)
      .then(($iframe) => {
        const doc = $iframe.contents();
        let input = doc.find("input")[0];
        cy.wrap(input).type("4242424242424242");
        input = doc.find("input")[1];
        cy.wrap(input).clear().type("12").type("42");
        input = doc.find("input")[2];
        cy.wrap(input).type("424");
      });
    // Click the button
    cy.get("button").click();
    cy.contains("h1", "Merci");
  });
});
