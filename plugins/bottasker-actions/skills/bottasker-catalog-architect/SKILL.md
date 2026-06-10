---
name: bottasker-catalog-architect
description: "Use when the user wants to design, create, import, update, or operate BotTasker catalogs, product categories, products, variants, modifiers, availability, product properties, and sales carts."
---

# BotTasker Catalog Architect

Use this skill as the specialist for the BotTasker `catalogs` and `sales-carts` modules. It owns catalog structure, categories, product payloads, variants, modifier groups, channel visibility, availability, and cart configuration.

If the user asks to create a complete app, route to `bottasker-app-builder` first. Return here after App Builder selects catalog/commerce as part of the approved app blueprint.

## Workflow

1. Call `bt_context_get_profile`.
2. Resolve `appId` with `bt_apps_list` or `bt_apps_get`.
3. Read existing commerce resources before writing:
   - `bt_catalogs_list`
   - `bt_product_categories_list`
   - `bt_products_list`
   - `bt_sales_carts_list` when cart behavior matters.
4. Before catalog/product writes:
   - Use `bt_catalogs_get_create_schema` before `bt_catalogs_create`.
   - Use `bt_products_get_bulk_upsert_schema` and `bt_products_validate_bulk` before `bt_products_bulk_upsert`.
5. Build a catalog blueprint:
   - catalog purpose and default currency;
   - category tree;
   - product types;
   - product fields, attributes, options, variants, modifier groups, availability, channel visibility, and media;
   - sales cart behavior and checkout requirements;
   - AI Agent tools needed for product search, presentation, and cart operations.
6. Show a visual blueprint and ask for approval before writes.
7. After approval, create/update in order:
   - catalog;
   - categories;
   - products or bulk upsert;
   - optional AI Agent item configs for product/catalog/cart tools;
   - verification reads.

## Visual Approval Gate

Before any write tool, show:

- A Mermaid diagram: customer/channel -> catalog search/presentation -> product/variant/modifier selection -> cart -> checkout.
- A component table: catalogs, categories, products, variants, modifier groups, sales cart settings, agent tools.
- A product structure table showing required fields, enums, options, variants, modifiers, attributes, availability, and media.
- A configuration matrix for any AI Agent input/output/tool that will use catalog or cart capabilities.
- Pending decisions and risks.

Do not call create, update, bulk upsert, add item, set status, or action-instance config tools until the user explicitly approves the visual blueprint.

## Catalog Model

Catalogs represent a sellable product collection. Core fields:

- `name`, `slug`, `description`.
- `status`: `active`, `inactive`, `archived`.
- `defaultCurrency`: currency used by products and carts when not otherwise specified.
- `imageUrl`.
- `vectorSearch`: semantic/hybrid search indexing status and configuration.
- `locationSettings`: location-aware inventory, normally `per_variant_per_location`.

Categories organize products inside a catalog. Core fields:

- `catalogId`, `name`, `slug`, `description`.
- `parentId` for category trees.
- `imageUrl`, `status`, `sortOrder`.

## Product Model

Products must be designed with the exact BotTasker product shape:

- Identity: `catalogId`, `name`, `slug`, `sku`, `brand`, `status`.
- `productType`: `physical`, `food`, `service`, `digital`, or `custom`.
- Description: `shortDescription`, `description`, `tags`.
- Categories: `categoryIds`.
- Media: `defaultImageUrl`, `media[]` with `type` (`image`, `video`, `file`), `url`, `alt`, `sortOrder`.
- Price: `basePrice` with `amount`, `currency`, optional `compareAt`, `cost`.
- Channel pricing: `priceBooks[]` with `channel`, `amount`, `currency`.
- Options: `options[]` where each option has `id`, `name`, and `values`.
- Variants: `variants[]` with `id`, `name`, `sku`, `barcode`, `optionValues`, optional `price`, `imageUrl`, `imageUrls`, `available`, `inventory`.
- Modifier groups: `modifierGroups[]` for extras/add-ons.
- Attributes: `attributes[]` for product properties.
- Visibility: `channelVisibility` for `web`, `whatsapp`, `callAgent`, `internal`.
- Availability: `availability` with `available`, `availableFor`, and optional `byLocation`.

## Variants, Options, And Modifiers

Use product options and variants for mutually exclusive product versions:

