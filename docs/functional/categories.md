# Functional Specification: Categories

The SellBuy.lv category system uses a hierarchical tree structure powered by PostgreSQL `ltree`.

## Hierarchy Structure
- The system supports 12 top-level categories.
- Each category can have unlimited sub-categories.
- The `Category` model uses `path` (ltree) to represent the path from root (e.g., `electronics.phones.smartphones`).

## Category Attributes
- Categories have localized names (Lv, Ru, En).
- Attributes are stored as JSON for dynamic filtering per category (e.g., screen size for phones, mileage for cars).

## Querying
- Fast ancestor/descendant lookups are performed using ltree operators (e.g., `@>`, `<@`).
- All category-dependent pages should be marked `force-dynamic` to ensure freshness.
