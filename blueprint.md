# Project Blueprint: Lotto Number Generator v2.0

## Overview

This project is a sophisticated, single-page web application that generates and displays 5 games of custom lottery numbers. It allows users to pre-select their favorite numbers and share the results as an image. This is version 2.0, an upgrade from the basic generator.

## Features & Design

### Implemented Features:

*   **Custom Number Selection:**
    *   Users can pre-select up to 5 "fixed" numbers to be included in the generation.
    *   A grid of 45 buttons allows for easy selection.
    *   A "Reset" button clears all selections.
*   **5-Game Generation:**
    *   Generates 5 complete sets (games A-E) of 6 unique lottery numbers.
    *   If numbers are pre-selected, the mode is "Semi-automatic" (반자동); otherwise, it's "Automatic" (자동).
    *   Uses a weighted probability algorithm (`weights` array) for number generation, rather than simple random chance.
*   **Dynamic UI & Animation:**
    *   The generated numbers are displayed in 5 rows of colored balls.
    *   A spinning animation plays while numbers are being "drawn", enhancing the user experience.
    *   The UI updates dynamically based on user selections and generated results.
*   **Image Sharing & Download:**
    *   A "Share" button generates a high-quality PNG image of the lottery numbers using HTML Canvas.
    *   A modal popup displays the generated image, with instructions for copying or sharing.
    *   A "Download" button allows the user to save the image file directly.
*   **Firebase Realtime Comment System:**
    *   Comments are stored and retrieved in real-time using Firebase Realtime Database.
    *   Allows all users to share and see each other's comments instantly.
    *   Ensures data persistence across different browsers and sessions.
    *   Uses simple email masking for privacy protection.
*   **Automatic Lotto Data Update:**
    *   Winning numbers are automatically fetched from the Donghang Lotto API.
    *   A GitHub Actions workflow (`update_lotto.yml`) runs every Saturday evening (KST) to update `lotto_data.json`.
    *   The `update_lotto.js` script handles data fetching, error checking, and round calculation.
    *   The frontend (`main.js`) fetches this JSON file and caches it in `localStorage` for performance.
*   **Responsive & Modern UI:**
    *   A clean, centered, card-based layout that is visually appealing and easy to use.
    *   The design is responsive and adapts well to mobile screen sizes.
    *   The UI includes a custom SVG logo.

### Style and Design:

*   **Layout:** Centered, single-column layout using Flexbox, with a responsive container.
*   **Colors:** A refined color palette is used for number balls to indicate their range (yellow, blue, red, gray, green), creating a vibrant look.
*   **Typography:** Uses system fonts like 'Apple SD Gothic Neo' and 'Malgun Gothic' for a native feel on different platforms.
*   **Components:**
    *   A main container with rounded corners and a soft shadow.
    *   A number selection grid with interactive buttons.
    *   A display area for 5 rows of colored "lotto balls".
    *   A share/download modal popup.

## Current Plan

The current request is to upgrade the application to **"Lotto Number Generator v2.0"** using the provided HTML code.

**Steps:**
1.  **Refactor Code:** The provided code is a single HTML file. To maintain a clean project structure, the code will be refactored:
    *   The HTML structure will be placed in `index.html`.
    *   The CSS styles will be extracted into `style.css`.
    *   The JavaScript logic will be extracted into `main.js`.
2.  **Update `index.html`:** Replace the old HTML body with the new structure for v2.0, including the logo, selection grid, results container, buttons, and share modal.
3.  **Update `style.css`:** Overwrite the old styles with the new, more advanced CSS for v2.0.
4.  **Update `main.js`:** Overwrite the old script with the new JavaScript, which includes the logic for number selection, weighted generation, animation, and image sharing.
5.  **Update `blueprint.md`:** Update this document to reflect the new features and plan.