- Example options: `Talla`, `Color`, `Sabor`.
- Every variant must have stable `id`, display `name`, and `optionValues` matching product option names.
- Use variant-level price when a variant changes price.
- Use variant-level inventory when stock differs by variant.

Use modifier groups for add-ons or extras selected at purchase time:

- Example groups: `Salsas`, `Bebida adicional`, `Extras`.
- Each group has `required`, `multiple`, optional `minSelections`, `maxSelections`.
- Each option has `id`, `name`, optional `priceDelta`, and `available`.
- Required modifier groups must be resolved before adding to cart.

Do not model paid extras as variants when they can be combined freely; use modifier groups.

## Attributes And Properties

Use `attributes[]` for product properties used for filtering, search, comparison, or agent reasoning:

- `key`, `label`, `type`, `value`, optional `unit`.
- `type`: `text`, `number`, `boolean`, `select`, `multiselect`, `measurement`.
- Set `filterable` when the user should filter by the property.
- Set `searchable` when the agent/search should match against the property.

Examples:

- Apparel: material, gender, sizeGuide, season.
- Food: allergens, calories, spicyLevel, preparationTime.
- Services: duration, locationType, providerLevel.
- Digital: licenseType, deliveryMethod, fileFormat.

## Availability And Inventory

Use product-level availability for broad sellability:

- `availability.available`.
- `availability.availableFor`: `delivery`, `pickup`, `shipping`, `dineIn`, `digital`.
- `availability.byLocation` when location matters.

Use variant inventory for SKU-level stock:

- `inventory.track`.
- `inventory.quantity`.
- `inventory.unit`.
- `inventory.byLocation[]` with `locationId`, `available`, `quantity`, optional `reserved`, `pickupEnabled`, `unit`.

When inventory is tracked, agents must not confirm an order until the cart tool accepts the product/variant.

## Sales Cart Rules

Sales carts are transactional state, not the product source of truth.

When configuring a cart tool for agents:

- Prefer a fixed `catalogId` when the agent sells from a known catalog.
- Set `defaultCurrency`.
- Configure `requiredReadyForCheckoutFields`.
- Configure required customer fields such as `fullName`, `phone`, `email`.
- Configure delivery requirements when delivery is part of checkout.

For catalog-scoped carts:

- Agents must add real `productId` values from the catalog.
- If a variant is selected, send `variantId`.
- If modifiers/extras are required, call the product/options tool first or use known `modifierSelections`.
- Do not invent prices. The cart validates catalog price, variants, modifiers, and availability.
- If a cart tool returns `success:false`, do not tell the customer the item was added. Follow the returned next action.

## AI Agent Handoff

When AI Agents will sell, recommend these specialist handoffs:

- `bottasker-ai-agent-architect` for agent/subagent design and item configuration.
- `bottasker-catalog-architect` provides `moduleContext.catalog` with catalogId, categories, product ids, variant ids, modifier groups, channel visibility, and cart settings.

Before `bt_ai_agents_add_item`, the agent specialist must use:

- `bt_ai_agent_tools_discover`
- `bt_ai_agent_tool_get_config_schema`
- `bt_ai_agent_prepare_item_config`
- `bt_ai_agent_validate_item_config`

For the cart tool, ensure `initialConfig` includes catalog and checkout settings when required by the plan.

## Operating Rules

- Use existing catalog/category/product records when they match the target app.
- Prefer native catalogs/products over simulating products in Data Hub when the `catalogs` module is available.
- Prefer `bt_products_bulk_upsert` for importing many products.
- Validate bulk products first with `bt_products_validate_bulk`; do not retry blindly after a bulk validation failure.
- Use stable slugs and IDs for variants/modifier options when possible.
- Ask before archiving/removing categories, products, catalogs, or changing active cart status.
- Do not expose credential values or checkout provider secrets.
- Keep catalog writes app-scoped with `appId`.

## Expected MCP Tools

Use:

- `bt_catalogs_list`
- `bt_catalogs_create`
- `bt_catalogs_update`
- `bt_product_categories_list`
- `bt_product_categories_create`
- `bt_products_list`
- `bt_products_create`
- `bt_products_update`
- `bt_products_bulk_upsert`
- `bt_sales_carts_list`
- `bt_sales_carts_get_or_create_active`
- `bt_sales_carts_add_item`
- `bt_sales_carts_set_status`

For app context use `bt_apps_list` and `bt_apps_get`. For agent tool configuration use the `bt_ai_agent_*` discovery, prepare, and validate tools.
