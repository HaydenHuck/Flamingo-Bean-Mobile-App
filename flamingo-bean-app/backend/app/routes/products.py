from typing import Any

from fastapi import APIRouter

router = APIRouter(tags=["products"])


MOCK_PRODUCTS: list[dict[str, Any]] = [
    {
        "id": 1,
        "name": "Flamingo House Blend",
        "description": "A smooth everyday blend with notes of caramel, cocoa, and bright citrus.",
        "category": "Coffee Beans",
        "price": 16.00,
        "image_url": "https://placehold.co/800x600/png?text=Flamingo+House+Blend",
        "roast_level": "Medium",
        "origin": "Colombia and Brazil",
        "size": "12 oz",
        "active": True,
    },
    {
        "id": 2,
        "name": "Sunrise Espresso",
        "description": "A rich espresso roast with dark chocolate, toasted almond, and brown sugar notes.",
        "category": "Coffee Beans",
        "price": 18.00,
        "image_url": "https://placehold.co/800x600/png?text=Sunrise+Espresso",
        "roast_level": "Medium-Dark",
        "origin": "Brazil and Guatemala",
        "size": "12 oz",
        "active": True,
    },
    {
        "id": 3,
        "name": "Pink Lagoon Decaf",
        "description": "A balanced decaf coffee with soft chocolate, honey, and toasted grain notes.",
        "category": "Coffee Beans",
        "price": 17.50,
        "image_url": "https://placehold.co/800x600/png?text=Pink+Lagoon+Decaf",
        "roast_level": "Medium",
        "origin": "Colombia",
        "size": "12 oz",
        "active": True,
    },
    {
        "id": 4,
        "name": "Coastal Cold Brew Blend",
        "description": "A low-acid blend built for cold brew with chocolate, molasses, and orange zest notes.",
        "category": "Coffee Beans",
        "price": 19.00,
        "image_url": "https://placehold.co/800x600/png?text=Coastal+Cold+Brew",
        "roast_level": "Dark",
        "origin": "Brazil and Ethiopia",
        "size": "12 oz",
        "active": True,
    },
    {
        "id": 5,
        "name": "Ethiopia Yirgacheffe",
        "description": "A floral single-origin coffee with jasmine, peach, and lemon tea notes.",
        "category": "Single Origin",
        "price": 21.00,
        "image_url": "https://placehold.co/800x600/png?text=Ethiopia+Yirgacheffe",
        "roast_level": "Light",
        "origin": "Yirgacheffe, Ethiopia",
        "size": "12 oz",
        "active": True,
    },
]


@router.get("/products")
def get_products() -> list[dict[str, Any]]:
    return MOCK_PRODUCTS

