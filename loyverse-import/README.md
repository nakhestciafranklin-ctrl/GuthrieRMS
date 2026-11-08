# Loyverse Import Files (Guthrie Bistro)

Everything from the RMS, ready to load into Loyverse. Made from the RMS 2.0 data on 2026-11-08: the full menu, inventory list, tables and catering packages.
On-hand counts and any edits made inside the live RMS are not included. For files with the latest live data, use the **Loyverse** tab in RMS 2.0 (manager login).

Do the steps in this order, on a computer, in **Loyverse Back Office** (https://r.loyverse.com).

## 1. Modifiers: `loyverse-modifiers.csv` (enter by hand)
Loyverse can't import modifiers, so enter these first: **Items > Modifiers > + Add modifier**.
Each row is one option. Rows with the same Modifier name go in the same modifier. Type the modifier names exactly as written, or step 3 can't attach them.
30 modifiers, 187 options in total:
- Bistro Catering Options
- Café Dessert Options
- Café Entree Options
- Café Beverage Options
- Bistro Handhelds Options
- Bistro Greens & Bowls Options
- Bistro Weekly Chef Special Options
- Bistro Sides Options
- Bistro Beverages Options
- Bistro Bake Shop Options
- Salsa
- Hold / Extra
- Allergy
- Icing
- Warm
- Protein
- Tortilla
- Leave Off
- Add Toppings
- Other
- Hot or Iced
- Whipped Cream
- Drizzle / Topping
- Ice (Iced Drinks)
- Flavor
- Garnish
- Foam / Garnish
- Syrup (+$1)
- Extras
- Ice

## 2. Discounts: `loyverse-discounts.csv` (enter by hand)
**Items > Discounts > + Add discount**: Veteran Free Entrée, Amount, $8.00.
(In the RMS this is a −$8 option on the entrées. Loyverse modifiers can't be negative.)

## 3. Menu: `loyverse-items-with-modifiers.csv` (import)
**Items > Item list > Import** and choose the file. Check the preview, then confirm.
- 70 items in categories like "Bistro: Handhelds", "Café: Beverage" and "Exemption Day: Coffee & Espresso".
- SKU = 900000 + the RMS item number (RMS item 205 = SKU 900205).
- Items on more than one menu have the menu in the name, e.g. "Iced Latte (Café)" and "Iced Latte (Bistro)".
- If Loyverse says a "Modifier - ..." column is unknown, that modifier from step 1 is missing or spelled differently. Fix it and import again, or import `loyverse-items.csv` (the same items without modifiers) and attach modifiers on each item.
- Importing again updates the same items (same Handle and SKU); it doesn't add copies.

## 4. Catering packages: `loyverse-catering-items.csv` (import)
Same import as step 3. Adds the 4 catering packages as items in a "Catering Packages" category (SKU 910001-910004).
Custom Catering Menu has no price, so Loyverse asks for the price when it's rung up.

## 5. Inventory: `loyverse-inventory.csv` (import)
Same import as step 3. Adds 321 inventory items in "Inventory: Bistro" and "Inventory: Culinary".
They are **not for sale** at Guthrie Bistro (they won't show on the POS), stock tracking is on, In stock = RMS on hand and Low stock = RMS par.
Supplier, barcode and pack size / storage location (in the description) come from the RMS.
The store column names must match the store name exactly: "Guthrie Bistro".

## 6. Tables: `loyverse-tables.csv` (enter by hand)
**Settings > Features**: turn on **Open tickets**. Then **Settings > Stores > Guthrie Bistro**, turn on **Predefined tickets** and add: Table 1, Table 2, Table 3, Table 4, Table 5, Table 6, Table 7, Table 8, Table 9, Table 10, Table 11, Table 12, Table 13, Table 14, Table 15, Table 16, Table 17, Table 18, Table 19, Table 20.

## 7. Staff (not in this folder)
Add people in **Employees > Employee list**. Loyverse gives each one their own POS PIN.
The staff list is sent separately (not saved in the repository) and has names, roles and positions only. RMS PINs and student IDs are never exported.

## 8. Kitchen (KMS)
Install the free **Loyverse KDS** app on the kitchen screen, or add a kitchen printer in **Settings > Printers**. Then choose which categories each station gets.
