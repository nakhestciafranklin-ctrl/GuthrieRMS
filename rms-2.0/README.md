# Guthrie RMS 2.0 (POS test copy: BriskTable, Loyverse)

A separate copy of the RMS for trying the RMS data in other POS / KMS platforms (BriskTable and Loyverse) to find a more reliable one. The live RMS in the site root is not changed.

Open it at `<your GitHub Pages site>/rms-2.0/` (same PINs as the live RMS).

## How it stays separate from the live RMS
- Saves in the browser under `guthrieRMS2` (the live RMS uses `guthrieRMS7A`).
- Syncs to its own Firestore document, `guthrieRMS2/sharedState` (the live RMS uses `guthrieRMS/sharedState`).
- The first time 2.0 connects, it reads the live data once to start from the real menu, inventory and staff. It never writes to the live data.
- The "Reset Local App Data" button in 2.0 clears only the 2.0 copy.
- If the Firestore rules don't allow the `guthrieRMS2` collection, 2.0 runs in local-only mode on each device. The login screen shows which mode it's in.

## BriskTable screen
Managers get a **BriskTable** tab. It has:
- The BriskTable POS link (editable), opened in a new tab or shown inside the RMS if BriskTable allows it.
- Downloads for BriskTable: Menu CSV (name, category, menu, price, modifiers), Modifiers CSV, Inventory CSV, Tables CSV, Staff CSV (names, roles and positions only, never PINs or student IDs), Catering CSV, and everything as one JSON file.
- Copy Menu, which copies a tab-separated list for pasting into a spreadsheet or form.

## Loyverse screen
Managers get a **Loyverse** tab. Loyverse has a real item import, so this uses files instead of a console loader:
- **Step 1, Modifiers**: Loyverse can't import modifiers, so a Modifiers Sheet CSV lists the 30 modifiers (one per RMS option-group name, e.g. "Ice", "Flavor", "Bistro Handhelds Options") with their options and prices, to enter in Back Office > Items > Modifiers. Negative options (Veteran Free Entrée, -$8) are listed as Loyverse discounts instead.
- **Step 2, Items**: Items + Modifiers CSV in Loyverse's import format (Handle, SKU, Name, Category, Default price, ..., `Modifier - <name>` Y/N columns) for Back Office > Items > Item list > Import. Items CSV (no modifiers) is there if step 1 is skipped. SKU = 900000 + RMS item number (RMS 205 = 900205); Handle and SKU are stable, so re-importing updates items.
- Optional store name (as in Back Office > Settings > Stores) adds per-store price and "available for sale" columns, and is needed for the Inventory CSV (inventory as not-for-sale, stock-tracked items with In stock = on hand and Low stock = par).
- Tables (as predefined ticket names), Staff (no PINs or student IDs), Catering and Everything (JSON).
- Loyverse POS runs as an iPad/Android app with the Loyverse KDS app for the kitchen; the tab links to Loyverse Back Office.
