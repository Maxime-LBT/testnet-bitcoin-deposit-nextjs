import { cy } from 'local-cypress';

describe('Home Page Payment Flow', () => {
    beforeEach(() => {
        // Visit the page before each test
        cy.visit('http://localhost:3000/')
    });

    it('should load the home page', () => {
        cy.url().should('eq', 'http://localhost:3000/');
    });

    it('should enter an amount, submit the form, and cancel the transaction', () => {
        // Enter the amount into the input field
        cy.get('input[id="amount"]').type('0.0001');
    
        // Click the submit button to generate the payment QR code
        cy.get('button[type="submit"]').click();
    
        // Verify that the QR code is displayed
        cy.get('[id="qr-code-display"]').should('be.visible');

        // Simulate cancel
        cy.get('button[id="cancel-transaction"]').click();
    
        // Verify that the QR code is no longer displayed
        cy.get('[id="qr-code-display"]').should('not.exist');
    });
})