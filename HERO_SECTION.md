# Hero Section Structure

The hero section now includes all content from the landing page:

## Hero Section Fields:

### Main Content:
- `heading`: "Accelerate your growth with"
- `highlightedText`: "top talent" (highlighted in orange)
- `icon`: Sparkle/star icon next to "talent"
- `supportingText`: Paragraph description
- `ctaButton`: { text: "Apply Now", link: "/apply" }

### Hero Cards (2x2 Grid):
- `heroCards.topLeft`: Person working on laptop (image)
- `heroCards.topRight`: 
  - New Hires card with count (+1428)
  - Calendar with days
  - Background image
- `heroCards.bottomLeft`: 
  - "Shine together" card
  - Interlocking rings icon
  - Gradient background
- `heroCards.bottomRight`: Person with laptop showing apps (image)

### Features Section:
- Array of feature pills/badges:
  - Smart Matching
  - Analytics
  - Global Reach
  - Collaboration
  - Skill Verification

### Powered By Section:
- Title: "POWERED BY:"
- Partners array with:
  - Name (e.g., "AfrESH", "Genius STUDIOZ", "brilliance")
  - Logo image (base64)
  - Logo text

## API Response Example:

```json
{
  "ok": true,
  "data": {
    "content": {
      "hero": {
        "heading": "Accelerate your growth with",
        "highlightedText": "top talent",
        "icon": "base64_image_or_url",
        "supportingText": "Join a network where companies...",
        "ctaButton": {
          "text": "Apply Now",
          "link": "/apply"
        },
        "heroCards": {
          "topLeft": { "image": "...", "alt": "..." },
          "topRight": { "title": "New Hires", "count": 1428, ... },
          "bottomLeft": { "title": "Shine together", ... },
          "bottomRight": { "image": "...", "alt": "..." }
        },
        "features": [
          { "name": "Smart Matching", "active": false },
          { "name": "Analytics", "active": false },
          ...
        ],
        "poweredBy": {
          "title": "POWERED BY:",
          "partners": [
            { "name": "AfrESH", "logo": "...", "logoText": "afr" },
            ...
          ]
        }
      },
      ...
    }
  }
}
```

All images are stored as base64 encoded strings in the database.

