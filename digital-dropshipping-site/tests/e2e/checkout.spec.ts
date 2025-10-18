import { test, expect } from '@playwright/test';

test.describe('Checkout Process', () => {
  test('should complete the checkout process successfully', async ({ page }) => {
    // Navigate to the cart page
    await page.goto('/cart');

    // Click on the checkout button
    await page.click('text=Checkout');

    // Fill in user information
    await page.fill('input[name="name"]', 'John Doe');
    await page.fill('input[name="email"]', 'john.doe@example.com');
    await page.fill('input[name="address"]', '123 Main St');
    await page.fill('input[name="city"]', 'Anytown');
    await page.fill('input[name="zip"]', '12345');

    // Fill in payment details (mocked for testing)
    await page.fill('input[name="cardNumber"]', '4242 4242 4242 4242');
    await page.fill('input[name="expiry"]', '12/23');
    await page.fill('input[name="cvc"]', '123');

    // Submit the checkout form
    await page.click('text=Submit Order');

    // Verify that the order confirmation is displayed
    await expect(page).toHaveURL(/.*confirmation/);
    await expect(page.locator('h1')).toHaveText('Thank you for your order!');
  });
});