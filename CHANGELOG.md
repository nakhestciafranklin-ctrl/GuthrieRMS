# Guthrie RMS Changelog

## KMS Build-Out
- Expo now sees every line on every ticket, with its station, seat, each modifier as its own tag (allergy alerts in red), and custom notes.
- Stations mark their own items done (per item or with a station Done button); Expo sees a check mark on finished lines and an items-done count.
- Items added after a ticket was sent show a NEW tag; the log records "Added Items Sent".
- Counter and to-go tickets paid before they are made stay on the KMS (marked PAID) until completed.
- Added a Recently Completed list with Recall, oldest-first ticket order, and timers that tick without redrawing the screen (the action log stays open).

## Sales by Item Report
- Added a Sales by Item table to Reports: quantity sold, sales, % of sales, category, and a count of each modifier (e.g. Iced Latte flavors).
- Added Today / Last 7 Days / This Month / All Time / Custom date ranges to the sales figures, sales by order type, and CSV exports.
- Added an Export Item Sales CSV button.

## Daily Pars
- Added a Daily Pars screen (managers and teachers) to set how many of each menu item are available for the day, grouped by category with All / Counter + To-Go / Dining Room filters.
- Shows sold and remaining counts, marks items Sold Out at 0, and adds 86 / Un-86 buttons plus Refill All to Par and Clear All Pars.
- Pars carry over day to day; counts refill and manual 86s clear automatically on the first use each morning (local date), with the previous day logged to production history.

## Common Grounds Café Menu
- Added 14 Common Grounds café items (cookies, protein muffins, wraps/quesadilla/bowl, refreshers, Iced Latte, Hot Coffee with Syrup) to Counter + To-Go ordering, priced at cookies $1, muffins $2, refreshers $3, Iced Latte / Hot Coffee with Syrup $3, and entrées $4.
- Added modifiers for each café item, including Vanilla / Mocha / Caramel / Pumpkin flavor choices for Iced Latte and Hot Coffee with Syrup.
- Café items are hidden from Dining Room table orders and route to the Beverage, Dessert, and Grill KMS stations.

## Phase 8C
- Restored Recipes / Labs tools.
- Added recipe ingredient lines tied to Culinary Inventory.
- Added culinary lab inventory deduction and usage logging.
- Added teacher student tracking support.
- Preserved Phase 8B demo mode, Bistro menu growth, production pars, running counts, 86 controls, and report exports.

## Phase 8B
- Added manager Demo Mode toggle.
- Added Bistro menu item management by category.
- Added daily production pars, running item counts, and 86 controls.
- Updated report export tools.


### Theme & Appearance
- Added manager-controlled color customization
- Added font selector
- Added page background styles
- Added card/button shape controls
- Added live theme preview and reset action

## 2026-08-18 - Inventory, Catering, and Student Position Update
- Added explicit Add/Edit/Delete inventory item workflows.
- Added direct quantity and storage-location editing in inventory tables.
- Added Walk-In Fridge and Walk-In Freezer to storage locations.
- Reworked Catering Guest Count into its own form block below Event Date.
- Added enterprise student leadership and shift positions from the Operations Manual.
- Student positions continue to feed shift scheduling and position-history tracking.
